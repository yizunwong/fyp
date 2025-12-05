import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { importLibrary, setOptions } from "@googlemaps/js-api-loader";
import { Platform, Text, TextInput, View } from "react-native";

let hasConfiguredGoogleMaps = false;

type FarmLocationPickerProps = {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  onAddressPartsChange?: (parts: {
    address: string;
    district?: string;
    state?: string;
  }) => void;
};

const DEFAULT_CENTER: google.maps.LatLngLiteral = { lat: 3.139, lng: 101.6869 };

const MAP_OPTIONS: google.maps.MapOptions = {
  center: DEFAULT_CENTER,
  zoom: 6,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  mapId: "AgriChain",
  restriction: {
    latLngBounds: {
      north: 7.4,
      south: 0.85,
      west: 99.6,
      east: 119.3,
    },
    strictBounds: true,
  },
};

const MALAYSIA_BOUNDS: google.maps.LatLngBoundsLiteral = {
  north: 7.4,
  south: 0.85,
  west: 99.6,
  east: 119.3,
};

const isWithinMalaysia = (coords: google.maps.LatLngLiteral) => {
  return (
    coords.lat >= MALAYSIA_BOUNDS.south &&
    coords.lat <= MALAYSIA_BOUNDS.north &&
    coords.lng >= MALAYSIA_BOUNDS.west &&
    coords.lng <= MALAYSIA_BOUNDS.east
  );
};

export default function FarmLocationPicker({
  value,
  onChange,
  onBlur,
  error,
  onAddressPartsChange,
}: FarmLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const placeAutocompleteContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(
    null
  );
  const markerLibRef = useRef<google.maps.MarkerLibrary | null>(null);
  const autocompleteElementRef =
    useRef<google.maps.places.PlaceAutocompleteElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const lastGeocodedValueRef = useRef<string>("");
  const onChangeRef = useRef(onChange);
  const onAddressPartsChangeRef = useRef<
    FarmLocationPickerProps["onAddressPartsChange"]
  >(onAddressPartsChange);

  const [mapStatus, setMapStatus] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onAddressPartsChangeRef.current = onAddressPartsChange;
  }, [onAddressPartsChange]);

  const apiKey = useMemo(() => process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY, []);

  const extractAddressParts = useCallback(
    (
      components?:
        | google.maps.GeocoderAddressComponent[]
        | google.maps.places.PlaceAddressComponent[]
    ) => {
      const getPart = (type: string) =>
        components?.find((component) => component.types?.includes(type))
          ?.long_name;

      const district =
        getPart("administrative_area_level_2") ??
        getPart("locality") ??
        getPart("sublocality");
      const state = getPart("administrative_area_level_1");

      return { district, state };
    },
    []
  );

  const formatAddressLine = useCallback(
    (
      components?:
        | google.maps.GeocoderAddressComponent[]
        | google.maps.places.PlaceAddressComponent[],
      fallback?: string
    ) => {
      if (components && components.length) {
        const excludedTypes = new Set([
          "administrative_area_level_1",
          "administrative_area_level_2",
          "country",
        ]);

        const get = (type: string) =>
          components.find((component) => component.types?.includes(type))
            ?.long_name;

        const streetNumber = get("street_number");
        const route = get("route");
        const premise = get("premise") ?? get("subpremise");
        const neighborhood =
          get("neighborhood") ??
          get("sublocality_level_1") ??
          get("sublocality");
        const locality = get("locality");
        const postal = get("postal_code");

        const addressParts = [
          [streetNumber, route].filter(Boolean).join(" ").trim(),
          premise,
          neighborhood,
          locality,
          postal,
        ]
          .map((part) => part?.trim())
          .filter(
            (part, index, arr): part is string =>
              Boolean(part) && arr.indexOf(part) === index
          );

        if (addressParts.length) {
          return addressParts.join(", ");
        }

        const filtered = components
          .filter(
            (component) =>
              !component.types?.some((type) => excludedTypes.has(type))
          )
          .map((component) => component.long_name?.trim())
          .filter(Boolean);

        if (filtered.length) {
          return filtered.join(", ");
        }
      }

      return fallback ?? "";
    },
    []
  );

  const moveMarker = useCallback((position: google.maps.LatLngLiteral) => {
    const map = mapRef.current;
    const markerLib = markerLibRef.current;
    if (!map || !markerLib?.AdvancedMarkerElement) return;
    if (!isWithinMalaysia(position)) {
      setMapStatus("Please pick a location within Malaysia.");
      return;
    }
    setMapStatus(null);

    if (!markerRef.current) {
      markerRef.current = new markerLib.AdvancedMarkerElement({
        map,
        position,
      });
    } else {
      markerRef.current.position = position;
      markerRef.current.map = map;
    }

    map.panTo(position);
    map.setZoom(13);
  }, []);

  const applyLocationValue = useCallback(
    (
      next: string,
      parts?: { district?: string; state?: string }
    ) => {
      onChangeRef.current(next);
      if (Platform.OS === "web" && autocompleteElementRef.current) {
        autocompleteElementRef.current.value = next;
      }
      lastGeocodedValueRef.current = next;

      if (onAddressPartsChangeRef.current) {
        onAddressPartsChangeRef.current({
          address: next,
          district: parts?.district,
          state: parts?.state,
        });
      }
    },
    []
  );

  const geocodeAddress = useCallback(
    (address: string) => {
      const geocoder = geocoderRef.current;
      if (!geocoder || !address.trim()) return;

      geocoder.geocode({ address }, (results, status) => {
        if (status !== "OK" || !results?.[0]) return;
        const { formatted_address, geometry, address_components } = results[0];
        const parts = extractAddressParts(address_components);
        const addressLine = formatAddressLine(
          address_components,
          formatted_address || address
        );
        const position = geometry?.location?.toJSON();
        if (position) {
          if (!isWithinMalaysia(position)) {
            setMapStatus("Please pick a location within Malaysia.");
            return;
          }
          moveMarker(position);
          applyLocationValue(addressLine, parts);
        }
      });
    },
    [applyLocationValue, moveMarker, extractAddressParts, formatAddressLine]
  );

  const geocodePosition = useCallback(
    (position: google.maps.LatLngLiteral) => {
      const geocoder = geocoderRef.current;
      if (!geocoder) return;

      geocoder.geocode({ location: position }, (results, status) => {
        const parts = extractAddressParts(results?.[0]?.address_components);
        const description =
          status === "OK"
            ? formatAddressLine(
                results?.[0]?.address_components,
                results?.[0]?.formatted_address
              )
            : `${position.lat.toFixed(5)}, ${position.lng.toFixed(5)}`;

        if (!isWithinMalaysia(position)) {
          setMapStatus("Please pick a location within Malaysia.");
          return;
        }
        setMapStatus(null);
        moveMarker(position);
        applyLocationValue(description, parts);
      });
    },
    [applyLocationValue, moveMarker, extractAddressParts]
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;

    if (!apiKey) {
      setMapStatus("Add EXPO_PUBLIC_GOOGLE_MAPS_API_KEY to enable map search.");
      return;
    }

    let isMounted = true;
    let mapClickListener: google.maps.MapsEventListener | null = null;
    let autocompleteListener: google.maps.MapsEventListener | null = null;

    const initMaps = async () => {
      try {
        if (!hasConfiguredGoogleMaps) {
          setOptions({  
            key: apiKey,
            mapIds: ["AgriChain"],
            language: "en",
            libraries: ["places", "marker"],
          });
          hasConfiguredGoogleMaps = true;
        }

        const [{ Map }, { Geocoder }, placesLib, markerLib] = await Promise.all([
          importLibrary("maps") as Promise<google.maps.MapsLibrary>,
          importLibrary("geocoding") as Promise<google.maps.GeocodingLibrary>,
          importLibrary("places") as Promise<google.maps.PlacesLibrary>,
          importLibrary("marker") as Promise<google.maps.MarkerLibrary>,
        ]);

        if (!isMounted || !mapContainerRef.current) return;

        const map = new Map(mapContainerRef.current, MAP_OPTIONS);
        mapRef.current = map;
        geocoderRef.current = new Geocoder();
        markerLibRef.current = markerLib;

        // ---- FIX: Remove old invalid event type ----
        if (
          placeAutocompleteContainerRef.current &&
          !autocompleteElementRef.current
        ) {
          const autocompleteElement =
            new placesLib.PlaceAutocompleteElement();

          autocompleteElement.className =
            "w-full rounded-lg border border-emerald-200 px-3 py-2 text-sm text-gray-900 outline-none";
          autocompleteElement.style.backgroundColor = "#ffffff";
          autocompleteElement.style.color = "#0f172a";
          autocompleteElement.style.borderColor = "#d1d5db";
          autocompleteElement.locationRestriction = MALAYSIA_BOUNDS;
          autocompleteElement.placeholder = "Search address or landmark";

          if (value) autocompleteElement.value = value;

          placeAutocompleteContainerRef.current.innerHTML = "";
          placeAutocompleteContainerRef.current.appendChild(
            autocompleteElement
          );
          autocompleteElementRef.current = autocompleteElement;

          const handlePlaceSelect = async (event: any) => {
            const place = event?.detail?.place;
            if (!place) return;

            await place.fetchFields({
              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "name",
                "addressComponents",
              ],
            });

            const position = place.location?.toJSON();
            if (position && !isWithinMalaysia(position)) {
              setMapStatus("Please pick a location within Malaysia.");
              return;
            }
            setMapStatus(null);
            const parts = extractAddressParts(place.addressComponents);
            const addressLine = formatAddressLine(
              place.addressComponents,
              place.formattedAddress || place.displayName || place.name
            );
            const description =
              addressLine ||
              place.formattedAddress ||
              place.displayName ||
              place.name ||
              autocompleteElement.value ||
              "";

            if (position) moveMarker(position);
            if (description) applyLocationValue(description, parts);
          };

          autocompleteElement.addEventListener(
            "gmp-placeselect",
            handlePlaceSelect
          );

          autocompleteListener = {
            remove: () =>
              autocompleteElement.removeEventListener(
                "gmp-placeselect",
                handlePlaceSelect
              ),
          } as unknown as google.maps.MapsEventListener;
        }

        mapClickListener = map.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
            const coords = event.latLng?.toJSON();
            if (coords) geocodePosition(coords);
          }
        );

        if (value.trim()) {
          geocodeAddress(value);
        } else {
          moveMarker(DEFAULT_CENTER);
        }

        setMapReady(true);
        setMapStatus(null);
      } catch (err) {
        console.error("Failed to load Google Maps", err);
        if (isMounted) {
          setMapStatus("Unable to load Google Maps right now.");
        }
      }
    };

    void initMaps();

    return () => {
      isMounted = false;
      if (mapClickListener) mapClickListener.remove();
      if (autocompleteListener) autocompleteListener.remove();
      if (markerRef.current) markerRef.current.map = null;
      autocompleteElementRef.current = null;
      mapRef.current = null;
    };
  }, [apiKey, applyLocationValue, geocodeAddress, geocodePosition, moveMarker]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapReady || !value.trim()) return;
    if (value.trim() === lastGeocodedValueRef.current.trim()) return;
    geocodeAddress(value);
  }, [geocodeAddress, mapReady, value]);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (
      autocompleteElementRef.current &&
      autocompleteElementRef.current.value !== value
    ) {
      autocompleteElementRef.current.value = value;
    }
  }, [value]);

  return (
    <View className="mb-5">
      <Text className="text-gray-700 text-sm font-semibold mb-2">Farm Address</Text>
      <View
        className={`rounded-xl border ${
          error ? "border-red-400" : "border-gray-200"
        } bg-white`}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          placeholder="Search address or paste coordinates"
          placeholderTextColor="#9ca3af"
          editable={false}
          className="px-4 py-3 text-gray-900 text-base"
        />
      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-2">{error}</Text>
      ) : null}

      {Platform.OS === "web" ? (
        <View className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
          <Text className="text-sm font-semibold text-emerald-900 mb-2">
            Pin the farm on Google Maps
          </Text>
          <div ref={placeAutocompleteContainerRef} />
          <View className="mt-3 h-64 rounded-lg overflow-hidden border border-emerald-200 bg-white">
            <div ref={mapContainerRef} className="h-full w-full" />
          </View>
          {mapStatus ? (
            <Text className="text-xs text-amber-700 mt-2">{mapStatus}</Text>
          ) : (
            <Text className="text-xs text-emerald-800 mt-2">
              Select a pin or click on the map to autofill the address field.
            </Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

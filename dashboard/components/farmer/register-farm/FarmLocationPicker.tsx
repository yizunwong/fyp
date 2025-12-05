// FarmLocationPicker.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MapPin, Search } from "lucide-react-native";

type AddressParts = { address?: string; district?: string; state?: string };

interface FarmLocationPickerProps {
  value: string;
  onChange: (next: string) => void;
  onBlur?: () => void;
  error?: string;
  onAddressPartsChange?: (parts: AddressParts) => void;
}

type PredictionItem = {
  placeId: string;
  mainText: string;
  secondaryText?: string;
  fullText: string;
};

const DEFAULT_CENTER = { lat: 3.139, lng: 101.6869 }; // Kuala Lumpur baseline
const MIN_QUERY_LENGTH = 3;

export default function FarmLocationPicker({
  value,
  onChange,
  onBlur,
  error,
  onAddressPartsChange,
}: FarmLocationPickerProps) {
  const [predictions, setPredictions] = useState<PredictionItem[]>([]);
  const [isLoadingMaps, setIsLoadingMaps] = useState(Platform.OS === "web");
  const [mapsReady, setMapsReady] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [searchText, setSearchText] = useState(value ?? "");

  const mapsRef = useRef<typeof google.maps | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.AutocompleteService | null>(
    null
  );
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(
    null
  );
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const sessionTokenRef =
    useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const lastGeocodedRef = useRef<string | null>(null);
  const mapClickListenerRef = useRef<google.maps.MapsEventListener | null>(null);
  const clickHandlerRef = useRef<(lat: number, lng: number) => void>(() => {});

  // load libraries when on web
  useEffect(() => {
    if (Platform.OS !== "web") {
      setIsLoadingMaps(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const { setOptions, importLibrary } = await import(
          "@googlemaps/js-api-loader"
        );

        setOptions({
          key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
          mapIds: ["AgriChain"],
          language: "en",
        });

        await importLibrary("maps");
        await importLibrary("places");
        await importLibrary("geocoding");

        if (!active) return;

        mapsRef.current = google.maps;
        setMapsReady(true);
      } catch (err) {
        console.error("Failed to load Google Maps libraries", err);
      } finally {
        setIsLoadingMaps(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  // sync search box when the external value changes (e.g., form reset or new selection)
  useEffect(() => {
    setSearchText(value ?? "");
  }, [value]);

  const extractAddressParts = (
    components?: google.maps.GeocoderAddressComponent[]
  ): { district?: string; state?: string } => {
    if (!components) return {};
    const findPart = (candidates: string[]) =>
      components.find((item) =>
        candidates.some((candidate) => item.types.includes(candidate))
      )?.long_name;

    return {
      district: findPart([
        "administrative_area_level_2",
        "administrative_area_level_3",
        "locality",
        "sublocality",
      ]),
      state: findPart([
        "administrative_area_level_1",
        "administrative_area_level_2",
      ]),
    };
  };

  const buildDisplayAddress = (
    components?: google.maps.GeocoderAddressComponent[],
    fallback?: string
  ) => {
    if (!components?.length) return fallback ?? "";

    const get = (types: string[]) =>
      components.find((item) =>
        types.some((candidate) => item.types.includes(candidate))
      )?.long_name;

    const streetNumber = get(["street_number"]);
    const route = get(["route"]);
    const premise = get(["premise", "subpremise"]);
    const neighborhood = get(["neighborhood"]);
    const sublocalities = components
      .filter((item) =>
        item.types.some((t) =>
          ["sublocality", "sublocality_level_1", "sublocality_level_2"].includes(
            t
          )
        )
      )
      .map((item) => item.long_name);
    const postalCode = get(["postal_code"]);

    const streetLine = [streetNumber, route].filter(Boolean).join(" ").trim();
    const parts = [
      streetLine || undefined,
      premise,
      neighborhood,
      ...sublocalities,
      postalCode,
    ].filter(Boolean);

    if (!parts.length && fallback) return fallback;
    // Remove duplicates while preserving order
    const seen = new Set<string>();
    const unique = parts.filter((part) => {
      if (seen.has(part!)) return false;
      seen.add(part!);
      return true;
    });

    return unique.join(", ");
  };

  const updateMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current || !markerRef.current) return;
    const position = { lat, lng };
    mapRef.current.panTo(position);
    mapRef.current.setZoom(15);
    markerRef.current.setPosition(position);
    markerRef.current.setVisible(true);
  }, []);

  const resolveLocationFromLatLng = useCallback(
    (lat: number, lng: number) => {
      if (Platform.OS !== "web") return;
      const geocoder = geocoderRef.current;
      const maps = mapsRef.current;
      if (!geocoder || !maps) return;

      setIsSearching(true);
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        setIsSearching(false);
        if (status !== maps.GeocoderStatus.OK || !results?.length) {
          return;
        }

        const bestMatch = results[0];
        const fullAddress =
          bestMatch.formatted_address ?? `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const formatted = buildDisplayAddress(
          bestMatch.address_components,
          fullAddress
        );
        const { district, state } = extractAddressParts(
          bestMatch.address_components
        );

        setSearchText(fullAddress);
        onChange(formatted);
        onAddressPartsChange?.({
          address: formatted,
          district,
          state,
        });
        lastGeocodedRef.current = formatted;
      });
    },
    [onAddressPartsChange, onChange]
  );

  // keep latest click handler without re-initializing the map
  useEffect(() => {
    clickHandlerRef.current = (lat: number, lng: number) => {
      setSelectedLabel(null);
      updateMarker(lat, lng);
      resolveLocationFromLatLng(lat, lng);
    };
  }, [resolveLocationFromLatLng, updateMarker]);

  // initialize map when libs ready
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapsReady || !mapContainerRef.current || !mapsRef.current) return;

    const maps = mapsRef.current;
    const map = new maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 7,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
    });

    mapRef.current = map;

    markerRef.current = new maps.Marker({
      map,
      position: DEFAULT_CENTER,
      visible: false,
    });

    autocompleteRef.current = new maps.places.AutocompleteService();
    placesServiceRef.current = new maps.places.PlacesService(map);
    geocoderRef.current = new maps.Geocoder();
    sessionTokenRef.current = new maps.places.AutocompleteSessionToken();

    mapClickListenerRef.current = maps.event.addListener(
      map,
      "click",
      (event: google.maps.MapMouseEvent) => {
        const lat = event.latLng?.lat();
        const lng = event.latLng?.lng();
        if (lat === undefined || lng === undefined) return;
        clickHandlerRef.current(lat, lng);
      }
    );

    return () => {
      mapClickListenerRef.current?.remove();
      mapClickListenerRef.current = null;
    };
  }, [mapsReady]);

  const runSearch = useCallback((query: string) => {
    if (Platform.OS !== "web") return;
    const maps = mapsRef.current;
    const autocomplete = autocompleteRef.current;
    if (!maps || !autocomplete) return;

    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    const sessionToken =
      sessionTokenRef.current ?? new maps.places.AutocompleteSessionToken();
    sessionTokenRef.current = sessionToken;

    autocomplete.getPlacePredictions(
      {
        input: trimmed,
        sessionToken,
      },
      (results, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !results?.length) {
          setPredictions([]);
          setIsSearching(false);
          return;
        }

        const mapped = results.map((item) => ({
          placeId: item.place_id,
          fullText: item.description,
          mainText: item.structured_formatting.main_text,
          secondaryText: item.structured_formatting.secondary_text,
        }));
        setPredictions(mapped);
        setIsSearching(false);
      }
    );
  }, []);

  const handlePredictionSelect = useCallback(
    (prediction: PredictionItem) => {
      setSelectedLabel(prediction.mainText);
      setPredictions([]);

      if (!mapsRef.current || !placesServiceRef.current) {
        setSearchText(prediction.fullText);
        onChange(prediction.fullText);
        onAddressPartsChange?.({ address: prediction.fullText });
        return;
      }

      setIsSearching(true);
      placesServiceRef.current.getDetails(
        {
          placeId: prediction.placeId,
          fields: [
            "formatted_address",
            "address_components",
            "geometry",
            "name",
          ],
          sessionToken: sessionTokenRef.current ?? undefined,
        },
        (place, status) => {
          setIsSearching(false);
          // Reset session token after use
          sessionTokenRef.current =
            new mapsRef.current!.places.AutocompleteSessionToken();

          if (
            status !== mapsRef.current!.places.PlacesServiceStatus.OK ||
            !place
          ) {
            return;
          }

          const fullAddress = place.formatted_address ?? prediction.fullText;
          const cleanAddress =
            buildDisplayAddress(place.address_components, fullAddress) ||
            prediction.fullText;
          const location = place.geometry?.location;
          const { district, state } = extractAddressParts(
            place.address_components
          );

          setSearchText(fullAddress);
          onChange(cleanAddress);
          onAddressPartsChange?.({
            address: cleanAddress,
            district,
            state,
          });

          if (location) {
            const lat = location.lat();
            const lng = location.lng();
            updateMarker(lat, lng);
            lastGeocodedRef.current = cleanAddress;
          }
        }
      );
    },
    [onAddressPartsChange, onChange, updateMarker]
  );

  // geocode when value changed (if not from place selection)
  useEffect(() => {
    if (Platform.OS !== "web") return;
    if (!mapsReady || !geocoderRef.current || !value?.trim()) return;
    const trimmed = value.trim();
    if (trimmed === lastGeocodedRef.current) return;

    geocoderRef.current.geocode({ address: trimmed }, (results, status) => {
      if (status !== mapsRef.current!.GeocoderStatus.OK || !results?.length) {
        return;
      }
      const location = results[0].geometry?.location;
      if (!location) return;
      updateMarker(location.lat(), location.lng());
      lastGeocodedRef.current = trimmed;
    });
  }, [mapsReady, updateMarker, value]);

  return (
    <View className="mb-5">
      <Text className="text-gray-700 text-sm font-semibold mb-2">
        Farm Location
      </Text>
      <View
        className={`rounded-2xl border ${
          error ? "border-red-400" : "border-gray-200"
        } bg-white shadow-sm`}
      >
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100">
          <Search color="#6b7280" size={18} />
          <TextInput
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setSelectedLabel(null);
              if (Platform.OS === "web") {
                runSearch(text);
              }
            }}
            onBlur={() => {
              onBlur?.();
              setTimeout(() => setPredictions([]), 200);
            }}
            placeholder="Search or paste the full farm address"
            placeholderTextColor="#9ca3af"
            className="flex-1 text-gray-900 text-base"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {isSearching ? (
            <ActivityIndicator size="small" color="#059669" />
          ) : null}
        </View>

        {Platform.OS === "web" && predictions.length ? (
          <View className="border-b border-gray-100">
            {predictions.map((item) => (
              <TouchableOpacity
                key={item.placeId}
                onPress={() => handlePredictionSelect(item)}
                className="px-4 py-3 flex-row gap-3 items-start hover:bg-emerald-50"
              >
                <MapPin color="#10b981" size={18} />
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-gray-900">
                    {item.mainText}
                  </Text>
                  {item.secondaryText ? (
                    <Text className="text-xs text-gray-500">
                      {item.secondaryText}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        <View className="px-4 py-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center gap-2">
              <MapPin color="#059669" size={18} />
              <Text className="text-sm font-semibold text-gray-800">
                Map preview
              </Text>
            </View>
            {Platform.OS === "web" ? (
              <Text className="text-xs text-gray-500">
                {mapsReady
                  ? selectedLabel || value
                    ? "Pinned location"
                    : "Search to pin a spot"
                  : "Loading map"}
              </Text>
            ) : (
              <Text className="text-xs text-gray-500">
                Map preview available on web
              </Text>
            )}
          </View>

          {Platform.OS === "web" ? (
            <View className="rounded-xl border border-gray-100 overflow-hidden bg-gray-50 relative">
              <div
                ref={mapContainerRef}
                className="w-full h-64"
                style={{ minHeight: 240, width: "100%" }}
              />
              {(!mapsReady || isLoadingMaps) && (
                <View className="absolute inset-0 items-center justify-center bg-white/70">
                  <ActivityIndicator color="#059669" />
                </View>
              )}
            </View>
          ) : (
            <View className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-5">
              <Text className="text-sm text-gray-600">
                Enter the full address above. Map preview is available when
                using the web dashboard.
              </Text>
            </View>
          )}
        </View>

      </View>
      {error ? (
        <Text className="text-red-500 text-xs mt-2">{error}</Text>
      ) : null}
    </View>
  );
}

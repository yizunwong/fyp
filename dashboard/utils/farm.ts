import { FARM_SIZE_UNITS, RegisterFarmFormData } from "@/validation/farm";
import {
  CreateFarmDto,
  FarmListRespondDto,
  ProduceListResponseDto,
  type UpdateFarmDto,
} from "@/api";

const splitProduceCategories = (value: string) =>
  value
    .split(",")
    .map((crop) => crop.trim())
    .filter(Boolean);

export const formatFarmLocation = (farm: {
  address?: string;
  district?: string;
  state?: string;
  location?: string;
}) => {
  const address = farm.address;
  const district = farm.district;
  const state = farm.state;
  const parts = [address, district, state].filter(Boolean) as string[];
  if (parts.length) {
    return parts.join(", ");
  }

  return farm.location ?? "";
};

export const createInitialForm = (): RegisterFarmFormData => ({
  name: "",
  address: "",
  district: "",
  state: "",
  size: 0,
  sizeUnit: FARM_SIZE_UNITS[0],
  produceCategories: [],
  farmDocuments: [],
});


export const buildSubmission = (values: RegisterFarmFormData) => {
  const trimmedName = values.name.trim();
  const trimmedAddress = values.address.trim();
  const trimmedDistrict = values.district.trim();
  const trimmedState = values.state.trim();
  const produceCategories = values.produceCategories;

  const createPayload: CreateFarmDto = {
    name: trimmedName,
    address: trimmedAddress,
    district: trimmedDistrict,
    state: trimmedState,
    size: Number(values.size),
    sizeUnit: values.sizeUnit,
    produceCategories: produceCategories,
  };

  const updatePayload: UpdateFarmDto = {
    ...createPayload,
  };

  const normalizedValues: RegisterFarmFormData = {
    ...values,
    name: trimmedName,
    address: trimmedAddress,
    district: trimmedDistrict,
    state: trimmedState,
    size: createPayload.size,
    sizeUnit: createPayload.sizeUnit,
    produceCategories: produceCategories,
    farmDocuments: values.farmDocuments ?? [],
  };

  return {
    createPayload,
    updatePayload,
    normalizedValues,
    trimmedName,
    trimmedAddress,
    trimmedDistrict,
    trimmedState,
    locationLabel: formatFarmLocation({
      address: trimmedAddress,
      district: trimmedDistrict,
      state: trimmedState,
      location: values.address,
    }),
  };
};

export const extractFarmSummary = (
  farm: Partial<FarmListRespondDto> | undefined,
  fallbackName: string,
  fallbackAddress: string,
  fallbackDistrict: string,
  fallbackState: string
) => {
  const name = farm?.name ?? fallbackName;
  const address = farm?.address ?? fallbackAddress;
  const district = farm?.district ?? fallbackDistrict;
  const state = farm?.state ?? fallbackState;
  const locationLabel = formatFarmLocation({ address, district, state });

  return { name, address, district, state, locationLabel };
};

export const formatFarmSize = (value: number | null) => {
  if (value === null || Number.isNaN(value)) return "--";
  return `${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

export const normalizeCertificationLabel = (label: string) =>
  label
    .split(/[_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export const isBatchVerified = (batch: ProduceListResponseDto) => {
  const status = typeof batch.name === "string" ? batch.name.toLowerCase() : "";
  return status === "verified";
};

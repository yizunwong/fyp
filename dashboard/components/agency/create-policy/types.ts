import type {
  CreatePolicyDtoType,
} from "@/api";


export type EligibilityListField =
  | "states"
  | "districts"
  | "cropTypes"
  | "landDocumentTypes";

export type PolicyType = CreatePolicyDtoType;

import type {
  CreatePolicyDto,
  CreatePolicyEligibilityDto,
  CreatePolicyDtoStatus,
  CreatePolicyDtoType,
  CreatePayoutRuleDto,
} from "@/api";

export type PolicyForm = Omit<CreatePolicyDto, "eligibility" | "payoutRule"> & {
  eligibility: Omit<CreatePolicyEligibilityDto, "certifications"> & {
    landDocumentTypes?: string[];
  };
  payoutRule: CreatePayoutRuleDto;
  description: string;
  status: CreatePolicyDtoStatus;
};

export type EligibilityListField =
  | "states"
  | "districts"
  | "cropTypes"
  | "landDocumentTypes";

export type PolicyType = CreatePolicyDtoType;

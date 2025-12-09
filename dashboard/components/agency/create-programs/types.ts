import type { CreateProgramDtoType } from "@/api";

export type EligibilityListField =
  | "states"
  | "districts"
  | "cropTypes"
  | "landDocumentTypes";

export type ProgramType = CreateProgramDtoType;

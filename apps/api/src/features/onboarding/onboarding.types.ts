import type { VisaType, City, FamilySituation, Occupation, PersonaKey } from '../../shared/types.js';

export interface CreateProfileRequest {
  visaType: VisaType;
  city: City;
  familySituation: FamilySituation;
  occupation: Occupation;
  arrivalDate: string; // ISO date — always required (past or future)
}

export interface CreateProfileResponse {
  profileId: string;
  personaKey: PersonaKey;
  roadmapGenerated: boolean; // always true
}

export interface GetProfileResponse {
  profileId: string;
  visaType: VisaType;
  city: City;
  familySituation: FamilySituation;
  occupation: Occupation;
  arrivalDate: string; // ISO date
  personaKey: PersonaKey;
}

export type OnboardingPreviewRequest = CreateProfileRequest;

export interface OnboardingPreviewResponse {
  tasks: { taskId: string; name: string; estimatedDuration: string; phase: number }[];  // ordered by task id
}

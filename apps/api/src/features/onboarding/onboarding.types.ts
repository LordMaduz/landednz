import type { VisaType, City, FamilySituation, Occupation } from '../../shared/types.js';

export interface CreateProfileRequest {
  visaType: VisaType;
  city: City;
  familySituation: FamilySituation;
  occupation: Occupation;
  arrivalDate: string; // ISO date — always required (past or future)
}

export interface CreateProfileResponse {
  profileId: string;
  roadmapGenerated: boolean; // always true
}

export interface GetProfileResponse {
  profileId: string;
  visaType: VisaType;
  city: City;
  familySituation: FamilySituation;
  occupation: Occupation;
  arrivalDate: string; // ISO date
}

export type OnboardingPreviewRequest = CreateProfileRequest;

export interface OnboardingPreviewResponse {
  tasks: { taskId: string; name: string; estimatedDuration: string; phase: number }[];  // ordered by task id
}

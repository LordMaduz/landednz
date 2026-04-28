import type { VisaType, City, FamilySituation, Occupation, PersonaKey } from '../../shared/types';
export interface CreateProfileRequest {
    visaType: VisaType;
    city: City;
    familySituation: FamilySituation;
    occupation: Occupation;
    arrivalDate: string;
}
export interface CreateProfileResponse {
    profileId: string;
    personaKey: PersonaKey;
    roadmapGenerated: boolean;
}
export interface GetProfileResponse {
    profileId: string;
    visaType: VisaType;
    city: City;
    familySituation: FamilySituation;
    occupation: Occupation;
    arrivalDate: string;
    personaKey: PersonaKey;
}
//# sourceMappingURL=onboarding.types.d.ts.map
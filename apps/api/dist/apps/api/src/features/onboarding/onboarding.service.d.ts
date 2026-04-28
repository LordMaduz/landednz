import type { CreateProfileRequest, CreateProfileResponse, GetProfileResponse } from './onboarding.types';
export declare function createProfile(userId: string, request: CreateProfileRequest, currentDate?: Date): Promise<CreateProfileResponse>;
export declare function updateProfileAndRegenerateRoadmap(userId: string, request: CreateProfileRequest, currentDate?: Date): Promise<CreateProfileResponse & {
    entriesCreated: number;
}>;
export declare function getUserProfile(userId: string): Promise<GetProfileResponse>;
//# sourceMappingURL=onboarding.service.d.ts.map
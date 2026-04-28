import { FamilySituation, Occupation, PersonaKey, VisaType } from '@landednz/types';
export interface FilterableTask {
    id: string;
    applicableVisaTypes: string;
    applicableFamilySituations: string;
    applicableOccupations: string;
    [key: string]: unknown;
}
interface UserProfile {
    visaType: VisaType;
    familySituation: FamilySituation;
    occupation: Occupation;
}
interface TaskFilterInput {
    tasks: FilterableTask[];
    profile: UserProfile;
}
export declare function filterApplicableTasks(input: TaskFilterInput): FilterableTask[];
export declare function derivePersonaKey(familySituation: FamilySituation): PersonaKey;
export {};
//# sourceMappingURL=filter.d.ts.map
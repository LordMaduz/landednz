import { PersonaKey } from '@landednz/types';
interface ScoringInput {
    task: {
        id: string;
        basePriority: number;
        phase: number;
    };
    personaKey: PersonaKey;
    arrivalDate: Date | null;
    currentDate: Date;
    isBlocked: boolean;
    isComplete: boolean;
}
interface ScoringResult {
    taskId: string;
    finalPriority: number;
    breakdown: {
        basePriority: number;
        personaWeight: number;
        timeUrgencyBonus: number;
        dependencyPenalty: number;
    };
}
export declare function scoreTask(input: ScoringInput): ScoringResult;
export {};
//# sourceMappingURL=scoring.d.ts.map
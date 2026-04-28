export type VisaType = "AEWV" | "PARTNER_OF_STUDENT" | "GREEN_LIST_WORK" | "GREEN_LIST_RESIDENCE" | "OTHER";
export type City = "AUCKLAND" | "WELLINGTON" | "CHRISTCHURCH" | "OTHER";
export type FamilySituation = "SOLO" | "COUPLE_DUAL_WORK" | "COUPLE_CONSTRAINED" | "FAMILY_WITH_CHILDREN";
export type Occupation = "TECHNOLOGY" | "HEALTHCARE" | "EDUCATION" | "FINANCE" | "TRADES" | "OTHER_PROFESSIONAL" | "SEEKING_WORK";
export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "SKIPPED";
export type DependencyType = "HARD" | "SOFT";
export type PersonaKey = "constrained_couple" | "solo_aewv" | "family_with_children" | "dual_work_couple";
export type ChatEntryPoint = "TASK_CARD" | "ROADMAP" | "EMAIL_DEEPLINK" | "NAVIGATION";
export interface ApiError {
    error: string;
    message: string;
    statusCode: number;
}
export interface AuthVerifyResponse {
    userId: string;
    email: string;
    isNewUser: boolean;
    hasProfile: boolean;
}
//# sourceMappingURL=index.d.ts.map
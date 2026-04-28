interface AuthVerifyResult {
    userId: string;
    email: string;
    isNewUser: boolean;
    hasProfile: boolean;
}
export declare function verifyAndUpsertUser(token: string): Promise<AuthVerifyResult>;
export {};
//# sourceMappingURL=auth.service.d.ts.map
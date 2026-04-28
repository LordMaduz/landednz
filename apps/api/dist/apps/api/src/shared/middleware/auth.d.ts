import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
declare module 'fastify' {
    interface FastifyRequest {
        userId: string;
    }
}
export declare function registerAuthDecoration(app: FastifyInstance): void;
export declare function authenticateRequest(request: FastifyRequest, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=auth.d.ts.map
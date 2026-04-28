import type { ChatEntryPoint } from '@landednz/types';
import type { CreateSessionResponse } from './chat.types';
import type { FastifyReply } from 'fastify';
export declare function createChatSession(userId: string, entryPoint: ChatEntryPoint, taskContext?: string): Promise<CreateSessionResponse>;
export declare function sendMessage(userId: string, sessionId: string, content: string, reply: FastifyReply): Promise<void>;
//# sourceMappingURL=service.d.ts.map
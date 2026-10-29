// Guide SSE writer on reply.raw (C14): reply.send() buffers, so headers and CORS are written by hand.
import type { FastifyReply } from 'fastify';
import type { GuideSseEvent } from '@landednz/types';
import { config } from '../../shared/config.js';

export type Sse = {
  send(e: GuideSseEvent): void;
  end(): void;
  closed: () => boolean;
  onClose(fn: () => void): void;
};

export function openSse(reply: FastifyReply): Sse {
  // No idle timeout on long answers (Railway closes at 30 s otherwise)
  if (process.env.NODE_ENV !== 'test') reply.raw.setTimeout?.(0);
  const origin = reply.request.headers.origin;
  const allowedOrigin = origin && config.corsOrigin.includes(origin) ? origin : undefined;
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
    // reply.raw bypasses @fastify/cors: echo the origin only if configured
    ...(allowedOrigin && { 'Access-Control-Allow-Origin': allowedOrigin, 'Access-Control-Allow-Credentials': 'true' }),
    Vary: 'Origin',
  });
  let closed = false;
  reply.raw.on('close', () => {
    closed = true;
  });
  return {
    send(e) {
      if (!closed && !reply.raw.writableEnded) reply.raw.write(`event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`);
    },
    end() {
      if (!reply.raw.writableEnded) reply.raw.end();
    },
    closed: () => closed,
    onClose(fn) {
      reply.raw.on('close', fn);
    },
  };
}

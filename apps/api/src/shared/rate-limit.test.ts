import { describe, expect, test, afterEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../server.js';

let app: FastifyInstance;

afterEach(async () => {
  await app.close();
});

async function hit(url: string, times: number): Promise<number[]> {
  const codes: number[] = [];
  for (let i = 0; i < times; i++) {
    codes.push((await app.inject({ method: 'GET', url, remoteAddress: '203.0.113.7' })).statusCode);
  }
  return codes;
}

describe('per-IP rate limit', () => {
  test('121st request in a minute from one IP returns 429', async () => {
    app = await buildApp();
    const codes = await hit('/config', 121);
    expect(codes.slice(0, 120).every(code => code === 200)).toBe(true);
    expect(codes[120]).toBe(429);
    const blocked = await app.inject({ method: 'GET', url: '/config', remoteAddress: '203.0.113.7' });
    expect(blocked.json()).toMatchObject({ error: 'RATE_LIMITED' });
  });

  test('/health is never rate limited', async () => {
    app = await buildApp();
    const codes = await hit('/health', 130);
    expect(codes.every(code => code === 200)).toBe(true);
  });
});

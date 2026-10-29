import { describe, expect, test, vi } from 'vitest';

// config is a module-level singleton already loaded by the setup file, so override it here
vi.mock('./config.js', async (original) => {
  const mod = await original<typeof import('./config.js')>();
  return { ...mod, config: { ...mod.config, trustProxy: true } };
});
import { buildApp } from '../server.js';

describe('trustProxy', () => {
  test('with TRUST_PROXY=true the rate limit keys on X-Forwarded-For, not the proxy address', async () => {
    const app = await buildApp();
    const send = (ip: string) =>
      app.inject({ method: 'GET', url: '/config', remoteAddress: '10.0.0.1', headers: { 'x-forwarded-for': ip } });
    for (let i = 0; i < 120; i++) await send('203.0.113.9');
    expect((await send('203.0.113.9')).statusCode).toBe(429);
    expect((await send('203.0.113.10')).statusCode).toBe(200);
    await app.close();
  });
});

import { afterEach, describe, expect, it, vi } from 'vitest'
import type { GuideSseEvent } from '@landednz/types'
import { askGuide } from './api'

function chunked(chunks: string[]): Response {
  const enc = new TextEncoder()
  const body = new ReadableStream<Uint8Array>({
    start(c) {
      chunks.forEach(s => c.enqueue(enc.encode(s)))
      c.close()
    },
  })
  return new Response(body, { status: 200 })
}

const ask = (signal = new AbortController().signal) => {
  const events: GuideSseEvent[] = []
  return { events, run: () => askGuide({ text: 'q', screen: { kind: 'home' } }, 'tok', e => events.push(e), signal) }
}

afterEach(() => vi.unstubAllGlobals())

describe('askGuide', () => {
  it('reads an event split across two chunks and two events in one chunk', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => chunked([
      'event: start\ndata: {"userMessageId":"u1",',
      '"assistantMessageId":"a1"}\n\n',
      'event: part\ndata: {"type":"text","text":"Hi.","citations":[]}\n\nevent: done\ndata: {"assistantMessageId":"a1","status":"complete"}\n\n',
    ])))
    const { events, run } = ask()
    await run()
    expect(events).toEqual([
      { event: 'start', data: { userMessageId: 'u1', assistantMessageId: 'a1' } },
      { event: 'part', data: { type: 'text', text: 'Hi.', citations: [] } },
      { event: 'done', data: { assistantMessageId: 'a1', status: 'complete' } },
    ])
  })

  it('sends text, screen and the bearer token', async () => {
    const fetchMock = vi.fn(async () => chunked([]))
    vi.stubGlobal('fetch', fetchMock)
    await ask().run()
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toMatch(/\/guide\/messages$/)
    expect(JSON.parse(init.body as string)).toEqual({ text: 'q', screen: { kind: 'home' } })
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
  })

  it('429 cap body throws kind cap with resetAt', async () => {
    const body = { error: 'CHAT_DAILY_CAP_REACHED', message: 'm', resetAt: '2026-10-31T11:00:00.000Z' }
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status: 429 })))
    await expect(ask().run()).rejects.toMatchObject({ kind: 'cap', resetAt: '2026-10-31T11:00:00.000Z' })
  })

  it('a 429 that is not the daily cap (rate limit) throws kind failed', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'RATE_LIMITED', message: 'm' }), { status: 429 })))
    await expect(ask().run()).rejects.toMatchObject({ kind: 'failed', status: 429 })
  })

  it('409 throws kind busy', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ error: 'GUIDE_BUSY' }), { status: 409 })))
    await expect(ask().run()).rejects.toMatchObject({ kind: 'busy' })
  })

  it('other errors throw kind failed with the status', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 500 })))
    await expect(ask().run()).rejects.toMatchObject({ kind: 'failed', status: 500 })
  })

  it('aborted ends quietly', async () => {
    const controller = new AbortController()
    vi.stubGlobal('fetch', vi.fn(async (_u: string, init: RequestInit) => {
      controller.abort()
      init.signal!.throwIfAborted()
      return chunked([])
    }))
    await expect(ask(controller.signal).run()).resolves.toBeUndefined()
  })
})

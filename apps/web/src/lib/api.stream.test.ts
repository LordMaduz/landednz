import { afterEach, describe, expect, it, vi } from 'vitest'
import { streamChat } from './api'

function sse(lines: string[]): Response {
  return new Response(lines.map(l => `data: ${l}\n\n`).join(''), { status: 200 })
}

afterEach(() => vi.unstubAllGlobals())

describe('streamChat', () => {
  it('chunks then done', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => sse(['{"type":"chunk","text":"Hi "}', '{"type":"chunk","text":"there"}', '{"type":"done"}'])))
    const chunks: string[] = []
    const onDone = vi.fn()
    await streamChat('s1', 'q', 'tok', t => chunks.push(t), onDone, vi.fn())
    expect(chunks.join('')).toBe('Hi there')
    expect(onDone).toHaveBeenCalled()
  })

  it('a non-OK JSON body reports its code and message', async () => {
    const body = { error: 'CHAT_DAILY_CAP_REACHED', message: 'Daily message limit reached.' }
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(body), { status: 429 })))
    const onError = vi.fn()
    await streamChat('s1', 'q', 'tok', vi.fn(), vi.fn(), onError)
    expect(onError).toHaveBeenCalledWith({ code: 'CHAT_DAILY_CAP_REACHED', message: 'Daily message limit reached.' })
  })

  it('aborted: passes the signal and reports nothing', async () => {
    const controller = new AbortController()
    const fetchMock = vi.fn(async (_url: string, init: RequestInit) => {
      controller.abort()
      init.signal!.throwIfAborted()
      return sse([])
    })
    vi.stubGlobal('fetch', fetchMock)
    const onError = vi.fn()
    await streamChat('s1', 'q', 'tok', vi.fn(), vi.fn(), onError, controller.signal)
    expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
    expect(onError).not.toHaveBeenCalled()
  })
})

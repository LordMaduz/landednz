import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 })
let api: typeof import('./api')
let fetchMock: ReturnType<typeof vi.fn>

beforeEach(async () => {
  vi.resetModules()
  api = await import('./api')
  fetchMock = vi.fn(async () => json({ phases: [] }))
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => vi.unstubAllGlobals())

describe('GET memory', () => {
  it('keeps the last roadmap, profile and task detail', async () => {
    expect(api.lastRoadmap()).toBeUndefined()
    await api.getRoadmap('tok')
    await api.getOnboardingProfile('tok')
    await api.getTaskDetail('T08', 'tok')
    expect(api.lastRoadmap()).toEqual({ phases: [] })
    expect(api.lastProfile()).toEqual({ phases: [] })
    expect(api.lastTaskDetail('T08')).toEqual({ phases: [] })
    expect(api.lastTaskDetail('T09')).toBeUndefined()
  })

  it('shares one request between callers while it runs, and asks again after', async () => {
    await Promise.all([api.getTaskDetail('T08', 'tok'), api.getTaskDetail('T08', 'tok')])
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await api.getTaskDetail('T08', 'tok')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('on the server nothing is shared: each caller (maybe another user) gets its own request', async () => {
    vi.stubGlobal('window', undefined)
    await Promise.all([api.getRoadmap('tok-a'), api.getRoadmap('tok-b')])
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(api.lastRoadmap()).toBeUndefined()
  })

  it('a failed request keeps nothing and still carries the status', async () => {
    fetchMock.mockResolvedValueOnce(new Response('', { status: 404 }))
    await expect(api.getOnboardingProfile('tok')).rejects.toMatchObject({ status: 404 })
    expect(api.lastProfile()).toBeUndefined()
  })

  it.each([
    ['completeTask', () => api.completeTask('T08', 'tok')],
    ['reopenTask', () => api.reopenTask('T08', 'tok')],
    ['updateOnboardingProfile', () => api.updateOnboardingProfile({} as never, 'tok')],
    ['submitOnboardingProfile', () => api.submitOnboardingProfile({} as never, 'tok')],
    ['deleteAccount', () => api.deleteAccount('tok')],
  ])('%s forgets everything', async (_, write) => {
    await api.getRoadmap('tok')
    await write()
    expect(api.lastRoadmap()).toBeUndefined()
  })

  it('a read that started before a write does not bring old data back', async () => {
    let answer!: (r: Response) => void
    fetchMock.mockReturnValueOnce(new Promise<Response>(r => (answer = r)))
    const read = api.getRoadmap('tok')
    await api.completeTask('T08', 'tok')
    answer(json({ phases: ['old'] }))
    await read
    expect(api.lastRoadmap()).toBeUndefined()
  })
})

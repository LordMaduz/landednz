// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { GET } from './route'

describe('/logo.png', () => {
  it('is a 512×512 PNG', async () => {
    const res = GET()
    expect(res.headers.get('content-type')).toBe('image/png')
    const view = new DataView(await res.arrayBuffer())
    // IHDR width and height sit at bytes 16–23
    expect([view.getUint32(16), view.getUint32(20)]).toEqual([512, 512])
  })
})

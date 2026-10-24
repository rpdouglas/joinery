import { describe, expect, it } from 'vitest'
import { ping } from '../src/index'

// Calls the handler directly; emulator-backed Function tests come with the first real Function.
describe('ping', () => {
  it('rejects callers without a staff role', async () => {
    await expect(ping.run({ data: {}, rawRequest: {} } as never)).rejects.toThrow('Staff only')
  })

  it('returns ok for a staff role', async () => {
    const result = await ping.run({
      data: {},
      rawRequest: {},
      auth: { uid: 'u1', token: { role: 'owner' } },
    } as never)
    expect(result).toMatchObject({ ok: true, role: 'owner' })
  })
})

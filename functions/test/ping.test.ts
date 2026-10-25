import { describe, expect, it } from 'vitest'
import { ping } from '../src/index'

type Req = Parameters<typeof ping.run>[0]
type Auth = NonNullable<Req['auth']>

// Test doubles: `ping` reads only `data`, `auth.uid` and `auth.token`, so the rest of the
// request and token shapes are deliberately left out (hence the casts).
const authWith = (token: Record<string, unknown>) => ({ uid: 'u1', token }) as unknown as Auth
const call = (req: { data?: unknown; auth?: Auth }) =>
  ping.run({ data: {}, rawRequest: {}, ...req } as unknown as Req)

// Calls the handler directly. Emulator-backed Function tests arrive with the first real Function
// (docs/BACKLOG.md).
describe('ping', () => {
  // Catches: a signed-out or role-less caller reaching a staff-only function.
  it('rejects callers without a staff role', async () => {
    await expect(call({})).rejects.toMatchObject({ code: 'permission-denied' })
    await expect(call({ auth: authWith({}) })).rejects.toMatchObject({ code: 'permission-denied' })
  })

  // Catches: the shared request schema not being enforced at the boundary.
  it('rejects unexpected input', async () => {
    await expect(
      call({ data: { extra: 1 }, auth: authWith({ role: 'owner' }) }),
    ).rejects.toMatchObject({ code: 'invalid-argument' })
  })

  it('returns ok for a staff role', async () => {
    const result = await call({ auth: authWith({ role: 'owner' }) })
    expect(result).toMatchObject({ ok: true, role: 'owner' })
  })
})

import { z } from 'zod'

// Custom claim `{ role }`, set only by a Cloud Function. `installer` is pending ADR 0003.
export const Role = z.enum(['owner', 'designer', 'installer', 'tradePartner'])
export type Role = z.infer<typeof Role>

export const RoleClaims = z.object({ role: Role })
export type RoleClaims = z.infer<typeof RoleClaims>

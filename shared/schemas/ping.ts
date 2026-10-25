import { z } from 'zod'
import { Role } from './roles'

// Callable contract for `ping`, shared by the app and Functions.
export const PingRequest = z.object({}).strict()
export type PingRequest = z.infer<typeof PingRequest>

export const PingResponse = z.object({ ok: z.literal(true), role: Role, at: z.iso.datetime() })
export type PingResponse = z.infer<typeof PingResponse>

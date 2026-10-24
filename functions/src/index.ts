import { FUNCTIONS_REGION } from '@shared/config'
import { Role } from '@shared/schemas/roles'
import { setGlobalOptions } from 'firebase-functions/v2'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

// Region is set once, here (ADR 0001). Every function inherits it.
setGlobalOptions({ region: FUNCTIONS_REGION, maxInstances: 10 })

// Smoke-test callable used by post-deploy checks. Requires a signed-in staff user.
export const ping = onCall((request) => {
  const role = Role.safeParse(request.auth?.token.role)
  if (!role.success) throw new HttpsError('permission-denied', 'Staff only')
  return { ok: true, role: role.data, at: new Date().toISOString() }
})

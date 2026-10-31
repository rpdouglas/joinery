import { FUNCTIONS_REGION } from '@shared/config'
import { PingRequest, type PingResponse } from '@shared/schemas/ping'
import { Role } from '@shared/schemas/roles'
import { logger } from 'firebase-functions'
import { setGlobalOptions } from 'firebase-functions/v2'
import { HttpsError, onCall } from 'firebase-functions/v2/https'

// Region is set once, here (ADR 0001). Every function inherits it.
setGlobalOptions({ region: FUNCTIONS_REGION })

// Smoke-test callable used by post-deploy checks. Follows the Lily Pad Cloud Function checklist:
// validated input, staff-only auth, explicit limits, error contract, structured logs.
export const ping = onCall(
  { timeoutSeconds: 10, memory: '256MiB', maxInstances: 2 },
  (request): PingResponse => {
    const log = { service: 'functions', function: 'ping', operation: 'ping' }
    try {
      const input = PingRequest.safeParse(request.data ?? {})
      if (!input.success) throw new HttpsError('invalid-argument', 'Unexpected request fields')
      const role = Role.safeParse(request.auth?.token.role)
      if (!role.success) throw new HttpsError('permission-denied', 'Staff only')
      logger.info('ping ok', { ...log, outcome: 'ok', uid: request.auth?.uid })
      return { ok: true, role: role.data, at: new Date().toISOString() }
    } catch (error) {
      if (error instanceof HttpsError) {
        logger.warn('ping rejected', { ...log, outcome: error.code })
        throw error
      }
      logger.error('ping failed', { ...log, outcome: 'internal', error })
      throw new HttpsError('internal', 'Internal error')
    }
  },
)

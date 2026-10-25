import { readFileSync } from 'node:fs'
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-joinery',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

beforeEach(() => env.clearFirestore())
afterAll(() => env.cleanup())

describe('default deny', () => {
  // Catches: a catch-all allow, or a new collection shipped without its own rule.
  it('blocks unknown collections even for owners', async () => {
    const db = env.authenticatedContext('o1', { role: 'owner' }).firestore()
    await assertFails(getDoc(doc(db, 'anything/x')))
  })

  // Catches: data readable without signing in.
  it('blocks signed-out users', async () => {
    const db = env.unauthenticatedContext().firestore()
    await assertFails(getDoc(doc(db, 'healthchecks/x')))
  })
})

describe('healthchecks', () => {
  // Catches: a designer gaining owner-only write access.
  it('lets staff read and only owners write', async () => {
    const designer = env.authenticatedContext('d1', { role: 'designer' }).firestore()
    const owner = env.authenticatedContext('o1', { role: 'owner' }).firestore()
    await assertSucceeds(getDoc(doc(designer, 'healthchecks/x')))
    await assertFails(setDoc(doc(designer, 'healthchecks/x'), { ok: true }))
    await assertSucceeds(setDoc(doc(owner, 'healthchecks/x'), { ok: true }))
  })

  // Catches: restricted roles (installer, trade partner) reading staff data.
  it('denies installers and trade partners', async () => {
    const installer = env.authenticatedContext('i1', { role: 'installer' }).firestore()
    const partner = env.authenticatedContext('t1', { role: 'tradePartner' }).firestore()
    await assertFails(getDoc(doc(installer, 'healthchecks/x')))
    await assertFails(getDoc(doc(partner, 'healthchecks/x')))
  })
})

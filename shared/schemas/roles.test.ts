import { describe, expect, it } from 'vitest'
import { Role } from './roles'

describe('Role', () => {
  it('accepts known roles and rejects others', () => {
    expect(Role.parse('owner')).toBe('owner')
    expect(Role.safeParse('admin').success).toBe(false)
  })
})

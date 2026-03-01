import { USER_ROLE } from '@dx3/models-shared'

import {
  privilegeSetParamsSchema,
  updatePrivilegeSetBodySchema,
} from './user-privilege-api.validation'

describe('user-privilege-api.validation', () => {
  describe('updatePrivilegeSetBodySchema', () => {
    it('should accept empty object (all optional)', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should accept valid payload with all fields', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({
        description: 'Admin role description',
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: USER_ROLE.ADMIN,
        order: 300,
      })
      expect(result.success).toBe(true)
    })

    it('should accept partial payload', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({
        description: 'Updated description',
      })
      expect(result.success).toBe(true)
    })

    it('should accept valid role name', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({
        name: USER_ROLE.EDITOR,
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid role name', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({
        name: 'INVALID_ROLE',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid order type', () => {
      const result = updatePrivilegeSetBodySchema.safeParse({
        order: 'not-a-number',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('privilegeSetParamsSchema', () => {
    it('should accept valid uuid', () => {
      const result = privilegeSetParamsSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty id', () => {
      const result = privilegeSetParamsSchema.safeParse({
        id: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject missing id', () => {
      const result = privilegeSetParamsSchema.safeParse({})
      expect(result.success).toBe(false)
    })

    it('should accept non-empty non-uuid string (schema only enforces min length)', () => {
      const result = privilegeSetParamsSchema.safeParse({
        id: 'some-id',
      })
      expect(result.success).toBe(true)
    })
  })
})

import {
  hasRoleOrHigher,
  USER_ROLE,
  USER_ROLE_ARRAY,
  USER_ROLE_ORDER,
} from './user-privilege-shared.consts'

describe('USER_ROLE', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ROLE).toBeDefined()
  })

  it('should have correct values for all roles', () => {
    expect(USER_ROLE.ADMIN).toEqual('ADMIN')
    expect(USER_ROLE.EDITOR).toEqual('EDITOR')
    expect(USER_ROLE.LOGGING_ADMIN).toEqual('LOGGING_ADMIN')
    expect(USER_ROLE.METRICS_ADMIN).toEqual('METRICS_ADMIN')
    expect(USER_ROLE.SUPER_ADMIN).toEqual('SUPER_ADMIN')
    expect(USER_ROLE.USER).toEqual('USER')
  })

  it('should have 6 roles total', () => {
    expect(Object.keys(USER_ROLE).length).toEqual(6)
  })
})

describe('USER_ROLE_ORDER', () => {
  it('should exist when imported', () => {
    expect(USER_ROLE_ORDER).toBeDefined()
  })

  it('should have correct order values for hierarchy (sparse numbering)', () => {
    // USER (100) → EDITOR (200) → ADMIN (300) → METRICS_ADMIN (400) → LOGGING_ADMIN (500) → SUPER_ADMIN (1000)
    expect(USER_ROLE_ORDER[USER_ROLE.USER]).toEqual(100)
    expect(USER_ROLE_ORDER[USER_ROLE.EDITOR]).toEqual(200)
    expect(USER_ROLE_ORDER[USER_ROLE.ADMIN]).toEqual(300)
    expect(USER_ROLE_ORDER[USER_ROLE.METRICS_ADMIN]).toEqual(400)
    expect(USER_ROLE_ORDER[USER_ROLE.LOGGING_ADMIN]).toEqual(500)
    expect(USER_ROLE_ORDER[USER_ROLE.SUPER_ADMIN]).toEqual(1000)
  })

  it('should have SUPER_ADMIN as highest order', () => {
    const orders = Object.values(USER_ROLE_ORDER)
    const maxOrder = Math.max(...orders)
    expect(USER_ROLE_ORDER[USER_ROLE.SUPER_ADMIN]).toEqual(maxOrder)
  })
})

describe('USER_ROLE_ARRAY', () => {
  // arrange
  // act
  // assert
  it('should exist when imported', () => {
    expect(USER_ROLE_ARRAY).toBeDefined()
  })

  it('should contain all 6 roles', () => {
    expect(USER_ROLE_ARRAY.length).toEqual(6)
    expect(USER_ROLE_ARRAY).toContain('ADMIN')
    expect(USER_ROLE_ARRAY).toContain('EDITOR')
    expect(USER_ROLE_ARRAY).toContain('LOGGING_ADMIN')
    expect(USER_ROLE_ARRAY).toContain('METRICS_ADMIN')
    expect(USER_ROLE_ARRAY).toContain('SUPER_ADMIN')
    expect(USER_ROLE_ARRAY).toContain('USER')
  })
})

describe('hasRoleOrHigher', () => {
  it('should exist when imported', () => {
    expect(hasRoleOrHigher).toBeDefined()
  })

  it('should return true when user has exact role', () => {
    expect(hasRoleOrHigher([USER_ROLE.ADMIN], USER_ROLE.ADMIN)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.USER], USER_ROLE.USER)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.SUPER_ADMIN], USER_ROLE.SUPER_ADMIN)).toBe(true)
  })

  it('should return true when user has higher role', () => {
    expect(hasRoleOrHigher([USER_ROLE.SUPER_ADMIN], USER_ROLE.ADMIN)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.LOGGING_ADMIN], USER_ROLE.ADMIN)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.METRICS_ADMIN], USER_ROLE.ADMIN)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.ADMIN], USER_ROLE.EDITOR)).toBe(true)
    expect(hasRoleOrHigher([USER_ROLE.EDITOR], USER_ROLE.USER)).toBe(true)
  })

  it('should return false when user has lower role', () => {
    expect(hasRoleOrHigher([USER_ROLE.USER], USER_ROLE.ADMIN)).toBe(false)
    expect(hasRoleOrHigher([USER_ROLE.EDITOR], USER_ROLE.ADMIN)).toBe(false)
    expect(hasRoleOrHigher([USER_ROLE.ADMIN], USER_ROLE.SUPER_ADMIN)).toBe(false)
    expect(hasRoleOrHigher([USER_ROLE.METRICS_ADMIN], USER_ROLE.LOGGING_ADMIN)).toBe(false)
  })

  it('should return false for empty roles array', () => {
    expect(hasRoleOrHigher([], USER_ROLE.USER)).toBe(false)
    expect(hasRoleOrHigher([], USER_ROLE.ADMIN)).toBe(false)
  })

  it('should check all roles in array and use highest', () => {
    // User with both USER and ADMIN should pass ADMIN check
    expect(hasRoleOrHigher([USER_ROLE.USER, USER_ROLE.ADMIN], USER_ROLE.ADMIN)).toBe(true)
    // User with USER and EDITOR should still fail ADMIN check
    expect(hasRoleOrHigher([USER_ROLE.USER, USER_ROLE.EDITOR], USER_ROLE.ADMIN)).toBe(false)
  })
})

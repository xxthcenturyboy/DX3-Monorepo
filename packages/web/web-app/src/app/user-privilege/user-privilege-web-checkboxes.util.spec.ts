import { USER_ROLE } from '@dx3/models-shared'

import { prepareRoleCheckboxes, userHasRole } from './user-privilege-web-checboxes.util'

describe('userHasRole', () => {
  const userWithRoles = { roles: [USER_ROLE.ADMIN, USER_ROLE.USER] } as never

  it('should return true when user has the role', () => {
    expect(userHasRole(userWithRoles, USER_ROLE.ADMIN)).toBe(true)
  })

  it('should return false when user does not have the role', () => {
    expect(userHasRole(userWithRoles, USER_ROLE.SUPER_ADMIN)).toBe(false)
  })

  it('should return false when user roles is undefined', () => {
    expect(userHasRole({} as never, USER_ROLE.ADMIN)).toBe(false)
  })

  it('should return false when user roles is null', () => {
    expect(userHasRole({ roles: null } as never, USER_ROLE.ADMIN)).toBe(false)
  })
})

describe('prepareRoleCheckboxes', () => {
  const privilegeSets = [
    { name: 'ADMIN' },
    { name: 'SUPER_ADMIN' },
    { name: 'USER' },
    { name: 'EDITOR' },
  ] as never[]

  it('should exclude USER role from checkboxes', () => {
    const user = { roles: [] } as never
    const checkboxes = prepareRoleCheckboxes(privilegeSets, user)
    const roleNames = checkboxes.map((c) => c.role)
    expect(roleNames).not.toContain(USER_ROLE.USER)
  })

  it('should include non-USER roles', () => {
    const user = { roles: [] } as never
    const checkboxes = prepareRoleCheckboxes(privilegeSets, user)
    const roleNames = checkboxes.map((c) => c.role)
    expect(roleNames).toContain(USER_ROLE.ADMIN)
    expect(roleNames).toContain(USER_ROLE.SUPER_ADMIN)
  })

  it('should mark roles as hasRole=true when user has them', () => {
    const user = { roles: [USER_ROLE.ADMIN] } as never
    const checkboxes = prepareRoleCheckboxes(privilegeSets, user)
    const adminCheckbox = checkboxes.find((c) => c.role === USER_ROLE.ADMIN)
    expect(adminCheckbox?.hasRole).toBe(true)
  })

  it('should mark roles as hasRole=false when user does not have them', () => {
    const user = { roles: [] } as never
    const checkboxes = prepareRoleCheckboxes(privilegeSets, user)
    const superAdminCheckbox = checkboxes.find((c) => c.role === USER_ROLE.SUPER_ADMIN)
    expect(superAdminCheckbox?.hasRole).toBe(false)
  })

  it('should return empty array when all privilege sets are USER', () => {
    const onlyUser = [{ name: 'USER' }] as never[]
    const user = { roles: [] } as never
    const checkboxes = prepareRoleCheckboxes(onlyUser, user)
    expect(checkboxes).toHaveLength(0)
  })
})

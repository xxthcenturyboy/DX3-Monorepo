import {
  type PrivilegeSetDataType,
  USER_ROLE,
  type UserRoleUi,
  type UserType,
} from '@dx3/models-shared'

const getSetNameArray = (privilegeSets: PrivilegeSetDataType[]): (keyof typeof USER_ROLE)[] => {
  return Array.from(privilegeSets, (set) => set.name)
}

export const userHasRole = (user: UserType, role: string): boolean => {
  if (user?.roles && Array.isArray(user.roles)) {
    return user.roles.indexOf(role) > -1
  }

  return false
}

export const prepareRoleCheckboxes = (
  privilegesets: PrivilegeSetDataType[],
  user: UserType,
): UserRoleUi[] => {
  const setNames = getSetNameArray(privilegesets)
  const userRoles: UserRoleUi[] = []

  for (const key of setNames) {
    if (key !== USER_ROLE.USER) {
      const thisRole = USER_ROLE[key]
      userRoles.push({
        hasRole: userHasRole(user, thisRole),
        role: thisRole,
      })
    }
  }

  return userRoles
}

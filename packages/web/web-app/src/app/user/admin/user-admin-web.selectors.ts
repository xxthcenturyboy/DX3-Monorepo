import dayjs from 'dayjs'
import parsePhoneNumber from 'libphonenumber-js'
import { createSelector } from 'reselect'

import type { PhoneType, UserType } from '@dx3/models-shared'

import type { RootState } from '../../store/store-web.redux'
import type { UserAdminStateType } from './user-admin-web.types'
import { UserAdminWebListService } from './user-admin-web-list.service'

const getUser = (state: RootState): UserAdminStateType['user'] => state.userAdmin.user
const getUsers = (state: RootState): UserAdminStateType['users'] => state.userAdmin.users

export const selectUserFormatted = createSelector([getUser], (user) => {
  if (user) {
    const nextPhones: PhoneType[] = []
    for (const phone of user.phones) {
      const formatted = parsePhoneNumber(phone.phone)
      nextPhones.push({
        ...phone,
        uiFormatted: formatted?.formatNational() || phone.phone,
      })
    }
    return {
      ...user,
      createdAt: dayjs(user.createdAt).format('MMM D, YYYY h:mm A'),
      phones: nextPhones,
    }
  }

  return user
})

export const selectUsersFormatted = createSelector([getUsers], (users) => {
  const nextUsers: UserType[] = []
  for (const user of users) {
    const nextPhones: PhoneType[] = []
    for (const phone of user.phones) {
      const formatted = parsePhoneNumber(phone.phone)
      nextPhones.push({
        ...phone,
        uiFormatted: formatted?.formatNational() || phone.phone,
      })
    }
    nextUsers.push({
      ...user,
      phones: nextPhones,
    })
  }

  return nextUsers
})

export const selectUsersListData = createSelector([selectUsersFormatted], (users) => {
  const service = new UserAdminWebListService()
  return service.getRows(users)
})

import parsePhoneNumber from 'libphonenumber-js'
import { createSelector } from 'reselect'

import { MEDIA_VARIANTS, type PhoneType, type UserProfileStateType } from '@dx3/models-shared'

import { WebConfigService } from '../../config/config-web.service'
import type { RootState } from '../../store/store-web.redux'

const getUserProfile = (state: RootState): UserProfileStateType => state.userProfile
const getCurrentUserId = (state: RootState): string | null => state.userProfile?.id

export const selectIsUserProfileValid = createSelector([getCurrentUserId], (userId) => !!userId)

export const selectHasAdminRole = createSelector([getUserProfile], (profile) => {
  return profile.a
})

export const selectHasSuperAdminRole = createSelector([getUserProfile], (profile) => {
  return profile.sa
})

export const selectUserEmails = createSelector([getUserProfile], (profile) => {
  return profile.emails || []
})

export const selectUserPhones = createSelector([getUserProfile], (profile) => {
  return profile.phones || []
})

export const selectProfileFormatted = createSelector([getUserProfile], (profile) => {
  const nextPhones: PhoneType[] = []
  for (const phone of profile.phones) {
    const formatted = parsePhoneNumber(phone.phone)
    nextPhones.push({
      ...phone,
      uiFormatted: formatted?.formatNational(),
    })
  }

  let profileImageUrl: string | undefined

  if (profile.profileImage) {
    profileImageUrl = `${WebConfigService.getWebUrls().API_URL}/api/media/${profile.profileImage}/${MEDIA_VARIANTS.THUMB}`
  }

  return {
    ...profile,
    phones: nextPhones,
    profileImageUrl,
  }
})

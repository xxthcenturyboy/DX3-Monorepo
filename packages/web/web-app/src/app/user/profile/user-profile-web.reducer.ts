import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import autoMergeLevel1 from 'reduxjs-toolkit-persist/lib/stateReconciler/autoMergeLevel1'
import storage from 'reduxjs-toolkit-persist/lib/storage'
import type { PersistConfig } from 'reduxjs-toolkit-persist/lib/types'

import {
  APP_PREFIX,
  DEFAULT_TIMEZONE,
  type EmailType,
  type PhoneType,
  type UserProfileStateType,
} from '@dx3/models-shared'

import { USER_PROFILE_ENTITY_NAME } from './user-profile-web.consts'

export const userProfileInitialState: UserProfileStateType = {
  a: false,
  b: false,
  device: {
    hasBiometricSetup: false,
    id: '',
  },
  emails: [],
  firstName: '',
  fullName: '',
  hasSecuredAccount: false,
  hasVerifiedEmail: false,
  hasVerifiedPhone: false,
  id: '',
  lastName: '',
  phones: [],
  profileImage: null,
  restrictions: [],
  role: [],
  sa: false,
  timezone: DEFAULT_TIMEZONE,
  username: '',
}

export const userProfilePersistConfig: PersistConfig<UserProfileStateType> = {
  key: `${APP_PREFIX}:${USER_PROFILE_ENTITY_NAME}`,
  stateReconciler: autoMergeLevel1,
  // blacklist: ['password'],
  storage,
}

const userProfileSlice = createSlice({
  initialState: userProfileInitialState,
  name: USER_PROFILE_ENTITY_NAME,
  reducers: {
    emailAddedToProfile(state, action: PayloadAction<EmailType>) {
      const nextEmails = state.emails
      nextEmails.push(action.payload)
      if (action.payload.default) {
        for (const email of nextEmails) {
          if (email.default && email.id !== action.payload.id) {
            email.default = false
          }
        }
      }
      state.emails = nextEmails
    },
    emailRemovedFromProfile(state, action: PayloadAction<string>) {
      const nextEmails = state.emails.filter((email) => email.id !== action.payload)
      state.emails = nextEmails
    },
    phoneAddedToProfile(state, action: PayloadAction<PhoneType>) {
      const nextPhones = state.phones
      nextPhones.push(action.payload)
      if (action.payload.default) {
        for (const phone of nextPhones) {
          if (phone.default && phone.id !== action.payload.id) {
            phone.default = false
          }
        }
      }
      state.phones = nextPhones
    },
    phoneRemovedFromProfile(state, action: PayloadAction<string>) {
      const nextPhones = state.phones.filter((phone) => phone.id !== action.payload)
      state.phones = nextPhones
    },
    profileImageUpdate(state, action: PayloadAction<string | null>) {
      state.profileImage = action.payload
    },
    profileInvalidated(state, _action: PayloadAction<undefined>) {
      state.device = userProfileInitialState.device
      state.emails = userProfileInitialState.emails
      state.firstName = userProfileInitialState.firstName
      state.fullName = userProfileInitialState.fullName
      state.hasSecuredAccount = userProfileInitialState.hasSecuredAccount
      state.hasVerifiedEmail = userProfileInitialState.hasVerifiedEmail
      state.hasVerifiedPhone = userProfileInitialState.hasVerifiedPhone
      state.id = userProfileInitialState.id
      state.a = userProfileInitialState.a
      state.b = userProfileInitialState.b
      state.sa = userProfileInitialState.sa
      state.lastName = userProfileInitialState.lastName
      state.phones = userProfileInitialState.phones
      state.profileImage = userProfileInitialState.profileImage
      state.restrictions = userProfileInitialState.restrictions
      state.role = userProfileInitialState.role
      state.username = userProfileInitialState.username
    },
    profileUpdated(state, action: PayloadAction<UserProfileStateType>) {
      state.device = action.payload.device
      state.emails = action.payload.emails
      state.firstName = action.payload.firstName
      state.fullName = action.payload.fullName
      state.hasSecuredAccount = action.payload.hasSecuredAccount
      state.hasVerifiedEmail = action.payload.hasVerifiedEmail
      state.hasVerifiedPhone = action.payload.hasVerifiedPhone
      state.id = action.payload.id
      state.a = action.payload.a
      state.b = action.payload.b
      state.sa = action.payload.sa
      state.lastName = action.payload.lastName
      state.phones = action.payload.phones
      state.profileImage = action.payload.profileImage
      state.restrictions = action.payload.restrictions
      state.role = action.payload.role
      state.username = action.payload.username
    },
  },
})

export const userProfileActions = userProfileSlice.actions

export const userProfileReducer = userProfileSlice.reducer

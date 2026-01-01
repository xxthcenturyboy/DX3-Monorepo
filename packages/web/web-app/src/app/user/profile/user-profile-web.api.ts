import type {
  UpdatePasswordPayloadType,
  UpdateUsernamePayloadType,
  UpdateUserPayloadType,
  UpdateUserResponseType,
  UserLookupResponseType,
  UserProfileStateType,
} from '@dx3/models-shared'

import { apiWeb } from '../../data/rtk-query/web.api'

export const apiWebUserProfile = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<{ profile: UserProfileStateType | string | null }, void>({
      query: () => ({
        method: 'GET',
        url: 'v1/user/profile',
      }),
    }),
    getUsernameAvailability: build.query<UserLookupResponseType, string>({
      query: (username) => ({
        method: 'GET',
        params: {
          username: username,
        },
        url: 'v1/user/check/availability',
      }),
    }),
    updatePassword: build.mutation<{ success: boolean }, UpdatePasswordPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/user/update/password`,
      }),
    }),
    updateUser: build.mutation<UpdateUserResponseType, UpdateUserPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/user/${encodeURIComponent(paylaod.id)}`,
      }),
    }),
    updateUsername: build.mutation<
      UpdateUserResponseType,
      { id: string; payload: UpdateUsernamePayloadType }
    >({
      query: (params) => ({
        data: params.payload,
        method: 'PUT',
        url: `v1/user/update/username/${encodeURIComponent(params.id)}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useLazyGetProfileQuery,
  useLazyGetUsernameAvailabilityQuery,
  useUpdatePasswordMutation,
  useUpdateUserMutation,
  useUpdateUsernameMutation,
} = apiWebUserProfile

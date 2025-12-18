import type { UpdatePasswordPayloadType, UserProfileStateType } from '@dx3/models-shared'

import { apiWeb } from '../../data/rtk-query/web.api'

export const apiWebUserProfile = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<{ profile: UserProfileStateType | string | null }, void>({
      query: () => ({
        method: 'GET',
        url: 'v1/user/profile',
      }),
    }),
    updatePassword: build.mutation<{ success: boolean }, UpdatePasswordPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/user/update/password`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetProfileQuery, useUpdatePasswordMutation } = apiWebUserProfile

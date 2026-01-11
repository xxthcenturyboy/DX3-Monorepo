import type {
  UpdatePasswordPayloadType,
  UpdateUsernamePayloadType,
  UpdateUserPayloadType,
  UpdateUserResponseType,
  UserLookupResponseType,
  UserProfileStateType,
} from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../../data/rtk-query/web.api'

export const apiWebUserProfile = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getProfile: build.query<{ profile: UserProfileStateType | string | null }, void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: 'user/profile',
      }),
    }),
    getUsernameAvailability: build.query<UserLookupResponseType, string>({
      query: (username) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        params: {
          username: username,
        },
        url: 'user/check/availability',
      }),
    }),
    updatePassword: build.mutation<{ success: boolean }, UpdatePasswordPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `user/update/password`,
      }),
    }),
    updateUser: build.mutation<UpdateUserResponseType, UpdateUserPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `user/${encodeURIComponent(paylaod.id)}`,
      }),
    }),
    updateUsername: build.mutation<
      UpdateUserResponseType,
      { id: string; payload: UpdateUsernamePayloadType }
    >({
      query: (params) => ({
        data: params.payload,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `user/update/username/${encodeURIComponent(params.id)}`,
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

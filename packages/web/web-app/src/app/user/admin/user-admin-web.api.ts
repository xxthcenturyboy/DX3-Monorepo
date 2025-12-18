import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  type GetUserListResponseType,
  type GetUsersListQueryType,
  type UpdateUserPayloadType,
  type UserType,
} from '@dx3/models-shared'

import { apiWeb } from '../../data/rtk-query/web.api'

const buildUserAdminListUrl = (params: GetUsersListQueryType): string => {
  const limit = params.limit !== undefined ? params.limit : DEFAULT_LIMIT
  const offset = params.offset !== undefined ? params.offset : DEFAULT_OFFSET

  let url = `/v1/user/list?limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`

  if (params.orderBy !== undefined && params.sortDir !== undefined) {
    url += `&orderBy=${encodeURIComponent(params.orderBy)}&sortDir=${encodeURIComponent(params.sortDir)}`
  }
  if (params.filterValue !== undefined) {
    url += `&filterValue=${encodeURIComponent(params.filterValue)}`
  }

  return url
}

export const apiWebUserAdmin = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getUserAdmin: build.query<UserType, string>({
      query: (payload) => ({
        method: 'GET',
        url: `/v1/user/user/${encodeURIComponent(payload)}`,
      }),
    }),
    getUserAdminList: build.query<GetUserListResponseType, GetUsersListQueryType>({
      query: (payload) => ({
        method: 'GET',
        url: buildUserAdminListUrl(payload),
      }),
    }),
    updateUser: build.mutation<{ id: string }, UpdateUserPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/user/${encodeURIComponent(paylaod.id)}`,
      }),
    }),
    updateUserRolesRestrictions: build.mutation<{ id: string }, UpdateUserPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/user/roles-restrictions/${encodeURIComponent(paylaod.id)}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useLazyGetUserAdminListQuery,
  useLazyGetUserAdminQuery,
  useUpdateUserMutation,
  useUpdateUserRolesRestrictionsMutation,
} = apiWebUserAdmin

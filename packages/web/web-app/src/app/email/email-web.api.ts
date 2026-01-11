import type { CreateEmailPayloadType, UpdateEmailPayloadType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

export const apiWebEmail = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    addEmail: build.mutation<{ id: string }, CreateEmailPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: 'email',
      }),
    }),
    checkEmailAvailability: build.mutation<{ isAvailable: boolean }, string>({
      query: (paylaod) => ({
        data: { email: paylaod },
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: 'email/validate',
      }),
    }),
    deleteEmail: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'DELETE',
        url: `email/${encodeURIComponent(paylaod)}`,
      }),
    }),
    deleteEmailProfile: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'DELETE',
        url: `email/user-profile/${encodeURIComponent(paylaod)}`,
      }),
    }),
    updateEmail: build.mutation<{ id: string }, UpdateEmailPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `email/${encodeURIComponent(paylaod.id)}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useAddEmailMutation,
  useCheckEmailAvailabilityMutation,
  useDeleteEmailMutation,
  useDeleteEmailProfileMutation,
  useUpdateEmailMutation,
} = apiWebEmail

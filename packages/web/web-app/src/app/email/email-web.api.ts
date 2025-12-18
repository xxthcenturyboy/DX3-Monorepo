import type { CreateEmailPayloadType, UpdateEmailPayloadType } from '@dx3/models-shared'

import { apiWeb } from '../data/rtk-query/web.api'

export const apiWebEmail = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    addEmail: build.mutation<{ id: string }, CreateEmailPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'POST',
        url: 'v1/email',
      }),
    }),
    checkEmailAvailability: build.mutation<{ isAvailable: boolean }, string>({
      query: (paylaod) => ({
        data: { email: paylaod },
        method: 'POST',
        url: 'v1/email/validate',
      }),
    }),
    deleteEmail: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        method: 'DELETE',
        url: `v1/email/${encodeURIComponent(paylaod)}`,
      }),
    }),
    deleteEmailProfile: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        method: 'DELETE',
        url: `v1/email/user-profile/${encodeURIComponent(paylaod)}`,
      }),
    }),
    updateEmail: build.mutation<{ id: string }, UpdateEmailPayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/email/${encodeURIComponent(paylaod.id)}`,
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

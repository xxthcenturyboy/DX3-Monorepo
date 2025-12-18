import type { CreatePhonePayloadType, UpdatePhonePayloadType } from '@dx3/models-shared'

import { apiWeb } from '../data/rtk-query/web.api'

export const apiWebPhone = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    addPhone: build.mutation<{ id: string; phoneFormatted: string }, CreatePhonePayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'POST',
        url: 'v1/phone',
      }),
    }),
    checkPhoneAvailability: build.mutation<
      { isAvailable: boolean },
      { phone: string; regionCode: string }
    >({
      query: (paylaod) => ({
        data: paylaod,
        method: 'POST',
        url: 'v1/phone/validate',
      }),
    }),
    deletePhone: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        method: 'DELETE',
        url: `v1/phone/${paylaod}`,
      }),
    }),
    deletePhoneProfile: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        method: 'DELETE',
        url: `v1/phone/user-profile/${paylaod}`,
      }),
    }),
    updatePhone: build.mutation<{ id: string }, UpdatePhonePayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        method: 'PUT',
        url: `v1/phone/${paylaod.id}`,
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useAddPhoneMutation,
  useCheckPhoneAvailabilityMutation,
  useDeletePhoneMutation,
  useDeletePhoneProfileMutation,
  useUpdatePhoneMutation,
} = apiWebPhone

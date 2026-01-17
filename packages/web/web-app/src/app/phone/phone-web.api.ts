import type { CreatePhonePayloadType, UpdatePhonePayloadType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

export const apiWebPhone = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    addPhone: build.mutation<{ id: string; phone: string }, CreatePhonePayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: 'phone',
      }),
    }),
    checkPhoneAvailability: build.mutation<
      { isAvailable: boolean },
      { phone: string; regionCode: string }
    >({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'POST',
        url: 'phone/validate',
      }),
    }),
    deletePhone: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'DELETE',
        url: `phone/${paylaod}`,
      }),
    }),
    deletePhoneProfile: build.mutation<{ id: string }, string>({
      query: (paylaod) => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'DELETE',
        url: `phone/user-profile/${paylaod}`,
      }),
    }),
    updatePhone: build.mutation<{ id: string }, UpdatePhonePayloadType>({
      query: (paylaod) => ({
        data: paylaod,
        headers: getCustomHeaders({ version: 1 }),
        method: 'PUT',
        url: `phone/${paylaod.id}`,
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

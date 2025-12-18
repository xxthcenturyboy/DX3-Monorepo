import type { PrivilegeSetDataType } from '@dx3/models-shared'

import { apiWeb } from '../data/rtk-query/web.api'

export const apiWebPrivilegeSets = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getPrivilegeSets: build.query<PrivilegeSetDataType[], void>({
      query: () => ({
        method: 'GET',
        url: '/v1/privilege-set',
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetPrivilegeSetsQuery } = apiWebPrivilegeSets

import type { PrivilegeSetDataType } from '@dx3/models-shared'

import { apiWeb, getCustomHeaders } from '../data/rtk-query/web.api'

export const apiWebPrivilegeSets = apiWeb.injectEndpoints({
  endpoints: (build) => ({
    getPrivilegeSets: build.query<PrivilegeSetDataType[], void>({
      query: () => ({
        headers: getCustomHeaders({ version: 1 }),
        method: 'GET',
        url: '/privilege-set',
      }),
    }),
  }),
  overrideExisting: true,
})

export const { useLazyGetPrivilegeSetsQuery } = apiWebPrivilegeSets

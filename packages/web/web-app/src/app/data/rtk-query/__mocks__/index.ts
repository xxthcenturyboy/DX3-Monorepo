import { createApi } from '@reduxjs/toolkit/query/react'

export const apiWeb = createApi({
  // @ts-expect-error - is only a mock
  baseQuery: () => null,
  endpoints: () => ({}),
  reducerPath: 'apiWeb',
})

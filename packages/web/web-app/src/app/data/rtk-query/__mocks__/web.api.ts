import { createApi } from '@reduxjs/toolkit/query/react'

export const apiWeb = createApi({
  baseQuery: () => ({ data: null }),
  endpoints: () => ({}),
  reducerPath: 'apiWeb',
})

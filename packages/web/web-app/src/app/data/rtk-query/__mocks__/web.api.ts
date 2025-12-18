import { createApi } from '@reduxjs/toolkit/query/react'

export const apiWeb = createApi({
  baseQuery: () => null,
  endpoints: () => ({}),
  reducerPath: 'apiWeb',
})

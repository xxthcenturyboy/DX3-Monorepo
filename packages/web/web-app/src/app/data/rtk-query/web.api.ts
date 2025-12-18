import { createApi } from '@reduxjs/toolkit/query/react'

import { axiosBaseQuery } from './axios-web.api'
// import { BaseQueryFnType } from './axios-web.types';

export const apiWeb = createApi({
  // baseQuery: axiosBaseQuery() as BaseQueryFnType,
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
})

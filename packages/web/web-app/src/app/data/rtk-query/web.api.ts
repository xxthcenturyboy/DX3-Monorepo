import { createApi } from '@reduxjs/toolkit/query/react'
import { AxiosHeaders } from 'axios'

import { HEADER_API_VERSION_PROP } from '@dx3/models-shared'

import { axiosBaseQuery } from './axios-web.api'
// import { BaseQueryFnType } from './axios-web.types';

export const apiWeb = createApi({
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
})

export const getCustomHeaders = (params: { contentType?: string; version: number }) => {
  const { contentType, version } = params

  const values: Record<string, string> = {}

  if (version !== undefined) {
    values[HEADER_API_VERSION_PROP] = '1'
  }

  if (contentType) {
    values['Content-Type'] = contentType
  }

  return new AxiosHeaders(values)
}

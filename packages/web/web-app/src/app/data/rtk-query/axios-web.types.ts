import type { BaseQueryFn, QueryReturnValue } from '@reduxjs/toolkit/query/react'
import type {
  AxiosHeaders,
  AxiosProgressEvent,
  AxiosRequestConfig,
  HeadersDefaults,
  HttpStatusCode,
  Method,
  RawAxiosRequestHeaders,
} from 'axios'

export type AxiosInstanceHeadersParamType = {
  headers: AxiosHeaders | Partial<HeadersDefaults> | RawAxiosRequestHeaders
}

export type UploadProgressHandlerType = (progress: AxiosProgressEvent) => void

export type AxiosBaseQueryParamsType = {
  url: string
  method?: Method
  data?: AxiosRequestConfig['data']
  params?: AxiosRequestConfig['params']
  headers?: (RawAxiosRequestHeaders & AxiosHeaders) | AxiosHeaders
  uploadProgressHandler?: UploadProgressHandlerType
}

export type BaseQueryFnType = BaseQueryFn<unknown, unknown, CustomResponseErrorType, object>

export type CustomResponseErrorType = {
  code?: string
  data?: string
  error: string
  i18nKey?: string | null
  localizedMessage?: string
  status: number
}

type BaseQueryResponseType<T> = {
  data?: T | T[] | string
  status?: HttpStatusCode
}

export type RequestResponseType<T> = {
  error?: CustomResponseErrorType
} & BaseQueryResponseType<T> &
  // biome-ignore lint/suspicious/noExplicitAny: expected here
  QueryReturnValue<T, CustomResponseErrorType, any>

export type JSONObject = {
  [key: string]: string | number | boolean | JSONObject
}

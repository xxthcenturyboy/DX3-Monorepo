import 'axios' // Important: ensures the original module is loaded into the context

import { HEADER_API_VERSION_PROP } from '@dx3/models-shared'

declare module 'axios' {
  /**
   * Extends the default headers interface to include custom headers.
   */
  export interface AxiosRequestHeaders {
    [HEADER_API_VERSION_PROP]?: string // Make it optional if it's not always present
  }

  /**
   * Also augment HeadersDefaults for global or instance-specific defaults
   */
  export interface HeadersDefaults extends AxiosRequestHeaders {}
}

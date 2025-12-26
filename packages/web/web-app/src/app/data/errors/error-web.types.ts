/**
 * Error Web Types
 *
 * Frontend-specific error handling types.
 */

import type { ErrorCodeType } from '@dx3/models-shared'

import type { InterpolationParams } from '../../i18n'

/**
 * Resolved error with localized message.
 */
export type ResolvedErrorType = {
  code: ErrorCodeType | null
  localizedMessage: string
  originalMessage: string
}

/**
 * Options for resolving an error message.
 */
export type ResolveErrorOptionsType = {
  code?: ErrorCodeType | string | null
  fallbackMessage?: string
  params?: InterpolationParams
}

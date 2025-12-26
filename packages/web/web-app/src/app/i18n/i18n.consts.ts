/**
 * i18n Constants
 *
 * Configuration constants for the internationalization system.
 */

import type { LocaleCode, StringKeys } from './i18n.types'

/**
 * Entity name for Redux slice identification.
 */
export const I18N_ENTITY_NAME = 'i18n' as const

/**
 * Default locale code used as fallback.
 */
export const DEFAULT_LOCALE: LocaleCode = 'en'

/**
 * Base path for locale JSON files.
 */
export const LOCALES_BASE_PATH = '/assets/locales'

/**
 * Interpolation placeholder regex pattern.
 * Matches {variableName} syntax.
 */
export const INTERPOLATION_REGEX = /\{(\w+)\}/g

/**
 * Default English strings - bundled inline as ultimate fallback.
 * These are always available even if network requests fail.
 */
export const DEFAULT_STRINGS: StringKeys = {
  // Common Actions
  CANCEL: 'Cancel',
  CONFIRM: 'Confirm',
  // Authentication
  COULD_NOT_LOG_YOU_IN: 'Could not log you in. Please try again.',
  DELETE: 'Delete',
  EDIT: 'Edit',

  // Common Labels
  EMAIL: 'Email',

  // Error Messages
  ERROR_GENERIC: 'An error occurred. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_NOT_FOUND: 'The requested resource was not found.',
  ERROR_UNAUTHORIZED: 'You are not authorized to perform this action.',

  // Greetings (with interpolation placeholders)
  GREETING: 'Hello, {name}!',
  LOADING: 'Loading...',
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  NAME: 'Name',
  PASSWORD: 'Password',
  PHONE: 'Phone',
  SAVE: 'Save',
  SUBMIT: 'Submit',
  SUCCESS_DELETED: 'Successfully deleted.',

  // Success Messages
  SUCCESS_SAVED: 'Successfully saved.',
  TRY_ANOTHER_WAY: 'Try another way?',
  USERNAME: 'Username',
  WELCOME_BACK: 'Welcome back, {name}!',
}

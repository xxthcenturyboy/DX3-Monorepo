/**
 * i18n Type Definitions
 *
 * This file contains all type definitions for the internationalization system.
 * String keys are strictly typed to prevent typos and ensure compile-time safety.
 */

/**
 * i18n State stored in Redux.
 */
export type I18nStateType = {
  currentLocale: LocaleCode
  defaultLocale: LocaleCode
  defaultTranslations: StringKeys
  error: string | null
  isInitialized: boolean
  isLoading: boolean
  translations: StringKeys | null
}

/**
 * Interpolation parameters type.
 * Maps placeholder names to their replacement values.
 */
export type InterpolationParams = Record<string, string | number>

/**
 * Available locale codes supported by the application.
 * Extend this union type as new locales are added.
 */
export type LocaleCode = 'en'

/**
 * Locale metadata for manifest file.
 */
export type LocaleMetadata = {
  code: LocaleCode
  isRTL: boolean
  name: string
  nativeName: string
}

/**
 * Locales manifest structure.
 */
export type LocalesManifest = {
  availableLocales: LocaleMetadata[]
  defaultLocale: LocaleCode
}

/**
 * Type-safe key union derived from StringKeys type.
 * Use this type when you need to reference a string key dynamically.
 */
export type StringKeyName = keyof StringKeys

/**
 * String keys type - defines all available translation keys.
 * Each key maps to a string value that may contain interpolation placeholders.
 *
 * Interpolation syntax: {variableName}
 * Example: "Hello, {name}!" where name is passed as { name: 'Dan' }
 */
export type StringKeys = {
  ACCOUNT_MENU: string
  ADD: string
  ARRAY_BUFFERS: string
  AUTH_FAILED: string
  AUTH_INVALID_CREDENTIALS: string
  AUTH_OTP_EXPIRED: string
  AUTH_OTP_INVALID: string
  AUTH_SESSION_EXPIRED: string
  AUTH_TOKEN_INVALID: string
  AUTH_UNAUTHORIZED: string
  APP_MENU: string
  BACK: string
  CANCEL: string
  CHANGE_PASSWORD: string
  CHARACTERS_REMAINING: string
  CLOSE: string
  CONFIRM: string
  CONFIRM_PASSWORD: string
  COULD_NOT_LOG_YOU_IN: string
  COULD_NOT_LOGOUT: string
  CREATE: string
  DASHBOARD_WELCOME: string
  DEFAULT: string
  DELETE: string
  EDIT: string
  EMAIL: string
  EMAIL_ALREADY_EXISTS: string
  EMAIL_DELETE_FAILED: string
  EMAIL_INVALID: string
  EMAIL_NOT_FOUND: string
  EMAIL_SEND_FAILED: string
  EMAIL_VERIFICATION_FAILED: string
  EMAILS: string
  EXTERNAL: string
  FILTER: string
  GENERIC: string
  GENERIC_BAD_REQUEST: string
  GENERIC_FORBIDDEN: string
  GENERIC_NOT_FOUND: string
  GENERIC_SERVER_ERROR: string
  GENERIC_VALIDATION_FAILED: string
  GET_CODE_VIA_EMAIL: string
  GET_CODE_VIA_PHONE: string
  GREETING: string
  HEAP_TOTAL: string
  HEAP_USED: string
  LABEL: string
  LOADING: string
  LOG_OUT: string
  LOGIN: string
  LOGOUT: string
  MEDIA_FILE_COUNT_EXCEEDED: string
  MEDIA_FILE_SIZE_EXCEEDED: string
  MEDIA_INVALID_TYPE: string
  MEDIA_UPLOAD_FAILED: string
  MESSAGE: string
  NAME: string
  NETWORK: string
  NEW_EMAIL: string
  NEW_PHONE: string
  NO_DATA: string
  NOT_FOUND: string
  NOTIFICATION_CREATE_FAILED: string
  NOTIFICATION_MISSING_PARAMS: string
  NOTIFICATION_MISSING_USER_ID: string
  NOTIFICATION_SERVER_ERROR: string
  NOTIFICATIONS: string
  NOTIFICATIONS_WILL_APPEAR_HERE: string
  OTP_CHOOSE_METHOD: string
  PAGE_TITLE_ADMIN_USERS: string
  PAGE_TITLE_API_HEALTH: string
  PAGE_TITLE_DASHBOARD: string
  PAGE_TITLE_EDIT_USER: string
  PAGE_TITLE_PROFILE: string
  PAGE_TITLE_USER_PROFILE: string
  PASSWORD: string
  PHONE: string
  PHONE_ALREADY_EXISTS: string
  PHONE_DELETE_FAILED: string
  PHONE_INVALID: string
  PHONE_NOT_FOUND: string
  PHONE_VERIFICATION_FAILED: string
  PHONES: string
  PING: string
  PROFILE: string
  READ: string
  REFRESH: string
  RESTRICTIONS: string
  ROLES: string
  RSS: string
  SAVE: string
  SEND: string
  SEND_CODE: string
  SEND_PUSH_TO_PHONE: string
  SEND_TO_ALL_USERS: string
  SEND_TO_USER: string
  START_OVER: string
  STATUS: string
  SUBMIT: string
  SUCCESS_DELETED: string
  SUCCESS_SAVED: string
  TITLE: string
  TOGGLE_DARK_MODE: string
  TOOLTIP_DELETE_EMAIL: string
  TOOLTIP_DELETE_PHONE: string
  TOOLTIP_REFRESH_DATA: string
  TOOLTIP_REFRESH_LIST: string
  TRY_ANOTHER_WAY: string
  TYPE: string
  UNAUTHORIZED: string
  UPDATE: string
  USER_ALREADY_EXISTS: string
  USER_CREATE_FAILED: string
  USER_NOT_FOUND: string
  USER_UPDATE_FAILED: string
  USERNAME: string
  VERIFIED: string
  VERIFY: string
  VERSION: string
  WELCOME_BACK: string
  WRITE: string
}

/**
 * Translation function type with interpolation support.
 */
export type TranslateFn = <K extends StringKeyName>(key: K, params?: InterpolationParams) => string

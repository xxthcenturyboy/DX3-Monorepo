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
  EMAILS: string
  ERROR_GENERIC: string
  ERROR_NETWORK: string
  ERROR_NOT_FOUND: string
  ERROR_UNAUTHORIZED: string
  EXTERNAL: string
  FILTER: string
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
  MESSAGE: string
  NAME: string
  NEW_EMAIL: string
  NEW_PHONE: string
  NO_DATA: string
  OTP_CHOOSE_METHOD: string
  PAGE_TITLE_ADMIN_USERS: string
  PAGE_TITLE_API_HEALTH: string
  PAGE_TITLE_DASHBOARD: string
  PAGE_TITLE_EDIT_USER: string
  PAGE_TITLE_PROFILE: string
  PAGE_TITLE_USER_PROFILE: string
  PASSWORD: string
  PHONE: string
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
  UPDATE: string
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

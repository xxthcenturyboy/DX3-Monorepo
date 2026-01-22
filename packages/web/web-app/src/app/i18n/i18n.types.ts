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
  ABOUT: string
  ABOUT_PAGE_TITLE: string
  ACCOUNT_MENU: string
  ADD: string
  ADMIN: string
  ADMINS: string
  ALL_USERS: string
  API_HEALTH: string
  APP_STATS: string
  ARE_YOU_SURE_YOU_WANT_TO_DELETE_THE_EMAIL: string
  ARE_YOU_SURE_YOU_WANT_TO_DELETE_THE_PHONE: string
  ARE_YOU_SURE_YOU_WANT_TO_LOG_OUT: string
  ARRAY_BUFFERS: string
  AUTH_FAILED: string
  AUTH_INCOMPLETE_BIOMETRIC: string
  AUTH_INVALID_BIOMETRIC: string
  AUTH_INVALID_CREDENTIALS: string
  AUTH_OTP_EXPIRED: string
  AUTH_OTP_INVALID: string
  AUTH_SESSION_EXPIRED: string
  AUTH_SIGNUP_BAD_PHONE_TYPE: string
  AUTH_SIGNUP_FAILED: string
  AUTH_TOKEN_INVALID: string
  AUTH_UNAUTHORIZED: string
  AVATAR: string
  APP_MENU: string
  BACK: string
  BETA: string
  BETA_USERS: string
  BLOG: string
  BLOG_PAGE_TITLE: string
  CANCEL: string
  CANCELING: string
  CHANGE_PASSWORD: string
  CHARACTERS_REMAINING: string
  CHECK_AVAILABLILITY: string
  CHECK_BACK_FOR_UPDATES: string
  CHOOSE_IMAGE: string
  CLOSE: string
  COMING_SOON: string
  CONFIRM: string
  CREATE_FEATURE_FLAG: string
  CONFIRM_PASSWORD: string
  COULD_NOT_LOG_YOU_IN: string
  COULD_NOT_LOGOUT: string
  CREATE: string
  CREATE_PASSWORD: string
  DASHBOARD: string
  DASHBOARD_WELCOME: string
  DEFAULT: string
  DELETE: string
  DESCRIPTION: string
  DOWN: string
  EDIT: string
  EMAIL: string
  EMAIL_ALREADY_EXISTS: string
  EMAIL_DELETE_FAILED: string
  EMAIL_DELETED: string
  EMAIL_INVALID: string
  EMAIL_NOT_FOUND: string
  EMAIL_SEND_FAILED: string
  EMAIL_VERIFICATION_FAILED: string
  EMAILS: string
  ENTER_THE_CODE_SENT_TO_YOUR_VAR: string
  EXTERNAL: string
  FAIL: string
  FAQ: string
  FAQ_PAGE_TITLE: string
  FEATURE_FLAG_COMING_SOON: string
  FEATURE_FLAGS: string
  FILTER: string
  FIRST_NAME: string
  GENERIC: string
  GENERIC_BAD_REQUEST: string
  GENERIC_FORBIDDEN: string
  GENERIC_NOT_FOUND: string
  GENERIC_SERVER_ERROR: string
  GENERIC_VALIDATION_FAILED: string
  GREETING: string
  HEAP_TOTAL: string
  HEAP_USED: string
  HOME: string
  LABEL: string
  LAST_NAME: string
  LOADING: string
  LOG_OUT: string
  LOGIN: string
  LOG_IN: string
  LOG_IN_TO_YOUR_ACCOUNT: string
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
  OK: string
  OOPS_SOMETHING_WENT_WRONG: string
  OPT_IN_BETA: string
  OTP_CHOOSE_METHOD: string
  PAGE_TITLE_ADMIN_USERS: string
  PAGE_TITLE_API_HEALTH: string
  PAGE_TITLE_DASHBOARD: string
  PAGE_TITLE_EDIT_USER: string
  PAGE_TITLE_PROFILE: string
  PAGE_TITLE_SSR_HEALTH: string
  PAGE_TITLE_USER_PROFILE: string
  PASSWORD: string
  PERCENTAGE: string
  PERSONAL: string
  PHONE: string
  PHONE_ALREADY_EXISTS: string
  PHONE_DELETE_FAILED: string
  PHONE_DELETED: string
  PHONE_INVALID: string
  PHONE_MUST_BE_ABLE_TO_RECEIVE_SMS: string
  PHONE_NOT_FOUND: string
  PHONE_VERIFICATION_FAILED: string
  PHONES: string
  PING: string
  PROFILE: string
  PROFILE_UPDATED: string
  PUBLIC_PAGES: string
  READ: string
  REFRESH: string
  RESTRICTED: string
  RESTRICTIONS: string
  ROLES: string
  ROLLOUT: string
  RSS: string
  SAVE: string
  SEND: string
  SEND_APP_UPDATE: string
  SEND_APP_UPDATE_TO_ALL_USERS: string
  SEND_CODE: string
  SEND_NOTIFICATION: string
  SEND_NOTIFICATION_TO_ALL_USERS: string
  SEND_PUSH_TO_PHONE: string
  SEND_TO_ALL_USERS: string
  SEND_TO_USER: string
  SET_AS_DEFAULT: string
  SIGNUP: string
  SIGNUP_FOR_AN_ACCOUNT: string
  SSR_HEALTH: string
  SSR_SERVER: string
  START_OVER: string
  STATUS: string
  SUBMIT: string
  SUCCESS_DELETED: string
  SUCCESS_SAVED: string
  SUPER: string
  SUPER_ADMINS: string
  TARGET: string
  THIS_ACCOUNT_CANNOT_BE_EDITED: string
  TIMEOUT_TURBO: string
  TITLE: string
  TOGGLE_DARK_MODE: string
  TOOLTIP_DELETE_EMAIL: string
  TOOLTIP_DELETE_PHONE: string
  TOOLTIP_REFRESH_DATA: string
  TOOLTIP_REFRESH_LIST: string
  TRY_WITH_ONE_TIME_CODE: string
  TRY_WITH_USERNAME_AND_PASSWORD: string
  TYPE: string
  UPTIME: string
  UNAUTHORIZED: string
  UPDATE: string
  USER_ADMIN: string
  USER_ALREADY_EXISTS: string
  USER_CREATE_FAILED: string
  USER_NOT_FOUND: string
  USER_PROFANE_USERNAMES_NOT_ALLOWED: string
  USER_STATS: string
  USER_TITLE: string
  USER_UPDATED: string
  USER_UPDATE_FAILED: string
  USER_USERNAME_UNAVAILABLE: string
  USERNAME: string
  USERNAME_IS_AVAILABLE: string
  USERNAME_IS_UNAVAILABLE: string
  USERNAME_REQUIREMENT: string
  VERIFIED: string
  VERIFY: string
  VERSION: string
  WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR: string
  WELCOME_BACK: string
  WORK: string
  WRITE: string
  YOU_CANNOT_EDIT_ROLES: string
  YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE: string
  YOU_HAVE_MADE_TOO_MANY_REQUESTS: string
  YOU_NEED_TO_ADD_A_PRIMARY_EMAIL: string
}

/**
 * Translation function type with interpolation support.
 */
export type TranslateFn = <K extends StringKeyName>(key: K, params?: InterpolationParams) => string

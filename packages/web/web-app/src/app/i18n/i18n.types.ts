/**
 * i18n Type Definitions
 *
 * This file contains all type definitions for the internationalization system.
 * String keys are strictly typed to prevent typos and ensure compile-time safety.
 */

/**
 * Available locale codes supported by the application.
 * Extend this union type as new locales are added.
 */
export type LocaleCode = 'en'

/**
 * String keys type - defines all available translation keys.
 * Each key maps to a string value that may contain interpolation placeholders.
 *
 * Interpolation syntax: {variableName}
 * Example: "Hello, {name}!" where name is passed as { name: 'Dan' }
 */
export type StringKeys = {
  // Authentication
  COULD_NOT_LOG_YOU_IN: string
  LOGIN: string
  LOGOUT: string
  PASSWORD: string
  TRY_ANOTHER_WAY: string
  USERNAME: string

  // Common Actions
  CANCEL: string
  CONFIRM: string
  DELETE: string
  EDIT: string
  SAVE: string
  SUBMIT: string

  // Common Labels
  EMAIL: string
  LOADING: string
  NAME: string
  PHONE: string

  // Error Messages
  ERROR_GENERIC: string
  ERROR_NETWORK: string
  ERROR_NOT_FOUND: string
  ERROR_UNAUTHORIZED: string

  // Success Messages
  SUCCESS_SAVED: string
  SUCCESS_DELETED: string

  // Greetings (examples with interpolation)
  GREETING: string
  WELCOME_BACK: string
}

/**
 * Type-safe key union derived from StringKeys type.
 * Use this type when you need to reference a string key dynamically.
 */
export type StringKeyName = keyof StringKeys

/**
 * Interpolation parameters type.
 * Maps placeholder names to their replacement values.
 */
export type InterpolationParams = Record<string, string | number>

/**
 * i18n State stored in Redux.
 */
export type I18nStateType = {
  /** Current active locale code */
  currentLocale: LocaleCode

  /** Default/fallback locale code */
  defaultLocale: LocaleCode

  /** Loaded translations for current locale */
  translations: StringKeys | null

  /** Default translations (English) - always available as fallback */
  defaultTranslations: StringKeys

  /** Whether translations are currently loading */
  isLoading: boolean

  /** Whether the i18n system has been initialized */
  isInitialized: boolean

  /** Error message if loading failed */
  error: string | null
}

/**
 * Locale metadata for manifest file.
 */
export type LocaleMetadata = {
  code: LocaleCode
  name: string
  nativeName: string
  isRTL: boolean
}

/**
 * Locales manifest structure.
 */
export type LocalesManifest = {
  defaultLocale: LocaleCode
  availableLocales: LocaleMetadata[]
}

/**
 * Translation function type with interpolation support.
 */
export type TranslateFn = <K extends StringKeyName>(key: K, params?: InterpolationParams) => string

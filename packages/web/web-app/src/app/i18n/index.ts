/**
 * i18n Module - Barrel Export
 *
 * Centralized internationalization system for the web application.
 * Provides type-safe translations with interpolation and fallback support.
 */

export {
  DEFAULT_LOCALE,
  DEFAULT_STRINGS,
  I18N_ENTITY_NAME,
  INTERPOLATION_REGEX,
  LOCALES_BASE_PATH,
} from './i18n.consts'

export type { UseI18nResult } from './i18n.hooks'
export { useI18n, useString, useStrings, useTranslation } from './i18n.hooks'

export {
  i18nActions,
  i18nInitialState,
  i18nPersistConfig,
  i18nReducer,
} from './i18n.reducer'

export {
  makeSelectTranslation,
  selectCurrentLocale,
  selectError,
  selectIsInitialized,
  selectIsLoading,
  selectTranslations,
} from './i18n.selectors'

export { I18nService, i18nService } from './i18n.service'

export type {
  I18nStateType,
  InterpolationParams,
  LocaleCode,
  LocaleMetadata,
  LocalesManifest,
  StringKeyName,
  StringKeys,
  TranslateFn,
} from './i18n.types'

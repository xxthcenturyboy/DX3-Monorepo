/** biome-ignore-all lint/suspicious/noExplicitAny: Type is ok here */
import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, useStore } from 'react-redux'
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  persistReducer,
  persistStore,
  REGISTER,
  REHYDRATE,
} from 'reduxjs-toolkit-persist'

import type { StatsStateType, UserProfileStateType } from '@dx3/models-shared'

import { adminLogsPersistConfig, adminLogsReducer } from '../admin-logs/admin-logs-web.reducer'
import {
  blogEditorBodyReducer,
  blogEditorListReducer,
  blogEditorSettingsReducer,
} from '../blog/admin/blog-admin-web.reducer'
import type { AdminLogsStateType } from '../admin-logs/admin-logs-web.types'
import {
  adminMetricsPersistConfig,
  adminMetricsReducer,
} from '../admin-metrics/admin-metrics-web.reducer'
import type { AdminMetricsStateType } from '../admin-metrics/admin-metrics-web.types'
import { authPersistConfig, authReducer } from '../auth/auth-web.reducer'
import type { AuthStateType } from '../auth/auth-web.types'
import { dashboardReducer } from '../dashboard/dashboard-web.reducer'
import { apiWeb } from '../data/rtk-query/web.api'
import { featureFlagAdminReducer } from '../feature-flags/admin/feature-flag-admin-web.reducer'
import {
  featureFlagsPersistConfig,
  featureFlagsReducer,
} from '../feature-flags/feature-flag-web.reducer'
import type { FeatureFlagsStateType } from '../feature-flags/feature-flag-web.types'
import { homeReducer } from '../home/home-web.reducer'
import { type I18nStateType, i18nPersistConfig, i18nReducer } from '../i18n'
import { mediaPersistConfig, mediaReducer } from '../media/media-web.reducer'
import type { MediaStateType } from '../media/media-web.types'
import { notificationReducer } from '../notifications/notification-web.reducer'
import { statsPersistConfig, statsReducer } from '../stats/stats-web.reducer'
import {
  type SupportAdminStateType,
  supportAdminPersistConfig,
  supportAdminReducer,
} from '../support/store/support-admin-web.reducer'
import { supportReducer } from '../support/store/support-web.reducer'
import { uiPersistConfig, uiReducer } from '../ui/store/ui-web.reducer'
import type { UiStateType } from '../ui/ui-web.types'
import { userAdminPersistConfig, userAdminReducer } from '../user/admin/user-admin-web.reducer'
import type { UserAdminStateType } from '../user/admin/user-admin-web.types'
import {
  userProfilePersistConfig,
  userProfileReducer,
} from '../user/profile/user-profile-web.reducer'
import {
  privilegeSetPersistConfig,
  privilegeSetReducer,
} from '../user-privilege/user-privilege-web.reducer'
import type { PrivilegeSetStateType } from '../user-privilege/user-privilege-web.types'

const combinedPersistReducers = combineReducers({
  [apiWeb.reducerPath]: apiWeb.reducer,
  adminLogs: persistReducer<AdminLogsStateType, any>(
    adminLogsPersistConfig,
    adminLogsReducer,
  ) as typeof adminLogsReducer,
  adminMetrics: persistReducer<AdminMetricsStateType, any>(
    adminMetricsPersistConfig,
    adminMetricsReducer,
  ) as typeof adminMetricsReducer,
  auth: persistReducer<AuthStateType, any>(authPersistConfig, authReducer) as typeof authReducer,
  blogEditorBody: blogEditorBodyReducer,
  blogEditorList: blogEditorListReducer,
  blogEditorSettings: blogEditorSettingsReducer,
  dashboard: dashboardReducer,
  featureFlags: persistReducer<FeatureFlagsStateType, any>(
    featureFlagsPersistConfig,
    featureFlagsReducer,
  ) as typeof featureFlagsReducer,
  featureFlagsAdmin: featureFlagAdminReducer,
  home: homeReducer,
  i18n: persistReducer<I18nStateType, any>(i18nPersistConfig, i18nReducer) as typeof i18nReducer,
  media: persistReducer<MediaStateType, any>(
    mediaPersistConfig,
    mediaReducer,
  ) as typeof mediaReducer,
  notification: notificationReducer,
  privileges: persistReducer<PrivilegeSetStateType, any>(
    privilegeSetPersistConfig,
    privilegeSetReducer,
  ) as typeof privilegeSetReducer,
  stats: persistReducer<StatsStateType, any>(
    statsPersistConfig,
    statsReducer,
  ) as typeof statsReducer,
  support: supportReducer,
  supportAdmin: persistReducer<SupportAdminStateType, any>(
    supportAdminPersistConfig,
    supportAdminReducer,
  ) as typeof supportAdminReducer,
  ui: persistReducer<UiStateType, any>(uiPersistConfig, uiReducer) as typeof uiReducer,
  userAdmin: persistReducer<UserAdminStateType, any>(
    userAdminPersistConfig,
    userAdminReducer,
  ) as typeof userAdminReducer,
  userProfile: persistReducer<UserProfileStateType, any>(
    userProfilePersistConfig,
    userProfileReducer,
  ) as typeof userProfileReducer,
})

const store = configureStore({
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        ignoredPaths: ['ui.dialogComponent'],
      },
    }).concat(apiWeb.middleware),
  reducer: combinedPersistReducers,
})

// Lazy persistor creation to avoid auto-rehydration during SSR
let persistor: ReturnType<typeof persistStore> | null = null

/**
 * Get or create persistor instance.
 * For SSR, this should be called AFTER applying preloaded state.
 * For CSR, this can be called immediately.
 */
export function getPersistor() {
  if (!persistor) {
    persistor = persistStore(store)
  }
  return persistor
}

type AppStore = typeof store
type RootState = ReturnType<AppStore['getState']>
type AppDispatch = AppStore['dispatch']

const useAppDispatch = useDispatch.withTypes<AppDispatch>()
const useAppSelector = useSelector.withTypes<RootState>()
const useAppStore = useStore.withTypes<AppStore>()

export type { AppDispatch, AppStore, RootState }

export { store, useAppDispatch, useAppSelector, useAppStore }

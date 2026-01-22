import { combineReducers, configureStore } from '@reduxjs/toolkit'

import { authReducer } from '../../auth/auth-web.reducer'
import { dashboardReducer } from '../../dashboard/dashboard-web.reducer'
import { apiWeb } from '../../data/rtk-query/web.api'
import { featureFlagAdminReducer } from '../../feature-flags/admin/feature-flag-admin-web.reducer'
import { featureFlagsReducer } from '../../feature-flags/feature-flag-web.reducer'
import { homeReducer } from '../../home/home-web.reducer'
import { i18nReducer } from '../../i18n/i18n.reducer'
import { mediaReducer } from '../../media/media-web.reducer'
import { notificationReducer } from '../../notifications/notification-web.reducer'
import { statsReducer } from '../../stats/stats-web.reducer'
import { uiReducer } from '../../ui/store/ui-web.reducer'
import { userAdminReducer } from '../../user/admin/user-admin-web.reducer'
import { userProfileReducer } from '../../user/profile/user-profile-web.reducer'
import { privilegeSetReducer } from '../../user-privilege/user-privilege-web.reducer'

export const rootReducer = combineReducers({
  [apiWeb.reducerPath]: apiWeb.reducer,
  auth: authReducer,
  dashboard: dashboardReducer,
  featureFlags: featureFlagsReducer,
  featureFlagsAdmin: featureFlagAdminReducer,
  home: homeReducer,
  i18n: i18nReducer,
  media: mediaReducer,
  notification: notificationReducer,
  privileges: privilegeSetReducer,
  stats: statsReducer,
  ui: uiReducer,
  userAdmin: userAdminReducer,
  userProfile: userProfileReducer,
})

export const setupStore = (_preloadedState: Partial<RootState>) => {
  return configureStore({
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiWeb.middleware),
    reducer: rootReducer,
  })
}

export type AppStore = ReturnType<typeof setupStore>
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = AppStore['dispatch']

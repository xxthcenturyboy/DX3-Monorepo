import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { BetaFeatureComponent } from '@dx3/web-libs/ui/global/beta-feature-placeholder.component'
import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { WebConfigService } from '../config/config-web.service'
import { store } from '../store/store-web.redux'

const LazyStatsComponent = lazy(async () => ({
  default: (await import('../stats/stats-web-api-health.component')).StatsWebApiHealthComponent,
}))

export const SudoRouter = () => {
  const hasSuperAdminRole = store.getState ? store.getState().userProfile.sa : false
  const strings = store.getState()?.i18n?.translations

  return hasSuperAdminRole ? (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  ) : (
    <UnauthorizedComponent message={strings?.YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE} />
  )
}

export class SudoWebRouterConfig {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()
    const strings = store.getState()?.i18n?.translations

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazyStatsComponent />,
            path: ROUTES.SUDO.STATS.HEALTH,
          },
          {
            element: (
              <BetaFeatureComponent
                comingSoon={strings?.COMING_SOON}
                message={strings?.CHECK_AVAILABLILITY}
              />
            ),
            errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
            path: ROUTES.SUDO.STATS.USERS,
          },
        ],
        element: <SudoRouter />,
        errorElement: (
          <UnauthorizedComponent message={strings?.YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE} />
        ),
      },
    ]

    return config
  }
}

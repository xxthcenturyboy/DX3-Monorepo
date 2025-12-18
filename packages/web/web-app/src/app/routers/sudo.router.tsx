import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router-dom'

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
  return hasSuperAdminRole ? (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  ) : (
    <UnauthorizedComponent />
  )
}

export class SudoWebRouterConfig {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazyStatsComponent />,
            path: ROUTES.SUDO.STATS.HEALTH,
          },
          {
            element: <BetaFeatureComponent />,
            errorElement: <GlobalErrorComponent />,
            path: ROUTES.SUDO.STATS.USERS,
          },
        ],
        element: <SudoRouter />,
        errorElement: <UnauthorizedComponent />,
      },
    ]

    return config
  }
}

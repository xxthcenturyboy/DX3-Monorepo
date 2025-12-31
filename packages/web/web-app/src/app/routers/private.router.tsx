import { lazy, Suspense } from 'react'
import { Navigate, Outlet, type RouteObject } from 'react-router'

import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { WebConfigService } from '../config/config-web.service'
import { useAppSelector } from '../store/store-web.redux'
import { AdminWebRouterConfig } from './admin.router'
import { SudoWebRouterConfig } from './sudo.router'

const LazyDashboardComponent = lazy(async () => ({
  default: (await import('../dashboard/dashboard-web.component')).Dashboard,
}))

const LazyUserProfileComponent = lazy(async () => ({
  default: (await import('../user/profile/user-profile-web.component')).UserProfile,
}))

export const PrivateRouter = () => {
  const isAuthenticated = useAppSelector((store) => selectIsAuthenticated(store))
  const ROUTES = WebConfigService.getWebRoutes()
  return isAuthenticated ? (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  ) : (
    <Navigate to={ROUTES.AUTH.LOGIN} />
  )
}

export class PrivateWebRouterConfig {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazyDashboardComponent />,
            errorElement: <GlobalErrorComponent />,
            path: ROUTES.DASHBOARD.MAIN,
          },
          {
            element: <LazyUserProfileComponent />,
            errorElement: <GlobalErrorComponent />,
            path: ROUTES.USER_PROFILE.MAIN,
          },
          ...AdminWebRouterConfig.getRouter(),
          ...SudoWebRouterConfig.getRouter(),
        ],
        element: <PrivateRouter />,
        errorElement: <UnauthorizedComponent />,
      },
    ]

    return config
  }
}

import { lazy, Suspense } from 'react'
import { Navigate, Outlet, type RouteObject } from 'react-router'

import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { WebConfigService } from '../config/config-web.service'
import { store, useAppSelector } from '../store/store-web.redux'
import { SUPPORT_ROUTES } from '../support/support-web.consts'
import { AdminWebRouterConfig } from './admin.router'
import { SudoWebRouterConfig } from './sudo.router'

const LazyDashboardComponent = lazy(async () => ({
  default: (await import('../dashboard/dashboard-web.component')).Dashboard,
}))

const LazySupportComponent = lazy(async () => ({
  default: (await import('../support/support-web.component')).SupportComponent,
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
    const strings = store.getState()?.i18n?.translations

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazyDashboardComponent />,
            errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
            path: ROUTES.DASHBOARD.MAIN,
          },
          {
            element: <LazySupportComponent />,
            errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
            path: SUPPORT_ROUTES.MAIN,
          },
          {
            element: <LazyUserProfileComponent />,
            errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
            path: ROUTES.USER_PROFILE.MAIN,
          },
          ...AdminWebRouterConfig.getRouter(),
          ...SudoWebRouterConfig.getRouter(),
        ],
        element: <PrivateRouter />,
        errorElement: (
          <UnauthorizedComponent message={strings?.YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE} />
        ),
      },
    ]

    return config
  }
}

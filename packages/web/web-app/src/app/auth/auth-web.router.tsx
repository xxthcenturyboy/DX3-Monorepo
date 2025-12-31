import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import { AUTH_ROUTES } from './auth-web.consts'

export const AuthWebRouter = () => {
  return (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  )
}

const LazySignupComponent = lazy(async () => ({
  default: (await import('./auth-web-wrapper.component')).WebAuthWrapper,
}))

export class AuthWebRouterConfig {
  public static getRouter() {
    const config: RouteObject[] = [
      {
        element: <LazySignupComponent route="login" />,
        errorElement: <NotFoundComponent />,
        path: AUTH_ROUTES.LOGIN,
      },
      {
        element: <LazySignupComponent route="signup" />,
        errorElement: <NotFoundComponent />,
        path: AUTH_ROUTES.SIGNUP,
      },
      {
        children: [
          // {
          //   path: ROUTES.AUTH.LOGIN,
          //   element: (<WebLogin />),
          //   errorElement: (<NotFoundComponent />)
          // }
        ],
        element: <AuthWebRouter />,
        errorElement: <NotFoundComponent />,
        path: AUTH_ROUTES.MAIN,
      },
    ]

    return config
  }
}

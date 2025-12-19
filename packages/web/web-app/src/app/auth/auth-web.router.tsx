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

const LazyLoginComponent = lazy(async () => ({
  default: (await import('./auth-web-login.component')).WebLogin,
}))

export class AuthWebRouterConfig {
  public static getRouter() {
    const config: RouteObject[] = [
      {
        // lazy: async () => {
        //   const { WebLogin } = await import('@dx/auth-web');
        //   return { Component: WebLogin };
        // },
        element: <LazyLoginComponent />,
        errorElement: <NotFoundComponent />,
        path: AUTH_ROUTES.LOGIN,
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

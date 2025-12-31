import { lazy } from 'react'
import type { RouteObject } from 'react-router'

import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import { AuthenticatedRouter } from '../routers/authenticated.router'
import { AUTH_ROUTES } from './auth-web.consts'

const LazySignupComponent = lazy(async () => ({
  default: (await import('./auth-web-wrapper.component')).WebAuthWrapper,
}))

export class AuthWebRouterConfig {
  public static getRouter() {
    const config: RouteObject[] = [
      {
        children: [
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
        ],
        element: <AuthenticatedRouter />,
        errorElement: <NotFoundComponent />,
      },
    ]

    return config
  }
}

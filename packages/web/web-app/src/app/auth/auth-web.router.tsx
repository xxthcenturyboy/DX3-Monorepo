import { lazy } from 'react'
import type { RouteObject } from 'react-router'

import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'

import { AuthenticatedRouter } from '../routers/authenticated.router'
import { store } from '../store/store-web.redux'
import { AUTH_ROUTES } from './auth-web.consts'

const LazySignupComponent = lazy(async () => ({
  default: (await import('./auth-web-wrapper.component')).WebAuthWrapper,
}))

export class AuthWebRouterConfig {
  public static getRouter() {
    const strings = store.getState()?.i18n?.translations

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazySignupComponent route="login" />,
            errorElement: (
              <NotFoundComponent
                notFoundHeader={strings?.NOT_FOUND}
                notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
              />
            ),
            path: AUTH_ROUTES.LOGIN,
          },
          {
            element: <LazySignupComponent route="signup" />,
            errorElement: (
              <NotFoundComponent
                notFoundHeader={strings?.NOT_FOUND}
                notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
              />
            ),
            path: AUTH_ROUTES.SIGNUP,
          },
        ],
        element: <AuthenticatedRouter />,
        errorElement: (
          <NotFoundComponent
            notFoundHeader={strings?.NOT_FOUND}
            notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
          />
        ),
      },
    ]

    return config
  }
}

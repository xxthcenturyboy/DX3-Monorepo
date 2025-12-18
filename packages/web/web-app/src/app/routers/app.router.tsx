import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'
import { RateLimitComponent } from '@dx3/web-libs/ui/global/rate-limit.component'

import { AuthWebRouterConfig } from '../auth/auth-web.router'
import { WebConfigService } from '../config/config-web.service'
import { Root } from '../root-web.component'
import { PrivateWebRouterConfig } from './private.router'

const LazyHomeComponent = lazy(async () => ({
  default: (await import('../home/home-web.component')).HomeComponent,
}))

const LazyShortlinkComponent = lazy(async () => ({
  default: (await import('../shortlink/shortlink-web.component')).ShortlinkComponent,
}))

export class AppRouter {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()

    return createBrowserRouter([
      {
        children: [
          {
            element: <LazyHomeComponent />,
            path: ROUTES.MAIN,
          },
          ...AuthWebRouterConfig.getRouter(),
          {
            element: <LazyShortlinkComponent />,
            path: `${ROUTES.SHORTLINK.MAIN}/:token`,
          },
          ...PrivateWebRouterConfig.getRouter(),
          {
            element: <NotFoundComponent />,
            path: ROUTES.NOT_FOUND,
          },
          {
            element: <RateLimitComponent />,
            path: ROUTES.LIMITED,
          },
          {
            element: <NotFoundComponent />,
            path: '*',
          },
        ],
        element: <Root />,
        errorElement: <GlobalErrorComponent />,
      },
    ])
  }
}

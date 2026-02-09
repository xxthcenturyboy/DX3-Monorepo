import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'

import { GlobalErrorComponent } from '@dx3/web-libs/ui/global/global-error.component'
import { NotFoundComponent } from '@dx3/web-libs/ui/global/not-found.component'
import { RateLimitComponent } from '@dx3/web-libs/ui/global/rate-limit.component'

import { AuthWebRouterConfig } from '../auth/auth-web.router'
import { WebConfigService } from '../config/config-web.service'
import { Root } from '../root-web.component'
import { store } from '../store/store-web.redux'
import { AuthenticatedRouter } from './authenticated.router'
import { PrivateWebRouterConfig } from './private.router'

const LazyHomeComponent = lazy(async () => ({
  default: (await import('../home/home-web.component')).HomeComponent,
}))

const LazyShortlinkComponent = lazy(async () => ({
  default: (await import('../shortlink/shortlink-web.component')).ShortlinkComponent,
}))

const LazyFaqComponent = lazy(async () => ({
  default: (await import('../faq/faq-web.component')).FaqComponent,
}))

const LazyAboutComponent = lazy(async () => ({
  default: (await import('../about/about-web.component')).AboutComponent,
}))

const LazyBlogComponent = lazy(async () => ({
  default: (await import('../blog/blog-web.component')).BlogComponent,
}))

const LazyBlogPostComponent = lazy(async () => ({
  default: (await import('../blog/blog-post-web.component')).BlogPostComponent,
}))

export class AppRouter {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()
    const strings = store.getState()?.i18n?.translations

    return createBrowserRouter([
      {
        children: [
          {
            children: [
              {
                element: <LazyHomeComponent />,
                path: ROUTES.MAIN,
              },
            ],
            element: <AuthenticatedRouter />,
            errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
          },
          ...AuthWebRouterConfig.getRouter(),
          {
            element: <LazyShortlinkComponent />,
            path: `${ROUTES.SHORTLINK.MAIN}/:token`,
          },
          {
            element: <LazyFaqComponent />,
            path: ROUTES.FAQ,
          },
          {
            element: <LazyAboutComponent />,
            path: ROUTES.ABOUT,
          },
          {
            element: <LazyBlogComponent />,
            path: ROUTES.BLOG,
          },
          {
            element: <LazyBlogPostComponent />,
            path: `${ROUTES.BLOG}/:slug`,
          },
          ...PrivateWebRouterConfig.getRouter(),
          {
            element: (
              <NotFoundComponent
                notFoundHeader={strings?.NOT_FOUND}
                notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
              />
            ),
            path: ROUTES.NOT_FOUND,
          },
          {
            element: (
              <RateLimitComponent
                bodyText={strings?.YOU_HAVE_MADE_TOO_MANY_REQUESTS}
                headerText={strings?.TIMEOUT_TURBO}
              />
            ),
            path: ROUTES.LIMITED,
          },
          {
            element: (
              <NotFoundComponent
                notFoundHeader={strings?.NOT_FOUND}
                notFoundText={strings?.WE_COULDNT_FIND_WHAT_YOURE_LOOKING_FOR}
              />
            ),
            path: '*',
          },
        ],
        element: <Root />,
        errorElement: <GlobalErrorComponent buttonText={strings?.BACK} />,
      },
    ])
  }
}

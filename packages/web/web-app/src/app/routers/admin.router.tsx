import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { WebConfigService } from '../config/config-web.service'
import { store } from '../store/store-web.redux'
import { SUPPORT_ADMIN_ROUTES } from '../support/support.consts'

const LazySupportAdminDetailComponent = lazy(async () => ({
  default: (await import('../support/admin/support-admin-detail.component'))
    .SupportAdminDetailComponent,
}))

const LazySupportAdminListComponent = lazy(async () => ({
  default: (await import('../support/admin/support-admin-list.component'))
    .SupportAdminListComponent,
}))

const LazyUserAdminComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web.component')).UserAdminMain,
}))

const LazyUserAdminEditComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web-edit.component')).UserAdminEdit,
}))

const LazyUserAdminListComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web-list.component')).UserAdminList,
}))

export const AdminRouter = () => {
  const hasAdminRole = () => {
    if (store.getState().userProfile.sa || store.getState().userProfile.a) {
      return true
    }

    return false
  }
  const strings = store.getState()?.i18n?.translations

  return hasAdminRole() ? (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  ) : (
    <UnauthorizedComponent message={strings?.YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE} />
  )
}

export class AdminWebRouterConfig {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()
    const strings = store.getState()?.i18n?.translations

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazySupportAdminListComponent />,
            path: SUPPORT_ADMIN_ROUTES.LIST,
          },
          {
            element: <LazySupportAdminDetailComponent />,
            path: `${SUPPORT_ADMIN_ROUTES.DETAIL}/:id`,
          },
          {
            element: <LazyUserAdminComponent />,
            path: ROUTES.ADMIN.USER.MAIN,
          },
          {
            element: <LazyUserAdminEditComponent />,
            path: `${ROUTES.ADMIN.USER.DETAIL}/:id`,
          },
          {
            element: <LazyUserAdminListComponent />,
            path: ROUTES.ADMIN.USER.LIST,
          },
        ],
        element: <AdminRouter />,
        errorElement: (
          <UnauthorizedComponent message={strings?.YOU_ARE_NOT_AUTHORIZED_TO_VIEW_THIS_FEATURE} />
        ),
      },
    ]

    return config
  }
}

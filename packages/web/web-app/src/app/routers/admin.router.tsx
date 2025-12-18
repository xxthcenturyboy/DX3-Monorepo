import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router-dom'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { WebConfigService } from '../config/config-web.service'
import { store } from '../store/store-web.redux'

const LazyUserAdminComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web.component')).UserAdminMain,
}))

const LazyUserAdminListComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web-list.component')).UserAdminList,
}))

const LazyUserAdminEditComponent = lazy(async () => ({
  default: (await import('../user/admin/user-admin-web-edit.component')).UserAdminEdit,
}))

export const AdminRouter = () => {
  const hasAdminRole = () => {
    if (store.getState().userProfile.sa || store.getState().userProfile.a) {
      return true
    }

    return false
  }

  return hasAdminRole() ? (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  ) : (
    <UnauthorizedComponent />
  )
}

export class AdminWebRouterConfig {
  public static getRouter() {
    const ROUTES = WebConfigService.getWebRoutes()

    const config: RouteObject[] = [
      {
        children: [
          {
            element: <LazyUserAdminComponent />,
            path: ROUTES.ADMIN.USER.MAIN,
          },
          {
            element: <LazyUserAdminListComponent />,
            path: ROUTES.ADMIN.USER.LIST,
          },
          {
            element: <LazyUserAdminEditComponent />,
            path: `${ROUTES.ADMIN.USER.DETAIL}/:id`,
          },
        ],
        element: <AdminRouter />,
        errorElement: <UnauthorizedComponent />,
      },
    ]

    return config
  }
}

import { lazy, Suspense } from 'react'
import { Outlet, type RouteObject } from 'react-router'

import { hasRoleOrHigher, USER_ROLE } from '@dx3/models-shared'
import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'
import { UnauthorizedComponent } from '@dx3/web-libs/ui/global/unauthorized.component'

import { ADMIN_LOGS_ROUTES } from '../admin-logs/admin-logs-web.consts'
import { ADMIN_METRICS_ROUTES } from '../admin-metrics/admin-metrics-web.consts'
import { BLOG_EDITOR_ROUTES } from '../blog/admin/blog-admin-web.consts'
import { WebConfigService } from '../config/config-web.service'
import { store } from '../store/store-web.redux'
import { SUPPORT_ADMIN_ROUTES } from '../support/support.consts'

const LazyAdminBlogEditorComponent = lazy(async () => ({
  default: (await import('../blog/admin/blog-admin-web-editor.component')).BlogAdminEditorComponent,
}))

const LazyAdminBlogListComponent = lazy(async () => ({
  default: (await import('../blog/admin/blog-admin-web-list.component')).BlogAdminListComponent,
}))

const LazyBlogPostPreviewComponent = lazy(async () => ({
  default: (await import('../blog/admin/blog-post-preview-web.component')).BlogPostPreviewComponent,
}))

const LazyAdminLogsListComponent = lazy(async () => ({
  default: (await import('../admin-logs/admin-logs-web-list.component')).AdminLogsListComponent,
}))

const LazyAdminMetricsDashboardComponent = lazy(async () => ({
  default: (await import('../admin-metrics/admin-metrics-web-dashboard.component'))
    .AdminMetricsDashboardComponent,
}))

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
    const { a, role, sa } = store.getState().userProfile
    if (sa || a) return true
    return hasRoleOrHigher(role, USER_ROLE.EDITOR)
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
            element: <LazyAdminBlogEditorComponent />,
            path: `${BLOG_EDITOR_ROUTES.EDIT}/:id`,
          },
          {
            element: <LazyAdminBlogEditorComponent />,
            path: BLOG_EDITOR_ROUTES.NEW,
          },
          {
            element: <LazyAdminBlogListComponent />,
            path: BLOG_EDITOR_ROUTES.LIST,
          },
          {
            element: <LazyBlogPostPreviewComponent />,
            path: `${BLOG_EDITOR_ROUTES.PREVIEW}/:id`,
          },
          {
            element: <LazyAdminLogsListComponent />,
            path: ADMIN_LOGS_ROUTES.LIST,
          },
          {
            element: <LazyAdminMetricsDashboardComponent />,
            path: ADMIN_METRICS_ROUTES.DASHBOARD,
          },
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

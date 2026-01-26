import type { RouteObject } from 'react-router'

import { SUPPORT_ADMIN_ROUTES } from '../support-web.consts'
import { SupportAdminDetailComponent } from './support-admin-detail.component'
import { SupportAdminListComponent } from './support-admin-list.component'

/**
 * Admin support routes
 * These routes require admin or super admin role
 */
export const supportAdminRoutes: RouteObject[] = [
  {
    element: <SupportAdminListComponent />,
    path: SUPPORT_ADMIN_ROUTES.LIST,
  },
  {
    element: <SupportAdminDetailComponent />,
    path: `${SUPPORT_ADMIN_ROUTES.DETAIL}/:id`,
  },
]

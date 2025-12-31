import { Suspense } from 'react'
import { Navigate, Outlet } from 'react-router'

import { UiLoadingComponent } from '@dx3/web-libs/ui/global/loading.component'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { WebConfigService } from '../config/config-web.service'
import { useAppSelector } from '../store/store-web.redux'

export const AuthenticatedRouter = () => {
  const isAuthenticated = useAppSelector((store) => selectIsAuthenticated(store))

  if (isAuthenticated) {
    const ROUTES = WebConfigService.getWebRoutes()
    return <Navigate to={ROUTES.DASHBOARD.MAIN} />
  }

  return (
    <Suspense fallback={<UiLoadingComponent pastDelay={true} />}>
      <Outlet />
    </Suspense>
  )
}

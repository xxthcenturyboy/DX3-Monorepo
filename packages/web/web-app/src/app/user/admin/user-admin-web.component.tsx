import React from 'react'
import { useNavigate } from 'react-router-dom'

import { WebConfigService } from '../../config/config-web.service'
import { useAppSelector } from '../../store/store-web-redux.hooks'

export const UserAdminMain: React.FC = () => {
  const lastRoute = useAppSelector((state) => state.userAdmin.lastRoute)
  const navigate = useNavigate()
  const ROUTES = WebConfigService.getWebRoutes()

  React.useEffect(() => {
    let nextRoute = ROUTES.ADMIN.USER.LIST
    if (lastRoute) {
      nextRoute = lastRoute
    }

    navigate(nextRoute, { replace: true })
  }, [lastRoute])

  return null
}

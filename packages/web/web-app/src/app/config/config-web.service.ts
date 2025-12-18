import { AUTH_ROUTES } from '../auth/auth-web.consts'
import { DASHBOARD_ROUTES } from '../dashboard/dashboard-web.consts'
import { SHORTLINK_ROUTES } from '../shortlink/shortlink-web.consts'
import { STATS_SUDO_ROUTES } from '../stats/stats-web.consts'
import { USER_ADMIN_ROUTES } from '../user/admin/user-admin-web.consts'
import { USER_PROFILE_ROUTES } from '../user/profile/user-profile-web.consts'
import { WEB_APP_ENV } from './env'

export class WebConfigService {
  public static getWebUrls() {
    return {
      API_URL: WEB_APP_ENV.API_URL,
      WEB_APP_URL: WEB_APP_ENV.WEB_APP_URL,
    }
  }

  public static getWebRoutes() {
    return {
      ADMIN: {
        USER: USER_ADMIN_ROUTES,
      },
      AUTH: AUTH_ROUTES,
      DASHBOARD: DASHBOARD_ROUTES,
      LIMITED: '/cyberia',
      MAIN: '/',
      NOT_FOUND: '/404',
      SHORTLINK: SHORTLINK_ROUTES,
      SUDO: {
        STATS: STATS_SUDO_ROUTES,
      },
      USER_PROFILE: USER_PROFILE_ROUTES,
    }
  }

  public static getNoRedirectRoutes() {
    const routes = WebConfigService.getWebRoutes()
    if (routes) {
      return [routes.MAIN, routes.AUTH.LOGIN, routes.SHORTLINK.MAIN]
    }

    return []
  }
}

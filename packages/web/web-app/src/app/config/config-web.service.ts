import { AUTH_ROUTES } from '../auth/auth-web.consts'
import { DASHBOARD_ROUTES } from '../dashboard/dashboard-web.consts'
import { SHORTLINK_ROUTES } from '../shortlink/shortlink-web.consts'
import { STATS_SUDO_ROUTES } from '../stats/stats-web.consts'
import { USER_ADMIN_ROUTES } from '../user/admin/user-admin-web.consts'
import { USER_PROFILE_ROUTES } from '../user/profile/user-profile-web.consts'
import { DEVELOPMENT } from './config-web.consts'
import { WEB_APP_ENV } from './env'

export class WebConfigService {
  public static getWebUrls() {
    return {
      API_URL: WEB_APP_ENV.API_URL,
      WEB_APP_URL: WEB_APP_ENV.WEB_APP_URL,
    }
  }

  public static isDev() {
    return WEB_APP_ENV.ENV === DEVELOPMENT
  }

  public static getWebRoutes() {
    return {
      ABOUT: '/about',
      ADMIN: {
        USER: USER_ADMIN_ROUTES,
      },
      AUTH: AUTH_ROUTES,
      BLOG: '/blog',
      DASHBOARD: DASHBOARD_ROUTES,
      FAQ: '/faq',
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
      return [
        routes.ABOUT,
        routes.AUTH.LOGIN,
        routes.AUTH.SIGNUP,
        routes.BLOG,
        routes.FAQ,
        routes.MAIN,
        routes.SHORTLINK.MAIN,
      ]
    }

    return []
  }
}

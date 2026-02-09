import { USER_ROLE } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'
import type { AppMenuType } from '../../ui/menus/app-menu.types'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'

/**
 * Standalone Blog Editor menu (EDITOR role) - single item, separate from Admin menu
 */
export const blogEditorMenu = (): AppMenuType => {
  const strings = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  return {
    collapsible: false,
    description: '',
    id: 'menu-blog-editor',
    items: [
      {
        icon: IconNames.EDIT_DOCUMENT,
        id: 'menu-item-blog-editor-posts',
        pathMatches: [
          BLOG_EDITOR_ROUTES.EDIT,
          BLOG_EDITOR_ROUTES.MAIN,
          BLOG_EDITOR_ROUTES.NEW,
          BLOG_EDITOR_ROUTES.PREVIEW,
        ],
        restriction: USER_ROLE.EDITOR,
        routeKey: BLOG_EDITOR_ROUTES.LIST,
        title: strings.BLOG_EDITOR_MENU ?? strings.BLOG,
        type: 'ROUTE',
      },
    ],
    title: strings.BLOG_EDITOR_MENU ?? strings.BLOG,
  }
}

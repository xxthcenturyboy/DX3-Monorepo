import React from 'react'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useAppSelector } from '../store/store-web-redux.hooks'
import { NotificationsDesktop } from './notification-desktop.component'
import { NotificationsMobile } from './notification-mobile.component'

type NotificationsMenuPropsType = {
  anchorElement: HTMLElement | null
  clickCloseMenu: () => void
}

export const NotificationsMenu: React.FC<NotificationsMenuPropsType> = (props) => {
  const [menuBreak, setMenuBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
  }, [windowWidth])

  if (menuBreak) {
    return <NotificationsMobile clickCloseMenu={props.clickCloseMenu} />
  }

  return <NotificationsDesktop {...props} />
}

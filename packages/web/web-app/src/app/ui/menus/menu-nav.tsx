import React from 'react'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useAppSelector } from '../../store/store-web-redux.hooks'
import { AppMenuDesktop } from './app-menu-desktop.component'
import { AppMenuMobile } from './app-menu-mobile.component'

export const MenuNav: React.FC = () => {
  const [menuBreak, setMenuBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
  }, [windowWidth])

  if (menuBreak) {
    return <AppMenuMobile />
  }

  return <AppMenuDesktop />
}

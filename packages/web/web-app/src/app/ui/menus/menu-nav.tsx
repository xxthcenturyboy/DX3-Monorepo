import React from 'react'

import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppSelector } from '../../store/store-web-redux.hooks'
import { OverlayMenu } from './overlay-menu.component'
import { ResponsiveMenu } from './responsive-menu.component'

export const MenuNav: React.FC = () => {
  const [menuBreak, setMenuBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
  }, [windowWidth])

  if (menuBreak) {
    return <OverlayMenu />
  }

  return <ResponsiveMenu />
}

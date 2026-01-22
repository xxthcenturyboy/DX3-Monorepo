import React from 'react'

import { DrawerMenuComponent } from '@dx3/web-libs/ui/dialog/drawer-menu.component'
import { DRAWER_WIDTH, MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'
import { PublicMenu } from './public-menu.component'

export const PublicMenuMobile: React.FC = () => {
  const open = useAppSelector((state) => state.ui.publicMenuOpen)
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const dispatch = useAppDispatch()
  const topPixel = mobileBreak ? 36 : 64

  React.useEffect(() => {
    setMobileBreak(windowWidth <= MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  const toggleMenuState = (): void => {
    dispatch(uiActions.togglePublicMenuSet(false))
  }

  return (
    <DrawerMenuComponent
      anchor={mobileBreak ? 'bottom' : 'left'}
      clickCloseMenu={toggleMenuState}
      open={open}
      topPixel={topPixel}
      width={mobileBreak ? '100%' : `${DRAWER_WIDTH}px`}
      widthOuter={`${DRAWER_WIDTH}px`}
    >
      <PublicMenu mobileBreak={mobileBreak} />
    </DrawerMenuComponent>
  )
}

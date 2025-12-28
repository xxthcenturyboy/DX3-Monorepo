import { Drawer } from '@mui/material'
import { styled } from '@mui/material/styles'
import React from 'react'

import { DRAWER_WIDTH } from '@dx3/web-libs/ui/system/mui-overrides/mui.theme'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { uiActions } from '../ui/store/ui-web.reducer'
import { DrawerContent } from './drawer-content.component'

export const DrawerComponent: React.FC = () => {
  const open = useAppSelector((state) => state.ui.mobileNotiicationsOpen)
  const [mobileBreak, setMobileBreak] = React.useState(false)
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const dispatch = useAppDispatch()
  const topPixel = mobileBreak ? 36 : 64

  React.useEffect(() => {
    setMobileBreak(windowWidth <= MEDIA_BREAK.MOBILE)
  }, [windowWidth])

  const toggleMenuState = (): void => {
    dispatch(uiActions.toggleMobileNotificationsOpenSet(false))
  }

  return (
    <Drawer
      anchor={mobileBreak ? 'bottom' : 'left'}
      onClose={toggleMenuState}
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          borderBottom: 'none',
          borderRadius: 0,
          borderTop: 'none',
          // height: '100%',
          height: `calc(100% - ${topPixel}px)`,
          position: 'fixed',
          top: `${topPixel}px`,
          width: mobileBreak ? '100%' : `${DRAWER_WIDTH}px`,
        },
        flexShrink: 0,
        width: `${DRAWER_WIDTH}px`,
      }}
      transitionDuration={500}
      variant="temporary"
    >
      <DrawerContent mobileBreak={mobileBreak} />
    </Drawer>
  )
}

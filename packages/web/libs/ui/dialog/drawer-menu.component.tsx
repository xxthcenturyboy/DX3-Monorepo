import { Drawer } from '@mui/material'
import type React from 'react'

import { BORDER_RADIUS } from '../ui.consts'
import { StyledContentWrapper } from './drawer-menu.ui'

type DrawerMenuComponentPropsType = {
  anchor: 'left' | 'bottom' | 'right' | 'top'
  children: React.ReactNode
  clickCloseMenu: () => void
  open: boolean
  topPixel: number
  width: string
  widthOuter: string
}

export const DrawerMenuComponent: React.FC<DrawerMenuComponentPropsType> = (props) => {
  const { anchor, children, clickCloseMenu, open, topPixel, width, widthOuter } = props

  return (
    <Drawer
      anchor={anchor}
      onClose={clickCloseMenu}
      open={open}
      sx={{
        '& .MuiDrawer-paper': {
          borderBottom: 'none',
          borderRadius: BORDER_RADIUS,
          borderTop: 'none',
          height: `calc(100% - ${topPixel}px)`,
          position: 'fixed',
          top: `${topPixel}px`,
          width: width,
        },
        flexShrink: 0,
        width: widthOuter,
      }}
      transitionDuration={500}
      variant="temporary"
    >
      <StyledContentWrapper>{children}</StyledContentWrapper>
    </Drawer>
  )
}

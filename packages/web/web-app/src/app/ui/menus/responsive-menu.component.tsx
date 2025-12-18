import { Drawer } from '@mui/material'
import { styled } from '@mui/material/styles'
import type React from 'react'

import { DRAWER_WIDTH } from '@dx3/web-libs/ui/system/mui-overrides/mui.theme'

import { useAppSelector } from '../../store/store-web-redux.hooks'
import { AppMenu } from './app-menu.component'

const DrawerContent = styled('div')<{ component?: React.ElementType }>({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  marginBottom: '53px',
  overflow: 'auto',
})

export const ResponsiveMenu: React.FC = () => {
  const open = useAppSelector((state) => state.ui.menuOpen)

  return (
    <Drawer
      anchor="left"
      elevation={0}
      open={open}
      PaperProps={{
        variant: 'outlined',
      }}
      sx={{
        '& .MuiDrawer-paper': {
          borderBottom: 'none',
          borderRadius: 0,
          borderTop: 'none',
          height: `calc(100% - 64px)`,
          position: 'fixed',
          top: '64px',
          width: `${DRAWER_WIDTH}px`,
        },
        flexShrink: 0,
        width: `${DRAWER_WIDTH}px`,
      }}
      variant="persistent"
    >
      <DrawerContent>
        <AppMenu />
      </DrawerContent>
    </Drawer>
  )
}

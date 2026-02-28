import AppBar from '@mui/material/AppBar'
import List from '@mui/material/List'
import Toolbar from '@mui/material/Toolbar'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import type React from 'react'

import type { SubMenuConfigType } from '../app-menu.types'
import { SubNavMenuItem } from './sub-nav-menu-item.component'

type SubNavMenuItemsProps = {
  id: string
  menus: SubMenuConfigType[]
  scrollBreak?: 'sm' | 'md'
}

export const SubNavMenu: React.FC<SubNavMenuItemsProps> = (props) => {
  const { id, menus, scrollBreak } = props
  const theme = useTheme()
  const MD_BREAK = useMediaQuery(theme.breakpoints.down(scrollBreak || 'sm'))

  return (
    <AppBar
      color="secondary"
      elevation={2}
      position="sticky"
    >
      <Toolbar
        className="umg-scrollbar"
        sx={{
          justifyContent: MD_BREAK ? 'flex-start' : 'center',
          minHeight: '42px',
          overflowX: 'auto',
        }}
        variant="dense"
      >
        <List
          sx={{
            direction: 'row',
            display: 'flex',
          }}
        >
          {menus.map((menu) => (
            <SubNavMenuItem
              id={id}
              key={`${menu.segment}-${id}`}
              menuItem={menu}
            />
          ))}
        </List>
      </Toolbar>
    </AppBar>
  )
}

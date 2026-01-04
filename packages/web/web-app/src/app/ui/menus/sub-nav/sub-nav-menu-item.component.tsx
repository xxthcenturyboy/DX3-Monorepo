/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ListItemButton,
  // ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material'
import type React from 'react'
import { useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router'

import type { SubMenuConfigType } from '../app-menu.types'

type SubNavMenuItemItemProps = {
  menuItem: SubMenuConfigType
  id: string
}

export const SubNavMenuItem: React.FC<SubNavMenuItemItemProps> = (props) => {
  const { id, menuItem } = props
  const [route] = useState(menuItem.route)
  const [segment] = useState(menuItem.segment)
  const location = useLocation()
  const navigate = useNavigate()
  const match = useMatch(menuItem.route.replace(':id', id))
  const theme = useTheme()

  const isSelected = (): boolean => {
    if (match) {
      return true
    }

    if (location.pathname.includes(segment)) {
      return true
    }
    return false
  }

  const goToRoute = (): void => {
    if (route && !isSelected()) {
      const url = route.replace(':id', id)
      navigate(url)
    }
  }

  // const renderIcon = (iconName: IconNames, color?: string) => {
  //   const Icon = getIcon(iconName, color);
  //   return Icon;
  // };

  return (
    <ListItemButton
      className="sub-nav"
      key={`${menuItem.segment}-${id}`}
      onClick={goToRoute}
      selected={isSelected()}
    >
      {/* {
        menuItem.icon && (
          <ListItemIcon
            sx={{
              color: 'inherit',
              marginLeft: isSubItem ? '24px' : undefined
            }}
          >
            {renderIcon(menuItem.icon as IconNames, theme.palette.primary.main)}
          </ListItemIcon>
        )
      } */}
      <ListItemText
        primary={menuItem.title}
        slotProps={{
          primary: {
            color: theme.palette.primary.main,
            fontSize: 14,
            fontWeight: 'medium',
          },
        }}
      />
    </ListItemButton>
  )
}

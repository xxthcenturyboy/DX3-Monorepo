/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ListItemButton,
  // ListItemIcon,
  ListItemText,
} from '@mui/material'
import type React from 'react'
import { useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router'

// import { getIcon } from '@mira/ui-web-shared/icons/icons';
// import { IconNames } from '@mira/ui-web-shared/icons/icons.enum';

import { getThemePalette } from '@dx3/web-libs/ui/system/mui-themes/mui-theme.service'

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
  const themeColors = getThemePalette()

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
            {renderIcon(menuItem.icon as IconNames, themeColors.primary)}
          </ListItemIcon>
        )
      } */}
      <ListItemText
        primary={menuItem.title}
        primaryTypographyProps={{
          color: themeColors.primary,
          fontSize: 14,
          fontWeight: 'medium',
        }}
      />
    </ListItemButton>
  )
}

import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import Badge from '@mui/material/Badge'
import React, { useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router-dom'

import { getIcon, type IconNames } from '@dx3/web-libs/ui/system/icons'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/system/ui.consts'

import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'
import type { AppMenuItemType } from './app-menu.types'

type AppMenuItemItemProps = {
  menuItem: AppMenuItemType
  isFirst: boolean
  isSubItem: boolean
}

export const AppMenuItem: React.FC<AppMenuItemItemProps> = (props) => {
  const { isFirst, isSubItem, menuItem } = props
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const location = useLocation()
  const { pathname } = location
  const [route, _] = useState(menuItem.routeKey)
  const [menuBreak, setMenuBreak] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const match = useMatch(route)

  React.useEffect(() => {
    setMenuBreak(windowWidth < MEDIA_BREAK.MENU)
  }, [windowWidth])

  const isSelected = (): boolean => {
    if (route === '/') {
      return menuItem.id === 'menu-item-home' && pathname === '/'
    }

    if (match) {
      return true
    }

    if (isSubItem && !match && menuItem.pathMatches) {
      for (const path of menuItem.pathMatches) {
        if (pathname.includes(path)) {
          return true
        }
      }
    }

    if (!isSubItem) {
      return pathname.includes(route)
    }

    return false
  }

  const goToRoute = (): void => {
    if (route && !isSelected()) {
      menuBreak && dispatch(uiActions.toggleMenuSet(false))
      navigate(route)
    }
  }

  const renderIcon = (iconName: IconNames, color?: string) => {
    const Icon = getIcon(iconName, color)
    return Icon
  }

  return (
    <ListItemButton
      key={menuItem.id}
      onClick={goToRoute}
      selected={isSelected()}
      sx={{
        minHeight: isFirst ? 48 : 40,
        px: 4,
        py: 0,
      }}
    >
      {!isSubItem && !!menuItem.icon && (
        <ListItemIcon
          sx={{
            color: 'inherit',
          }}
        >
          {renderIcon(menuItem.icon as IconNames, themeColors.primary)}
        </ListItemIcon>
      )}
      <ListItemText
        primary={menuItem.title}
        primaryTypographyProps={{
          color: themeColors.primary,
          fontSize: 14,
          fontWeight: 'medium',
        }}
        sx={{
          marginLeft: isSubItem ? '48px' : undefined,
        }}
      />
      {menuItem.beta && (
        <Badge
          badgeContent="BETA"
          color="info"
        />
      )}
    </ListItemButton>
  )
}

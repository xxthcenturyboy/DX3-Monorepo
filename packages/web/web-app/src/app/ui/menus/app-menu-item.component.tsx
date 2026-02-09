import { ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import Badge from '@mui/material/Badge'
import React, { useState } from 'react'
import { useLocation, useMatch, useNavigate } from 'react-router'

import { getIcon, type IconNames } from '@dx3/web-libs/ui/icons'
import { MEDIA_BREAK } from '@dx3/web-libs/ui/ui.consts'

import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { selectSupportUnviewedCount } from '../../support/store/support-web.selector'
import { uiActions } from '../store/ui-web.reducer'
import { selectIsMobileWidth } from '../store/ui-web.selector'
import type { AppMenuItemType } from './app-menu.types'

type AppMenuItemItemProps = {
  isFirst: boolean
  isMobileBreak?: boolean
  isSubItem: boolean
  menuItem: AppMenuItemType
  onNavigate?: () => void
}

export const AppMenuItem: React.FC<AppMenuItemItemProps> = (props) => {
  const { isFirst, isMobileBreak, isSubItem, menuItem, onNavigate } = props
  const windowWidth = useAppSelector((state) => state.ui.windowWidth) || 0
  const isMobileWidth = useAppSelector((state) => selectIsMobileWidth(state))
  const supportUnviewedCount = useAppSelector((state) => selectSupportUnviewedCount(state))
  const location = useLocation()
  const { pathname } = location
  const [route, _] = useState(menuItem.routeKey)
  const [menuBreak, setMenuBreak] = useState<boolean>(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const match = useMatch(route)
  const theme = useTheme()

  // Get badge count based on badge selector
  const getBadgeCount = (): number => {
    if (!menuItem.badge || !menuItem.badgeSelector) {
      return 0
    }
    if (menuItem.badgeSelector === 'support') {
      return supportUnviewedCount
    }
    return 0
  }

  const badgeCount = getBadgeCount()

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

    if ((isSubItem || !match) && Array.isArray(menuItem.pathMatches)) {
      for (const path of menuItem.pathMatches) {
        if (pathname.includes(path)) {
          return true
        }
      }
    }

    // Use exact or prefix-with-slash match for non-sub-items to prevent /blog
    // matching /blog-editor (pathname.startsWith('/blog') would match both)
    if (!isSubItem) {
      return pathname === route || pathname.startsWith(`${route}/`)
    }

    return false
  }

  const goToRoute = (): void => {
    // Use isMobileBreak prop if provided (for public menu), otherwise use computed menuBreak
    const shouldCloseOnMobile = isMobileBreak !== undefined ? isMobileBreak : menuBreak

    if (route && isSelected() && isMobileWidth) {
      if (onNavigate) {
        onNavigate()
      } else {
        dispatch(uiActions.toggleMenuSet(false))
      }
      return
    }

    if (route && !isSelected()) {
      if (onNavigate && shouldCloseOnMobile) {
        onNavigate()
      } else {
        menuBreak && dispatch(uiActions.toggleMenuSet(false))
      }
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
          {renderIcon(menuItem.icon as IconNames, theme.palette.primary.light)}
        </ListItemIcon>
      )}
      <ListItemText
        primary={menuItem.title}
        slotProps={{
          primary: {
            color: theme.palette.primary.light,
            fontSize: 14,
            fontWeight: 'medium',
          },
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
      {menuItem.badge && badgeCount > 0 && (
        <Badge
          badgeContent={badgeCount}
          color="error"
          max={99}
        />
      )}
    </ListItemButton>
  )
}

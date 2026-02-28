import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import { useTheme } from '@mui/material/styles'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

import { getIcon, type IconNames } from '@dx3/web-libs/ui/icons'

import { useAppSelector } from '../../store/store-web-redux.hooks'
import { selectSupportUnviewedCount } from '../../support/store/support-web.selector'
import type { AppMenuType } from './app-menu.types'

type AppMenuGroupProps = {
  menu: AppMenuType
  isFirst: boolean
  children?: React.ReactNode
}

export const AppMenuGroup: React.FC<AppMenuGroupProps> = (props) => {
  const { isFirst, menu } = props
  const [open, setOpen] = useState<boolean>(false)
  const [_backgroundColor, setBackgroundColor] = useState<string>('')
  const theme = useTheme()
  const location = useLocation()
  const { pathname } = location
  const supportUnviewedCount = useAppSelector((state) => selectSupportUnviewedCount(state))

  // Get badge count based on badge selector - only show when collapsed
  const getBadgeCount = (): number => {
    if (!menu.badge || !menu.badgeSelector || open) {
      return 0
    }
    if (menu.badgeSelector === 'support') {
      return supportUnviewedCount
    }
    return 0
  }

  const badgeCount = getBadgeCount()

  const isSubItemActive = () => {
    const subItemRouteKeys = Array.from(menu.items, (item) => item.routeKey)
    for (const routeKey of subItemRouteKeys) {
      if (pathname.includes(routeKey)) {
        return true
      }
    }

    return false
  }

  useEffect(() => {
    if (isSubItemActive()) {
      setOpen(true)
    }
  }, [])

  useEffect(() => {
    setBackgroundColor(
      theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
    )
  }, [theme])

  const renderIcon = (iconName: IconNames, color?: string) => {
    const Icon = getIcon(iconName, color)
    return Icon
  }

  return (
    <Box
      key={menu.id}
      sx={{
        minHeight: isFirst ? 48 : 40,
      }}
    >
      <ListItemButton
        alignItems="center"
        onClick={() => setOpen(!open)}
        selected={!open && isSubItemActive()}
        sx={{
          minHeight: isFirst ? 48 : 40,
          px: 4,
          py: 0,
        }}
      >
        {!!menu.icon && (
          <ListItemIcon
            sx={{
              color: 'inherit',
              marginTop: 0,
            }}
          >
            {renderIcon(menu.icon as IconNames, theme.palette.primary.light)}
          </ListItemIcon>
        )}
        <ListItemText
          primary={menu.title}
          secondary={menu.description}
          slotProps={{
            primary: {
              color: theme.palette.primary.light,
              fontSize: '0.85rem',
              fontWeight: 'medium',
              lineHeight: '20px',
              pl: -2,
            },
            secondary: {
              color: open ? 'rgba(0,0,0,0)' : theme.palette.grey[500],
              fontSize: 11,
              lineHeight: '16px',
              noWrap: true,
            },
          }}
          sx={{ my: 0 }}
        />
        {badgeCount > 0 && (
          <Badge
            badgeContent={badgeCount}
            color="error"
            max={99}
            sx={{ marginRight: 2 }}
          />
        )}
        <KeyboardArrowDown
          sx={{
            mr: -1,
            transform: open ? 'rotate(-180deg)' : 'rotate(0)',
            transition: '0.2s',
          }}
        />
      </ListItemButton>
      {open && props.children}
    </Box>
  )
}

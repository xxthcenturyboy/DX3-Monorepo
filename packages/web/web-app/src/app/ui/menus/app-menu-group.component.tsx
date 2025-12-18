import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown'
import { Box, ListItemButton, ListItemIcon, ListItemText, useTheme } from '@mui/material'
import type React from 'react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { getIcon, type IconNames } from '@dx3/web-libs/ui/system/icons'
import { themeColors } from '@dx3/web-libs/ui/system/mui-overrides/styles'

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
            {renderIcon(menu.icon as IconNames, themeColors.primary)}
          </ListItemIcon>
        )}
        <ListItemText
          primary={menu.title}
          primaryTypographyProps={{
            color: 'primary',
            fontSize: '0.85rem',
            fontWeight: 'medium',
            lineHeight: '20px',
            pl: -2,
          }}
          secondary={menu.description}
          secondaryTypographyProps={{
            color: open ? 'rgba(0,0,0,0)' : theme.palette.grey[500],
            fontSize: 11,
            lineHeight: '16px',
            noWrap: true,
          }}
          sx={{ my: 0 }}
        />
        <KeyboardArrowDown
          sx={{
            mr: -1,
            // opacity: 0,
            transform: open ? 'rotate(-180deg)' : 'rotate(0)',
            transition: '0.2s',
          }}
        />
      </ListItemButton>
      {open && props.children}
    </Box>
  )
}

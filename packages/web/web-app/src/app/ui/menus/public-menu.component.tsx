import ClearIcon from '@mui/icons-material/Clear'
import { Divider, IconButton, List, ListItemButton, ListItemText } from '@mui/material'
import React from 'react'
import { useLocation, useNavigate } from 'react-router'

import { CloseViewItem } from '@dx3/web-libs/ui/dialog/drawer-menu.ui'

import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { useAppDispatch } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'

type PublicMenuProps = {
  mobileBreak?: boolean
}

export const PublicMenu: React.FC<PublicMenuProps> = (props) => {
  const { mobileBreak } = props
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const ROUTES = WebConfigService.getWebRoutes()
  const strings = useStrings(['ABOUT', 'BLOG', 'FAQ'])

  const publicLinks = [
    { label: strings.FAQ, path: ROUTES.FAQ },
    { label: strings.ABOUT, path: ROUTES.ABOUT },
    { label: strings.BLOG, path: ROUTES.BLOG },
  ]

  const handleNavigate = (path: string) => {
    navigate(path)
    dispatch(uiActions.togglePublicMenuSet(false))
  }

  return (
    <List sx={{ pt: 0 }}>
      {mobileBreak && (
        <CloseViewItem justifcation="flex-end">
          <IconButton
            color="default"
            onClick={() => dispatch(uiActions.togglePublicMenuSet(false))}
            style={{
              padding: 0,
            }}
          >
            <ClearIcon
              style={{
                fontSize: '26px',
              }}
            />
          </IconButton>
        </CloseViewItem>
      )}
      {publicLinks.map((link) => (
        <React.Fragment key={link.path}>
          <ListItemButton
            onClick={() => handleNavigate(link.path)}
            selected={pathname === link.path}
          >
            <ListItemText primary={link.label} />
          </ListItemButton>
          <Divider sx={{ m: 0 }} />
        </React.Fragment>
      ))}
    </List>
  )
}

import ClearIcon from '@mui/icons-material/Clear'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import React from 'react'

import { CloseViewItem, StyledList } from '@dx3/web-libs/ui/dialog/drawer-menu.ui'

import { useAppDispatch } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'
import { AppMenuItem } from './app-menu-item.component'
import { publicMenu } from './public.menu'

type PublicMenuProps = {
  closeMenu?: () => void
  mobileBreak?: boolean
}

export const PublicMenu: React.FC<PublicMenuProps> = (props) => {
  const { closeMenu, mobileBreak } = props
  const dispatch = useAppDispatch()

  // Get menu items from shared public menu definition
  const menuItems = publicMenu().items

  const handleClose = () => {
    if (closeMenu) {
      // SSR mode with local state
      closeMenu()
    } else {
      // CSR mode with Redux
      dispatch(uiActions.togglePublicMenuSet(false))
    }
  }

  return (
    <StyledList>
      {mobileBreak && (
        <CloseViewItem justifcation="flex-end">
          <IconButton
            color="default"
            onClick={handleClose}
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
      {menuItems.map((item, index) => (
        <React.Fragment key={item.id}>
          <AppMenuItem
            isFirst={index === 0}
            isMobileBreak={mobileBreak}
            isSubItem={false}
            menuItem={item}
            onNavigate={handleClose}
          />
          <Divider sx={{ m: 0 }} />
        </React.Fragment>
      ))}
    </StyledList>
  )
}

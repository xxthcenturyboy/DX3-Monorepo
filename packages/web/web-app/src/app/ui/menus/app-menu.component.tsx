import ClearIcon from '@mui/icons-material/Clear'
import { Divider, IconButton, ListSubheader, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import {
  CloseViewItem,
  StyledBottomContainer,
  StyledBottomItem,
  StyledList,
} from '@dx3/web-libs/ui/dialog/drawer-menu.ui'
import { getThemePalette } from '@dx3/web-libs/ui/system/mui-themes/mui-theme.service'
import { DRAWER_WIDTH } from '@dx3/web-libs/ui/system/ui.consts'

import { LogoutButton } from '../../auth/auth-web-logout.button'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { uiActions } from '../store/ui-web.reducer'
import type { AppMenuItemType, AppMenuType } from './app-menu.types'
import { AppMenuGroup } from './app-menu-group.component'
import { AppMenuItem } from './app-menu-item.component'

type AppMenuItemsProps = {
  mobileBreak?: boolean
}

export const AppMenu: React.FC<AppMenuItemsProps> = (props) => {
  const { mobileBreak } = props
  const [shouldRenderMenus, setShouldRenderMenus] = useState(false)
  const menus = useAppSelector((state) => state.ui.menus)
  const strings = useStrings(['APP_MENU'])
  const dispatch = useAppDispatch()
  const themeColors = getThemePalette()

  useEffect(() => {
    if (menus && Array.isArray(menus)) {
      setShouldRenderMenus(true)
      return
    }
  }, [menus])

  const menuItemDivider = (key: string): React.ReactElement => {
    const id = `divider-${key}`
    return (
      <Divider
        id={id}
        key={id}
        style={{
          margin: 0,
        }}
      />
    )
  }

  const renderItems = (
    items: AppMenuItemType[],
    index: number,
    isFirst: boolean,
    isSubItem?: boolean,
  ): React.ReactElement => {
    return (
      <React.Fragment key={`inner-frag-${index}`}>
        {items.map((item: AppMenuItemType, _idx: number) => {
          if (item.type === 'ROUTE') {
            return (
              <React.Fragment key={`inner-inner-frag-${item.id}`}>
                <AppMenuItem
                  isFirst={isFirst}
                  isSubItem={isSubItem || false}
                  menuItem={item}
                />
                {!isSubItem && menuItemDivider(item.id)}
              </React.Fragment>
            )
          }
          if (item.type === 'SUB_HEADING') {
            return (
              <ListSubheader
                color="primary"
                component="div"
                key={item.id}
                sx={{
                  bgcolor: 'transparent',
                  fontSize: '0.75rem',
                }}
              >
                {item.title}
              </ListSubheader>
            )
          }
        })}
      </React.Fragment>
    )
  }

  return (
    <>
      <StyledList>
        {mobileBreak && (
          <CloseViewItem justifcation="space-between">
            <Typography
              color={themeColors.primary}
              fontWeight={700}
              textAlign="center"
              variant="h6"
            >
              {strings.APP_MENU}
            </Typography>
            <IconButton
              color="primary"
              onClick={() => dispatch(uiActions.toggleMenuSet(false))}
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
        {shouldRenderMenus &&
          (menus as AppMenuType[]).map((menu: AppMenuType, index: number) => {
            const isFirst = index === 0
            if (menu.collapsible) {
              return (
                <React.Fragment key={`menu-outer-${menu.id}`}>
                  <AppMenuGroup
                    isFirst={isFirst}
                    menu={menu}
                  >
                    {renderItems(menu.items, index, isFirst, true)}
                  </AppMenuGroup>
                  {menuItemDivider(menu.id)}
                </React.Fragment>
              )
            }

            return renderItems(menu.items, index, isFirst)
          })}
      </StyledList>
      <StyledBottomContainer width={mobileBreak ? '100%' : `${DRAWER_WIDTH}px`}>
        <Divider key="logout-divider" />
        <StyledBottomItem
          justifcation={mobileBreak ? 'flex-end' : 'center'}
          key="logout-item"
        >
          <LogoutButton context="APP_MENU" />
        </StyledBottomItem>
      </StyledBottomContainer>
    </>
  )
}

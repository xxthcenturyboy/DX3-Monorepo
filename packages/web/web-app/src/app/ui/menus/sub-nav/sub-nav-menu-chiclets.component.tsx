import { Grid } from '@mui/material'
import type React from 'react'
import { useMatch, useNavigate } from 'react-router'

import { StyledControlItem, StyledTopControlRowContainer } from './sub-nav-menu.ui'

type MenuItemProps = {
  id: string
  route: string
  title: string
}

const MenuItem: React.FC<MenuItemProps> = (props) => {
  const { id, route, title } = props
  const match = useMatch(route.replace(':id', id))
  const navigate = useNavigate()

  const isSelected = (): boolean => {
    if (match) {
      return true
    }

    return false
  }

  const goToRoute = (): void => {
    if (route && !isSelected()) {
      const url = route.replace(':id', id || '')
      navigate(url)
    }
  }

  return (
    <StyledControlItem
      onClick={goToRoute}
      selected={isSelected()}
    >
      {title}
    </StyledControlItem>
  )
}

export type SubMenuChicletConfigType = {
  route: string
  title: string
}

type SubNavChicletMenuItemsProps = {
  id: string
  menus: SubMenuChicletConfigType[]
}

export const SubNavChicletMenu: React.FC<SubNavChicletMenuItemsProps> = (props) => {
  const { id, menus } = props

  return (
    <StyledTopControlRowContainer
      container
      direction={'row'}
    >
      <Grid
        container
        direction={'row'}
        justifyContent={'center'}
      >
        {menus.map((menu, index) => (
          <MenuItem
            id={id || ''}
            key={`${menu.title}-${index}`}
            route={menu.route}
            title={menu.title}
          />
        ))}
      </Grid>
    </StyledTopControlRowContainer>
  )
}

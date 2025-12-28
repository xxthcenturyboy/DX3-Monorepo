import ClearIcon from '@mui/icons-material/Clear'
import { Divider, IconButton } from '@mui/material'
import type React from 'react'

import {
  CloseViewItem,
  StyledBottomContainer,
  StyledBottomItem,
  StyledContentWrapper,
  StyledList,
} from './drawer.ui'

type DrawerContentProps = {
  children: React.ReactNode
  FooterButton: React.FC
  mobileBreak?: boolean
  toggleVisibility: (t: boolean) => undefined
}

export const DrawerContent: React.FC<DrawerContentProps> = (props) => {
  const { children, FooterButton, mobileBreak, toggleVisibility } = props

  return (
    <StyledContentWrapper>
      <StyledList>
        {mobileBreak && (
          <CloseViewItem>
            <IconButton
              onClick={() => toggleVisibility(false)}
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
        {children}
      </StyledList>
      {!!FooterButton && (
        <StyledBottomContainer mobilebreak={mobileBreak?.toString() || 'false'}>
          <Divider key="logout-divider" />
          <StyledBottomItem key="logout-item">
            <FooterButton />
          </StyledBottomItem>
        </StyledBottomContainer>
      )}
    </StyledContentWrapper>
  )
}

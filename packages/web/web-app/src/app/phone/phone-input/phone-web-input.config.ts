import type { Theme } from '@mui/material/styles'
import type React from 'react'

import { BORDER_RADIUS } from '@dx3/web-libs/ui/ui.consts'

export const getDefaultStyles = (theme: Theme): { [key: string]: React.CSSProperties } => {
  const buttonStyleDefaults: React.CSSProperties = {
    background: 'transparent',
    borderRadius: 0,
    color: 'inherit',
  }

  const containerStyleDefaults: React.CSSProperties = {
    margin: 0,
  }

  const dropdownStyleDefaults: React.CSSProperties = {
    color: `${theme.palette.primary.main}`,
    position: 'fixed',
  }

  const inputStyleDefaults: React.CSSProperties = {
    background: 'transparent',
    // height: '1.4375em',
    borderRadius: BORDER_RADIUS,
    boxShadow: 'none',
    boxSizing: 'border-box',
    color: 'inherit',
    fontSize: '16px',
    padding: '18.5px 14px 18.5px 50px',
    resize: 'vertical',
    width: '100%',
  }

  const searchStyleDefaults: React.CSSProperties = {
    boxSizing: 'border-box',
    color: 'inherit',
    width: '94%',
  }

  return {
    buttonStyleDefaults,
    containerStyleDefaults,
    dropdownStyleDefaults,
    inputStyleDefaults,
    searchStyleDefaults,
  }
}

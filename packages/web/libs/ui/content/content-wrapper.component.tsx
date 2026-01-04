import Box from '@mui/material/Box'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import type React from 'react'

import { FADE_TIMEOUT_DUR } from '../ui.consts'

export type ContentWrapperPropsType = {
  children: React.ReactNode
  contentPaddding?: string
  contentHeight?: string
  contentTopOffset?: string
  overflow?: string
  spacerDiv?: boolean
}

export const ContentWrapper: React.FC<ContentWrapperPropsType> = (props) => {
  const { children, contentPaddding, contentTopOffset, overflow, spacerDiv } = props

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Grid
        container
        direction="column"
        justifyContent="flex-start"
        overflow={'hidden'}
        spacing={0}
        // sx={{
        //   height: contentHeight ?? 'calc(100vh - 80px)',
        // }}
        wrap="nowrap"
      >
        <Box
          display={'flex'}
          flexDirection={'column'}
          height={'100%'}
          sx={(theme) => {
            return {
              marginTop: contentTopOffset,
              overflow: overflow || 'auto',
              padding: contentPaddding ? contentPaddding : '0',
            }
          }}
        >
          {children}
          {spacerDiv && (
            <div
              style={{
                paddingBottom: '24px',
              }}
            />
          )}
        </Box>
      </Grid>
    </Fade>
  )
}

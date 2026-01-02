import ExpandMore from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  // AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Fade,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React, { useState } from 'react'
import { BeatLoader } from 'react-spinners'

import { APP_COLOR_PALETTE, BORDER_RADIUS, FADE_TIMEOUT_DUR } from '../system/ui.consts'

export type CollapsiblePanelPropsType = {
  children: React.ReactNode
  headerTitle: string
  initialOpen?: boolean
  isLoading?: boolean
  panelId: string
  themeMode?: 'light' | 'dark'
}

export const CollapsiblePanel: React.FC<CollapsiblePanelPropsType> = React.forwardRef(
  (props, ref) => {
    const { children, headerTitle, initialOpen, isLoading, panelId, themeMode } = props
    const [expanded, setExpanded] = useState<string | false>(initialOpen ? panelId : false)
    const theme = useTheme()
    const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))

    // const handleClickExpansion = (panelId: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    //   setExpanded(isExpanded ? panelId : false);
    // };

    return (
      <Box
        padding="0"
        ref={ref}
        width="100%"
      >
        <Accordion
          expanded={expanded === panelId}
          onChange={(event) => {
            if (SM_BREAK) {
              setExpanded(expanded !== panelId ? panelId : false)
              return
            }
            event.stopPropagation()
          }}
          sx={{
            borderRadius: `0px 0px ${BORDER_RADIUS} ${BORDER_RADIUS} !important`,
          }}
        >
          <AccordionSummary
            expandIcon={
              <ExpandMore
                onClick={(event) => {
                  event.stopPropagation()
                  setExpanded(expanded !== panelId ? panelId : false)
                }}
                sx={(theme) => {
                  return {
                    color: theme.palette.common.white,
                    cursor: 'pointer',
                  }
                }}
              />
            }
            onClick={(event) => event.stopPropagation()}
            sx={(theme) => {
              return {
                background:
                  themeMode === 'dark' ? theme.palette.common.black : theme.palette.primary.light,
                borderRadius:
                  expanded === panelId
                    ? `${BORDER_RADIUS} ${BORDER_RADIUS} 0px 0px`
                    : BORDER_RADIUS,
                cursor: SM_BREAK ? 'pointer' : 'default !important',
              }
            }}
          >
            <Typography
              sx={(theme) => {
                return {
                  color: theme.palette.common.white,
                }
              }}
              variant={'subtitle1'}
            >
              {headerTitle}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {children}
            {
              <Fade
                in={isLoading}
                timeout={FADE_TIMEOUT_DUR}
              >
                <Box
                  alignItems={'center'}
                  display={'flex'}
                  flexDirection={'row'}
                  justifyContent={'center'}
                  sx={{
                    backgroundColor: '#00000057',
                    height: 'fill-available',
                    left: 0,
                    position: 'absolute',
                    top: '68px',
                    width: 'fill-available',
                    zIndex: 100,
                  }}
                >
                  <BeatLoader
                    color={APP_COLOR_PALETTE.SECONDARY[700]}
                    size={24}
                  />
                </Box>
              </Fade>
            }
          </AccordionDetails>
        </Accordion>
      </Box>
    )
  },
)

import ChevronLeft from '@mui/icons-material/ChevronLeft'
import {
  Divider,
  Fade,
  Grid2,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type React from 'react'

import { FADE_TIMEOUT_DUR } from '../system/ui.consts'
import { StyledContentFixedHeader } from './content-fixed-header.styled'
import { StyledContentWrapper } from './content-wrapper.styled'

export type ContentWrapperPropsType = {
  children: React.ReactNode
  headerTitle: string
  contentMarginTop?: string
  headerColumnRightJustification?: string
  headerColumnsBreaks?: {
    left?: {
      xs?: number
      sm?: number
      md?: number
      lg?: number
    }
    right?: {
      xs?: number
      sm?: number
      md?: number
      lg?: number
    }
  }
  headerContent?: React.ReactNode
  headerSubTitle?: string
  navigation?: () => void
  tooltip?: string
}

export const ContentWrapper: React.FC<ContentWrapperPropsType> = (props) => {
  const {
    children,
    contentMarginTop,
    headerColumnsBreaks,
    headerColumnRightJustification,
    headerContent,
    headerSubTitle,
    headerTitle,
    navigation,
    tooltip,
  } = props
  const THEME = useTheme()
  const MD_BREAK = useMediaQuery(THEME.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(THEME.breakpoints.down('sm'))

  const renderHeaderNavigation = (): JSX.Element => {
    if (tooltip) {
      return (
        <Tooltip title={tooltip}>
          <IconButton
            color="primary"
            component="span"
            onClick={() => {
              if (typeof navigation === 'function') {
                navigation()
              }
            }}
          >
            <ChevronLeft />
          </IconButton>
        </Tooltip>
      )
    }

    return (
      <IconButton
        color="primary"
        component="span"
        onClick={() => {
          if (typeof navigation === 'function') {
            navigation()
          }
        }}
      >
        <ChevronLeft />
      </IconButton>
    )
  }

  const renderHeader = (): JSX.Element => {
    return (
      <StyledContentFixedHeader>
        <Grid2
          alignItems={'center'}
          container
          direction={'row'}
          justifyContent="space-between"
          padding="14px 16px 14px"
        >
          <Grid2
            mb={SM_BREAK && (headerColumnsBreaks?.left?.xs || 12) === 12 ? '12px' : undefined}
            // width="100%"
            size={{
              md: headerColumnsBreaks?.left?.md || 6,
              sm: headerColumnsBreaks?.left?.sm || 6,
              xs: headerColumnsBreaks?.left?.xs || 12,
            }}
          >
            <Typography
              color="primary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              variant="h5"
            >
              {navigation && renderHeaderNavigation()}
              <Fade
                in={true}
                timeout={FADE_TIMEOUT_DUR}
              >
                <span>{headerTitle}</span>
              </Fade>
            </Typography>
            {headerSubTitle && (
              <span
                style={{
                  margin: '-10px 0 0 44px',
                }}
              >
                <Typography
                  color="primary"
                  variant="caption"
                >
                  {headerSubTitle}
                </Typography>
              </span>
            )}
          </Grid2>

          <Grid2
            display="flex"
            justifyContent={headerColumnRightJustification}
            size={{
              md: headerColumnsBreaks?.right?.md || 6,
              sm: headerColumnsBreaks?.right?.sm || 6,
              xs: headerColumnsBreaks?.right?.xs || 12,
            }}
            // width="100%"
          >
            {headerContent}
          </Grid2>
        </Grid2>
        <Divider />
      </StyledContentFixedHeader>
    )
  }

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Grid2
        container
        direction="column"
        justifyContent="flex-start"
        spacing={0}
        sx={{
          height: MD_BREAK ? undefined : '100%',
        }}
        wrap="nowrap"
      >
        {renderHeader()}
        <StyledContentWrapper
          sx={{
            marginTop: contentMarginTop,
          }}
        >
          {children}
        </StyledContentWrapper>
      </Grid2>
    </Fade>
  )
}

import { ChevronLeft } from '@mui/icons-material'
import {
  Box,
  Divider,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type React from 'react'

export type ContentHeaderPropsType = {
  headerTitle: string
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
  // topOffset: string;
}

export const ContentHeader: React.FC<ContentHeaderPropsType> = (props) => {
  const {
    headerColumnsBreaks,
    headerColumnRightJustification,
    headerContent,
    headerSubTitle,
    headerTitle,
    navigation,
    tooltip,
    // topOffset
  } = props
  const THEME = useTheme()
  const MD_BREAK = useMediaQuery(THEME.breakpoints.down('md'))
  const SM_BREAK = useMediaQuery(THEME.breakpoints.down('sm'))

  const renderHeaderNavigation = (): React.ReactElement => {
    if (tooltip) {
      return (
        <Tooltip title={tooltip}>
          <IconButton
            color="primary"
            component="span"
            onClick={() => !!navigation && navigation()}
            sx={{
              padding: '0 8px',
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
        onClick={() => !!navigation && navigation()}
      >
        <ChevronLeft />
      </IconButton>
    )
  }

  return (
    <Box
      // boxShadow={'0px 2px 9px 5px rgb(0 0 0 / 10%), 0px 2px 2px 0px rgb(0 0 0 / 10%), 0px 1px 5px 0px rgb(0 0 0 / 10%)'}
      position={'fixed'}
      sx={(theme) => {
        return {
          background:
            theme.palette.mode === 'light'
              ? theme.palette.common.white
              : theme.palette.common.black,
        }
      }}
      top={'64px'}
      width={'fill-available'}
      zIndex={10}
    >
      <Grid
        alignItems={MD_BREAK ? 'flex-start' : 'center'}
        container
        direction={SM_BREAK ? 'column' : 'row'}
        justifyContent="space-between"
        padding="14px 16px 14px"
      >
        <Grid
          size={{
            md: headerColumnsBreaks?.left?.md || 6,
            sm: headerColumnsBreaks?.left?.sm || 6,
            xs: headerColumnsBreaks?.left?.xs || 12,
          }}
          width="100%"
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
            {headerTitle}
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
        </Grid>
        <Grid
          display="flex"
          justifyContent={headerColumnRightJustification}
          size={{
            md: headerColumnsBreaks?.right?.md || 6,
            sm: headerColumnsBreaks?.right?.sm || 6,
            xs: headerColumnsBreaks?.right?.xs || 12,
          }}
          width="100%"
        >
          {headerContent}
        </Grid>
      </Grid>
      <Divider />
    </Box>
  )
}

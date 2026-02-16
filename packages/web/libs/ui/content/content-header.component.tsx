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
  forceRowOnMobile?: boolean
  gridDirection?: 'row' | 'column'
  headerTitle: React.ReactNode
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
  headerSecondaryContent?: React.ReactNode
  headerSubContent?: React.ReactNode
  headerSubTitle?: string
  navigation?: () => void
  tooltip?: string
  // topOffset: string;
}

export const ContentHeader: React.FC<ContentHeaderPropsType> = (props) => {
  const {
    forceRowOnMobile,
    gridDirection,
    headerColumnsBreaks,
    headerColumnRightJustification,
    headerContent,
    headerSecondaryContent,
    headerSubContent,
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

  const getGridDirection = () => {
    if (gridDirection) {
      return gridDirection
    }
    if (forceRowOnMobile) {
      return 'row'
    }
    return SM_BREAK ? 'column' : 'row'
  }

  return (
    <Box
      // boxShadow={'0px 2px 9px 5px rgb(0 0 0 / 10%), 0px 2px 2px 0px rgb(0 0 0 / 10%), 0px 1px 5px 0px rgb(0 0 0 / 10%)'}
      position={'fixed'}
      sx={(theme) => {
        return {
          background: theme.palette.background.paper,
        }
      }}
      top={SM_BREAK ? '56px' : '64px'}
      width={'fill-available'}
      zIndex={10}
    >
      <Grid
        alignItems={'flex-start'}
        container
        direction={getGridDirection()}
        justifyContent="space-between"
        padding="14px 16px 14px"
        wrap="nowrap"
      >
        <Grid
          // paddingBottom={headerContent ? '12px' : '0px'}
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
          {headerSubContent && <Box sx={{ marginTop: 1 }}>{headerSubContent}</Box>}
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
      {headerSecondaryContent && (
        <Box sx={{ padding: '0 16px 14px' }}>{headerSecondaryContent}</Box>
      )}
      <Divider />
    </Box>
  )
}

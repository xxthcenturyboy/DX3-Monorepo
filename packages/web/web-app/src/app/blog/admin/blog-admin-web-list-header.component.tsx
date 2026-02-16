import Cached from '@mui/icons-material/Cached'
import {
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import type * as React from 'react'

import { BLOG_POST_STATUS } from '@dx3/models-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'

import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { blogEditorListActions } from './blog-admin-web-list.reducer'
import { selectBlogEditorStatus } from './blog-admin-web.selectors'

type BlogAdminListHeaderComponentProps = {
  onCreateClick: () => void
  onRefresh: () => void
}

export const BlogAdminListHeaderComponent: React.FC<BlogAdminListHeaderComponentProps> = (
  props,
) => {
  const dispatch = useAppDispatch()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const statusFilter = useAppSelector(selectBlogEditorStatus)

  const strings = useStrings([
    'ALL',
    'BLOG_CREATE_POST',
    'BLOG_EDITOR_TITLE',
    'BLOG_STATUS_ARCHIVED',
    'BLOG_STATUS_DRAFT',
    'BLOG_STATUS_PUBLISHED',
    'BLOG_STATUS_SCHEDULED',
    'BLOG_STATUS_UNPUBLISHED',
    'BLOG',
    'STATUS',
    'TOOLTIP_REFRESH_LIST',
  ])

  const statusFilterControl = (
    <FormControl
      size="small"
      sx={{ minWidth: SM_BREAK ? 100 : 160 }}
    >
      <InputLabel>{strings.STATUS}</InputLabel>
      <Select
        label={strings.STATUS}
        onChange={(e) =>
          dispatch(
            blogEditorListActions.statusSet(
              e.target.value as
                | (typeof BLOG_POST_STATUS)[keyof typeof BLOG_POST_STATUS]
                | '',
            ),
          )
        }
        value={statusFilter}
      >
        <MenuItem value="">{strings.ALL}</MenuItem>
        <MenuItem value={BLOG_POST_STATUS.DRAFT}>{strings.BLOG_STATUS_DRAFT}</MenuItem>
        <MenuItem value={BLOG_POST_STATUS.PUBLISHED}>
          {strings.BLOG_STATUS_PUBLISHED}
        </MenuItem>
        <MenuItem value={BLOG_POST_STATUS.SCHEDULED}>
          {strings.BLOG_STATUS_SCHEDULED}
        </MenuItem>
        <MenuItem value={BLOG_POST_STATUS.UNPUBLISHED}>
          {strings.BLOG_STATUS_UNPUBLISHED}
        </MenuItem>
        <MenuItem value={BLOG_POST_STATUS.ARCHIVED}>
          {strings.BLOG_STATUS_ARCHIVED}
        </MenuItem>
      </Select>
    </FormControl>
  )

  const createButton = (
    <Button
      color="primary"
      onClick={props.onCreateClick}
      variant="contained"
    >
      {strings.BLOG_CREATE_POST}
    </Button>
  )

  const refreshButton = (
    <IconButton
      color="primary"
      onClick={(e: React.SyntheticEvent) => {
        e.stopPropagation()
        props.onRefresh()
      }}
      sx={{ boxShadow: 1 }}
    >
      <Tooltip title={strings.TOOLTIP_REFRESH_LIST}>
        <Cached />
      </Tooltip>
    </IconButton>
  )

  return (
    <ContentHeader
      forceRowOnMobile
      headerColumnRightJustification="flex-end"
      headerColumnsBreaks={{
        left: { md: 4, sm: 4, xs: 10 },
        right: { md: 8, sm: 8, xs: 2 },
      }}
      headerContent={
        SM_BREAK ? (
          refreshButton
        ) : (
          <Grid
            alignItems="center"
            container
            direction="row"
            justifyContent="flex-end"
            spacing={1}
          >
            <Grid>{statusFilterControl}</Grid>
            <Grid>{createButton}</Grid>
            <Grid>{refreshButton}</Grid>
          </Grid>
        )
      }
      headerSecondaryContent={
        SM_BREAK ? (
          <Grid
            alignItems="center"
            container
            justifyContent="space-between"
          >
            <Grid>{statusFilterControl}</Grid>
            <Grid>{createButton}</Grid>
          </Grid>
        ) : undefined
      }
      headerTitle={strings.BLOG_EDITOR_TITLE ?? strings.BLOG}
    />
  )
}

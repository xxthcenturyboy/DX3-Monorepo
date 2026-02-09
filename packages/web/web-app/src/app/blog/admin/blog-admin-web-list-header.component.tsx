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
import { blogEditorActions } from './blog-admin-web.reducer'

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
  const statusFilter = useAppSelector((state) => state.blogEditor.status)

  const strings = useStrings([
    'ALL',
    'BLOG_CREATE_POST',
    'BLOG_EDITOR_TITLE',
    'BLOG_STATUS_ARCHIVED',
    'BLOG_STATUS_DRAFT',
    'BLOG_STATUS_PUBLISHED',
    'BLOG_STATUS_SCHEDULED',
    'BLOG',
    'STATUS',
    'TOOLTIP_REFRESH_LIST',
  ])

  return (
    <ContentHeader
      headerColumnRightJustification={SM_BREAK ? 'center' : 'flex-end'}
      headerColumnsBreaks={{
        left: { sm: 4, xs: 12 },
        right: { sm: 8, xs: 12 },
      }}
      headerContent={
        <Grid
          alignItems="center"
          container
          direction={SM_BREAK ? 'column-reverse' : 'row'}
          justifyContent={SM_BREAK ? 'center' : 'flex-end'}
          spacing={1}
        >
          <Grid>
            <FormControl
              size="small"
              sx={{ minWidth: 160 }}
            >
              <InputLabel>{strings.STATUS}</InputLabel>
              <Select
                label={strings.STATUS}
                onChange={(e) =>
                  dispatch(
                    blogEditorActions.statusSet(
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
                <MenuItem value={BLOG_POST_STATUS.ARCHIVED}>
                  {strings.BLOG_STATUS_ARCHIVED}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid>
            <Button
              color="primary"
              onClick={props.onCreateClick}
              variant="contained"
            >
              {strings.BLOG_CREATE_POST}
            </Button>
          </Grid>
          <Grid>
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
          </Grid>
        </Grid>
      }
      headerTitle={strings.BLOG_EDITOR_TITLE ?? strings.BLOG}
    />
  )
}

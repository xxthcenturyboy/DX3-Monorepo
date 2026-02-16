import { Grid, useMediaQuery, useTheme } from '@mui/material'
import * as React from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import {
  useGetBlogAdminPostsQuery,
  usePublishBlogPostMutation,
  useUnpublishBlogPostMutation,
  useUnscheduleBlogPostMutation,
} from '../blog-web.api'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'
import { blogEditorActions } from './blog-admin-web.reducer'
import { selectBlogEditorQueryParams } from './blog-admin-web.selectors'
import { BlogAdminListHeaderComponent } from './blog-admin-web-list-header.component'
import {
  BlogAdminWebListService,
  type BlogListActionsType,
} from './blog-admin-web-list.service'
import { BlogScheduleDialogComponent } from './blog-schedule-dialog.component'

export const BlogAdminListComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'))

  const strings = useStrings([
    'BLOG',
    'BLOG_EDITOR_TITLE',
    'BLOG_PUBLISH',
    'BLOG_PUBLISH_CONFIRM',
    'BLOG_UNPUBLISH',
    'BLOG_UNPUBLISH_CONFIRM',
    'BLOG_UNSCHEDULE',
    'BLOG_UNSCHEDULE_CONFIRM',
    'CANCEL',
    'CANCELING',
  ])

  const queryParams = useAppSelector(selectBlogEditorQueryParams)
  const { data, isFetching, refetch } = useGetBlogAdminPostsQuery(queryParams, {
    refetchOnMountOrArgChange: true,
  })
  const [publishPost] = usePublishBlogPostMutation()
  const [unpublishPost] = useUnpublishBlogPostMutation()
  const [unschedulePost] = useUnscheduleBlogPostMutation()

  const [publishConfirmOpen, setPublishConfirmOpen] = React.useState(false)
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = React.useState(false)
  const [publishPostId, setPublishPostId] = React.useState<string | null>(null)
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false)
  const [schedulePostId, setSchedulePostId] = React.useState<string | null>(null)
  const [unscheduleConfirmOpen, setUnscheduleConfirmOpen] = React.useState(false)
  const [unschedulePostId, setUnschedulePostId] = React.useState<string | null>(null)
  const [unpublishPostId, setUnpublishPostId] = React.useState<string | null>(null)

  const limit = useAppSelector((state) => state.blogEditor.limit)
  const offset = useAppSelector((state) => state.blogEditor.offset)
  const orderBy = useAppSelector((state) => state.blogEditor.orderBy)
  const sortDir = useAppSelector((state) => state.blogEditor.sortDir)

  const listService = React.useMemo(() => new BlogAdminWebListService(), [])
  const listHeaders = BlogAdminWebListService.getListHeaders()
  const handlePublishClick = React.useCallback((id: string) => {
    setPublishPostId(id)
    setPublishConfirmOpen(true)
  }, [])
  const handlePublishConfirm = React.useCallback(
    async (confirmed: boolean) => {
      setPublishConfirmOpen(false)
      const id = publishPostId
      setPublishPostId(null)
      if (!confirmed || !id) return
      try {
        await publishPost(id).unwrap()
        refetch()
      } catch {
        // Error handled by RTK Query / toast
      }
    },
    [publishPost, publishPostId, refetch],
  )
  const handleScheduleClick = React.useCallback((id: string) => {
    setSchedulePostId(id)
    setScheduleDialogOpen(true)
  }, [])
  const handleScheduleClose = React.useCallback(() => {
    setScheduleDialogOpen(false)
    setSchedulePostId(null)
  }, [])
  const handleUnpublishClick = React.useCallback((id: string) => {
    setUnpublishPostId(id)
    setUnpublishConfirmOpen(true)
  }, [])
  const handleUnscheduleClick = React.useCallback((id: string) => {
    setUnschedulePostId(id)
    setUnscheduleConfirmOpen(true)
  }, [])
  const handleUnpublishConfirm = React.useCallback(
    async (confirmed: boolean) => {
      setUnpublishConfirmOpen(false)
      const id = unpublishPostId
      setUnpublishPostId(null)
      if (!confirmed || !id) return
      try {
        await unpublishPost(id).unwrap()
        refetch()
      } catch {
        // Error handled by RTK Query / toast
      }
    },
    [refetch, unpublishPost, unpublishPostId],
  )
  const handleUnscheduleConfirm = React.useCallback(
    async (confirmed: boolean) => {
      setUnscheduleConfirmOpen(false)
      const id = unschedulePostId
      setUnschedulePostId(null)
      if (!confirmed || !id) return
      try {
        await unschedulePost(id).unwrap()
        refetch()
      } catch {
        // Error handled by RTK Query / toast
      }
    },
    [refetch, unschedulePost, unschedulePostId],
  )
  const handleUnpublishClose = React.useCallback(() => {
    setUnpublishConfirmOpen(false)
    setUnpublishPostId(null)
  }, [])
  const handleUnscheduleClose = React.useCallback(() => {
    setUnscheduleConfirmOpen(false)
    setUnschedulePostId(null)
  }, [])
  const listActions: BlogListActionsType = React.useMemo(
    () => ({
      onPublish: handlePublishClick,
      onScheduleClick: handleScheduleClick,
      onUnpublish: handleUnpublishClick,
      onUnschedule: handleUnscheduleClick,
    }),
    [
      handlePublishClick,
      handleScheduleClick,
      handleUnpublishClick,
      handleUnscheduleClick,
    ],
  )
  const rows: TableRowType[] = React.useMemo(
    () => listService.getRows(data?.rows ?? [], listActions),
    [data?.rows, listActions, listService],
  )
  const scheduledPost = React.useMemo(
    () => data?.rows?.find((p) => p.id === schedulePostId) ?? null,
    [data?.rows, schedulePostId],
  )

  React.useEffect(() => {
    setDocumentTitle(strings.BLOG_EDITOR_TITLE || strings.BLOG)
  }, [strings.BLOG_EDITOR_TITLE, strings.BLOG])

  const clickRow = (rowData: TableRowType): void => {
    navigate(`${BLOG_EDITOR_ROUTES.EDIT}/${rowData.id}`)
  }

  const handleOffsetChange = (newOffset: number): void => {
    dispatch(blogEditorActions.offsetSet(newOffset))
  }

  const handleLimitChange = (newLimit: number): void => {
    dispatch(blogEditorActions.limitSet(newLimit))
    dispatch(blogEditorActions.offsetSet(0))
  }

  const handleSortChange = (fieldName: string): void => {
    if (fieldName === orderBy) {
      dispatch(blogEditorActions.sortDirSet(sortDir === 'ASC' ? 'DESC' : 'ASC'))
      return
    }
    dispatch(blogEditorActions.orderBySet(fieldName))
    dispatch(blogEditorActions.sortDirSet('ASC'))
  }

  const handleCreateClick = (): void => {
    dispatch(blogEditorActions.editorFormLoad({ content: '', title: '' }))
    navigate(BLOG_EDITOR_ROUTES.NEW)
  }

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? (isMobileWidth ? '120px' : '82px') : undefined}
      spacerDiv={isAuthenticated}
    >
      <BlogAdminListHeaderComponent
        onCreateClick={handleCreateClick}
        onRefresh={() => refetch()}
      />

      <Grid
        alignItems="center"
        container
        direction="column"
        justifyContent="flex-start"
        padding="18px 24px 6px"
        spacing={0}
      >
        <TableComponent
          changeLimit={handleLimitChange}
          changeOffset={handleOffsetChange}
          changeSort={handleSortChange}
          clickRow={clickRow}
          count={data?.count ?? 0}
          header={listHeaders}
          isInitialized={true}
          limit={limit}
          loading={isFetching}
          offset={offset}
          orderBy={orderBy}
          rows={rows}
          sortDir={sortDir}
          tableName="BlogPosts"
        />
      </Grid>

      <BlogScheduleDialogComponent
        onClose={handleScheduleClose}
        onSuccess={refetch}
        open={scheduleDialogOpen}
        postId={schedulePostId}
        postTitle={scheduledPost?.title ?? ''}
      />
      {createPortal(
        <>
          <CustomDialog
            body={
              <ConfirmationDialog
                bodyMessage={strings.BLOG_PUBLISH_CONFIRM}
                cancellingText={(strings as Record<string, string>).CANCELING ?? 'Canceling'}
                cancelText={strings.CANCEL}
                okText={strings.BLOG_PUBLISH}
                onComplete={handlePublishConfirm}
              />
            }
            closeDialog={() => {
              setPublishConfirmOpen(false)
              setPublishPostId(null)
            }}
            isMobileWidth={isMobileWidth}
            open={publishConfirmOpen}
          />
          <CustomDialog
            body={
              <ConfirmationDialog
                bodyMessage={strings.BLOG_UNPUBLISH_CONFIRM}
                cancellingText={(strings as Record<string, string>).CANCELING ?? 'Canceling'}
                cancelText={strings.CANCEL}
                okText={strings.BLOG_UNPUBLISH}
                onComplete={handleUnpublishConfirm}
              />
            }
            closeDialog={handleUnpublishClose}
            isMobileWidth={isMobileWidth}
            open={unpublishConfirmOpen}
          />
          <CustomDialog
            body={
              <ConfirmationDialog
                bodyMessage={strings.BLOG_UNSCHEDULE_CONFIRM}
                cancellingText={(strings as Record<string, string>).CANCELING ?? 'Canceling'}
                cancelText={strings.CANCEL}
                okText={strings.BLOG_UNSCHEDULE}
                onComplete={handleUnscheduleConfirm}
              />
            }
            closeDialog={handleUnscheduleClose}
            isMobileWidth={isMobileWidth}
            open={unscheduleConfirmOpen}
          />
        </>,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}
    </ContentWrapper>
  )
}

import { Grid } from '@mui/material'
import * as React from 'react'
import { useNavigate } from 'react-router'

import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { TableComponent } from '@dx3/web-libs/ui/table/table.component'
import type { TableRowType } from '@dx3/web-libs/ui/table/types'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useGetBlogAdminPostsQuery } from '../blog-web.api'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'
import { blogEditorActions } from './blog-admin-web.reducer'
import { selectBlogEditorQueryParams } from './blog-admin-web.selectors'
import { BlogAdminWebListService } from './blog-admin-web-list.service'
import { BlogAdminListHeaderComponent } from './blog-admin-web-list-header.component'

export const BlogAdminListComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  const strings = useStrings(['BLOG', 'BLOG_EDITOR_TITLE'])

  const queryParams = useAppSelector(selectBlogEditorQueryParams)
  const { data, isLoading, refetch } = useGetBlogAdminPostsQuery(queryParams)

  const limit = useAppSelector((state) => state.blogEditor.limit)
  const offset = useAppSelector((state) => state.blogEditor.offset)
  const orderBy = useAppSelector((state) => state.blogEditor.orderBy)
  const sortDir = useAppSelector((state) => state.blogEditor.sortDir)

  const listService = React.useMemo(() => new BlogAdminWebListService(), [])
  const listHeaders = BlogAdminWebListService.getListHeaders()
  const rows: TableRowType[] = React.useMemo(
    () => listService.getRows(data?.rows ?? []),
    [data?.rows, listService],
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
    navigate(BLOG_EDITOR_ROUTES.NEW)
  }

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
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
          loading={isLoading}
          offset={offset}
          orderBy={orderBy}
          rows={rows}
          sortDir={sortDir}
          tableName="BlogPosts"
        />
      </Grid>
    </ContentWrapper>
  )
}

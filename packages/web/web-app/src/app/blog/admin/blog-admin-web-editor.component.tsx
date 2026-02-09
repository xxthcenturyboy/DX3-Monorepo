import { Button, Typography } from '@mui/material'
import * as React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { useString, useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'

export const BlogAdminEditorComponent: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const strings = useStrings([
    'BACK',
    'BLOG',
    'BLOG_CREATE_NEW_POST',
    'BLOG_EDITOR_COMING_SOON_DESC',
    'BLOG_EDITOR_TITLE',
    'BLOG_EDIT_POST_TITLE',
    'BLOG_NEW_POST_TITLE',
    'COMING_SOON',
    'PREVIEW',
  ])
  const editPostWithId = useString('BLOG_EDIT_POST_ID', { id: id ?? '' })

  const isNew = pathname.endsWith('/new') || !id

  React.useEffect(() => {
    setDocumentTitle(
      isNew
        ? `${strings.BLOG_NEW_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`
        : `${strings.BLOG_EDIT_POST_TITLE} | ${strings.BLOG_EDITOR_TITLE}`,
    )
  }, [isNew, strings.BLOG_EDITOR_TITLE, strings.BLOG_NEW_POST_TITLE, strings.BLOG_EDIT_POST_TITLE])

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      <ContentHeader
        headerContent={
          !isNew && id ? (
            <Button
              onClick={() => navigate(`${BLOG_EDITOR_ROUTES.PREVIEW}/${id}`)}
              variant="outlined"
            >
              {strings.PREVIEW}
            </Button>
          ) : undefined
        }
        headerTitle={strings.BLOG_EDITOR_TITLE || strings.BLOG}
        navigation={() => navigate(BLOG_EDITOR_ROUTES.LIST)}
        tooltip={strings.BACK}
      />

      <div style={{ padding: 24 }}>
        <Typography variant="h6">
          {isNew ? strings.BLOG_CREATE_NEW_POST : editPostWithId}
        </Typography>
        <Typography
          color="textSecondary"
          sx={{ marginTop: 2 }}
        >
          {strings.COMING_SOON} - {strings.BLOG_EDITOR_COMING_SOON_DESC}
        </Typography>
      </div>
    </ContentWrapper>
  )
}

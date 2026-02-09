import { Alert, Container, Fade, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router'
import rehypeSanitize from 'rehype-sanitize'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { useGetBlogPostPreviewQuery } from '../blog-web.api'
import { BLOG_EDITOR_ROUTES } from './blog-admin-web.consts'

dayjs.extend(localizedFormat)

/**
 * Preview unpublished blog posts (draft/scheduled) - EDITOR role only
 */
export const BlogPostPreviewComponent: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [fadeIn, setFadeIn] = React.useState(false)
  const strings = useStrings([
    'BACK',
    'BLOG',
    'BLOG_EDITOR_TITLE',
    'BLOG_READING_TIME_MIN',
    'PREVIEW',
    'PREVIEW_NOT_PUBLISHED',
  ])

  const { data: post, isLoading, isError } = useGetBlogPostPreviewQuery(id ?? '', {
    skip: !id,
  })

  React.useEffect(() => {
    if (post) {
      setDocumentTitle(`${strings.PREVIEW}: ${post.title}`)
    }
  }, [post, strings.PREVIEW])

  React.useEffect(() => {
    setFadeIn(true)
  }, [])

  if (!id || isError) {
    return (
      <ContentWrapper
        contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
        contentTopOffset={isAuthenticated ? '82px' : undefined}
        spacerDiv={isAuthenticated}
      >
        {isAuthenticated && (
          <ContentHeader
            headerContent={
              <Chip
                clickable
                label={strings.BACK}
                onClick={() => navigate(BLOG_EDITOR_ROUTES.LIST)}
                size="small"
                variant="outlined"
              />
            }
            headerTitle={strings.BLOG_EDITOR_TITLE || strings.BLOG}
          />
        )}
        <Container sx={{ paddingTop: 4 }}>
          <Typography color="textSecondary">Post not found</Typography>
        </Container>
      </ContentWrapper>
    )
  }

  if (isLoading || !post) {
    return (
      <ContentWrapper
        contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
        contentTopOffset={isAuthenticated ? '82px' : undefined}
        spacerDiv={isAuthenticated}
      >
        {isAuthenticated && <ContentHeader headerTitle={strings.BLOG_EDITOR_TITLE || strings.BLOG} />}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          minHeight={200}
        >
          <Typography color="textSecondary">Loading...</Typography>
        </Box>
      </ContentWrapper>
    )
  }

  const displayDate = post.publishedAt
    ? dayjs(post.publishedAt).format('LL')
    : dayjs(post.createdAt).format('LL')

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      {isAuthenticated && (
        <ContentHeader
          headerContent={
            <Chip
              clickable
              label={strings.BACK}
              onClick={() => navigate(BLOG_EDITOR_ROUTES.LIST)}
              size="small"
              variant="outlined"
            />
          }
          headerTitle={strings.BLOG_EDITOR_TITLE || strings.BLOG}
        />
      )}

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Container
          maxWidth="md"
          sx={{ paddingBottom: '40px', paddingTop: isAuthenticated ? undefined : '40px' }}
        >
          <Alert
            severity="info"
            sx={{ marginBottom: 3 }}
          >
            {strings.PREVIEW_NOT_PUBLISHED} ({post.status})
          </Alert>

          <article>
            <Typography
              component="h1"
              gutterBottom
              variant="h4"
            >
              {post.title}
            </Typography>
            <Typography
              color="textSecondary"
              gutterBottom
              variant="body2"
            >
              {post.authorDisplayName} · {displayDate}
              {post.readingTimeMinutes > 0 &&
                ` · ${post.readingTimeMinutes} ${strings.BLOG_READING_TIME_MIN}`}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}>
              {post.categories.map((cat) => (
                <Chip
                  key={cat.id}
                  label={cat.name}
                  size="small"
                  variant="outlined"
                />
              ))}
              {post.tags.map((tag) => (
                <Chip
                  key={tag.id}
                  label={tag.name}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
            <Box
              className="blog-post-content"
              sx={{
                '& p': { marginBottom: 2 },
                '& pre': { overflow: 'auto' },
              }}
            >
              <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{post.content}</ReactMarkdown>
            </Box>
          </article>
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

import { Alert, Container, Fade, Typography } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useNavigate, useParams } from 'react-router'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'

import { MEDIA_VARIANTS } from '@dx3/models-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../../auth/auth-web.selector'
import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { getPublicMediaUrl } from '../../media/media-web.util'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { blogMarkdownComponents } from '../blog-markdown-components'
import { blogRehypePlugins } from '../blog-rehype-sanitize-schema'
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
    'BLOG',
    'BLOG_EDITOR_TITLE',
    'BLOG_FEATURED_IMAGE',
    'BLOG_READING_TIME_MIN',
    'PREVIEW',
    'PREVIEW_NOT_PUBLISHED',
  ])

  const {
    data: post,
    isLoading,
    isError,
  } = useGetBlogPostPreviewQuery(id ?? '', {
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
            headerTitle={strings.BLOG_EDITOR_TITLE || strings.BLOG}
            navigation={() =>
              navigate(id ? `${BLOG_EDITOR_ROUTES.EDIT}/${id}` : BLOG_EDITOR_ROUTES.LIST)
            }
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
        {isAuthenticated && (
          <ContentHeader
            headerTitle={strings.PREVIEW}
            navigation={() => navigate(`${BLOG_EDITOR_ROUTES.EDIT}/${id}`)}
          />
        )}
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
          headerTitle={strings.PREVIEW}
          navigation={() => navigate(`${BLOG_EDITOR_ROUTES.EDIT}/${id}`)}
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
            {post.featuredImageId && (
              <Box
                alt={strings.BLOG_FEATURED_IMAGE}
                component="img"
                src={getPublicMediaUrl(
                  WebConfigService.getWebUrls().API_URL,
                  post.featuredImageId,
                  MEDIA_VARIANTS.MEDIUM,
                )}
                sx={{
                  borderRadius: 1,
                  marginBottom: 2,
                  maxHeight: 400,
                  objectFit: 'cover',
                  width: '100%',
                }}
              />
            )}
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
                '& img': {
                  height: 'auto',
                  maxWidth: '100%',
                },
                '& p': { marginBottom: 2 },
                '& pre': { overflow: 'auto' },
              }}
            >
              <ReactMarkdown
                components={blogMarkdownComponents}
                rehypePlugins={blogRehypePlugins as PluggableList}
                remarkPlugins={[remarkGfm]}
                remarkRehypeOptions={{ allowDangerousHtml: true }}
              >
                {post.content}
              </ReactMarkdown>
            </Box>
          </article>
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

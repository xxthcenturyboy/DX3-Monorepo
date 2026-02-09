import { Container, Fade, Typography, useTheme } from '@mui/material'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router'
import rehypeSanitize from 'rehype-sanitize'
import { BeatLoader } from 'react-spinners'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { NoDataLottie } from '@dx3/web-libs/ui/lottie/no-data.lottie'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { BlogPostCardComponent } from './blog-post-card.component'
import { useGetBlogPostBySlugQuery, useGetBlogRelatedPostsQuery } from './blog-web.api'

dayjs.extend(localizedFormat)

export const BlogPostComponent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [fadeIn, setFadeIn] = React.useState(false)
  const theme = useTheme()
  const strings = useStrings([
    'BLOG',
    'BLOG_POST_NOT_FOUND',
    'BLOG_READING_TIME_MIN',
    'BLOG_RELATED_POSTS',
  ])

  const {
    data: post,
    isLoading,
    isError,
  } = useGetBlogPostBySlugQuery(slug ?? '', {
    skip: !slug,
  })
  const { data: relatedPosts = [] } = useGetBlogRelatedPostsQuery(
    { id: post?.id ?? '', limit: 3 },
    { skip: !post?.id },
  )

  React.useEffect(() => {
    if (post) {
      setDocumentTitle(post.seoTitle ?? post.title)
    }
  }, [post])

  React.useEffect(() => {
    setFadeIn(true)
  }, [])

  if (!slug || isError) {
    return (
      <ContentWrapper
        contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
        contentTopOffset={isAuthenticated ? '82px' : undefined}
        spacerDiv={isAuthenticated}
      >
        {isAuthenticated && <ContentHeader headerTitle={strings.BLOG} />}
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          minHeight={200}
          sx={{ paddingTop: 4 }}
        >
          <NoDataLottie />
          <Typography
            color="textSecondary"
            sx={{ marginTop: 2 }}
          >
            {strings.BLOG_POST_NOT_FOUND}
          </Typography>
        </Box>
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
        {isAuthenticated && <ContentHeader headerTitle={strings.BLOG} />}
        <Box
          alignItems="center"
          display="flex"
          justifyContent="center"
          minHeight={200}
        >
          <BeatLoader
            color={theme.palette.secondary.main}
            margin="2px"
            size={24}
          />
        </Box>
      </ContentWrapper>
    )
  }

  const publishedDate = post.publishedAt ? dayjs(post.publishedAt).format('LL') : ''

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      {isAuthenticated && <ContentHeader headerTitle={strings.BLOG} />}

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Container
          maxWidth="md"
          sx={{ paddingBottom: '40px', paddingTop: isAuthenticated ? undefined : '40px' }}
        >
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
              {post.authorDisplayName} · {publishedDate}
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

          {relatedPosts.length > 0 && (
            <Box sx={{ marginTop: 4 }}>
              <Typography
                gutterBottom
                variant="h6"
              >
                {strings.BLOG_RELATED_POSTS}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {relatedPosts.map((p) => (
                  <BlogPostCardComponent
                    key={p.id}
                    post={p}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

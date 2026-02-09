import { Box, CircularProgress, Container, Fade, Grid, Typography } from '@mui/material'
import * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { BlogPostCardComponent } from './blog-post-card.component'
import { useGetBlogPostsQuery } from './blog-web.api'

export const BlogComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [fadeIn, setFadeIn] = React.useState(false)
  const strings = useStrings(['BLOG', 'BLOG_PAGE_TITLE', 'BLOG_LOADING', 'BLOG_NO_POSTS'])

  const { data, isLoading, isSuccess } = useGetBlogPostsQuery(undefined)

  React.useEffect(() => {
    setDocumentTitle(strings.BLOG_PAGE_TITLE || strings.BLOG)
  }, [strings.BLOG, strings.BLOG_PAGE_TITLE])

  React.useEffect(() => {
    setFadeIn(true)
  }, [])

  const posts = data?.posts ?? []

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
          <Typography
            align="center"
            color="textSecondary"
            paragraph
            variant="h6"
          >
            {strings.BLOG_PAGE_TITLE}
          </Typography>

          {isLoading && (
            <Box
              alignItems="center"
              display="flex"
              justifyContent="center"
              minHeight={200}
            >
              <CircularProgress />
            </Box>
          )}

          {isSuccess && posts.length === 0 && !isLoading && (
            <Typography
              align="center"
              color="textSecondary"
              variant="body1"
            >
              {strings.BLOG_NO_POSTS}
            </Typography>
          )}

          {isSuccess && posts.length > 0 && (
            <Grid
              container
              spacing={3}
            >
              {posts.map((post) => (
                <Grid
                  key={post.id}
                  size={{ xs: 12 }}
                >
                  <BlogPostCardComponent post={post} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

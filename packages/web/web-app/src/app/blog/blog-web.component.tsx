import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'
import { Await, useLoaderData } from 'react-router'
import { BeatLoader } from 'react-spinners'

import type { BlogPostWithAuthorType } from '@dx3/models-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { BlogPostCardComponent } from './blog-post-card.component'
import { useGetBlogPostsQuery } from './blog-web.api'

type BlogListContentProps = {
  posts: BlogPostWithAuthorType[]
}

/** Presentational component - no RTK Query. Safe for SSR when used with loader data. */
const BlogListContent: React.FC<BlogListContentProps> = ({ posts }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const fadeIn = true
  const strings = useStrings(['BLOG', 'BLOG_NO_POSTS'])

  React.useEffect(() => {
    setDocumentTitle(strings.BLOG)
  }, [strings.BLOG])

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
          {posts.length === 0 && (
            <Typography
              align="center"
              color="textSecondary"
              variant="body1"
            >
              {strings.BLOG_NO_POSTS}
            </Typography>
          )}

          {posts.length > 0 && (
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

const BlogListLoaderFallback: React.FC = () => {
  const theme = useTheme()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const strings = useStrings(['BLOG'])

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

const BlogListErrorElement: React.FC = () => {
  const strings = useStrings(['BLOG_LOAD_FAILED'])
  return (
    <Typography
      align="center"
      color="error"
      sx={{ padding: 4 }}
    >
      {strings.BLOG_LOAD_FAILED}
    </Typography>
  )
}

/** CSR fallback when no loader (e.g. AppRouter without loaders). Uses RTK Query - fetches on mount. */
const BlogComponentWithRtk: React.FC = () => {
  const { data: rtkData, isLoading } = useGetBlogPostsQuery(undefined)
  const posts = (rtkData?.posts ?? []) as BlogPostWithAuthorType[]

  if (isLoading) {
    return <BlogListLoaderFallback />
  }

  return <BlogListContent posts={posts} />
}

export const BlogComponent: React.FC = () => {
  const loaderData = useLoaderData() as
    | { posts?: BlogPostWithAuthorType[] | Promise<BlogPostWithAuthorType[]> }
    | undefined

  // CSR without loaders (e.g. AppRouter): use RTK Query
  if (loaderData?.posts === undefined) {
    return <BlogComponentWithRtk />
  }

  // SSR: posts already resolved (serializable)
  if (!(loaderData.posts instanceof Promise)) {
    return <BlogListContent posts={loaderData.posts ?? []} />
  }

  // Client nav with loader: posts is a promise - use Await + Suspense
  return (
    <React.Suspense fallback={<BlogListLoaderFallback />}>
      <Await
        errorElement={<BlogListErrorElement />}
        resolve={loaderData.posts}
      >
        {(resolvedPosts) => <BlogListContent posts={resolvedPosts ?? []} />}
      </Await>
    </React.Suspense>
  )
}

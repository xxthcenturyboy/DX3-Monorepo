import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { Await, useLoaderData, useNavigate, useParams } from 'react-router'
import { BeatLoader } from 'react-spinners'
import remarkGfm from 'remark-gfm'
import type { PluggableList } from 'unified'

import type { BlogPostWithAuthorType } from '@dx3/models-shared'
import { MEDIA_VARIANTS } from '@dx3/models-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { NoDataLottie } from '@dx3/web-libs/ui/lottie/no-data.lottie'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { WebConfigService } from '../config/config-web.service'
import { useStrings } from '../i18n'
import { getPublicMediaUrl } from '../media/media-web.util'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { BlogImageWithPlaceholder } from './blog-image-with-placeholder.component'
import { blogMarkdownComponents } from './blog-markdown-components'
import { BlogPostCardComponent } from './blog-post-card.component'
import { blogRehypePlugins } from './blog-rehype-sanitize-schema'
import { useGetBlogPostBySlugQuery, useGetBlogRelatedPostsQuery } from './blog-web.api'
import { setBlogPostMeta } from './blog-web-set-meta'

dayjs.extend(localizedFormat)

type BlogPostLoaderDataResolved = {
  post: BlogPostWithAuthorType
  relatedPosts: BlogPostWithAuthorType[]
}

type BlogPostLoaderData = {
  data: BlogPostLoaderDataResolved | Promise<BlogPostLoaderDataResolved>
}

/** CSR fallback when no loader (e.g. AppRouter without loaders). Uses RTK Query - fetches on mount. */
const BlogPostComponentWithRtk: React.FC<{ slug: string }> = ({ slug }) => {
  const {
    data: rtkPost,
    isError: isRtkError,
    isLoading: isRtkLoading,
  } = useGetBlogPostBySlugQuery(slug, { skip: !slug })
  const { data: rtkRelatedPosts = [] } = useGetBlogRelatedPostsQuery(
    { id: rtkPost?.id ?? '', limit: 3 },
    { skip: !rtkPost?.id },
  )

  const post = rtkPost
  const relatedPosts = (rtkRelatedPosts ?? []) as BlogPostWithAuthorType[]

  React.useEffect(() => {
    if (post && slug) {
      setDocumentTitle(post.seoTitle ?? post.title)
      setBlogPostMeta(
        {
          canonicalUrl: post.canonicalUrl,
          content: post.content,
          excerpt: post.excerpt,
          seoDescription: post.seoDescription,
          seoTitle: post.seoTitle,
          slug,
          title: post.title,
        },
        WebConfigService.getWebUrls().WEB_APP_URL,
      )
    }
  }, [post, slug])

  if (!slug || isRtkError) {
    return <BlogPostErrorState />
  }

  if (isRtkLoading || !post) {
    return <BlogPostLoadingState />
  }

  return (
    <BlogPostContent
      post={post}
      relatedPosts={relatedPosts}
      slug={slug}
    />
  )
}

export const BlogPostComponent: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const loaderData = useLoaderData() as BlogPostLoaderData | undefined

  // CSR without loaders (e.g. AppRouter): use RTK Query
  if (loaderData?.data === undefined) {
    return <BlogPostComponentWithRtk slug={slug ?? ''} />
  }

  // SSR: data already resolved (serializable)
  if (!(loaderData.data instanceof Promise)) {
    return (
      <BlogPostContent
        post={loaderData.data.post}
        relatedPosts={loaderData.data.relatedPosts ?? []}
        slug={slug ?? ''}
      />
    )
  }

  // Client nav with loader: data is a promise - use Await + Suspense
  return (
    <React.Suspense fallback={<BlogPostLoadingState />}>
      <Await
        errorElement={<BlogPostErrorState />}
        resolve={loaderData.data}
      >
        {(resolved) => (
          <BlogPostContent
            post={resolved.post}
            relatedPosts={resolved.relatedPosts ?? []}
            slug={slug ?? ''}
          />
        )}
      </Await>
    </React.Suspense>
  )
}

/** Presentational component - no RTK Query. Safe for SSR. */
const BlogPostContent: React.FC<{
  post: BlogPostWithAuthorType
  relatedPosts: BlogPostWithAuthorType[]
  slug: string
}> = ({ post, relatedPosts, slug }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const fadeIn = true
  const navigate = useNavigate()
  const strings = useStrings([
    'BACK',
    'BLOG',
    'BLOG_FEATURED_IMAGE',
    'BLOG_POST_NOT_FOUND',
    'BLOG_READING_TIME_MIN',
    'BLOG_RELATED_POSTS',
  ])

  React.useEffect(() => {
    setDocumentTitle(post.seoTitle ?? post.title)
    setBlogPostMeta(
      {
        canonicalUrl: post.canonicalUrl,
        content: post.content,
        excerpt: post.excerpt,
        seoDescription: post.seoDescription,
        seoTitle: post.seoTitle,
        slug,
        title: post.title,
      },
      WebConfigService.getWebUrls().WEB_APP_URL,
    )
  }, [post, slug])

  const publishedDate = post.publishedAt ? dayjs(post.publishedAt).format('LL') : ''

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : '114px'}
      spacerDiv={isAuthenticated}
    >
      <ContentHeader
        headerTitle={strings.BLOG}
        navigation={() => navigate(WebConfigService.getWebRoutes().BLOG)}
        tooltip={strings.BACK}
      />

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Container
          maxWidth="md"
          sx={{ paddingBottom: '40px', paddingTop: isAuthenticated ? undefined : '40px' }}
        >
          <article>
            {post.featuredImageId && (
              <BlogImageWithPlaceholder
                alt={strings.BLOG_FEATURED_IMAGE}
                height={400}
                imgSx={{
                  maxHeight: 400,
                  objectFit: 'cover',
                }}
                src={getPublicMediaUrl(
                  WebConfigService.getWebUrls().API_URL,
                  post.featuredImageId,
                  MEDIA_VARIANTS.MEDIUM,
                )}
                sx={{
                  borderRadius: 1,
                  marginBottom: 2,
                  overflow: 'hidden',
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
              suppressHydrationWarning
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

const BlogPostErrorState: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const strings = useStrings(['BLOG', 'BLOG_POST_NOT_FOUND'])

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

const BlogPostLoadingState: React.FC = () => {
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

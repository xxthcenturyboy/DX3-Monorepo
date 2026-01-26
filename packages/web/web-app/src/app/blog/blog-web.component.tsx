import { Card, CardContent, Container, Fade, Grid, Typography } from '@mui/material'
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

dayjs.extend(localizedFormat)

export const BlogComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const [fadeIn, setFadeIn] = React.useState(false)
  const strings = useStrings(['BLOG', 'BLOG_PAGE_TITLE'])

  React.useEffect(() => {
    setFadeIn(true)
    setDocumentTitle(strings.BLOG_PAGE_TITLE || strings.BLOG)
  }, [strings.BLOG, strings.BLOG_PAGE_TITLE])

  // Placeholder blog posts - will be replaced with API data in future
  const blogPosts = [
    {
      content:
        'Explore the latest updates and improvements in our platform, including new features and performance enhancements.',
      date: '2026-01-20',
      id: '1',
      title: 'Welcome to Our Blog',
    },
    {
      content:
        'Learn about server-side rendering and how it improves performance and SEO for web applications.',
      date: '2026-01-18',
      id: '2',
      title: 'Getting Started with SSR',
    },
    {
      content:
        'Discover best practices for building scalable and maintainable applications with TypeScript and React.',
      date: '2026-01-15',
      id: '3',
      title: 'Building Modern Web Applications',
    },
  ]

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
            Latest Updates and Articles
          </Typography>
          <Grid
            container
            spacing={3}
          >
            {blogPosts.map((post) => (
              <Grid
                key={post.id}
                size={{ xs: 12 }}
              >
                <Card>
                  <CardContent>
                    <Typography
                      color="primary"
                      gutterBottom
                      variant="h5"
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      gutterBottom
                      variant="caption"
                    >
                      {dayjs(post.date).format('L')}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      variant="body1"
                    >
                      {post.content}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

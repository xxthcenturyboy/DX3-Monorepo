import { Card, CardContent, Container, Fade, Grid, Typography } from '@mui/material'
import * as React from 'react'

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

export const BlogComponent: React.FC = () => {
  const strings = useStrings(['BLOG', 'BLOG_PAGE_TITLE'])

  React.useEffect(() => {
    setDocumentTitle(strings.BLOG_PAGE_TITLE || strings.BLOG)
  }, [strings])

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
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Container
        maxWidth="md"
        sx={{
          paddingBottom: '40px',
          paddingTop: '40px',
        }}
      >
        <Typography
          align="center"
          color="primary"
          gutterBottom
          variant="h3"
        >
          {strings.BLOG}
        </Typography>
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
              item
              key={post.id}
              xs={12}
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
                    {new Date(post.date).toLocaleDateString()}
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
  )
}

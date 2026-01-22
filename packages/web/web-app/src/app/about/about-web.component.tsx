import { Container, Fade, Grid, Typography } from '@mui/material'
import * as React from 'react'

import { APP_DESCRIPTION, APP_NAME } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

export const AboutComponent: React.FC = () => {
  const strings = useStrings(['ABOUT', 'ABOUT_PAGE_TITLE'])

  React.useEffect(() => {
    setDocumentTitle(strings.ABOUT_PAGE_TITLE || strings.ABOUT)
  }, [strings])

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
        <Grid
          container
          spacing={4}
        >
          <Grid
            item
            xs={12}
          >
            <Typography
              align="center"
              color="primary"
              gutterBottom
              variant="h3"
            >
              {strings.ABOUT} {APP_NAME}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Typography
              paragraph
              variant="h6"
            >
              {APP_DESCRIPTION}
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Typography
              gutterBottom
              variant="h5"
            >
              Our Mission
            </Typography>
            <Typography
              color="textSecondary"
              paragraph
            >
              We are committed to building powerful, scalable applications that help users achieve
              their goals efficiently and effectively.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Typography
              gutterBottom
              variant="h5"
            >
              Technology Stack
            </Typography>
            <Typography
              color="textSecondary"
              paragraph
            >
              Built with modern web technologies including React, TypeScript, Node.js, and
              PostgreSQL, {APP_NAME} provides a robust and reliable platform for your needs.
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Typography
              gutterBottom
              variant="h5"
            >
              Get in Touch
            </Typography>
            <Typography
              color="textSecondary"
              paragraph
            >
              Have questions or feedback? We'd love to hear from you. Reach out through our support
              channels.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Fade>
  )
}

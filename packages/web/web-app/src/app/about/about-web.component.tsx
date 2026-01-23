import { Container, Fade, Grid, Typography } from '@mui/material'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import { APP_DESCRIPTION, APP_NAME } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import type { StringKeyName } from '../i18n'
import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { ABOUT_CONTENT } from './about-web-content.consts'

export const AboutComponent: React.FC = () => {
  const aboutSections = ABOUT_CONTENT.sections
  const [fadeIn, setFadeIn] = React.useState(false)

  // Gather all required string keys from content structure
  const stringKeys = React.useMemo(() => {
    const keys: StringKeyName[] = ['ABOUT', 'ABOUT_PAGE_TITLE']
    const sectionKeys = aboutSections.flatMap((section) => [section.titleKey, section.contentKey])
    return [...keys, ...sectionKeys]
  }, [aboutSections])

  const strings = useStrings(stringKeys)

  React.useEffect(() => {
    setDocumentTitle(strings.ABOUT_PAGE_TITLE || strings.ABOUT)
  }, [strings])

  React.useEffect(() => {
    setFadeIn(true)
  }, [])

  return (
    <Fade in={fadeIn} timeout={FADE_TIMEOUT_DUR}>
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
          <Grid size={{ xs: 12 }}>
            <Typography
              align="center"
              color="primary"
              gutterBottom
              variant="h3"
            >
              {strings.ABOUT} {APP_NAME}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography
              paragraph
              variant="h6"
            >
              {APP_DESCRIPTION}
            </Typography>
          </Grid>
          {aboutSections.map((section) => (
            <Grid
              key={section.id}
              size={{ xs: 12 }}
            >
              <Typography
                gutterBottom
                variant="h5"
              >
                {strings[section.titleKey]}
              </Typography>
              <Typography
                color="textSecondary"
                component="div"
                paragraph
              >
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                  {strings[section.contentKey] || ''}
                </ReactMarkdown>
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Fade>
  )
}

import { Container, Fade, Grid, Typography } from '@mui/material'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import { APP_DESCRIPTION, APP_NAME } from '@dx3/models-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import type { StringKeyName } from '../i18n'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { ABOUT_CONTENT } from './about-web-content.consts'

export const AboutComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const aboutSections = ABOUT_CONTENT.sections
  // Use true so content is visible on SSR (Fade in=false renders opacity 0 = invisible).
  const fadeIn = true

  // Gather all required string keys from content structure
  const stringKeys = React.useMemo(() => {
    const keys: StringKeyName[] = ['ABOUT', 'ABOUT_PAGE_TITLE']
    const sectionKeys = aboutSections.flatMap((section) => [section.titleKey, section.contentKey])
    return [...keys, ...sectionKeys]
  }, [aboutSections])

  const strings = useStrings(stringKeys)

  React.useEffect(() => {
    setDocumentTitle(strings.ABOUT_PAGE_TITLE || strings.ABOUT)
  }, [strings.ABOUT, strings.ABOUT_PAGE_TITLE])

  const headerTitle = `${strings.ABOUT} ${APP_NAME}`

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      {isAuthenticated && <ContentHeader headerTitle={headerTitle} />}

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Container
          maxWidth="md"
          sx={{ paddingBottom: '40px', paddingTop: isAuthenticated ? undefined : '40px' }}
        >
          <Grid
            container
            spacing={4}
          >
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
    </ContentWrapper>
  )
}

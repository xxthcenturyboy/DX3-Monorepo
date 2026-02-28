import Container from '@mui/material/Container'
import Fade from '@mui/material/Fade'
import Typography from '@mui/material/Typography'
import * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { FaqWebBodyComponent } from './faq-web-body.component'
import { FAQ_CONTENT } from './faq-web-content.consts'

export const FaqComponent: React.FC = () => {
  // SSR-safe: selector handles missing auth reducer in SSR store
  // SSR always shows public FAQs only (authenticated users get CSR anyway)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  // Use true so content is visible on SSR (Fade in=false renders opacity 0 = invisible).
  const fadeIn = true

  const strings = useStrings(['FAQ', 'FAQ_PAGE_TITLE'])

  React.useEffect(() => {
    setDocumentTitle(strings.FAQ_PAGE_TITLE || strings.FAQ)
  }, [strings.FAQ, strings.FAQ_PAGE_TITLE])

  // Determine which FAQ items to show for structured data
  const faqItems = React.useMemo(() => {
    return isAuthenticated
      ? [...FAQ_CONTENT.public, ...FAQ_CONTENT.authenticated]
      : FAQ_CONTENT.public
  }, [isAuthenticated])

  // Generate JSON-LD structured data for SEO
  const structuredData = React.useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        acceptedAnswer: {
          '@type': 'Answer',
          // @ts-expect-error - keys are fine here
          text: strings[item.answerKey],
        },
        // @ts-expect-error - keys are fine here
        name: strings[item.questionKey],
      })),
    }),
    [faqItems, strings],
  )

  return (
    <ContentWrapper
      contentHeight={isAuthenticated ? 'calc(100vh - 80px)' : undefined}
      contentTopOffset={isAuthenticated ? '82px' : undefined}
      spacerDiv={isAuthenticated}
    >
      {/* SEO: JSON-LD structured data for FAQ */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: This will be safe as we control the content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

      {isAuthenticated && <ContentHeader headerTitle={strings.FAQ} />}

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
            {strings.FAQ_PAGE_TITLE}
          </Typography>

          <FaqWebBodyComponent
            includeAuthenticated={isAuthenticated}
            subtitle=""
            title=""
          />
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

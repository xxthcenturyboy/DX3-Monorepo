import { Box, Container, Divider, Fade } from '@mui/material'
import * as React from 'react'

import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { FaqWebBodyComponent } from '../faq/faq-web-body.component'
import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { ContactUsFormComponent } from './contact-us-form.component'

/**
 * Support page component that composes the FAQ section and Contact Us form.
 * Both child components are self-contained to isolate their state and prevent
 * unnecessary re-renders.
 */
export const SupportComponent: React.FC = () => {
  const [fadeIn, setFadeIn] = React.useState(false)

  const strings = useStrings(['SUPPORT'])

  React.useEffect(() => {
    setFadeIn(true)
    setDocumentTitle(strings.SUPPORT)
  }, [strings.SUPPORT])

  return (
    <ContentWrapper
      contentHeight="calc(100vh - 80px)"
      contentTopOffset="82px"
      spacerDiv={true}
    >
      <ContentHeader headerTitle={strings.SUPPORT} />

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Container
          maxWidth="md"
          sx={{ paddingBottom: '40px' }}
        >
          {/* FAQ Section - Memoized reusable component */}
          <Box sx={{ marginBottom: '48px' }}>
            <FaqWebBodyComponent includeAuthenticated={true} />
          </Box>

          <Divider sx={{ marginBottom: '24px' }} />

          {/* Contact Us Section - Self-contained form with success state */}
          <ContactUsFormComponent />
        </Container>
      </Fade>
    </ContentWrapper>
  )
}

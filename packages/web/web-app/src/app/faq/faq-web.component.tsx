import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Container,
  Fade,
  Typography,
} from '@mui/material'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { selectIsAuthenticated } from '../auth/auth-web.selector'
import type { StringKeyName } from '../i18n'
import { useStrings } from '../i18n'
import { useAppSelector } from '../store/store-web-redux.hooks'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'
import { FAQ_CONTENT } from './faq-web-content.consts'

export const FaqComponent: React.FC = () => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)

  // Show public FAQs for everyone, plus authenticated FAQs for logged-in users
  const faqItems = React.useMemo(() => {
    return isAuthenticated
      ? [...FAQ_CONTENT.public, ...FAQ_CONTENT.authenticated]
      : FAQ_CONTENT.public
  }, [isAuthenticated])

  // Gather all required string keys from content structure
  const stringKeys = React.useMemo(() => {
    const keys: StringKeyName[] = ['FAQ', 'FAQ_PAGE_TITLE']
    const itemKeys = faqItems.flatMap((item) => [item.questionKey, item.answerKey])
    return [...keys, ...itemKeys]
  }, [faqItems])

  const strings = useStrings(stringKeys)

  React.useEffect(() => {
    setDocumentTitle(strings.FAQ_PAGE_TITLE || strings.FAQ)
  }, [strings])

  // Generate JSON-LD structured data for SEO
  const structuredData = React.useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        acceptedAnswer: {
          '@type': 'Answer',
          text: strings[item.answerKey],
        },
        name: strings[item.questionKey],
      })),
    }),
    [faqItems, strings],
  )

  return (
    <>
      {/* SEO: JSON-LD structured data for FAQ */}
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: This will be safe as we control the content
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        type="application/ld+json"
      />

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
            {strings.FAQ}
          </Typography>
          <Typography
            align="center"
            color="textSecondary"
            paragraph
            variant="h6"
          >
            {strings.FAQ_PAGE_TITLE}
          </Typography>
          {faqItems.map((faq) => (
            <Accordion
              key={faq.id}
              sx={{ marginBottom: '8px' }}
            >
              <AccordionSummary
                aria-controls={`faq-${faq.id}-content`}
                expandIcon={<ExpandMoreIcon />}
                id={`faq-${faq.id}-header`}
              >
                <Typography variant="h6">{strings[faq.questionKey]}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography
                  color="textSecondary"
                  component="div"
                >
                  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                    {strings[faq.answerKey] || ''}
                  </ReactMarkdown>
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Fade>
    </>
  )
}

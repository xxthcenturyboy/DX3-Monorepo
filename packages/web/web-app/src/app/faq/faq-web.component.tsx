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

import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { setDocumentTitle } from '../ui/ui-web-set-document-title'

export const FaqComponent: React.FC = () => {
  const strings = useStrings(['FAQ', 'FAQ_PAGE_TITLE'])

  React.useEffect(() => {
    setDocumentTitle(strings.FAQ_PAGE_TITLE || strings.FAQ)
  }, [strings])

  // Placeholder FAQ data - will be replaced with API data in future
  const faqs = [
    {
      answer: 'DX3 is a full-stack application platform built with TypeScript, React, and Node.js.',
      id: '1',
      question: 'What is DX3?',
    },
    {
      answer:
        'Simply sign up for an account and start exploring the features available in your dashboard.',
      id: '2',
      question: 'How do I get started?',
    },
    {
      answer: 'You can contact our support team through the contact form or email us directly.',
      id: '3',
      question: 'How can I contact support?',
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
          {strings.FAQ}
        </Typography>
        <Typography
          align="center"
          color="textSecondary"
          paragraph
          variant="h6"
        >
          Frequently Asked Questions
        </Typography>
        {faqs.map((faq) => (
          <Accordion
            key={faq.id}
            sx={{ marginBottom: '8px' }}
          >
            <AccordionSummary
              aria-controls={`faq-${faq.id}-content`}
              expandIcon={<ExpandMoreIcon />}
              id={`faq-${faq.id}-header`}
            >
              <Typography variant="h6">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="textSecondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Container>
    </Fade>
  )
}

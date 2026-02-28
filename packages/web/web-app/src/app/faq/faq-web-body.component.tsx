import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'

import type { StringKeyName } from '../i18n'
import { useStrings } from '../i18n'
import { FAQ_CONTENT } from './faq-web-content.consts'

export type FaqWebBodyProps = {
  /** Whether to include authenticated-only FAQ items */
  includeAuthenticated?: boolean
  /** Optional title to display above the FAQ list */
  title?: string
  /** Optional subtitle to display below the title */
  subtitle?: string
}

/**
 * Reusable FAQ body component that renders the accordion list of FAQs.
 */
export const FaqWebBodyComponent: React.FC<FaqWebBodyProps> = ({
  includeAuthenticated = false,
  subtitle,
  title,
}) => {
  // Determine which FAQ items to show
  const faqItems = React.useMemo(() => {
    return includeAuthenticated
      ? [...FAQ_CONTENT.public, ...FAQ_CONTENT.authenticated]
      : FAQ_CONTENT.public
  }, [includeAuthenticated])

  // Gather all required string keys from content structure
  const stringKeys = React.useMemo(() => {
    const keys: StringKeyName[] = ['FAQ', 'FAQ_PAGE_TITLE']
    const itemKeys = faqItems.flatMap((item) => [
      item.questionKey as StringKeyName,
      item.answerKey as StringKeyName,
    ])
    return [...keys, ...itemKeys]
  }, [faqItems])

  const strings = useStrings(stringKeys)

  const displayTitle = title ?? strings.FAQ
  const displaySubtitle = subtitle ?? strings.FAQ_PAGE_TITLE

  return (
    <Box>
      {displayTitle && (
        <Typography
          color="primary"
          gutterBottom
          variant="h4"
        >
          {displayTitle}
        </Typography>
      )}
      {displaySubtitle && (
        <Typography
          color="textSecondary"
          sx={{ marginBottom: '24px' }}
          variant="body1"
        >
          {displaySubtitle}
        </Typography>
      )}

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
    </Box>
  )
}

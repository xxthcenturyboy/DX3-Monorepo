import type { FaqContentStructure } from './faq-web.types'

/**
 * Static content structure for FAQ page
 * All content strings are stored in i18n locale files
 * This file defines the structure and maps to i18n keys
 */
export const FAQ_CONTENT: FaqContentStructure = {
  authenticated: [
    {
      answerKey: 'FAQ_AUTH_ITEM_1_ANSWER',
      id: '1',
      questionKey: 'FAQ_AUTH_ITEM_1_QUESTION',
    },
    {
      answerKey: 'FAQ_AUTH_ITEM_2_ANSWER',
      id: '2',
      questionKey: 'FAQ_AUTH_ITEM_2_QUESTION',
    },
    {
      answerKey: 'FAQ_AUTH_ITEM_3_ANSWER',
      id: '3',
      questionKey: 'FAQ_AUTH_ITEM_3_QUESTION',
    },
  ],
  public: [
    {
      answerKey: 'FAQ_ITEM_1_ANSWER',
      id: '1',
      questionKey: 'FAQ_ITEM_1_QUESTION',
    },
    {
      answerKey: 'FAQ_ITEM_2_ANSWER',
      id: '2',
      questionKey: 'FAQ_ITEM_2_QUESTION',
    },
  ],
}

import type { AboutContentStructure } from './about-web.types'

/**
 * Static content structure for About page
 * All content strings are stored in i18n locale files
 * This file defines the structure and maps to i18n keys
 */
export const ABOUT_CONTENT: AboutContentStructure = {
  sections: [
    {
      contentKey: 'ABOUT_SECTION_MISSION_CONTENT',
      id: 'mission',
      titleKey: 'ABOUT_SECTION_MISSION_TITLE',
    },
    {
      contentKey: 'ABOUT_SECTION_TECH_CONTENT',
      id: 'tech',
      titleKey: 'ABOUT_SECTION_TECH_TITLE',
    },
    {
      contentKey: 'ABOUT_SECTION_CONTACT_CONTENT',
      id: 'contact',
      titleKey: 'ABOUT_SECTION_CONTACT_TITLE',
    },
  ],
}

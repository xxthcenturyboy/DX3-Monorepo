export enum IconNames {
  ACCESSIBLITY = 'ACCESSIBLITY',
  ARTICLE = 'ARTICLE',
  CHECK = 'CHECK',
  CHECKBOX = 'CHECKBOX',
  CHECKBOX_OUTLINED_BLANK = 'CHECKBOX_OUTLINED_BLANK',
  DASHBOARD = 'DASHBOARD',
  FLAG = 'FLAG',
  HEALTHZ = 'HEALTHZ',
  HELP = 'HELP',
  HOME = 'HOME',
  INFO = 'INFO',
  MANAGE_ACCOUNTS = 'MANAGE_ACCOUNTS',
  MENU_OPEN = 'MENU_OPEN',
  PEOPLE = 'PEOPLE',
  PEOPLE_OUTLINE = 'PEOPLE_OUTLINE',
  STATS = 'STATS',
}

export const getIconNameSelect = (): IconNames[] => {
  const keys = Object.keys(IconNames)
  return keys as IconNames[]
}

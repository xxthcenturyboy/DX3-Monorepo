export enum IconNames {
  ACCESSIBLITY = 'ACCESSIBLITY',
  CHECK = 'CHECK',
  CHECKBOX = 'CHECKBOX',
  CHECKBOX_OUTLINED_BLANK = 'CHECKBOX_OUTLINED_BLANK',
  FLAG = 'FLAG',
  HEALTHZ = 'HEALTHZ',
  DASHBOARD = 'DASHBOARD',
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

export type MenuRestrictionType = 'ADMIN' | 'SUPER_ADMIN'

export type AppMenuItemType = {
  beta?: boolean
  id: string
  icon?: string
  pathMatches?: string[]
  restriction?: MenuRestrictionType
  routeKey: string
  stringsKey?: string
  title: string
  type: 'ROUTE' | 'SUB_HEADING'
}

export type AppMenuType = {
  id: string
  collapsible: boolean
  description: string
  icon?: string
  items: AppMenuItemType[]
  stringsKeyDescription?: string
  stringsKeyTitle?: string
  title: string
}

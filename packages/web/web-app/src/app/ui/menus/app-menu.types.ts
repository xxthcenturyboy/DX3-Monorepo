export type AppMenuItemType = {
  badge?: boolean
  badgeSelector?: string
  beta?: boolean
  icon?: string
  id: string
  pathMatches?: string[]
  restriction?: string
  routeKey: string
  stringsKey?: string
  title: string
  type: 'ROUTE' | 'SUB_HEADING'
}

export type AppMenuType = {
  badge?: boolean
  badgeSelector?: string
  collapsible: boolean
  description: string
  icon?: string
  id: string
  items: AppMenuItemType[]
  stringsKeyDescription?: string
  stringsKeyTitle?: string
  title: string
}

export type SubMenuConfigType = {
  route: string
  segment: string
  title: string
}

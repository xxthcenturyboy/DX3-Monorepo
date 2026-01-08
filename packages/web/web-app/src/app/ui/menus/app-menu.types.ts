export type AppMenuItemType = {
  beta?: boolean
  id: string
  icon?: string
  pathMatches?: string[]
  restriction?: string
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

export type SubMenuConfigType = {
  route: string
  segment: string
  title: string
}

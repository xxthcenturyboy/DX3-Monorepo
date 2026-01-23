import type { StringKeyName } from '../i18n'

export type AboutSection = {
  contentKey: StringKeyName
  id: string
  titleKey: StringKeyName
}

export type AboutContentStructure = {
  sections: AboutSection[]
}

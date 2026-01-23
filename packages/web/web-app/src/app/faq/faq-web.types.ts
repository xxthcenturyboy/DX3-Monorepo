import type { StringKeyName } from '../i18n'

export type FaqItem = {
  answerKey: StringKeyName
  id: string
  questionKey: StringKeyName
}

export type FaqContentStructure = {
  authenticated: FaqItem[]
  public: FaqItem[]
}

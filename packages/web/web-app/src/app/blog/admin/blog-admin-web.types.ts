import type { BlogPostStatusType } from '@dx3/models-shared'

export type BlogEditorSettingsType = {
  canonicalUrl: string
  categories: string[]
  excerpt: string
  featuredImageId: string
  isAnonymous: boolean
  seoDescription: string
  seoTitle: string
  slug: string
  tags: string[]
}

export type BlogEditorStateType = {
  content: string
  filterValue: string
  initialContent: string
  initialTitle: string
  limit: number
  offset: number
  orderBy: string
  settings: BlogEditorSettingsType
  sortDir: 'ASC' | 'DESC'
  status: BlogPostStatusType | ''
  title: string
}

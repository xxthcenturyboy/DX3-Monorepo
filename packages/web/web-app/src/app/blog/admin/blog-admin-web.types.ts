import type { BlogPostStatusType } from '@dx3/models-shared'

export type BlogEditorStateType = {
  content: string
  filterValue: string
  initialContent: string
  initialTitle: string
  limit: number
  offset: number
  orderBy: string
  sortDir: 'ASC' | 'DESC'
  status: BlogPostStatusType | ''
  title: string
}

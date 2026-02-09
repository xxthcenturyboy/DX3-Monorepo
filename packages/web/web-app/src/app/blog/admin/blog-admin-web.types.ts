import type { BlogPostStatusType } from '@dx3/models-shared'

export type BlogEditorStateType = {
  filterValue: string
  limit: number
  offset: number
  orderBy: string
  sortDir: 'ASC' | 'DESC'
  status: BlogPostStatusType | ''
}

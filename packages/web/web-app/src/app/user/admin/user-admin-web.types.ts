import type { UserType } from '@dx3/models-shared'

export type UserAdminStateType = {
  filterValue?: string
  lastRoute: string
  limit: number
  offset: number
  orderBy?: string
  sortDir: 'ASC' | 'DESC'
  user?: UserType
  users: UserType[]
  usersCount?: number
}

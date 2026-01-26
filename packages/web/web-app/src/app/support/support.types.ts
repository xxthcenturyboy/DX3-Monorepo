import type {
  SupportCategoryType,
  SupportRequestType,
  SupportRequestWithUserType,
  SupportStatusType,
} from '@dx3/models-shared'

export type StatusChipColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'error'
  | 'info'
  | 'success'
  | 'warning'

export type SupportWebState = {
  lastToast: SupportRequestType | null
  newRequestIds: string[]
  unviewedCount: number
}

export type SupportAdminStateType = {
  categoryFilter: SupportCategoryType | ''
  filterValue: string
  lastRoute: string
  limit: number
  offset: number
  orderBy: string
  selectedIds: string[]
  sortDir: 'ASC' | 'DESC'
  statusFilter: SupportStatusType | ''
  supportRequestsWithUser: SupportRequestWithUserType[]
  supportRequestsWithUserCount: number
  // User support requests tab state (namespaced)
  userTab: {
    filterOpenOnly: boolean
    limit: number
    offset: number
    orderBy: string
    sortDir: 'ASC' | 'DESC'
    supportRequests: SupportRequestType[]
    supportRequestsCount: number
    userId: string
  }
}

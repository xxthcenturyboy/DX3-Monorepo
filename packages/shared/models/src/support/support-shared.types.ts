import type { SUPPORT_CATEGORY, SUPPORT_STATUS } from './support-shared.consts'

/**
 * Support Category type derived from constants
 */
export type SupportCategoryType = (typeof SUPPORT_CATEGORY)[keyof typeof SUPPORT_CATEGORY]

/**
 * Support Status type derived from constants
 */
export type SupportStatusType = (typeof SUPPORT_STATUS)[keyof typeof SUPPORT_STATUS]

/**
 * Support Request entity type
 */
export type SupportRequestType = {
  assignedTo: string | null
  category: SupportCategoryType
  createdAt: Date
  id: string
  message: string
  resolvedAt: Date | null
  status: SupportStatusType
  subject: string
  updatedAt: Date
  userId: string
  userTimezone: string
  viewedAt: Date | null
  viewedByAdmin: boolean
}

/**
 * Support Request with user display info (for admin list)
 */
export type SupportRequestWithUserType = SupportRequestType & {
  userDisplayName: string
  userEmail: string | null
  userFullName: string | null
  username: string | null
}

/**
 * Support Message entity type (for future threading)
 */
export type SupportMessageType = {
  createdAt: Date
  id: string
  isAdminResponse: boolean
  isInternalNote: boolean
  message: string
  supportRequestId: string
  userId: string
}

/**
 * Payload for creating a new support request
 */
export type CreateSupportRequestPayloadType = {
  category: SupportCategoryType
  message: string
  subject: string
}

/**
 * Payload for updating support request status
 */
export type UpdateSupportRequestStatusPayloadType = {
  assignedTo?: string
  status: SupportStatusType
}

/**
 * Query parameters for listing support requests
 */
export type GetSupportRequestsListQueryType = {
  category?: SupportCategoryType
  filterValue?: string
  limit?: number
  offset?: number
  openOnly?: boolean
  orderBy?: string
  sortDir?: 'ASC' | 'DESC'
  status?: SupportStatusType
  userId?: string
}

/**
 * Response type for support requests list
 */
export type GetSupportRequestsListResponseType = {
  count: number
  rows: SupportRequestWithUserType[]
}

/**
 * Response type for unviewed count
 */
export type SupportUnviewedCountResponseType = {
  count: number
}

/**
 * WebSocket event types for support notifications
 */
export type SupportSocketServerToClientEvents = {
  newSupportRequest: (request: SupportRequestType) => void
  supportRequestUpdated: (request: SupportRequestType) => void
}

export type SupportSocketClientToServerEvents = {
  joinAdminRoom: () => void
}

export type SupportSocketInterServerEvents = {
  ping: () => void
}

export type SupportSocketData = {
  isAdmin: boolean
  userId: string
}

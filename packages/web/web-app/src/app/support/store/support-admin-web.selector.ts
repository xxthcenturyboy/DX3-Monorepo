import { createSelector } from 'reselect'

import type { RootState } from '../../store/store-web.redux'
import { SupportAdminWebListService } from '../admin/support-admin-list.service'
import { UserSupportRequestListService } from '../admin/user-support-requests-list.service'
import type { SupportAdminStateType } from '../support.types'

const getSelectedIds = (state: RootState): SupportAdminStateType['selectedIds'] =>
  state.supportAdmin.selectedIds
const getSupportRequestsWithUser = (
  state: RootState,
): SupportAdminStateType['supportRequestsWithUser'] => state.supportAdmin.supportRequestsWithUser
const getSupportRequestWithUserCount = (
  state: RootState,
): SupportAdminStateType['supportRequestsWithUserCount'] =>
  state.supportAdmin.supportRequestsWithUserCount
const getUserTabSupportRequests = (
  state: RootState,
): SupportAdminStateType['userTab']['supportRequests'] =>
  state.supportAdmin.userTab?.supportRequests || []

export const selectSupportRequestWithUserRowData = createSelector(
  [getSupportRequestsWithUser],
  (supportRequests) => {
    const service = new SupportAdminWebListService()
    return service.getRows(supportRequests)
  },
)

export const selectAllRowsSelected = createSelector(
  [getSupportRequestWithUserCount, getSelectedIds],
  (count, ids) => {
    if (count === 0) {
      return false
    }
    return count === ids?.length
  },
)

export const selectUserTabSupportRequestRowData = createSelector(
  [getUserTabSupportRequests],
  (supportRequests) => {
    const service = new UserSupportRequestListService()
    return service.getRows(supportRequests)
  },
)

import { createSelector } from 'reselect'

import type { RootState } from '../store/store-web.redux'
import { AdminLogsWebListService } from './admin-logs-web-list.service'
import type { AdminLogsStateType } from './admin-logs-web.types'

const getLogs = (state: RootState): AdminLogsStateType['logs'] => state.adminLogs.logs

export const selectAdminLogsState = (state: RootState): AdminLogsStateType => state.adminLogs

export const selectLogsListData = createSelector([getLogs], (logs) => {
  const service = new AdminLogsWebListService()
  return service.getRows(logs)
})

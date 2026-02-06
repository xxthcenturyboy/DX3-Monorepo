import type { LogEntryType, LogEventType } from '@dx3/models-shared'

export type AdminLogsStateType = {
  eventTypeFilter: LogEventType | ''
  isAvailable: boolean | null
  lastRoute: string
  limit: number
  logs: LogEntryType[]
  logsCount: number
  offset: number
  orderBy: string
  sortDir: 'ASC' | 'DESC'
  successFilter: boolean | ''
}

import { green, red } from '@mui/material/colors'
import dayjs from 'dayjs'

import type { LogEntryType } from '@dx3/models-shared'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../i18n'
import { store } from '../store'

export class AdminLogsWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  public static ADMIN_LOGS_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'createdAt',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Time',
      width: '160px',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'eventType',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Event Type',
      width: '140px',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'appId',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'App',
      width: '100px',
    },
    {
      align: 'center',
      componentType: 'text',
      fieldName: 'success',
      fieldType: 'string',
      headerAlign: 'center',
      sortable: true,
      title: AdminLogsWebListService.STRINGS.STATUS,
      width: '80px',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'message',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: AdminLogsWebListService.STRINGS.MESSAGE,
      width: '250px',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'userId',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: 'User ID',
      width: '100px',
    },
    {
      align: 'center',
      componentType: 'text',
      fieldName: 'statusCode',
      fieldType: 'number',
      headerAlign: 'center',
      sortable: true,
      title: 'Code',
      width: '60px',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of AdminLogsWebListService.ADMIN_LOGS_LIST_META) {
      data.push({
        align: meta.headerAlign,
        fieldName: meta.fieldName,
        sortable: meta.sortable,
        title: meta.title,
        width: meta.width,
      })
    }

    return data
  }

  private getRowData(log: LogEntryType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: log.id,
    }

    for (const meta of AdminLogsWebListService.ADMIN_LOGS_LIST_META) {
      let cellData: unknown
      let color: string | undefined

      switch (meta.fieldName) {
        case 'createdAt':
          cellData = dayjs(log.createdAt).format('YYYY-MM-DD HH:mm:ss')
          break
        case 'eventType':
          cellData = log.eventType
          break
        case 'appId':
          cellData = log.appId || '-'
          break
        case 'success':
          if (log.success === true || log.success === undefined) {
            cellData = 'OK'
            color = green[600]
          } else {
            cellData = 'ERR'
            color = red[500]
          }
          break
        case 'message':
          cellData = log.message || '-'
          break
        case 'userId':
          cellData = log.userId ? `${log.userId.substring(0, 8)}...` : '-'
          break
        case 'statusCode':
          cellData = log.statusCode ?? '-'
          break
        default:
          cellData = '-'
      }

      row.columns.push({
        align: meta.align,
        color,
        componentType: meta.componentType,
        data: cellData,
        dataType: meta.fieldType,
      })
    }

    return row
  }

  public getRows(logs: LogEntryType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const log of logs) {
      const data = this.getRowData(log)
      rows.push(data)
    }

    return rows
  }
}

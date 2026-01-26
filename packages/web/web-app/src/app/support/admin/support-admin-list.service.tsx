/** biome-ignore-all lint/suspicious/noExplicitAny: Acceptable */
import { Checkbox, Chip, Tooltip } from '@mui/material'

import {
  SUPPORT_STATUS_COLORS,
  SUPPORT_VALIDATION,
  type SupportRequestWithUserType,
} from '@dx3/models-shared'
import { DxDateUtilClass, truncateString } from '@dx3/utils-shared'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store'
import { supportAdminActions } from '../store/support-admin-web.reducer'
import { CATEGORY_LABEL_KEYS, STATUS_LABEL_KEYS } from '../support.consts'
import type { StatusChipColor } from '../support.types'

export class SupportAdminWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS
  public static dispatch = store.dispatch(supportAdminActions.statusFilterSet(''))

  public static SUPPORT_ADMIN_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'center',
      componentType: 'component',
      fieldName: 'checkbox',
      fieldType: null,
      headerAlign: 'left',
      sortable: false,
      title: '',
      width: '5%',
    },
    {
      align: 'left',
      componentType: 'component',
      fieldName: 'createdAt',
      fieldType: null,
      headerAlign: 'left',
      sortable: true,
      title: 'Date',
      width: '8%',
    },
    {
      align: 'left',
      componentType: 'component',
      fieldName: 'category',
      fieldType: null,
      headerAlign: 'left',
      sortable: true,
      title: 'Category',
      width: '8%',
    },
    {
      align: 'left',
      componentType: 'component',
      fieldName: 'subject',
      fieldType: null,
      headerAlign: 'left',
      sortable: true,
      title: 'Subject',
      width: '45%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'userDisplayName',
      fieldType: null,
      headerAlign: 'left',
      sortable: true,
      title: 'User',
      width: '10%',
    },
    {
      align: 'left',
      componentType: 'component',
      fieldName: 'status',
      fieldType: null,
      headerAlign: 'left',
      sortable: true,
      title: 'Status',
      width: '5%',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of SupportAdminWebListService.SUPPORT_ADMIN_LIST_META) {
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

  private getRowData(data: SupportRequestWithUserType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: data.id,
    }

    for (const meta of SupportAdminWebListService.SUPPORT_ADMIN_LIST_META) {
      let cellData: any
      let icon: any
      let color: string | undefined

      if (meta.fieldName === 'checkbox') {
        const isSelected = store.getState().supportAdmin.selectedIds.includes(data.id)
        cellData = (
          <Checkbox
            checked={isSelected}
            onChange={(e) => {
              const selectedIds = store.getState().supportAdmin.selectedIds.slice()
              if (e.target.checked) {
                selectedIds.push(data.id)
              } else {
                const index = selectedIds.indexOf(data.id)
                if (index > -1) {
                  selectedIds.splice(index, 1)
                }
              }
              store.dispatch(supportAdminActions.setSelectedIds(selectedIds))
            }}
            onClick={(e) => e.stopPropagation()}
            size="small"
          />
        )
      }
      if (meta.fieldName === 'createdAt') {
        cellData = (
          <Tooltip title={DxDateUtilClass.formatAbsoluteTime(data.createdAt)}>
            <span style={{ fontWeight: data.viewedByAdmin ? 'normal' : 'bold' }}>
              {DxDateUtilClass.formatRelativeTime(data.createdAt)}
            </span>
          </Tooltip>
        )
      }
      if (meta.fieldName === 'category') {
        cellData = (
          <Chip
            color="primary"
            label={
              SupportAdminWebListService.STRINGS[CATEGORY_LABEL_KEYS[data.category]] ||
              data.category
            }
            size="small"
            variant="outlined"
          />
        )
      }
      if (meta.fieldName === 'subject') {
        cellData = (
          <Tooltip title={data.subject}>
            <span style={{ fontWeight: data.viewedByAdmin ? 'normal' : 'bold' }}>
              {truncateString(data.subject, SUPPORT_VALIDATION.SUBJECT_TRUNCATE_LENGTH)}
            </span>
          </Tooltip>
        )
      }
      if (meta.fieldName === 'userDisplayName') {
        cellData = data.userDisplayName
      }
      if (meta.fieldName === 'status') {
        cellData = (
          <Chip
            color={(SUPPORT_STATUS_COLORS[data.status] as StatusChipColor) || 'default'}
            label={
              SupportAdminWebListService.STRINGS[STATUS_LABEL_KEYS[data.status]] || data.status
            }
            size="small"
          />
        )
      }

      if (cellData === undefined) {
        // @ts-expect-error - error lame
        cellData = data[meta.fieldName] || '-'
      }
      row.columns.push({
        align: meta.align,
        color,
        componentType: meta.componentType,
        data: cellData,
        dataType: meta.fieldType,
        icon,
        onClick: (id: string, actionType: string) => console.log(id, actionType),
      })
    }

    return row
  }

  public getRows(supportData: SupportRequestWithUserType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const sd of supportData) {
      const data = this.getRowData(sd)
      rows.push(data)
    }

    return rows
  }
}

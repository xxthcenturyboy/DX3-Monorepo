import { green, grey, orange } from '@mui/material/colors'

import { FEATURE_FLAG_STATUS, FEATURE_FLAG_TARGET, type FeatureFlagType } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store/store-web.redux'

export class FeatureFlagAdminWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  public static FEATURE_FLAG_ADMIN_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'name',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Name',
      width: '20%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'description',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: 'Description',
      width: '30%',
    },
    {
      align: 'center',
      componentType: 'icon',
      fieldName: 'status',
      fieldType: 'string',
      headerAlign: 'center',
      sortable: true,
      title: 'Status',
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'target',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: 'Target',
      width: '15%',
    },
    {
      align: 'center',
      componentType: 'text',
      fieldName: 'percentage',
      fieldType: 'number',
      headerAlign: 'center',
      sortable: true,
      title: '%',
      width: '10%',
    },
    {
      align: 'left',
      componentType: 'none',
      fieldName: '',
      fieldType: null,
      headerAlign: 'center',
      sortable: false,
      title: '',
      width: '10%',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of FeatureFlagAdminWebListService.FEATURE_FLAG_ADMIN_LIST_META) {
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

  private getRowData(flag: FeatureFlagType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: flag.id,
      testingKey: `feature-flag-row-${flag.name}`,
    }

    for (const meta of FeatureFlagAdminWebListService.FEATURE_FLAG_ADMIN_LIST_META) {
      let cellData: unknown
      let icon: IconNames | undefined
      let color: string | undefined

      if (meta.fieldName === 'status') {
        cellData = flag.status
        icon = IconNames.FLAG
        switch (flag.status) {
          case FEATURE_FLAG_STATUS.ACTIVE:
            color = green[600]
            break
          case FEATURE_FLAG_STATUS.ROLLOUT:
            color = orange[500]
            break
          case FEATURE_FLAG_STATUS.DISABLED:
            color = grey[400]
            break
        }
      }

      if (meta.fieldName === 'target') {
        switch (flag.target) {
          case FEATURE_FLAG_TARGET.ALL:
            cellData = 'All Users'
            break
          case FEATURE_FLAG_TARGET.ADMIN:
            cellData = 'Admins'
            break
          case FEATURE_FLAG_TARGET.SUPER_ADMIN:
            cellData = 'Super Admins'
            break
          case FEATURE_FLAG_TARGET.BETA_USERS:
            cellData = 'Beta Users'
            break
          case FEATURE_FLAG_TARGET.PERCENTAGE:
            cellData = `${flag.percentage}% Rollout`
            break
          default:
            cellData = flag.target
        }
      }

      if (meta.fieldName === 'percentage') {
        cellData = flag.percentage !== null ? `${flag.percentage}%` : '-'
      }

      if (cellData === undefined) {
        cellData = flag[meta.fieldName as keyof FeatureFlagType]
      }

      row.columns.push({
        align: meta.align,
        color,
        componentType: meta.componentType,
        data: cellData,
        dataType: meta.fieldType,
        icon,
      })
    }

    return row
  }

  public getRows(flags: FeatureFlagType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const flag of flags) {
      const data = this.getRowData(flag)
      rows.push(data)
    }

    return rows
  }
}

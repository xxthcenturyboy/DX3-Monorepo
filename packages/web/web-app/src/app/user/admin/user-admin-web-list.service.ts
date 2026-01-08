/** biome-ignore-all lint/suspicious/noExplicitAny: Acceptable */
import { blue, green, red } from '@mui/material/colors'

import type { UserType } from '@dx3/models-shared'
import { IconNames } from '@dx3/web-libs/ui/icons'
import type { TableHeaderItem, TableMeta, TableRowType } from '@dx3/web-libs/ui/table/types'

import { DEFAULT_STRINGS } from '../../i18n'
import { store } from '../../store'

export class UserAdminWebListService {
  public static STRINGS = store.getState()?.i18n?.translations || DEFAULT_STRINGS

  public static USER_ADMIN_LIST_META: TableMeta<unknown>[] = [
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'fullName',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: UserAdminWebListService.STRINGS.NAME,
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'username',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: true,
      title: UserAdminWebListService.STRINGS.USERNAME,
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'emails',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: UserAdminWebListService.STRINGS.EMAIL,
      width: '25%',
    },
    {
      align: 'left',
      componentType: 'text',
      fieldName: 'phones',
      fieldType: 'string',
      headerAlign: 'left',
      sortable: false,
      title: UserAdminWebListService.STRINGS.PHONE,
      width: '15%',
    },
    {
      align: 'left',
      componentType: 'icon',
      fieldName: 'isAdmin',
      fieldType: 'boolean',
      headerAlign: 'center',
      sortable: true,
      title: UserAdminWebListService.STRINGS.ADMIN,
      width: '5%',
    },
    {
      align: 'left',
      componentType: 'icon',
      fieldName: 'isSuperAdmin',
      fieldType: 'boolean',
      headerAlign: 'center',
      sortable: true,
      title: UserAdminWebListService.STRINGS.SUPER,
      width: '5%',
    },
    {
      align: 'left',
      componentType: 'icon',
      fieldName: 'optInBeta',
      fieldType: 'boolean',
      headerAlign: 'center',
      sortable: true,
      title: UserAdminWebListService.STRINGS.BETA,
      width: '5%',
    },
    {
      align: 'left',
      componentType: 'icon',
      fieldName: 'restrictions',
      fieldType: 'boolean',
      headerAlign: 'center',
      sortable: true,
      title: UserAdminWebListService.STRINGS.RESTRICTED,
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
      width: '5%',
    },
  ]

  public static getListHeaders(): TableHeaderItem[] {
    const data: TableHeaderItem[] = []

    for (const meta of UserAdminWebListService.USER_ADMIN_LIST_META) {
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

  private getRowData(user: UserType): TableRowType {
    const row: TableRowType = {
      columns: [],
      id: user.id,
    }

    for (const meta of UserAdminWebListService.USER_ADMIN_LIST_META) {
      let cellData: any
      let icon: any
      let color: string | undefined

      if (meta.fieldName === 'emails') {
        const e = user.emails?.find((email) => email.default)
        if (e) {
          cellData = e.email
        }
        if (!e && user.emails?.length > 0) {
          cellData = user.emails[0].email
        }
      }
      if (meta.fieldName === 'phones') {
        const p = user.phones?.find((phone) => phone.default)
        if (p) {
          cellData = p.uiFormatted || p.phone
        }
        if (!p && user.phones?.length > 0) {
          cellData = user.phones[0].uiFormatted || user.phones[0].phone
        }
      }
      if (meta.fieldName === 'restrictions') {
        cellData = Array.isArray(user.restrictions) && user.restrictions.length > 0
        if (cellData) {
          icon = IconNames.CHECK
          color = red[300]
        }
      }
      if (meta.fieldName === 'isAdmin') {
        cellData = user.isAdmin
        if (cellData) {
          icon = IconNames.CHECK
          color = blue[200]
        }
      }
      if (meta.fieldName === 'isSuperAdmin') {
        cellData = user.isSuperAdmin
        if (cellData) {
          icon = IconNames.CHECK
          color = blue[700]
        }
      }
      if (meta.fieldName === 'optInBeta') {
        cellData = user.optInBeta
        if (cellData) {
          icon = IconNames.CHECK
          color = green[600]
        }
      }

      if (cellData === undefined) {
        // @ts-expect-error - error lame
        cellData = user[meta.fieldName]
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

  public getRows(userData: UserType[]): TableRowType[] {
    const rows: TableRowType[] = []
    for (const user of userData) {
      const data = this.getRowData(user)
      rows.push(data)
    }

    return rows
  }
}

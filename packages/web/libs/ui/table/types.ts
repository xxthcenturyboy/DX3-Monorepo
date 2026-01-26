import type { PrimitiveTypes, SortDirType } from '@dx3/utils-shared'

import type { IconNames } from '../icons'

export type CellAlignment = 'left' | 'center' | 'right' | 'justify' | 'inherit'
export type ComponentType = 'text' | 'icon' | 'component' | 'none'

export type TableComponentProps = {
  borderRadius?: string
  changeFilter?: (value: string) => void
  changeLimit?: (limit: number) => void
  changeOffset?: (offset: number) => void
  changeSort?: (fieldName: string) => void
  clickRow?: (rowData: TableRowType) => void
  count: number
  header: TableHeaderItem[]
  hideFooter?: boolean
  isInitialized: boolean
  loading?: boolean
  loadingColor?: string
  limit: number
  maxHeight?: string
  offset: number
  orderBy?: string
  rows: TableRowType[]
  sortDir: SortDirType
  tableName: string
  themeMode?: 'light' | 'dark'
}

export type TableHeaderItem = {
  align?: CellAlignment
  assetId?: string
  fieldName: string
  sortable: boolean
  title: string
  width?: string | number
}

export type TableRowType = {
  id: string
  columns: TableCellData[]
  testingKey?: string
}

export type TableCellData = {
  align?: CellAlignment
  assetMimeType?: string
  assetValue?: string
  color?: string
  componentType: ComponentType
  data: unknown
  dataType: PrimitiveTypes | null
  fieldLabel?: string
  icon?: IconNames
  isAsset?: boolean
  onClick?: (id: string, actionType: string) => void
  originalStringValue?: string
}

export type TableDummyColumn = number[]

export type TableDummyRow = TableDummyColumn[]

export type TableMeta<T> = {
  align?: CellAlignment
  componentType: ComponentType
  data?: T
  fieldName: string
  fieldType: PrimitiveTypes | null
  headerAlign: CellAlignment
  sortable: boolean
  title: string
  width?: string | number
}

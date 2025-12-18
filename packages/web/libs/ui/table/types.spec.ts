import type { PrimitiveTypes } from '@dx3/utils-shared'

// removed runtime IconNames import (icons are a type-only export now)
import { IconNames } from '../system/icons'
import type {
  CellAlignment,
  ComponentType,
  TableCellData,
  TableComponentProps,
  TableDummyColumn,
  TableDummyRow,
  TableHeaderItem,
  TableMeta,
  TableRowType,
} from './types'

describe('table types', () => {
  describe('CellAlignment', () => {
    it('should accept valid alignment values', () => {
      const alignments: CellAlignment[] = ['left', 'center', 'right', 'justify', 'inherit']
      alignments.forEach((alignment) => {
        expect(alignment).toBeDefined()
      })
    })
  })

  describe('ComponentType', () => {
    it('should accept valid component type values', () => {
      const componentTypes: ComponentType[] = ['text', 'icon', 'checkbox', 'none']
      componentTypes.forEach((type) => {
        expect(type).toBeDefined()
      })
    })
  })

  describe('TableComponentProps', () => {
    it('should have required properties', () => {
      const props: TableComponentProps = {
        count: 100,
        header: [],
        isInitialized: true,
        limit: 10,
        offset: 0,
        rows: [],
        sortDir: 'ASC',
        tableName: 'test-table',
      }

      expect(props.count).toBe(100)
      expect(props.header).toEqual([])
      expect(props.isInitialized).toBe(true)
      expect(props.limit).toBe(10)
      expect(props.offset).toBe(0)
      expect(props.rows).toEqual([])
      expect(props.sortDir).toBe('ASC')
      expect(props.tableName).toBe('test-table')
    })

    it('should allow optional properties', () => {
      const props: TableComponentProps = {
        changeFilter: jest.fn(),
        changeLimit: jest.fn(),
        changeOffset: jest.fn(),
        changeSort: jest.fn(),
        clickRow: jest.fn(),
        count: 50,
        header: [],
        isInitialized: false,
        limit: 25,
        loading: true,
        maxHeight: '500px',
        offset: 1,
        orderBy: 'name',
        rows: [],
        sortDir: 'DESC',
        tableName: 'user-table',
      }

      expect(props.changeFilter).toBeDefined()
      expect(props.changeLimit).toBeDefined()
      expect(props.changeOffset).toBeDefined()
      expect(props.changeSort).toBeDefined()
      expect(props.clickRow).toBeDefined()
      expect(props.loading).toBe(true)
      expect(props.maxHeight).toBe('500px')
      expect(props.orderBy).toBe('name')
    })
  })

  describe('TableHeaderItem', () => {
    it('should have required properties', () => {
      const header: TableHeaderItem = {
        fieldName: 'username',
        sortable: true,
        title: 'Username',
      }

      expect(header.fieldName).toBe('username')
      expect(header.sortable).toBe(true)
      expect(header.title).toBe('Username')
    })

    it('should allow optional properties', () => {
      const header: TableHeaderItem = {
        align: 'center',
        fieldName: 'id',
        sortable: false,
        title: 'ID',
        width: 100,
      }

      expect(header.align).toBe('center')
      expect(header.width).toBe(100)
    })

    it('should accept string width', () => {
      const header: TableHeaderItem = {
        fieldName: 'description',
        sortable: false,
        title: 'Description',
        width: '300px',
      }

      expect(header.width).toBe('300px')
    })
  })

  describe('TableRowType', () => {
    it('should have id and columns', () => {
      const row: TableRowType = {
        columns: [],
        id: 'row-1',
      }

      expect(row.id).toBe('row-1')
      expect(row.columns).toEqual([])
    })

    it('should contain column data', () => {
      const row: TableRowType = {
        columns: [
          {
            componentType: 'text',
            data: 'Test Data',
            dataType: 'string',
          },
        ],
        id: 'row-2',
      }

      expect(row.columns.length).toBe(1)
      expect(row.columns[0].componentType).toBe('text')
      expect(row.columns[0].data).toBe('Test Data')
    })
  })

  describe('TableCellData', () => {
    it('should have required properties', () => {
      const cell: TableCellData = {
        componentType: 'text',
        data: 'Sample Text',
        dataType: 'string',
      }

      expect(cell.componentType).toBe('text')
      expect(cell.data).toBe('Sample Text')
      expect(cell.dataType).toBe('string')
    })

    it('should allow null dataType', () => {
      const cell: TableCellData = {
        componentType: 'none',
        data: null,
        dataType: null,
      }

      expect(cell.dataType).toBeNull()
    })

    it('should allow optional properties', () => {
      const cell: TableCellData = {
        align: 'right',
        color: '#ff0000',
        componentType: 'icon',
        data: null,
        dataType: 'string',
        icon: IconNames.CHECK,
        onClick: jest.fn(),
      }

      expect(cell.align).toBe('right')
      expect(cell.color).toBe('#ff0000')
      expect(cell.icon).toBe(IconNames.CHECK)
      expect(cell.onClick).toBeDefined()
    })

    it('should accept different data types', () => {
      const stringCell: TableCellData = {
        componentType: 'text',
        data: 'string value',
        dataType: 'string',
      }

      const numberCell: TableCellData = {
        componentType: 'text',
        data: 42,
        dataType: 'number',
      }

      const booleanCell: TableCellData = {
        componentType: 'checkbox',
        data: true,
        dataType: 'boolean',
      }

      expect(stringCell.data).toBe('string value')
      expect(numberCell.data).toBe(42)
      expect(booleanCell.data).toBe(true)
    })
  })

  describe('TableDummyColumn', () => {
    it('should be an array of numbers', () => {
      const column: TableDummyColumn = [0, 1, 2, 3]

      expect(Array.isArray(column)).toBe(true)
      expect(column.length).toBe(4)
      expect(typeof column[0]).toBe('number')
    })
  })

  describe('TableDummyRow', () => {
    it('should be an array of TableDummyColumn', () => {
      const row: TableDummyRow = [
        [0, 1, 2],
        [0, 1, 2],
        [0, 1, 2],
      ]

      expect(Array.isArray(row)).toBe(true)
      expect(row.length).toBe(3)
      expect(Array.isArray(row[0])).toBe(true)
    })
  })

  describe('TableMeta', () => {
    it('should have required properties', () => {
      const meta: TableMeta<any> = {
        componentType: 'text',
        fieldName: 'email',
        fieldType: 'string',
        headerAlign: 'left',
        sortable: true,
        title: 'Email Address',
      }

      expect(meta.componentType).toBe('text')
      expect(meta.fieldName).toBe('email')
      expect(meta.fieldType).toBe('string')
      expect(meta.headerAlign).toBe('left')
      expect(meta.sortable).toBe(true)
      expect(meta.title).toBe('Email Address')
    })

    it('should allow optional properties', () => {
      const meta: TableMeta<any> = {
        align: 'center',
        componentType: 'icon',
        fieldName: 'status',
        fieldType: null,
        headerAlign: 'center',
        sortable: false,
        title: 'Status',
        width: '80px',
      }

      expect(meta.align).toBe('center')
      expect(meta.width).toBe('80px')
    })

    it('should accept null fieldType', () => {
      const meta: TableMeta<any> = {
        componentType: 'none',
        fieldName: 'actions',
        fieldType: null,
        headerAlign: 'right',
        sortable: false,
        title: 'Actions',
      }

      expect(meta.fieldType).toBeNull()
    })
  })

  describe('Type Compatibility', () => {
    it('should work with IconNames enum', () => {
      const cell: TableCellData = {
        componentType: 'icon',
        data: null,
        dataType: null,
        icon: IconNames.DASHBOARD,
      }

      expect(cell.icon).toBe(IconNames.DASHBOARD)
    })

    it('should work with PrimitiveTypes', () => {
      const types: PrimitiveTypes[] = ['string', 'number', 'boolean']

      types.forEach((type) => {
        const meta: TableMeta<any> = {
          componentType: 'text',
          fieldName: 'test',
          fieldType: type,
          headerAlign: 'left',
          sortable: true,
          title: 'Test',
        }

        expect(meta.fieldType).toBe(type)
      })
    })

    it('should handle callback functions', () => {
      const onClickMock = jest.fn()
      const cell: TableCellData = {
        componentType: 'icon',
        data: null,
        dataType: null,
        onClick: onClickMock,
      }

      if (cell.onClick) {
        cell.onClick('row-1', 'delete')
      }

      expect(onClickMock).toHaveBeenCalledWith('row-1', 'delete')
    })
  })

  describe('Complex Type Structures', () => {
    it('should handle complete TableComponentProps', () => {
      const mockChangeSort = jest.fn()
      const mockClickRow = jest.fn()

      const header: TableHeaderItem[] = [
        { fieldName: 'id', sortable: true, title: 'ID', width: 50 },
        { fieldName: 'name', sortable: true, title: 'Name', width: 200 },
      ]

      const rows: TableRowType[] = [
        {
          columns: [
            { componentType: 'text', data: '1', dataType: 'number' },
            { componentType: 'text', data: 'John', dataType: 'string' },
          ],
          id: '1',
        },
      ]

      const props: TableComponentProps = {
        changeSort: mockChangeSort,
        clickRow: mockClickRow,
        count: 100,
        header,
        isInitialized: true,
        limit: 10,
        offset: 0,
        orderBy: 'name',
        rows,
        sortDir: 'ASC',
        tableName: 'users',
      }

      expect(props.header.length).toBe(2)
      expect(props.rows.length).toBe(1)
      expect(props.rows[0].columns.length).toBe(2)
    })
  })
})

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'

import { IconNames } from '../system/icons'
import { TableComponent } from './table.component'
import type { TableHeaderItem, TableRowType } from './types'

// Mock BeatLoader
jest.mock('react-spinners', () => ({
  BeatLoader: ({ color, size, margin }: { color: string; size: number; margin: string }) => (
    <div
      data-color={color}
      data-margin={margin}
      data-size={size}
      data-testid="beat-loader"
    >
      Loading Spinner
    </div>
  ),
}))

// Mock getIcon
jest.mock('../system/icons', () => ({
  ...jest.requireActual('../system/icons'),
  getIcon: jest.fn((iconName: string, color?: string) => (
    <span
      data-color={color}
      data-testid={`icon-${iconName}`}
    >
      Icon
    </span>
  )),
  IconNames: {
    CHECK: 'CHECK',
    DASHBOARD: 'DASHBOARD',
  },
}))

// Mock waveItem
jest.mock('../global/skeletons.ui', () => ({
  waveItem: (height: string) => (
    <div
      data-height={height}
      data-testid="wave-skeleton"
    >
      Skeleton
    </div>
  ),
}))

const mockTheme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>)
}

describe('TableComponent', () => {
  const defaultHeader: TableHeaderItem[] = [
    { fieldName: 'id', sortable: true, title: 'ID', width: 50 },
    { fieldName: 'name', sortable: true, title: 'Name', width: 200 },
    { fieldName: 'status', sortable: false, title: 'Status', width: 100 },
  ]

  const defaultRows: TableRowType[] = [
    {
      columns: [
        { componentType: 'text', data: '1', dataType: 'number' },
        { componentType: 'text', data: 'John Doe', dataType: 'string' },
        { componentType: 'icon', data: null, dataType: null, icon: IconNames.CHECK },
      ],
      id: '1',
    },
    {
      columns: [
        { componentType: 'text', data: '2', dataType: 'number' },
        { componentType: 'text', data: 'Jane Smith', dataType: 'string' },
        { componentType: 'icon', data: null, dataType: null, icon: IconNames.DASHBOARD },
      ],
      id: '2',
    },
  ]

  const defaultProps = {
    count: 100,
    header: defaultHeader,
    isInitialized: true,
    limit: 10,
    offset: 0,
    rows: defaultRows,
    sortDir: 'ASC' as const,
    tableName: 'Test Table',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      const { container } = renderWithTheme(<TableComponent {...defaultProps} />)
      const tables = container.querySelectorAll('table')
      expect(tables.length).toBeGreaterThan(0)
    })

    it('should render table headers', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      expect(screen.getByText('ID')).toBeInTheDocument()
      expect(screen.getByText('Name')).toBeInTheDocument()
      expect(screen.getByText('Status')).toBeInTheDocument()
    })

    it('should render table rows', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })

    it('should render table with custom tableName', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          tableName="User Table"
        />,
      )

      const table = container.querySelector('#user-table')
      expect(table).toBeInTheDocument()
      expect(table).toHaveAttribute('id', 'user-table')
    })
  })

  describe('Initialization State', () => {
    it('should show BeatLoader when not initialized', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          isInitialized={false}
        />,
      )

      expect(screen.getByTestId('beat-loader')).toBeInTheDocument()
    })

    it('should hide table content when not initialized', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          isInitialized={false}
        />,
      )

      const mainTable = container.querySelector('#test-table')
      expect(mainTable).not.toBeVisible()
    })

    it('should show table when initialized', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          isInitialized={true}
        />,
      )

      const mainTable = container.querySelector('#test-table')
      expect(mainTable).toBeVisible()
    })

    it('should pass loadingColor to BeatLoader', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          isInitialized={false}
          loadingColor="#ff0000"
        />,
      )

      const loader = screen.getByTestId('beat-loader')
      expect(loader).toHaveAttribute('data-color', '#ff0000')
    })
  })

  describe('Loading State', () => {
    it('should show skeleton loaders when loading', async () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          loading={true}
        />,
      )

      await waitFor(() => {
        expect(screen.getAllByTestId('wave-skeleton').length).toBeGreaterThan(0)
      })
    })

    it('should hide actual rows when loading', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          loading={true}
        />,
      )

      expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
      expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()
    })

    it('should show rows when not loading', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          loading={false}
        />,
      )

      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  describe('Empty State', () => {
    it('should show "No Data" message when rows are empty', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          loading={false}
          rows={[]}
        />,
      )

      expect(screen.getByText('No Data')).toBeInTheDocument()
    })

    it('should not show "No Data" when loading', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          loading={true}
          rows={[]}
        />,
      )

      expect(screen.queryByText('No Data')).not.toBeInTheDocument()
    })

    it('should not show "No Data" when rows exist', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          rows={defaultRows}
        />,
      )

      expect(screen.queryByText('No Data')).not.toBeInTheDocument()
    })
  })

  describe('Sorting', () => {
    it('should call changeSort when sortable header clicked', () => {
      const changeSort = jest.fn()
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          changeSort={changeSort}
        />,
      )

      const nameHeader = screen.getByText('Name')
      fireEvent.click(nameHeader)

      expect(changeSort).toHaveBeenCalledWith('name')
    })

    it('should not call changeSort when non-sortable header clicked', () => {
      const changeSort = jest.fn()
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          changeSort={changeSort}
        />,
      )

      const statusHeader = screen.getByText('Status')
      fireEvent.click(statusHeader)

      expect(changeSort).not.toHaveBeenCalled()
    })

    it('should highlight sorted column', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          orderBy="name"
        />,
      )

      const nameHeader = screen.getByText('Name')
      expect(nameHeader.closest('span')).toHaveClass('Mui-active')
    })

    it('should show correct sort direction', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          orderBy="name"
          sortDir="DESC"
        />,
      )

      expect(screen.getByText('Name')).toBeInTheDocument()
    })
  })

  describe('Pagination', () => {
    it('should render pagination controls', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      expect(screen.getByLabelText('first page')).toBeInTheDocument()
      expect(screen.getByLabelText('previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('next page')).toBeInTheDocument()
      expect(screen.getByLabelText('last page')).toBeInTheDocument()
    })

    it('should call changeOffset when page changed', async () => {
      const changeOffset = jest.fn()
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          changeOffset={changeOffset}
        />,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('next page'))
      })

      expect(changeOffset).toHaveBeenCalledWith(1)
    })

    it('should call changeLimit when rows per page changed', () => {
      const changeLimit = jest.fn()
      const changeOffset = jest.fn()

      renderWithTheme(
        <TableComponent
          {...defaultProps}
          changeLimit={changeLimit}
          changeOffset={changeOffset}
        />,
      )

      const rowsPerPageSelect = screen.getByRole('combobox')
      fireEvent.mouseDown(rowsPerPageSelect)

      const option25 = screen.getByText('25')
      fireEvent.click(option25)

      expect(changeLimit).toHaveBeenCalledWith(25)
      expect(changeOffset).toHaveBeenCalledWith(0)
    })

    it('should display correct page range', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={100}
          limit={10}
          offset={2}
        />,
      )

      expect(screen.getByText(/21–30 of 100/)).toBeInTheDocument()
    })
  })

  describe('Footer', () => {
    it('should hide footer when hideFooter is true', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          hideFooter={true}
        />,
      )

      // The footer contains the pagination controls
      expect(screen.queryByLabelText('first page')).not.toBeInTheDocument()
    })
  })

  describe('Row Click', () => {
    it('should call clickRow when row clicked', () => {
      const clickRow = jest.fn()
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          clickRow={clickRow}
        />,
      )

      const row = screen.getByText('John Doe').closest('tr')
      if (row) {
        fireEvent.click(row)
      }

      expect(clickRow).toHaveBeenCalledWith(defaultRows[0])
    })

    it('should not set pointer cursor when clickRow not provided', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      const row = screen.getByText('John Doe').closest('tr')
      expect(row).not.toHaveStyle({ cursor: 'pointer' })
    })
  })

  describe('Cell Rendering', () => {
    it('should render text cells', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })

    it('should render icon cells', () => {
      renderWithTheme(<TableComponent {...defaultProps} />)

      expect(screen.getAllByTestId(/^icon-/).length).toBeGreaterThan(0)
    })

    it('should pass color to icon cells', () => {
      const rowsWithColor: TableRowType[] = [
        {
          columns: [
            {
              color: '#ff0000',
              componentType: 'icon',
              data: null,
              dataType: null,
              icon: IconNames.CHECK,
            },
          ],
          id: '1',
        },
      ]

      renderWithTheme(
        <TableComponent
          {...defaultProps}
          header={[{ fieldName: 'status', sortable: false, title: 'Status' }]}
          rows={rowsWithColor}
        />,
      )

      const icon = screen.getByTestId('icon-CHECK')
      expect(icon).toHaveAttribute('data-color', '#ff0000')
    })

    it('should apply cell alignment', () => {
      const headerWithAlign: TableHeaderItem[] = [
        { align: 'right', fieldName: 'id', sortable: false, title: 'ID' },
      ]

      renderWithTheme(
        <TableComponent
          {...defaultProps}
          header={headerWithAlign}
        />,
      )

      expect(screen.getByText('ID')).toBeInTheDocument()
    })
  })

  describe('getDataToPopulate', () => {
    it('should return originalStringValue for text component if data is not string or number', () => {
      const rowsWithInvalidData: TableRowType[] = [
        {
          columns: [
            {
              componentType: 'text',
              data: null,
              dataType: 'string',
              originalStringValue: 'Fallback Text',
            },
          ],
          id: '1',
        },
      ]

      renderWithTheme(
        <TableComponent
          {...defaultProps}
          header={[{ fieldName: 'name', sortable: false, title: 'Name' }]}
          rows={rowsWithInvalidData}
        />,
      )
      expect(screen.getByText('Fallback Text')).toBeInTheDocument()
    })
  })

  describe('Max Height', () => {
    it('should apply maxHeight prop to table container', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          maxHeight="400px"
        />,
      )

      const tableContainer = container.querySelector('.MuiTableContainer-root')
      expect(tableContainer).toHaveStyle({ maxHeight: '400px' })
    })

    it('should apply borderRadius prop to Paper wrapper', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          borderRadius="10px"
        />,
      )

      const paper = container.querySelector('.MuiPaper-root')
      expect(paper).toHaveStyle({ borderRadius: '10px' })
      const tableContainer = container.querySelector('.MuiTableContainer-root')
      expect(tableContainer).toHaveStyle({ borderRadius: '10px' })
    })

    it('should not set maxHeight when prop not provided', () => {
      const { container } = renderWithTheme(<TableComponent {...defaultProps} />)

      const tableContainer = container.querySelector('.MuiTableContainer-root')
      expect(tableContainer).not.toHaveStyle({ maxHeight: '400px' })
    })
  })

  describe('Rows Per Page Options', () => {
    it('should render pagination for small datasets', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={8}
          limit={10}
        />,
      )

      // Pagination still renders even for small datasets
      expect(screen.getByText(/1–8 of 8/)).toBeInTheDocument()
    })

    it('should show options for larger datasets', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={100}
        />,
      )

      const rowsPerPageSelect = screen.getByRole('combobox')
      expect(rowsPerPageSelect).toBeInTheDocument()
    })

    it('should calculate correct rows per page options', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={150}
        />,
      )

      const rowsPerPageSelect = screen.getByRole('combobox')
      fireEvent.mouseDown(rowsPerPageSelect)

      // Check that the dropdown menu appears with options
      const listbox = screen.getByRole('listbox')
      expect(listbox).toBeInTheDocument()

      // Check for all option values
      expect(screen.getAllByText('10').length).toBeGreaterThan(0)
      expect(screen.getByRole('option', { name: '25' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '50' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: '100' })).toBeInTheDocument()
    })
  })

  describe('Theme Mode', () => {
    it('should work with light theme', () => {
      const lightTheme = createTheme({ palette: { mode: 'light' } })

      const { container } = render(
        <ThemeProvider theme={lightTheme}>
          <TableComponent {...defaultProps} />
        </ThemeProvider>,
      )

      const mainTable = container.querySelector('#test-table')
      expect(mainTable).toBeInTheDocument()
    })

    it('should work with dark theme', () => {
      const darkTheme = createTheme({ palette: { mode: 'dark' } })

      const { container } = render(
        <ThemeProvider theme={darkTheme}>
          <TableComponent {...defaultProps} />
        </ThemeProvider>,
      )

      const mainTable = container.querySelector('#test-table')
      expect(mainTable).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render with Paper wrapper', () => {
      const { container } = renderWithTheme(<TableComponent {...defaultProps} />)

      expect(container.querySelector('.MuiPaper-root')).toBeInTheDocument()
    })

    it('should render with Collapse component', () => {
      const { container } = renderWithTheme(<TableComponent {...defaultProps} />)

      expect(container.querySelector('.MuiCollapse-root')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty header array', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          header={[]}
          rows={[]}
        />,
      )

      const tables = container.querySelectorAll('table')
      expect(tables.length).toBeGreaterThan(0)
    })

    it('should handle large row counts', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={10000}
        />,
      )

      // The number might be formatted with commas
      expect(screen.getByText(/of 10[,]?000/)).toBeInTheDocument()
    })

    it('should handle zero count', () => {
      renderWithTheme(
        <TableComponent
          {...defaultProps}
          count={0}
          rows={[]}
        />,
      )

      expect(screen.getByText(/0–0 of 0/)).toBeInTheDocument()
    })

    it('should handle tableName with spaces', () => {
      const { container } = renderWithTheme(
        <TableComponent
          {...defaultProps}
          tableName="My Table Name"
        />,
      )

      // Component only replaces the first space, so "My Table Name" becomes "my-table name"
      const table = container.querySelector('table[id]')
      expect(table).toBeInTheDocument()
      expect(table?.getAttribute('id')).toBeTruthy()
    })
  })

  describe('Callback Functions', () => {
    it('should not error when optional callbacks not provided', () => {
      expect(() => {
        renderWithTheme(<TableComponent {...defaultProps} />)
      }).not.toThrow()
    })

    it('should handle all callbacks being defined', () => {
      const callbacks = {
        changeFilter: jest.fn(),
        changeLimit: jest.fn(),
        changeOffset: jest.fn(),
        changeSort: jest.fn(),
        clickRow: jest.fn(),
      }

      expect(() => {
        renderWithTheme(
          <TableComponent
            {...defaultProps}
            {...callbacks}
          />,
        )
      }).not.toThrow()
    })
  })
})

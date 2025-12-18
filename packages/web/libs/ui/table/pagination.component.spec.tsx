import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type React from 'react'

import { themeColors } from '../system/mui-overrides/styles'
import { TablePaginationActions } from './pagination.component'

const mockTheme = createTheme({
  direction: 'ltr',
})

jest.mock('@mui/icons-material/FirstPage', () => () => <div data-testid="FirstPageIcon" />)
jest.mock('@mui/icons-material/LastPage', () => () => <div data-testid="LastPageIcon" />)
jest.mock('@mui/icons-material/KeyboardArrowLeft', () => () => (
  <div data-testid="KeyboardArrowLeftIcon" />
))
jest.mock('@mui/icons-material/KeyboardArrowRight', () => () => (
  <div data-testid="KeyboardArrowRightIcon" />
))
const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>)
}

describe('TablePaginationActions', () => {
  const defaultProps = {
    count: 100,
    disabled: false,
    onPageChange: jest.fn(),
    page: 0,
    rowsPerPage: 10,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Rendering', () => {
    it('should render without errors', () => {
      renderWithTheme(<TablePaginationActions {...defaultProps} />)

      expect(screen.getByLabelText('first page')).toBeInTheDocument()
      expect(screen.getByLabelText('previous page')).toBeInTheDocument()
      expect(screen.getByLabelText('next page')).toBeInTheDocument()
      expect(screen.getByLabelText('last page')).toBeInTheDocument()
    })

    it('should render all four navigation buttons', () => {
      renderWithTheme(<TablePaginationActions {...defaultProps} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(4)
    })
  })

  describe('Button States', () => {
    it('should disable first and previous buttons on first page', () => {
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={0}
        />,
      )

      expect(screen.getByLabelText('first page')).toBeDisabled()
      expect(screen.getByLabelText('previous page')).toBeDisabled()
    })

    it('should enable next and last buttons on first page', () => {
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={0}
        />,
      )

      expect(screen.getByLabelText('next page')).not.toBeDisabled()
      expect(screen.getByLabelText('last page')).not.toBeDisabled()
    })

    it('should disable next and last buttons on last page', async () => {
      const lastPage = Math.ceil(100 / 10) - 1
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={lastPage}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('next page')).toBeDisabled()
        expect(screen.getByLabelText('last page')).toBeDisabled()
      })
    })

    it('should enable first and previous buttons on last page', async () => {
      const lastPage = Math.ceil(100 / 10) - 1
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={lastPage}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('first page')).not.toBeDisabled()
        expect(screen.getByLabelText('previous page')).not.toBeDisabled()
      })
    })

    it('should enable all navigation buttons on middle page', async () => {
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={5}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('first page')).not.toBeDisabled()
        expect(screen.getByLabelText('previous page')).not.toBeDisabled()
        expect(screen.getByLabelText('next page')).not.toBeDisabled()
        expect(screen.getByLabelText('last page')).not.toBeDisabled()
      })
    })

    it('should disable all buttons when disabled prop is true', () => {
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          disabled={true}
          page={5}
        />,
      )

      expect(screen.getByLabelText('first page')).toBeDisabled()
      expect(screen.getByLabelText('previous page')).toBeDisabled()
      expect(screen.getByLabelText('next page')).toBeDisabled()
      expect(screen.getByLabelText('last page')).toBeDisabled()
    })

    it('should have correct colors when buttons are disabled', () => {
      renderWithTheme(<TablePaginationActions {...defaultProps} />)

      const firstPageButton = screen.getByLabelText('first page')
      const nextPageButton = screen.getByLabelText('next page')

      expect(firstPageButton).toHaveStyle(`color: ${themeColors.dark.secondary}`)
      expect(nextPageButton).toHaveStyle(`color: ${themeColors.primary}`)
    })

    it('should have correct colors when buttons are enabled', () => {
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          page={5}
        />,
      )

      const firstPageButton = screen.getByLabelText('first page')
      const nextPageButton = screen.getByLabelText('next page')

      expect(firstPageButton).toHaveStyle(`color: ${themeColors.primary}`)
      expect(nextPageButton).toHaveStyle(`color: ${themeColors.primary}`)
    })
  })

  describe('Button Click Handlers', () => {
    it('should call onPageChange with 0 when first page button clicked', () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={5}
        />,
      )

      fireEvent.click(screen.getByLabelText('first page'))
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 0)
    })

    it('should not call onPageChange when first page button clicked on page 0', () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={0}
        />,
      )

      fireEvent.click(screen.getByLabelText('first page'))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should call onPageChange with page-1 when previous button clicked', () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={5}
        />,
      )

      fireEvent.click(screen.getByLabelText('previous page'))
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 4)
    })

    it('should not call onPageChange when previous button clicked on page 0', () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={0}
        />,
      )

      fireEvent.click(screen.getByLabelText('previous page'))
      expect(onPageChange).not.toHaveBeenCalled()
    })

    it('should call onPageChange with page+1 when next button clicked', () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={5}
        />,
      )

      fireEvent.click(screen.getByLabelText('next page'))
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 6)
    })

    it('should call onPageChange with last page when last page button clicked', async () => {
      const onPageChange = jest.fn()
      const lastPage = Math.ceil(100 / 10) - 1

      renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={0}
        />,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('last page'))
      })

      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), lastPage)
    })
  })

  describe('Last Offset Calculation', () => {
    it('should calculate correct last offset for 100 items with 10 per page', async () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          count={100}
          onPageChange={onPageChange}
          page={0}
          rowsPerPage={10}
        />,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('last page'))
      })

      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 9)
    })

    it('should calculate correct last offset for 50 items with 25 per page', async () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          count={50}
          onPageChange={onPageChange}
          page={0}
          rowsPerPage={25}
        />,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('last page'))
      })

      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 1)
    })

    it('should handle single page scenario', async () => {
      renderWithTheme(
        <TablePaginationActions
          count={5}
          onPageChange={jest.fn()}
          page={0}
          rowsPerPage={10}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('next page')).toBeDisabled()
        expect(screen.getByLabelText('last page')).toBeDisabled()
      })
    })
  })

  describe('RTL Support', () => {
    it('should render correct icons with RTL theme', () => {
      const rtlTheme = createTheme({ direction: 'rtl' })

      render(
        <ThemeProvider theme={rtlTheme}>
          <TablePaginationActions {...defaultProps} />
        </ThemeProvider>,
      )

      expect(
        screen.getByLabelText('first page').querySelector('[data-testid="LastPageIcon"]'),
      ).toBeInTheDocument()
      expect(
        screen
          .getByLabelText('previous page')
          .querySelector('[data-testid="KeyboardArrowRightIcon"]'),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('next page').querySelector('[data-testid="KeyboardArrowLeftIcon"]'),
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('last page').querySelector('[data-testid="FirstPageIcon"]'),
      ).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero count', async () => {
      renderWithTheme(
        <TablePaginationActions
          count={0}
          onPageChange={jest.fn()}
          page={0}
          rowsPerPage={10}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('first page')).toBeDisabled()
        expect(screen.getByLabelText('previous page')).toBeDisabled()
        expect(screen.getByLabelText('next page')).toBeDisabled()
        expect(screen.getByLabelText('last page')).toBeDisabled()
      })
    })

    it('should handle large rowsPerPage value', async () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          count={100}
          onPageChange={onPageChange}
          page={0}
          rowsPerPage={100}
        />,
      )

      await waitFor(() => {
        expect(screen.getByLabelText('next page')).toBeDisabled()
        expect(screen.getByLabelText('last page')).toBeDisabled()
      })
    })

    it('should handle odd number divisions', async () => {
      const onPageChange = jest.fn()
      renderWithTheme(
        <TablePaginationActions
          count={97}
          onPageChange={onPageChange}
          page={0}
          rowsPerPage={10}
        />,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('last page'))
      })

      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 9)
    })
  })

  describe('Sequential Navigation', () => {
    it('should navigate through pages sequentially', async () => {
      const onPageChange = jest.fn()
      const { rerender } = renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={0}
        />,
      )

      fireEvent.click(screen.getByLabelText('next page'))
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 1)

      rerender(
        <ThemeProvider theme={mockTheme}>
          <TablePaginationActions
            {...defaultProps}
            onPageChange={onPageChange}
            page={1}
          />
        </ThemeProvider>,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('next page'))
      })
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 2)
    })

    it('should navigate backwards sequentially', async () => {
      const onPageChange = jest.fn()
      const { rerender } = renderWithTheme(
        <TablePaginationActions
          {...defaultProps}
          onPageChange={onPageChange}
          page={5}
        />,
      )

      fireEvent.click(screen.getByLabelText('previous page'))
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 4)

      rerender(
        <ThemeProvider theme={mockTheme}>
          <TablePaginationActions
            {...defaultProps}
            onPageChange={onPageChange}
            page={4}
          />
        </ThemeProvider>,
      )

      await waitFor(() => {
        fireEvent.click(screen.getByLabelText('previous page'))
      })
      expect(onPageChange).toHaveBeenCalledWith(expect.any(Object), 3)
    })
  })
})

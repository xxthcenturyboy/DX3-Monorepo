import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type React from 'react'

import {
  StyledEllipsisHeaderText,
  StyledTableCell,
  StyledTableRow,
  StyledTableSortLabel,
} from './table.ui'

const mockTheme = createTheme()

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={mockTheme}>{component}</ThemeProvider>)
}

describe('table.ui styled components', () => {
  describe('StyledTableCell', () => {
    it('should render without errors', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="light">Header Cell</StyledTableCell>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Header Cell')).toBeInTheDocument()
    })

    it('should accept thememode prop', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="dark">Dark Cell</StyledTableCell>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Dark Cell')).toBeInTheDocument()
    })

    it('should render with light mode', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="light">Light Cell</StyledTableCell>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Light Cell')).toBeInTheDocument()
    })

    it('should render as table cell', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="light">Header</StyledTableCell>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Header')).toBeInTheDocument()
    })

    it('should accept standard TableCell props', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell
                align="center"
                thememode="light"
                width="200px"
              >
                Centered Cell
              </StyledTableCell>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Centered Cell')).toBeInTheDocument()
    })
  })

  describe('StyledEllipsisHeaderText', () => {
    it('should render without errors and with correct text', () => {
      const { getByText } = renderWithTheme(
        <StyledEllipsisHeaderText>Ellipsis Header</StyledEllipsisHeaderText>,
      )
      expect(getByText('Ellipsis Header')).toBeInTheDocument()
    })

    it('should have correct styles for text overflow', () => {
      const { getByText } = renderWithTheme(
        <StyledEllipsisHeaderText>Some long header text</StyledEllipsisHeaderText>,
      )
      const element = getByText('Some long header text')
      expect(element).toHaveStyle({
        display: 'block',
        maxWidth: '150px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      })
    })

    it('should accept standard div props like className', () => {
      const { container } = renderWithTheme(<StyledEllipsisHeaderText className="custom-class" />)
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('StyledTableSortLabel', () => {
    it('should render without errors', () => {
      const { container } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <th>
                <StyledTableSortLabel>Sort Label</StyledTableSortLabel>
              </th>
            </tr>
          </thead>
        </table>,
      )

      expect(container.querySelector('.MuiTableSortLabel-root')).toBeInTheDocument()
    })

    it('should accept active prop', () => {
      const { container } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <th>
                <StyledTableSortLabel active={true}>Active Sort</StyledTableSortLabel>
              </th>
            </tr>
          </thead>
        </table>,
      )

      expect(container.querySelector('.Mui-active')).toBeInTheDocument()
    })

    it('should accept direction prop', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <th>
                <StyledTableSortLabel direction="asc">Ascending Sort</StyledTableSortLabel>
              </th>
            </tr>
          </thead>
        </table>,
      )

      expect(getByText('Ascending Sort')).toBeInTheDocument()
    })

    it('should handle onClick event', () => {
      const handleClick = jest.fn()
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <th>
                <StyledTableSortLabel onClick={handleClick}>Clickable Sort</StyledTableSortLabel>
              </th>
            </tr>
          </thead>
        </table>,
      )

      const sortLabel = getByText('Clickable Sort')
      sortLabel.click()
      expect(handleClick).toHaveBeenCalled()
    })

    it('should render with both active and direction', () => {
      const { container } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <th>
                <StyledTableSortLabel
                  active={true}
                  direction="desc"
                >
                  Active Desc
                </StyledTableSortLabel>
              </th>
            </tr>
          </thead>
        </table>,
      )

      expect(container.querySelector('.Mui-active')).toBeInTheDocument()
    })
  })

  describe('StyledTableRow', () => {
    it('should render without errors', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Row Content</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('tr')).toBeInTheDocument()
    })

    it('should accept loading prop', () => {
      const { getByText } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading="true"
              thememode="light"
            >
              <td>Loading Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(getByText('Loading Row')).toBeInTheDocument()
    })

    it('should accept thememode prop', () => {
      const { getByText } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="dark"
            >
              <td>Dark Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(getByText('Dark Row')).toBeInTheDocument()
    })

    it('should render with loading true', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading="true"
              thememode="light"
            >
              <td>Loading State</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('tr')).toBeInTheDocument()
    })

    it('should render with loading false', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Not Loading</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('tr')).toBeInTheDocument()
    })

    it('should accept standard TableRow props', () => {
      const handleClick = jest.fn()
      const { getByText } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              onClick={handleClick}
              thememode="light"
            >
              <td>Clickable Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      const row = getByText('Clickable Row').closest('tr')
      row?.click()
      expect(handleClick).toHaveBeenCalled()
    })

    it('should render multiple rows', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Row 1</td>
            </StyledTableRow>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Row 2</td>
            </StyledTableRow>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Row 3</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      const rows = container.querySelectorAll('tr')
      expect(rows.length).toBe(3)
    })
  })

  describe('Component Integration', () => {
    it('should render all styled components together', () => {
      const { container } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="light">
                <StyledTableSortLabel
                  active={true}
                  direction="asc"
                >
                  Sortable Header
                </StyledTableSortLabel>
              </StyledTableCell>
            </tr>
          </thead>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Row Content</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('thead')).toBeInTheDocument()
      expect(container.querySelector('tbody')).toBeInTheDocument()
      expect(container.querySelector('.MuiTableSortLabel-root')).toBeInTheDocument()
    })

    it('should handle multiple theme modes', () => {
      const { getByText } = renderWithTheme(
        <table>
          <thead>
            <tr>
              <StyledTableCell thememode="dark">Dark Header</StyledTableCell>
              <StyledTableCell thememode="light">Light Header</StyledTableCell>
            </tr>
          </thead>
          <tbody>
            <StyledTableRow
              loading=""
              thememode="dark"
            >
              <td>Dark Row</td>
            </StyledTableRow>
            <StyledTableRow
              loading=""
              thememode="light"
            >
              <td>Light Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(getByText('Dark Header')).toBeInTheDocument()
      expect(getByText('Light Header')).toBeInTheDocument()
      expect(getByText('Dark Row')).toBeInTheDocument()
      expect(getByText('Light Row')).toBeInTheDocument()
    })
  })

  describe('Styled Component Props', () => {
    it('should pass through custom sx props', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              loading=""
              sx={{ backgroundColor: 'red' }}
              thememode="light"
            >
              <td>Custom Styled Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('tr')).toBeInTheDocument()
    })

    it('should pass through className prop', () => {
      const { container } = renderWithTheme(
        <table>
          <tbody>
            <StyledTableRow
              className="custom-class"
              loading=""
              thememode="light"
            >
              <td>Custom Class Row</td>
            </StyledTableRow>
          </tbody>
        </table>,
      )

      expect(container.querySelector('.custom-class')).toBeInTheDocument()
    })
  })

  describe('Theme Integration', () => {
    it('should work with custom theme', () => {
      const customTheme = createTheme({
        palette: {
          primary: { light: '#ff6666', main: '#ff0000' },
          secondary: { light: '#66ff66', main: '#00ff00' },
        },
      })

      const { getByText } = render(
        <ThemeProvider theme={customTheme}>
          <table>
            <thead>
              <tr>
                <StyledTableCell thememode="light">Custom Theme</StyledTableCell>
              </tr>
            </thead>
            <tbody>
              <StyledTableRow
                loading=""
                thememode="light"
              >
                <td>Custom Theme Row</td>
              </StyledTableRow>
            </tbody>
          </table>
        </ThemeProvider>,
      )

      expect(getByText('Custom Theme')).toBeInTheDocument()
      expect(getByText('Custom Theme Row')).toBeInTheDocument()
    })
  })
})

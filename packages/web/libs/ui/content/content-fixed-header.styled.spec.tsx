import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type React from 'react'

import { StyledContentFixedHeader } from './content-fixed-header.styled'

describe('StyledContentFixedHeader', () => {
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
    },
  })

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  })

  const renderWithTheme = (ui: React.ReactElement, theme = lightTheme) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
  }

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render children content', () => {
      const { getByText } = renderWithTheme(
        <StyledContentFixedHeader>
          <div>Test Content</div>
        </StyledContentFixedHeader>,
      )

      expect(getByText('Test Content')).toBeInTheDocument()
    })

    it('should render as a Box element', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)
      const element = container.firstChild

      expect(element).toBeInstanceOf(HTMLDivElement)
    })
  })

  describe('Styling', () => {
    it('should have fixed position', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)
      const element = container.firstChild as HTMLElement

      expect(element).toHaveStyle({ position: 'fixed' })
    })

    it('should have z-index of 10', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)
      const element = container.firstChild as HTMLElement

      expect(element).toHaveStyle({ zIndex: '10' })
    })

    it('should have fill-available width', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)
      const element = container.firstChild as HTMLElement

      expect(element).toHaveStyle({ width: 'fill-available' })
    })
  })

  describe('Theme - Light Mode', () => {
    it('should have white background in light mode', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />, lightTheme)
      const element = container.firstChild as HTMLElement

      const styles = window.getComputedStyle(element)
      expect(styles.backgroundColor).toBeDefined()
      // In light mode, background should be white
      expect(element).toHaveStyle({
        background: lightTheme.palette.common.white,
      })
    })

    it('should render correctly with light theme', () => {
      const { container } = renderWithTheme(
        <StyledContentFixedHeader>
          <span>Light Mode Content</span>
        </StyledContentFixedHeader>,
        lightTheme,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Theme - Dark Mode', () => {
    it('should have black background in dark mode', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />, darkTheme)
      const element = container.firstChild as HTMLElement

      expect(element).toHaveStyle({
        background: darkTheme.palette.common.black,
      })
    })

    it('should render correctly with dark theme', () => {
      const { container } = renderWithTheme(
        <StyledContentFixedHeader>
          <span>Dark Mode Content</span>
        </StyledContentFixedHeader>,
        darkTheme,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Box Props', () => {
    it('should accept and apply Box props', () => {
      const { container } = renderWithTheme(
        <StyledContentFixedHeader
          margin={1}
          padding={2}
        />,
      )
      const element = container.firstChild as HTMLElement

      expect(element).toBeInTheDocument()
    })

    it('should accept data-testid prop', () => {
      const { getByTestId } = renderWithTheme(
        <StyledContentFixedHeader data-testid="fixed-header" />,
      )

      expect(getByTestId('fixed-header')).toBeInTheDocument()
    })

    it('should accept className prop', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader className="custom-class" />)
      const element = container.firstChild as HTMLElement

      expect(element).toHaveClass('custom-class')
    })

    it('should accept sx prop for additional styling', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader sx={{ left: 0, top: 0 }} />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Complex Children', () => {
    it('should render nested components', () => {
      const { getByText } = renderWithTheme(
        <StyledContentFixedHeader>
          <div>
            <h1>Header Title</h1>
            <p>Header Description</p>
          </div>
        </StyledContentFixedHeader>,
      )

      expect(getByText('Header Title')).toBeInTheDocument()
      expect(getByText('Header Description')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      const { getByText } = renderWithTheme(
        <StyledContentFixedHeader>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </StyledContentFixedHeader>,
      )

      expect(getByText('Child 1')).toBeInTheDocument()
      expect(getByText('Child 2')).toBeInTheDocument()
      expect(getByText('Child 3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should render with no children', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with null children', () => {
      const { container } = renderWithTheme(
        <StyledContentFixedHeader>{null}</StyledContentFixedHeader>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with empty fragment', () => {
      const { container } = renderWithTheme(<StyledContentFixedHeader></StyledContentFixedHeader>)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Theme Switching', () => {
    it('should update background when theme changes', () => {
      const { container, rerender } = renderWithTheme(<StyledContentFixedHeader />, lightTheme)
      const element = container.firstChild as HTMLElement

      // Initially light theme (white background)
      expect(element).toHaveStyle({
        background: lightTheme.palette.common.white,
      })

      // Switch to dark theme
      rerender(
        <ThemeProvider theme={darkTheme}>
          <StyledContentFixedHeader />
        </ThemeProvider>,
      )

      // Should now have black background
      expect(element).toHaveStyle({
        background: darkTheme.palette.common.black,
      })
    })
  })
})

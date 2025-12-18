import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render } from '@testing-library/react'
import type React from 'react'

import { StyledContentWrapper } from './content-wrapper.styled'

// Create test themes
const lightTheme = createTheme({ palette: { mode: 'light' } })
const darkTheme = createTheme({ palette: { mode: 'dark' } })

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement, theme = lightTheme) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)
}

describe('StyledContentWrapper', () => {
  describe('Basic Rendering', () => {
    it('should render successfully', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render as a Box component', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      const element = container.firstChild as HTMLElement
      expect(element.tagName).toBe('DIV')
    })

    it('should render with children', () => {
      const { getByText } = renderWithTheme(
        <StyledContentWrapper>
          <div>Test Content</div>
        </StyledContentWrapper>,
      )
      expect(getByText('Test Content')).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      const { getByText } = renderWithTheme(
        <StyledContentWrapper>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </StyledContentWrapper>,
      )
      expect(getByText('Child 1')).toBeInTheDocument()
      expect(getByText('Child 2')).toBeInTheDocument()
      expect(getByText('Child 3')).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply flex display', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ display: 'flex' })
    })

    it('should apply column flex direction', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ flexDirection: 'column' })
    })

    it('should apply 100% height', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ height: '100%' })
    })

    it('should apply theme spacing for padding', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />)
      const element = container.firstChild as HTMLElement
      // theme.spacing(3) = 24px (default MUI spacing is 8px per unit)
      expect(element).toHaveStyle({ padding: '24px' })
    })
  })

  describe('Theme Integration', () => {
    it('should work with light theme', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />, lightTheme)
      const element = container.firstChild as HTMLElement
      expect(element).toBeInTheDocument()
      expect(element).toHaveStyle({ padding: '24px' })
    })

    it('should work with dark theme', () => {
      const { container } = renderWithTheme(<StyledContentWrapper />, darkTheme)
      const element = container.firstChild as HTMLElement
      expect(element).toBeInTheDocument()
      expect(element).toHaveStyle({ padding: '24px' })
    })

    it('should apply consistent styles across themes', () => {
      const { container: lightContainer } = renderWithTheme(<StyledContentWrapper />, lightTheme)
      const { container: darkContainer } = renderWithTheme(<StyledContentWrapper />, darkTheme)

      const lightElement = lightContainer.firstChild as HTMLElement
      const darkElement = darkContainer.firstChild as HTMLElement

      // Core layout styles should be the same regardless of theme
      expect(lightElement).toHaveStyle({ display: 'flex' })
      expect(darkElement).toHaveStyle({ display: 'flex' })
      expect(lightElement).toHaveStyle({ flexDirection: 'column' })
      expect(darkElement).toHaveStyle({ flexDirection: 'column' })
      expect(lightElement).toHaveStyle({ height: '100%' })
      expect(darkElement).toHaveStyle({ height: '100%' })
    })
  })

  describe('Custom Spacing', () => {
    it('should respect custom theme spacing', () => {
      const customTheme = createTheme({
        spacing: 10, // 10px per unit instead of default 8px
      })

      const { container } = renderWithTheme(<StyledContentWrapper />, customTheme)
      const element = container.firstChild as HTMLElement
      // theme.spacing(3) = 30px with custom spacing
      expect(element).toHaveStyle({ padding: '30px' })
    })

    it('should handle theme with different spacing factors', () => {
      const customTheme = createTheme({
        spacing: (factor: number) => `${factor * 4}px`,
      })

      const { container } = renderWithTheme(<StyledContentWrapper />, customTheme)
      const element = container.firstChild as HTMLElement
      // theme.spacing(3) = 12px with custom spacing function
      expect(element).toHaveStyle({ padding: '12px' })
    })
  })

  describe('Props and Overrides', () => {
    it('should accept and apply sx prop overrides', () => {
      const { container } = renderWithTheme(
        <StyledContentWrapper sx={{ backgroundColor: 'red' }} />,
      )
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ backgroundColor: 'red' })
    })

    it('should merge sx prop with existing styles', () => {
      const { container } = renderWithTheme(<StyledContentWrapper sx={{ marginTop: '20px' }} />)
      const element = container.firstChild as HTMLElement
      // Original styles should still be present
      expect(element).toHaveStyle({ display: 'flex' })
      expect(element).toHaveStyle({ flexDirection: 'column' })
      // New sx styles should be applied
      expect(element).toHaveStyle({ marginTop: '20px' })
    })

    it('should accept standard HTML attributes', () => {
      const { container } = renderWithTheme(
        <StyledContentWrapper
          data-testid="wrapper"
          id="content-wrapper"
        />,
      )
      const element = container.firstChild as HTMLElement
      expect(element).toHaveAttribute('data-testid', 'wrapper')
      expect(element).toHaveAttribute('id', 'content-wrapper')
    })

    it('should accept className prop', () => {
      const { container } = renderWithTheme(<StyledContentWrapper className="custom-class" />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveClass('custom-class')
    })

    it('should override padding via sx prop', () => {
      const { container } = renderWithTheme(<StyledContentWrapper sx={{ padding: '10px' }} />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ padding: '10px' })
    })

    it('should override height via sx prop', () => {
      const { container } = renderWithTheme(<StyledContentWrapper sx={{ height: '50%' }} />)
      const element = container.firstChild as HTMLElement
      expect(element).toHaveStyle({ height: '50%' })
    })
  })

  describe('Edge Cases', () => {
    it('should render with empty children', () => {
      const { container } = renderWithTheme(<StyledContentWrapper></StyledContentWrapper>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with null children', () => {
      const { container } = renderWithTheme(<StyledContentWrapper>{null}</StyledContentWrapper>)
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with text node as child', () => {
      const { getByText } = renderWithTheme(
        <StyledContentWrapper>Plain text content</StyledContentWrapper>,
      )
      expect(getByText('Plain text content')).toBeInTheDocument()
    })

    it('should render with conditional children', () => {
      const showContent = true
      const { getByText, queryByText } = renderWithTheme(
        <StyledContentWrapper>
          {showContent && <div>Conditional Content</div>}
          {!showContent && <div>Hidden Content</div>}
        </StyledContentWrapper>,
      )
      expect(getByText('Conditional Content')).toBeInTheDocument()
      expect(queryByText('Hidden Content')).not.toBeInTheDocument()
    })
  })

  describe('Composition', () => {
    it('should work with nested components', () => {
      const { getByText } = renderWithTheme(
        <StyledContentWrapper>
          <div>
            <span>Nested Content</span>
          </div>
        </StyledContentWrapper>,
      )
      expect(getByText('Nested Content')).toBeInTheDocument()
    })

    it('should work with complex component trees', () => {
      const { getByText } = renderWithTheme(
        <StyledContentWrapper>
          <div>
            <header>Header</header>
            <main>Main Content</main>
            <footer>Footer</footer>
          </div>
        </StyledContentWrapper>,
      )
      expect(getByText('Header')).toBeInTheDocument()
      expect(getByText('Main Content')).toBeInTheDocument()
      expect(getByText('Footer')).toBeInTheDocument()
    })

    it('should maintain flex layout with multiple direct children', () => {
      const { container } = renderWithTheme(
        <StyledContentWrapper>
          <div>Item 1</div>
          <div>Item 2</div>
          <div>Item 3</div>
        </StyledContentWrapper>,
      )
      const element = container.firstChild as HTMLElement
      // Should maintain flex column layout
      expect(element).toHaveStyle({ display: 'flex', flexDirection: 'column' })
    })
  })

  describe('Accessibility', () => {
    it('should accept aria attributes', () => {
      const { container } = renderWithTheme(
        <StyledContentWrapper
          aria-label="Content Wrapper"
          role="region"
        />,
      )
      const element = container.firstChild as HTMLElement
      expect(element).toHaveAttribute('aria-label', 'Content Wrapper')
      expect(element).toHaveAttribute('role', 'region')
    })

    it('should be accessible with semantic children', () => {
      const { getByRole } = renderWithTheme(
        <StyledContentWrapper>
          <main>Main content area</main>
        </StyledContentWrapper>,
      )
      expect(getByRole('main')).toBeInTheDocument()
    })
  })
})

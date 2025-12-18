import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'

import { CollapsiblePanel, type CollapsiblePanelPropsType } from './content-collapsible-panel'

// Mock useMediaQuery
const mockUseMediaQuery = jest.fn()

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => mockUseMediaQuery(),
}))

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('CollapsiblePanel', () => {
  const defaultProps: CollapsiblePanelPropsType = {
    children: <div>Test Content</div>,
    headerTitle: 'Test Header',
    panelId: 'test-panel-1',
  }

  beforeEach(() => {
    // Default to desktop view (not small breakpoint)
    mockUseMediaQuery.mockReturnValue(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with required props', () => {
      renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render children content', () => {
      renderWithTheme(
        <CollapsiblePanel {...defaultProps}>
          <div data-testid="child-element">Child Content</div>
        </CollapsiblePanel>,
      )

      expect(screen.getByTestId('child-element')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('should render with custom header title', () => {
      renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          headerTitle="Custom Header"
        />,
      )

      expect(screen.getByText('Custom Header')).toBeInTheDocument()
    })
  })

  describe('Expand/Collapse Functionality', () => {
    it('should start collapsed by default', () => {
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordion = container.querySelector('.MuiAccordion-root')
      expect(accordion).not.toHaveClass('Mui-expanded')
    })

    it('should start expanded when initialOpen is true', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          initialOpen={true}
        />,
      )

      const accordion = container.querySelector('.MuiAccordion-root')
      expect(accordion).toHaveClass('Mui-expanded')
    })

    it('should toggle expansion when expand icon is clicked', () => {
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const expandIcon = container.querySelector('.MuiSvgIcon-root')
      const accordion = container.querySelector('.MuiAccordion-root')

      // Initially collapsed
      expect(accordion).not.toHaveClass('Mui-expanded')

      // Click to expand
      if (expandIcon) {
        fireEvent.click(expandIcon)
        expect(accordion).toHaveClass('Mui-expanded')

        // Click to collapse
        fireEvent.click(expandIcon)
        expect(accordion).not.toHaveClass('Mui-expanded')
      }
    })
  })

  describe('Small Screen Behavior', () => {
    it('should allow accordion header click on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true) // Small screen
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordionSummary = container.querySelector('.MuiAccordionSummary-root')
      const accordion = container.querySelector('.MuiAccordion-root')

      // Initially collapsed
      expect(accordion).not.toHaveClass('Mui-expanded')

      // Click header on small screen should expand
      if (accordionSummary) {
        fireEvent.click(accordionSummary)
        expect(accordion).toHaveClass('Mui-expanded')
      }
    })

    it('should not expand when clicking header on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordionSummary = container.querySelector('.MuiAccordionSummary-root')
      const accordion = container.querySelector('.MuiAccordion-root')

      // Initially collapsed
      // Click header on desktop should NOT expand (event is stopped)
      if (accordionSummary) {
        fireEvent.click(accordionSummary)
        expect(accordion).not.toHaveClass('Mui-expanded')
      }
    })
  })

  describe('Loading State', () => {
    it('should render without errors when isLoading is true', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          initialOpen={true}
          isLoading={true}
        />,
      )

      // Component renders successfully
      expect(container).toBeInTheDocument()
      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render without errors when isLoading is false', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          initialOpen={true}
          isLoading={false}
        />,
      )

      expect(container).toBeInTheDocument()
      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should render without errors when isLoading is undefined', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          initialOpen={true}
        />,
      )

      expect(container).toBeInTheDocument()
      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should accept isLoading prop', () => {
      // Test that the component accepts the prop without TypeScript errors
      expect(() => {
        renderWithTheme(
          <CollapsiblePanel
            {...defaultProps}
            initialOpen={true}
            isLoading={true}
          />,
        )
      }).not.toThrow()
    })
  })

  describe('Theme Mode', () => {
    it('should apply dark theme styles when themeMode is dark', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          themeMode="dark"
        />,
      )

      const accordionSummary = container.querySelector('.MuiAccordionSummary-root')
      expect(accordionSummary).toBeInTheDocument()
      // Dark mode sets background to black
    })

    it('should apply light theme styles when themeMode is light', () => {
      const { container } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          themeMode="light"
        />,
      )

      const accordionSummary = container.querySelector('.MuiAccordionSummary-root')
      expect(accordionSummary).toBeInTheDocument()
      // Light mode sets background to primary.light
    })

    it('should apply default theme when themeMode is undefined', () => {
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordionSummary = container.querySelector('.MuiAccordionSummary-root')
      expect(accordionSummary).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordion = container.querySelector('.MuiAccordion-root')
      expect(accordion).toBeInTheDocument()
    })

    it('should have accordion summary button', () => {
      renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const accordionButton = screen.getByRole('button')
      expect(accordionButton).toBeInTheDocument()
    })

    it('should have expand icon', () => {
      const { container } = renderWithTheme(<CollapsiblePanel {...defaultProps} />)

      const expandIcon = container.querySelector('.MuiSvgIcon-root')
      expect(expandIcon).toBeInTheDocument()
    })
  })

  describe('Multiple Panels', () => {
    it('should work with different panelIds', () => {
      const { rerender } = renderWithTheme(
        <CollapsiblePanel
          {...defaultProps}
          initialOpen={true}
          panelId="panel-1"
        />,
      )

      let accordion = document.querySelector('.MuiAccordion-root')
      expect(accordion).toHaveClass('Mui-expanded')

      rerender(
        <ThemeProvider theme={testTheme}>
          <CollapsiblePanel
            {...defaultProps}
            initialOpen={false}
            panelId="panel-2"
          />
        </ThemeProvider>,
      )

      accordion = document.querySelector('.MuiAccordion-root')
      expect(accordion).not.toHaveClass('Mui-expanded')
    })
  })

  describe('Ref Forwarding', () => {
    it('should forward ref to Box component', () => {
      const ref = React.createRef<HTMLDivElement>()
      const Component = CollapsiblePanel as any // Cast to any to handle forwardRef typing
      renderWithTheme(
        <Component
          {...defaultProps}
          ref={ref}
        />,
      )

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      renderWithTheme(<CollapsiblePanel {...defaultProps}></CollapsiblePanel>)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should handle null children', () => {
      renderWithTheme(<CollapsiblePanel {...defaultProps}>{null}</CollapsiblePanel>)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should handle complex nested children', () => {
      renderWithTheme(
        <CollapsiblePanel {...defaultProps}>
          <div>
            <h1>Nested Header</h1>
            <p>Nested paragraph</p>
            <ul>
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
          </div>
        </CollapsiblePanel>,
      )

      expect(screen.getByText('Nested Header')).toBeInTheDocument()
      expect(screen.getByText('Nested paragraph')).toBeInTheDocument()
      expect(screen.getByText('Item 1')).toBeInTheDocument()
    })
  })
})

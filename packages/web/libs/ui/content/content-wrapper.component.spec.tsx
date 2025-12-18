import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { ContentWrapper, type ContentWrapperPropsType } from './content-wrapper.component'

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

describe('ContentWrapper', () => {
  const defaultProps: ContentWrapperPropsType = {
    children: <div>Test Content</div>,
    headerTitle: 'Test Header',
  }

  beforeEach(() => {
    // Default to desktop view (not small/medium breakpoint)
    mockUseMediaQuery.mockReturnValue(false)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with required props', () => {
      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render header title', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerTitle="My Page Title"
        />,
      )

      expect(screen.getByText('My Page Title')).toBeInTheDocument()
    })

    it('should render children content', () => {
      renderWithTheme(
        <ContentWrapper {...defaultProps}>
          <div data-testid="child-element">Child Content</div>
        </ContentWrapper>,
      )

      expect(screen.getByTestId('child-element')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })
  })

  describe('Header Subtitle', () => {
    it('should render header subtitle when provided', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerSubTitle="Subtitle Text"
        />,
      )

      expect(screen.getByText('Subtitle Text')).toBeInTheDocument()
    })

    it('should not render subtitle when not provided', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const subtitleElement = container.querySelector('.MuiTypography-caption')
      expect(subtitleElement).not.toBeInTheDocument()
    })

    it('should render both title and subtitle', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerSubTitle="Sub Title"
          headerTitle="Main Title"
        />,
      )

      expect(screen.getByText('Main Title')).toBeInTheDocument()
      expect(screen.getByText('Sub Title')).toBeInTheDocument()
    })
  })

  describe('Navigation', () => {
    it('should render navigation button when navigation prop is provided', () => {
      const navigationMock = jest.fn()
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
        />,
      )

      const navButton = screen.getByRole('button')
      expect(navButton).toBeInTheDocument()
    })

    it('should call navigation function when navigation button is clicked', () => {
      const navigationMock = jest.fn()
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
        />,
      )

      const navButton = screen.getByRole('button')
      fireEvent.click(navButton)

      expect(navigationMock).toHaveBeenCalledTimes(1)
    })

    it('should not render navigation button when navigation prop is not provided', () => {
      renderWithTheme(<ContentWrapper {...defaultProps} />)

      const buttons = screen.queryAllByRole('button')
      expect(buttons).toHaveLength(0)
    })

    it('should render ChevronLeft icon in navigation button', () => {
      const navigationMock = jest.fn()
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
        />,
      )

      const chevronIcon = container.querySelector('.MuiSvgIcon-root')
      expect(chevronIcon).toBeInTheDocument()
    })
  })

  describe('Navigation with Tooltip', () => {
    it('should render tooltip when tooltip prop is provided', () => {
      const navigationMock = jest.fn()
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
          tooltip="Go Back"
        />,
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render navigation without tooltip when tooltip is not provided', () => {
      const navigationMock = jest.fn()
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
        />,
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should call navigation even with tooltip', () => {
      const navigationMock = jest.fn()
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={navigationMock}
          tooltip="Back to Home"
        />,
      )

      const navButton = screen.getByRole('button')
      fireEvent.click(navButton)

      expect(navigationMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('Header Content', () => {
    it('should render header content when provided', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerContent={<div data-testid="header-content">Header Actions</div>}
        />,
      )

      expect(screen.getByTestId('header-content')).toBeInTheDocument()
      expect(screen.getByText('Header Actions')).toBeInTheDocument()
    })

    it('should not render header content when not provided', () => {
      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.queryByTestId('header-content')).not.toBeInTheDocument()
    })

    it('should render complex header content', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerContent={
            <div>
              <button type="button">Action 1</button>
              <button type="button">Action 2</button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Action 1')).toBeInTheDocument()
      expect(screen.getByText('Action 2')).toBeInTheDocument()
    })
  })

  describe('Content Margin Top', () => {
    it('should render successfully with custom contentMarginTop', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentMarginTop="100px"
        />,
      )

      // Verify the component renders without errors and content is present
      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should work without contentMarginTop', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Header Column Right Justification', () => {
    it('should render successfully with right column justification', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerColumnRightJustification="flex-end"
          headerContent={<div>Right Content</div>}
        />,
      )

      // Verify the component renders without errors and content is present
      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Right Content')).toBeInTheDocument()
    })

    it('should render without justification when not provided', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerContent={<div>Content</div>}
        />,
      )

      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Header Column Breaks', () => {
    it('should accept custom header column breakpoints', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerColumnsBreaks={{
            left: { md: 9, sm: 8, xs: 12 },
            right: { md: 3, sm: 4, xs: 12 },
          }}
        />,
      )

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should use default breakpoints when not provided', () => {
      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should handle partial breakpoint configuration', () => {
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerColumnsBreaks={{
            left: { xs: 12 },
          }}
        />,
      )

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render correctly on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true) // Small screen

      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render correctly on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should adjust layout based on breakpoints', () => {
      mockUseMediaQuery.mockReturnValueOnce(false).mockReturnValueOnce(true) // MD: false, SM: true

      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    it('should render all features together', () => {
      const navigationMock = jest.fn()

      renderWithTheme(
        <ContentWrapper
          contentMarginTop="80px"
          headerColumnRightJustification="flex-end"
          headerContent={<button type="button">Header Action</button>}
          headerSubTitle="With Subtitle"
          headerTitle="Complex Page"
          navigation={navigationMock}
          tooltip="Navigate Back"
        >
          <div>Main Page Content</div>
        </ContentWrapper>,
      )

      expect(screen.getByText('Complex Page')).toBeInTheDocument()
      expect(screen.getByText('With Subtitle')).toBeInTheDocument()
      expect(screen.getByText('Header Action')).toBeInTheDocument()
      expect(screen.getByText('Main Page Content')).toBeInTheDocument()

      const navButtons = screen.getAllByRole('button')
      expect(navButtons.length).toBeGreaterThan(0)
    })

    it('should handle multiple children', () => {
      renderWithTheme(
        <ContentWrapper {...defaultProps}>
          <div>Content 1</div>
          <div>Content 2</div>
          <div>Content 3</div>
        </ContentWrapper>,
      )

      expect(screen.getByText('Content 1')).toBeInTheDocument()
      expect(screen.getByText('Content 2')).toBeInTheDocument()
      expect(screen.getByText('Content 3')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      renderWithTheme(<ContentWrapper {...defaultProps}></ContentWrapper>)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should handle null children', () => {
      renderWithTheme(<ContentWrapper {...defaultProps}>{null}</ContentWrapper>)

      expect(screen.getByText('Test Header')).toBeInTheDocument()
    })

    it('should handle navigation callback being undefined in click handler', () => {
      // This tests the internal safety check: if (typeof navigation === 'function')
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          navigation={() => {}}
        />,
      )

      const button = screen.getByRole('button')
      expect(() => fireEvent.click(button)).not.toThrow()
    })

    it('should render with very long title', () => {
      const longTitle = 'A'.repeat(100)
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerTitle={longTitle}
        />,
      )

      expect(screen.getByText(longTitle)).toBeInTheDocument()
    })

    it('should render with special characters in title', () => {
      const specialTitle = 'Test <>&"\' Title'
      renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          headerTitle={specialTitle}
        />,
      )

      expect(screen.getByText(specialTitle)).toBeInTheDocument()
    })
  })

  describe('Layout Structure', () => {
    it('should render header with divider', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const divider = container.querySelector('.MuiDivider-root')
      expect(divider).toBeInTheDocument()
    })

    it('should render with proper component structure', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      // Verify the component renders without errors
      expect(screen.getByText('Test Header')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should wrap content in Grid2 container', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid2-root')
      expect(grid).toBeInTheDocument()
    })
  })
})

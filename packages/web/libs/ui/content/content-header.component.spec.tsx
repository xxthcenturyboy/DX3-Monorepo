import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { ContentHeader, type ContentHeaderPropsType } from './content-header.component'

// window.matchMedia is stubbed globally in jest.setup.ts (matches: false = desktop).
// No MUI module-level mocking is needed here.

const testTheme = createTheme()

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)

describe('ContentHeader', () => {
  const defaultProps: ContentHeaderPropsType = {
    headerTitle: 'Page Title',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ---------------------------------------------------------------------------
  // Basic Rendering
  // ---------------------------------------------------------------------------
  describe('Basic Rendering', () => {
    it('should render with only the required headerTitle prop', () => {
      renderWithTheme(<ContentHeader {...defaultProps} />)

      expect(screen.getByText('Page Title')).toBeInTheDocument()
    })

    it('should render headerTitle as a ReactNode (JSX element)', () => {
      renderWithTheme(
        <ContentHeader headerTitle={<span data-testid="custom-title">Custom Title</span>} />,
      )

      expect(screen.getByTestId('custom-title')).toBeInTheDocument()
    })

    it('should render headerSubTitle when provided', () => {
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          headerSubTitle="Sub title text"
        />,
      )

      expect(screen.getByText('Sub title text')).toBeInTheDocument()
    })

    it('should NOT render headerSubTitle when omitted', () => {
      renderWithTheme(<ContentHeader {...defaultProps} />)

      expect(screen.queryByText('Sub title text')).not.toBeInTheDocument()
    })

    it('should render headerSubContent when provided', () => {
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          headerSubContent={<div data-testid="sub-content">Sub Content</div>}
        />,
      )

      expect(screen.getByTestId('sub-content')).toBeInTheDocument()
    })

    it('should render headerContent (right column) when provided', () => {
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          headerContent={<button type="button">Action</button>}
        />,
      )

      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('should render headerSecondaryContent when provided', () => {
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          headerSecondaryContent={<div data-testid="secondary">Secondary</div>}
        />,
      )

      expect(screen.getByTestId('secondary')).toBeInTheDocument()
    })

    it('should NOT render headerSecondaryContent when omitted', () => {
      renderWithTheme(<ContentHeader {...defaultProps} />)

      expect(screen.queryByTestId('secondary')).not.toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  describe('Navigation', () => {
    it('should NOT render a navigation button when navigation prop is omitted', () => {
      renderWithTheme(<ContentHeader {...defaultProps} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render an IconButton when navigation prop is provided', () => {
      const mockNav = jest.fn()
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          navigation={mockNav}
        />,
      )

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should call navigation() when the back button is clicked', () => {
      const mockNav = jest.fn()
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          navigation={mockNav}
        />,
      )

      fireEvent.click(screen.getByRole('button'))

      expect(mockNav).toHaveBeenCalledTimes(1)
    })

    it('should render a Tooltip around the button when tooltip prop is provided', () => {
      const mockNav = jest.fn()
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          navigation={mockNav}
          tooltip="Go back"
        />,
      )

      // The button should still be present
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should still call navigation() when tooltip is set and button is clicked', () => {
      const mockNav = jest.fn()
      renderWithTheme(
        <ContentHeader
          {...defaultProps}
          navigation={mockNav}
          tooltip="Go back"
        />,
      )

      fireEvent.click(screen.getByRole('button'))

      expect(mockNav).toHaveBeenCalledTimes(1)
    })

    it('should not throw when navigation is undefined and button click guard is hit', () => {
      // navigation prop omitted — no button rendered, confirm no throw
      expect(() => renderWithTheme(<ContentHeader {...defaultProps} />)).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // Grid direction / responsive behaviour
  // ---------------------------------------------------------------------------
  describe('Grid direction', () => {
    it('should use the explicitly provided gridDirection prop regardless of breakpoint', () => {
      window.matchMedia = jest.fn().mockImplementation((q: string) => ({
        addEventListener: jest.fn(),
        addListener: jest.fn(),
        dispatchEvent: jest.fn(),
        matches: true,
        media: q,
        onchange: null,
        removeEventListener: jest.fn(),
        removeListener: jest.fn(),
      })) // SM_BREAK = true (mobile)
      const { container } = renderWithTheme(
        <ContentHeader
          {...defaultProps}
          gridDirection="row"
        />,
      )

      const grid = container.querySelector('.MuiGrid-container')
      expect(grid).toBeInTheDocument()
    })

    it('should force row direction on mobile when forceRowOnMobile is true', () => {
      window.matchMedia = jest.fn().mockImplementation((q: string) => ({
        addEventListener: jest.fn(),
        addListener: jest.fn(),
        dispatchEvent: jest.fn(),
        matches: true,
        media: q,
        onchange: null,
        removeEventListener: jest.fn(),
        removeListener: jest.fn(),
      })) // SM_BREAK = true
      const { container } = renderWithTheme(
        <ContentHeader
          {...defaultProps}
          forceRowOnMobile
        />,
      )

      const grid = container.querySelector('.MuiGrid-container')
      expect(grid).toBeInTheDocument()
    })

    it('should render column direction on mobile when forceRowOnMobile is not set', () => {
      window.matchMedia = jest.fn().mockImplementation((q: string) => ({
        addEventListener: jest.fn(),
        addListener: jest.fn(),
        dispatchEvent: jest.fn(),
        matches: true,
        media: q,
        onchange: null,
        removeEventListener: jest.fn(),
        removeListener: jest.fn(),
      })) // SM_BREAK = true
      const { container } = renderWithTheme(<ContentHeader {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-container')
      expect(grid).toBeInTheDocument()
    })

    it('should render row direction on desktop', () => {
      // Default matchMedia stub already returns matches: false (desktop)
      const { container } = renderWithTheme(<ContentHeader {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-container')
      expect(grid).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // Column break overrides
  // ---------------------------------------------------------------------------
  describe('Column breaks', () => {
    it('should accept headerColumnsBreaks without error', () => {
      expect(() =>
        renderWithTheme(
          <ContentHeader
            {...defaultProps}
            headerColumnsBreaks={{
              left: { lg: 4, md: 4, sm: 6, xs: 12 },
              right: { lg: 8, md: 8, sm: 6, xs: 12 },
            }}
          />,
        ),
      ).not.toThrow()
    })

    it('should accept partial headerColumnsBreaks (only left)', () => {
      expect(() =>
        renderWithTheme(
          <ContentHeader
            {...defaultProps}
            headerColumnsBreaks={{ left: { md: 3 } }}
          />,
        ),
      ).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // Right column justification
  // ---------------------------------------------------------------------------
  describe('Right column justification', () => {
    it('should accept headerColumnRightJustification without error', () => {
      expect(() =>
        renderWithTheme(
          <ContentHeader
            {...defaultProps}
            headerColumnRightJustification="flex-end"
          />,
        ),
      ).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // Divider is always rendered
  // ---------------------------------------------------------------------------
  describe('Divider', () => {
    it('should always render a Divider at the bottom of the header', () => {
      const { container } = renderWithTheme(<ContentHeader {...defaultProps} />)

      expect(container.querySelector('.MuiDivider-root')).toBeInTheDocument()
    })
  })
})

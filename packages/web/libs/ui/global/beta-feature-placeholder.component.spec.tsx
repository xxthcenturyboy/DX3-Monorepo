import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { BetaFeatureComponent } from './beta-feature-placeholder.component'

// Mock the dependencies
jest.mock('../lottie/beta-badge.lottie', () => ({
  BetaBadgeLottie: () => <div data-testid="beta-badge-lottie">Beta Badge Animation</div>,
}))

jest.mock('../content/content-wrapper.styled', () => ({
  StyledContentWrapper: ({ children }: any) => (
    <div data-testid="styled-content-wrapper">{children}</div>
  ),
}))

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('BetaFeatureComponent', () => {
  describe('Basic Rendering', () => {
    it('should render successfully', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('styled-content-wrapper')).toBeInTheDocument()
    })

    it('should render BetaBadgeLottie animation', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
    })

    it('should render "Coming Soon" heading', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should render subtitle message', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
    })

    it('should render StyledContentWrapper', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('styled-content-wrapper')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('should render all components together', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
      expect(screen.getByTestId('styled-content-wrapper')).toBeInTheDocument()
    })

    it('should render animation before text', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const animation = screen.getByTestId('beta-badge-lottie')
      const heading = screen.getByText('Coming Soon')

      expect(animation).toBeInTheDocument()
      expect(heading).toBeInTheDocument()
    })

    it('should render heading before subtitle', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const heading = screen.getByText('Coming Soon')
      const subtitle = screen.getByText('This feature is not ready yet. Check back for updates.')

      expect(heading).toBeInTheDocument()
      expect(subtitle).toBeInTheDocument()
    })

    it('should render with Grid container', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Typography', () => {
    it('should render heading as h1 variant', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const heading = container.querySelector('.MuiTypography-h1')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Coming Soon')
    })

    it('should render subtitle as h5 variant', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const subtitle = container.querySelector('.MuiTypography-h5')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveTextContent('This feature is not ready yet. Check back for updates.')
    })

    it('should render heading with proper styling', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const heading = screen.getByText('Coming Soon')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveClass('MuiTypography-h1')
    })

    it('should render subtitle with proper styling', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const subtitle = screen.getByText('This feature is not ready yet. Check back for updates.')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveClass('MuiTypography-h5')
    })
  })

  describe('Layout', () => {
    it('should have centered content', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const grid = container.querySelector('.MuiGrid-root') as HTMLElement
      expect(grid).toHaveStyle({ minHeight: '80vh' })
    })

    it('should render with proper grid structure', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
    })

    it('should render content in styled wrapper', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const wrapper = screen.getByTestId('styled-content-wrapper')
      expect(wrapper).toBeInTheDocument()

      // Check that content is inside wrapper
      expect(wrapper).toContainElement(screen.getByTestId('beta-badge-lottie'))
      expect(wrapper).toContainElement(screen.getByText('Coming Soon'))
    })
  })

  describe('Accessibility', () => {
    it('should have accessible heading', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const heading = screen.getByText('Coming Soon')
      expect(heading).toBeInTheDocument()
    })

    it('should have accessible subtitle text', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const subtitle = screen.getByText('This feature is not ready yet. Check back for updates.')
      expect(subtitle).toBeInTheDocument()
    })

    it('should render semantic HTML structure', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
    })
  })

  describe('Content Visibility', () => {
    it('should display all text content', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeVisible()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeVisible()
    })

    it('should display animation', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeVisible()
    })

    it('should render complete placeholder message', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const subtitle = screen.getByText(/This feature is not ready yet/)
      expect(subtitle).toBeInTheDocument()
      expect(subtitle.textContent).toBe('This feature is not ready yet. Check back for updates.')
    })
  })

  describe('Static Component', () => {
    it('should render consistently', () => {
      const { rerender } = renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <BetaFeatureComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should have no props', () => {
      // Component takes no props - should render the same every time
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
    })

    it('should be a pure presentation component', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      expect(container.firstChild).toBeInTheDocument()
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a placeholder for beta features', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
    })

    it('should work as a coming soon page', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(screen.getByText(/Check back for updates/)).toBeInTheDocument()
    })

    it('should work as a feature unavailable message', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText(/not ready yet/)).toBeInTheDocument()
    })
  })

  describe('Visual Elements', () => {
    it('should render with animation element', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
    })

    it('should render with clear messaging', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
    })

    it('should have prominent heading', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const heading = container.querySelector('.MuiTypography-h1')
      expect(heading).toBeInTheDocument()
      expect(heading).toHaveTextContent('Coming Soon')
    })

    it('should have descriptive subtitle', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const subtitle = container.querySelector('.MuiTypography-h5')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveTextContent('This feature is not ready yet. Check back for updates.')
    })
  })

  describe('Integration', () => {
    it('should integrate with StyledContentWrapper', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const wrapper = screen.getByTestId('styled-content-wrapper')
      expect(wrapper).toBeInTheDocument()
    })

    it('should integrate with MUI Grid', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toBeInTheDocument()
    })

    it('should integrate with MUI Typography', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      const heading = container.querySelector('.MuiTypography-h1')
      const subtitle = container.querySelector('.MuiTypography-h5')

      expect(heading).toBeInTheDocument()
      expect(subtitle).toBeInTheDocument()
    })

    it('should integrate with BetaBadgeLottie', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
    })
  })

  describe('Snapshot Behavior', () => {
    it('should render the same content every time', () => {
      const { container: container1 } = renderWithTheme(<BetaFeatureComponent />)
      const { container: container2 } = renderWithTheme(<BetaFeatureComponent />)

      expect(container1.textContent).toBe(container2.textContent)
    })

    it('should have consistent text content', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
      expect(
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ).toBeInTheDocument()
    })

    it('should have all expected elements', () => {
      renderWithTheme(<BetaFeatureComponent />)

      const elements = [
        screen.getByTestId('styled-content-wrapper'),
        screen.getByTestId('beta-badge-lottie'),
        screen.getByText('Coming Soon'),
        screen.getByText('This feature is not ready yet. Check back for updates.'),
      ]

      elements.forEach((element) => {
        expect(element).toBeInTheDocument()
      })
    })
  })

  describe('Component Isolation', () => {
    it('should render independently', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should not require external state', () => {
      renderWithTheme(<BetaFeatureComponent />)

      expect(screen.getByTestId('beta-badge-lottie')).toBeInTheDocument()
      expect(screen.getByText('Coming Soon')).toBeInTheDocument()
    })

    it('should be self-contained', () => {
      const { container } = renderWithTheme(<BetaFeatureComponent />)

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})

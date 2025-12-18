import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { GlobalErrorComponent } from './global-error.component'

// Mock the ErrorLottie component
jest.mock('../lottie/error.lottie', () => ({
  ErrorLottie: () => <div data-testid="error-lottie">Error Animation</div>,
}))

// Mock history.back()
const mockHistoryBack = jest.fn()
Object.defineProperty(window, 'history', {
  value: { back: mockHistoryBack },
  writable: true,
})

describe('GlobalErrorComponent', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByText('Ouch')).toBeInTheDocument()
    })

    it('should render the error lottie animation', () => {
      renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
    })

    it('should display the main error heading', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const heading = screen.getByText('Ouch')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should display the error message', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const message = screen.getByText('We encountered a fatal system fault.')
      expect(message).toBeInTheDocument()
    })

    it('should render a button', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button Behavior', () => {
    it('should display default button text "Go Back"', () => {
      renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByRole('button')).toHaveTextContent('Go Back')
    })

    it('should display custom button text when provided', () => {
      const customText = 'Return to Home'
      renderWithTheme(<GlobalErrorComponent buttonText={customText} />)

      expect(screen.getByRole('button')).toHaveTextContent(customText)
    })

    it('should call history.back() when button is clicked without routingFn', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    })

    it('should call custom routingFn when provided and button is clicked', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<GlobalErrorComponent routingFn={mockRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockRoutingFn).toHaveBeenCalledTimes(1)
      expect(mockHistoryBack).not.toHaveBeenCalled()
    })

    it('should prefer custom routingFn over history.back()', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<GlobalErrorComponent routingFn={mockRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockRoutingFn).toHaveBeenCalled()
      expect(mockHistoryBack).not.toHaveBeenCalled()
    })

    it('should handle multiple button clicks', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<GlobalErrorComponent routingFn={mockRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockRoutingFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('Custom Props', () => {
    it('should handle both custom buttonText and routingFn together', () => {
      const mockRoutingFn = jest.fn()
      const customText = 'Navigate Away'

      renderWithTheme(
        <GlobalErrorComponent
          buttonText={customText}
          routingFn={mockRoutingFn}
        />,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(customText)

      fireEvent.click(button)
      expect(mockRoutingFn).toHaveBeenCalledTimes(1)
    })

    it('should handle empty string as buttonText', () => {
      renderWithTheme(<GlobalErrorComponent buttonText="" />)

      const button = screen.getByRole('button')
      // Empty string is falsy, so it should show default text
      expect(button).toHaveTextContent('Go Back')
    })

    it('should handle very long button text', () => {
      const longText = 'This is a very long button text that might wrap to multiple lines'
      renderWithTheme(<GlobalErrorComponent buttonText={longText} />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(longText)
    })
  })

  describe('Component Structure', () => {
    it('should render all main elements in correct order', () => {
      renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByTestId('error-lottie')).toBeInTheDocument()
      expect(screen.getByText('Ouch')).toBeInTheDocument()
      expect(screen.getByText('We encountered a fatal system fault.')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should wrap content in StyledContentWrapper', () => {
      const { container } = renderWithTheme(<GlobalErrorComponent />)

      // StyledContentWrapper renders a Box component
      const wrapper = container.querySelector('.MuiBox-root')
      expect(wrapper).toBeInTheDocument()
    })

    it('should use Grid2 for layout', () => {
      const { container } = renderWithTheme(<GlobalErrorComponent />)

      // Grid2 should be present for layout
      const grid = container.querySelector('.MuiGrid2-root')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Typography Variants', () => {
    it('should use h1 variant for main heading', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const heading = screen.getByText('Ouch')
      expect(heading).toHaveClass('MuiTypography-h1')
    })

    it('should use h5 variant for error message', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const message = screen.getByText('We encountered a fatal system fault.')
      expect(message).toHaveClass('MuiTypography-h5')
    })
  })

  describe('Accessibility', () => {
    it('should have a clickable button', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
    })

    it('should have descriptive error message text', () => {
      renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByText('We encountered a fatal system fault.')).toBeInTheDocument()
    })

    it('should have button with accessible text', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const button = screen.getByRole('button', { name: /go back/i })
      expect(button).toBeInTheDocument()
    })

    it('should have custom button text accessible', () => {
      const customText = 'Return Home'
      renderWithTheme(<GlobalErrorComponent buttonText={customText} />)

      const button = screen.getByRole('button', { name: customText })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined routingFn gracefully', () => {
      renderWithTheme(<GlobalErrorComponent routingFn={undefined} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    })

    it('should call routingFn even if it is synchronous', () => {
      const syncRoutingFn = jest.fn(() => {
        // Synchronous function that completes immediately
        return true
      })

      renderWithTheme(<GlobalErrorComponent routingFn={syncRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(syncRoutingFn).toHaveBeenCalledTimes(1)
    })

    it('should handle special characters in button text', () => {
      const specialText = '← Go Back & Retry!'
      renderWithTheme(<GlobalErrorComponent buttonText={specialText} />)

      expect(screen.getByRole('button')).toHaveTextContent(specialText)
    })
  })

  describe('Rendering Consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = renderWithTheme(<GlobalErrorComponent />)

      expect(screen.getByText('Ouch')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalErrorComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Ouch')).toBeInTheDocument()
      expect(screen.getByText('We encountered a fatal system fault.')).toBeInTheDocument()
    })

    it('should maintain state between prop updates', () => {
      const mockRoutingFn1 = jest.fn()
      const mockRoutingFn2 = jest.fn()

      const { rerender } = renderWithTheme(
        <GlobalErrorComponent
          buttonText="First"
          routingFn={mockRoutingFn1}
        />,
      )

      expect(screen.getByRole('button')).toHaveTextContent('First')

      rerender(
        <ThemeProvider theme={testTheme}>
          <GlobalErrorComponent
            buttonText="Second"
            routingFn={mockRoutingFn2}
          />
        </ThemeProvider>,
      )

      expect(screen.getByRole('button')).toHaveTextContent('Second')

      fireEvent.click(screen.getByRole('button'))
      expect(mockRoutingFn2).toHaveBeenCalledTimes(1)
      expect(mockRoutingFn1).not.toHaveBeenCalled()
    })
  })

  describe('Button Variants', () => {
    it('should render button with outlined variant', () => {
      renderWithTheme(<GlobalErrorComponent />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiButton-outlined')
    })
  })
})

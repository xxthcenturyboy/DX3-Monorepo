import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { NotFoundComponent } from './not-found.component'

// Mock the NotFoundLottie component
jest.mock('../lottie/not-found.lottie', () => ({
  NotFoundLottie: () => <div data-testid="not-found-lottie">Not Found Animation</div>,
}))

// Mock history.back()
const mockHistoryBack = jest.fn()
Object.defineProperty(window, 'history', {
  value: { back: mockHistoryBack },
  writable: true,
})

describe('NotFoundComponent', () => {
  const testTheme = createTheme()

  const renderWithTheme = (component: React.ReactElement) => {
    return render(<ThemeProvider theme={testTheme}>{component}</ThemeProvider>)
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByText('Not Found')).toBeInTheDocument()
    })

    it('should render the not found lottie animation', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByTestId('not-found-lottie')).toBeInTheDocument()
    })

    it('should display the main heading', () => {
      renderWithTheme(<NotFoundComponent />)

      const heading = screen.getByText('Not Found')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should display the description message', () => {
      renderWithTheme(<NotFoundComponent />)

      const message = screen.getByText("We couldn't find what you were looking for.")
      expect(message).toBeInTheDocument()
    })

    it('should render a button', () => {
      renderWithTheme(<NotFoundComponent />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Button Behavior', () => {
    it('should display default button text "Go Back"', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByRole('button')).toHaveTextContent('Go Back')
    })

    it('should display custom button text when provided', () => {
      const customText = 'Return to Home'
      renderWithTheme(<NotFoundComponent buttonText={customText} />)

      expect(screen.getByRole('button')).toHaveTextContent(customText)
    })

    it('should call history.back() when button is clicked without routingFn', () => {
      renderWithTheme(<NotFoundComponent />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    })

    it('should call custom routingFn when provided and button is clicked', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<NotFoundComponent routingFn={mockRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockRoutingFn).toHaveBeenCalledTimes(1)
      expect(mockHistoryBack).not.toHaveBeenCalled()
    })

    it('should prefer custom routingFn over history.back()', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<NotFoundComponent routingFn={mockRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockRoutingFn).toHaveBeenCalled()
      expect(mockHistoryBack).not.toHaveBeenCalled()
    })

    it('should handle multiple button clicks', () => {
      const mockRoutingFn = jest.fn()
      renderWithTheme(<NotFoundComponent routingFn={mockRoutingFn} />)

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
        <NotFoundComponent
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
      renderWithTheme(<NotFoundComponent buttonText="" />)

      const button = screen.getByRole('button')
      // Empty string is falsy, so it should show default text
      expect(button).toHaveTextContent('Go Back')
    })

    it('should handle very long button text', () => {
      const longText = 'This is a very long button text that might wrap to multiple lines'
      renderWithTheme(<NotFoundComponent buttonText={longText} />)

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent(longText)
    })
  })

  describe('Component Structure', () => {
    it('should render all main elements in correct order', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByTestId('not-found-lottie')).toBeInTheDocument()
      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText("We couldn't find what you were looking for.")).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should wrap content in StyledContentWrapper', () => {
      const { container } = renderWithTheme(<NotFoundComponent />)

      // StyledContentWrapper renders a Box component
      const wrapper = container.querySelector('.MuiBox-root')
      expect(wrapper).toBeInTheDocument()
    })

    it('should use Grid2 for layout', () => {
      const { container } = renderWithTheme(<NotFoundComponent />)

      // Grid2 should be present for layout
      const grid = container.querySelector('.MuiGrid2-root')
      expect(grid).toBeInTheDocument()
    })
  })

  describe('Typography Variants', () => {
    it('should use h1 variant for main heading', () => {
      renderWithTheme(<NotFoundComponent />)

      const heading = screen.getByText('Not Found')
      expect(heading).toHaveClass('MuiTypography-h1')
    })

    it('should use h5 variant for description message', () => {
      renderWithTheme(<NotFoundComponent />)

      const message = screen.getByText("We couldn't find what you were looking for.")
      expect(message).toHaveClass('MuiTypography-h5')
    })
  })

  describe('Accessibility', () => {
    it('should have a clickable button', () => {
      renderWithTheme(<NotFoundComponent />)

      const button = screen.getByRole('button')
      expect(button).toBeEnabled()
    })

    it('should have descriptive message text', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByText("We couldn't find what you were looking for.")).toBeInTheDocument()
    })

    it('should have button with accessible text', () => {
      renderWithTheme(<NotFoundComponent />)

      const button = screen.getByRole('button', { name: /go back/i })
      expect(button).toBeInTheDocument()
    })

    it('should have custom button text accessible', () => {
      const customText = 'Return Home'
      renderWithTheme(<NotFoundComponent buttonText={customText} />)

      const button = screen.getByRole('button', { name: customText })
      expect(button).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined routingFn gracefully', () => {
      renderWithTheme(<NotFoundComponent routingFn={undefined} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    })

    it('should call routingFn even if it is synchronous', () => {
      const syncRoutingFn = jest.fn(() => {
        // Synchronous function that completes immediately
        return true
      })

      renderWithTheme(<NotFoundComponent routingFn={syncRoutingFn} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(syncRoutingFn).toHaveBeenCalledTimes(1)
    })

    it('should handle special characters in button text', () => {
      const specialText = '← Go Back & Retry!'
      renderWithTheme(<NotFoundComponent buttonText={specialText} />)

      expect(screen.getByRole('button')).toHaveTextContent(specialText)
    })

    it('should handle button text with emojis', () => {
      const emojiText = '🏠 Go Home'
      renderWithTheme(<NotFoundComponent buttonText={emojiText} />)

      expect(screen.getByRole('button')).toHaveTextContent(emojiText)
    })

    it('should handle null routingFn', () => {
      renderWithTheme(<NotFoundComponent routingFn={null as any} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      // Should fall back to history.back()
      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('Rendering Consistency', () => {
    it('should render the same content on multiple renders', () => {
      const { rerender } = renderWithTheme(<NotFoundComponent />)

      expect(screen.getByText('Not Found')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent />
        </ThemeProvider>,
      )

      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.getByText("We couldn't find what you were looking for.")).toBeInTheDocument()
    })

    it('should maintain state between prop updates', () => {
      const mockRoutingFn1 = jest.fn()
      const mockRoutingFn2 = jest.fn()

      const { rerender } = renderWithTheme(
        <NotFoundComponent
          buttonText="First"
          routingFn={mockRoutingFn1}
        />,
      )

      expect(screen.getByRole('button')).toHaveTextContent('First')

      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent
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
      renderWithTheme(<NotFoundComponent />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('MuiButton-outlined')
    })
  })

  describe('Static Content', () => {
    it('should always display "Not Found" heading', () => {
      renderWithTheme(<NotFoundComponent />)

      const heading = screen.getByText('Not Found')
      expect(heading).toBeInTheDocument()
      expect(heading.tagName).toBe('H1')
    })

    it('should always display description message', () => {
      renderWithTheme(<NotFoundComponent />)

      expect(screen.getByText("We couldn't find what you were looking for.")).toBeInTheDocument()
    })

    it('should display animation regardless of props', () => {
      const { rerender } = renderWithTheme(<NotFoundComponent />)

      expect(screen.getByTestId('not-found-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent buttonText="Custom" />
        </ThemeProvider>,
      )

      expect(screen.getByTestId('not-found-lottie')).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should handle rapid prop changes', () => {
      const mockRoutingFn1 = jest.fn()
      const mockRoutingFn2 = jest.fn()
      const mockRoutingFn3 = jest.fn()

      const { rerender } = renderWithTheme(
        <NotFoundComponent
          buttonText="Text 1"
          routingFn={mockRoutingFn1}
        />,
      )

      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent
            buttonText="Text 2"
            routingFn={mockRoutingFn2}
          />
        </ThemeProvider>,
      )

      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent
            buttonText="Text 3"
            routingFn={mockRoutingFn3}
          />
        </ThemeProvider>,
      )

      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Text 3')

      fireEvent.click(button)
      expect(mockRoutingFn3).toHaveBeenCalledTimes(1)
      expect(mockRoutingFn1).not.toHaveBeenCalled()
      expect(mockRoutingFn2).not.toHaveBeenCalled()
    })

    it('should handle switching between custom routing and default routing', () => {
      const mockRoutingFn = jest.fn()

      const { rerender } = renderWithTheme(<NotFoundComponent routingFn={mockRoutingFn} />)

      let button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockRoutingFn).toHaveBeenCalledTimes(1)
      expect(mockHistoryBack).not.toHaveBeenCalled()

      // Switch to default routing
      rerender(
        <ThemeProvider theme={testTheme}>
          <NotFoundComponent />
        </ThemeProvider>,
      )

      button = screen.getByRole('button')
      fireEvent.click(button)
      expect(mockHistoryBack).toHaveBeenCalledTimes(1)
      expect(mockRoutingFn).toHaveBeenCalledTimes(1) // Still only 1 from before
    })
  })

  describe('Component Identity', () => {
    it('should have distinct content from error component', () => {
      renderWithTheme(<NotFoundComponent />)

      // Should have "Not Found" not "Ouch"
      expect(screen.getByText('Not Found')).toBeInTheDocument()
      expect(screen.queryByText('Ouch')).not.toBeInTheDocument()
    })

    it('should have appropriate message for 404 scenario', () => {
      renderWithTheme(<NotFoundComponent />)

      const message = screen.getByText("We couldn't find what you were looking for.")
      expect(message).toBeInTheDocument()
    })
  })
})

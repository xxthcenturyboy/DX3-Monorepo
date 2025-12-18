import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { DialogError } from './error.dialog'

// Mock the dependencies
jest.mock('../lottie/alert.lottie', () => ({
  AlertLottie: () => <div data-testid="alert-lottie">Alert Animation</div>,
}))

jest.mock('./custom-content.dialog', () => ({
  CustomDialogContent: ({ children, isMobileWidth, windowHeight }: any) => (
    <div
      data-mobile={isMobileWidth}
      data-testid="custom-dialog-content"
      data-window-height={windowHeight}
    >
      {children}
    </div>
  ),
}))

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

describe('DialogError', () => {
  const defaultProps = {
    windowHeight: 800,
  }

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false) // Desktop by default
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic Rendering', () => {
    it('should render successfully', () => {
      renderWithTheme(<DialogError {...defaultProps} />)

      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should render AlertLottie animation', () => {
      renderWithTheme(<DialogError {...defaultProps} />)

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should render CustomDialogContent wrapper', () => {
      renderWithTheme(<DialogError {...defaultProps} />)

      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should render with empty message by default', () => {
      const { container } = renderWithTheme(<DialogError {...defaultProps} />)

      // Component renders successfully even without message
      expect(container.firstChild).toBeInTheDocument()
    })

    it('should have correct message ID', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error occurred"
        />,
      )

      const text = screen.getByText('Error occurred')
      expect(text).toHaveAttribute('id', 'dialog-error')
    })
  })

  describe('Custom Message', () => {
    it('should render custom message', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Something went wrong"
        />,
      )

      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should render empty string when message prop is undefined', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message={undefined}
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should render empty string message', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message=""
        />,
      )

      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should render long error message', () => {
      const longMessage = 'A'.repeat(500)
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle message with special characters', () => {
      const specialMessage = 'Error: <data> & processing failed!'
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })

    it('should handle message with line breaks', () => {
      const multilineMessage = 'Error on line 1\nError on line 2'
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message={multilineMessage}
        />,
      )

      expect(screen.getByText((content) => content.includes('Error on line 1'))).toBeInTheDocument()
    })

    it('should update message dynamically', () => {
      const { rerender } = renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Initial error"
        />,
      )

      expect(screen.getByText('Initial error')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            {...defaultProps}
            message="Updated error"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Updated error')).toBeInTheDocument()
      expect(screen.queryByText('Initial error')).not.toBeInTheDocument()
    })
  })

  describe('Window Height', () => {
    it('should pass windowHeight to CustomDialogContent', () => {
      renderWithTheme(<DialogError windowHeight={1024} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '1024')
    })

    it('should handle different window heights', () => {
      renderWithTheme(<DialogError windowHeight={600} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '600')
    })

    it('should handle small window height', () => {
      renderWithTheme(<DialogError windowHeight={400} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '400')
    })

    it('should handle large window height', () => {
      renderWithTheme(<DialogError windowHeight={2000} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '2000')
    })

    it('should handle window height of 0', () => {
      renderWithTheme(<DialogError windowHeight={0} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '0')
    })
  })

  describe('Responsive Behavior', () => {
    it('should pass isMobileWidth as false on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(<DialogError {...defaultProps} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'false')
    })

    it('should pass isMobileWidth as true on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(<DialogError {...defaultProps} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'true')
    })

    it('should render correctly on mobile with message', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Mobile error message"
        />,
      )

      expect(screen.getByText('Mobile error message')).toBeInTheDocument()
      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'true')
    })

    it('should render correctly on desktop with message', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Desktop error message"
        />,
      )

      expect(screen.getByText('Desktop error message')).toBeInTheDocument()
      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'false')
    })
  })

  describe('Component Structure', () => {
    it('should render all components together', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Complete error"
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
      expect(screen.getByText('Complete error')).toBeInTheDocument()
    })

    it('should render animation and message together', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error with animation"
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByText('Error with animation')).toBeInTheDocument()
    })

    it('should render with proper hierarchy', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Test error"
        />,
      )

      const content = screen.getByTestId('custom-dialog-content')
      const lottie = screen.getByTestId('alert-lottie')
      const message = screen.getByText('Test error')

      expect(content).toBeInTheDocument()
      expect(lottie).toBeInTheDocument()
      expect(message).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined message prop', () => {
      renderWithTheme(
        <DialogError
          message={undefined}
          windowHeight={800}
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should handle null message gracefully', () => {
      renderWithTheme(
        <DialogError
          message={null as any}
          windowHeight={800}
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should handle message with only whitespace', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="   "
        />,
      )

      // Component should render successfully even with whitespace-only message
      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should handle message with numbers', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error code: 404"
        />,
      )

      expect(screen.getByText('Error code: 404')).toBeInTheDocument()
    })

    it('should handle message with symbols', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error: !@#$%^&*()"
        />,
      )

      expect(screen.getByText('Error: !@#$%^&*()')).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should work on desktop with all features', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(
        <DialogError
          message="Desktop error occurred"
          windowHeight={900}
        />,
      )

      expect(screen.getByText('Desktop error occurred')).toBeInTheDocument()
      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'false')
      expect(content).toHaveAttribute('data-window-height', '900')
    })

    it('should work on mobile with all features', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(
        <DialogError
          message="Mobile error occurred"
          windowHeight={667}
        />,
      )

      expect(screen.getByText('Mobile error occurred')).toBeInTheDocument()
      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'true')
      expect(content).toHaveAttribute('data-window-height', '667')
    })

    it('should handle state changes', () => {
      const { rerender } = renderWithTheme(
        <DialogError
          message="Error 1"
          windowHeight={800}
        />,
      )

      expect(screen.getByText('Error 1')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            message="Error 2"
            windowHeight={900}
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Error 2')).toBeInTheDocument()
      expect(screen.queryByText('Error 1')).not.toBeInTheDocument()
    })
  })

  describe('Use Cases', () => {
    it('should work as a network error dialog', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Network connection failed. Please try again."
        />,
      )

      expect(screen.getByText('Network connection failed. Please try again.')).toBeInTheDocument()
    })

    it('should work as a validation error dialog', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Please fill in all required fields."
        />,
      )

      expect(screen.getByText('Please fill in all required fields.')).toBeInTheDocument()
    })

    it('should work as a generic error dialog', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="An unexpected error occurred."
        />,
      )

      expect(screen.getByText('An unexpected error occurred.')).toBeInTheDocument()
    })

    it('should work as a server error dialog', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Server error: 500 - Internal Server Error"
        />,
      )

      expect(screen.getByText('Server error: 500 - Internal Server Error')).toBeInTheDocument()
    })

    it('should work without a message', () => {
      renderWithTheme(<DialogError {...defaultProps} />)

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible message element', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Accessible error message"
        />,
      )

      const message = screen.getByText('Accessible error message')
      expect(message).toHaveAttribute('id', 'dialog-error')
    })

    it('should render accessible content', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error for screen readers"
        />,
      )

      expect(screen.getByText('Error for screen readers')).toBeInTheDocument()
    })

    it('should support message reading by screen readers', () => {
      renderWithTheme(
        <DialogError
          {...defaultProps}
          message="This error message is accessible to assistive technology"
        />,
      )

      const message = screen.getByText('This error message is accessible to assistive technology')
      expect(message).toBeInTheDocument()
    })
  })

  describe('Message Updates', () => {
    it('should transition from no message to message', () => {
      const { rerender } = renderWithTheme(
        <DialogError
          {...defaultProps}
          message=""
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            {...defaultProps}
            message="Error appeared"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Error appeared')).toBeInTheDocument()
    })

    it('should transition from message to no message', () => {
      const { rerender } = renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error message"
        />,
      )

      expect(screen.getByText('Error message')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            {...defaultProps}
            message=""
          />
        </ThemeProvider>,
      )

      expect(screen.queryByText('Error message')).not.toBeInTheDocument()
    })

    it('should handle rapid message changes', () => {
      const { rerender } = renderWithTheme(
        <DialogError
          {...defaultProps}
          message="Error 1"
        />,
      )

      expect(screen.getByText('Error 1')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            {...defaultProps}
            message="Error 2"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Error 2')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <DialogError
            {...defaultProps}
            message="Error 3"
          />
        </ThemeProvider>,
      )

      expect(screen.getByText('Error 3')).toBeInTheDocument()
    })
  })

  describe('Props Combination', () => {
    it('should work with minimal props', () => {
      renderWithTheme(<DialogError windowHeight={800} />)

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should work with all props', () => {
      renderWithTheme(
        <DialogError
          message="Complete error message"
          windowHeight={1000}
        />,
      )

      expect(screen.getByText('Complete error message')).toBeInTheDocument()
      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should work with message only', () => {
      renderWithTheme(
        <DialogError
          message="Just the message"
          windowHeight={800}
        />,
      )

      expect(screen.getByText('Just the message')).toBeInTheDocument()
    })
  })
})

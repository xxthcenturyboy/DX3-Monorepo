import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { DialogAlert } from './alert.dialog'

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

describe('DialogAlert', () => {
  const mockCloseDialog = jest.fn()
  const defaultProps = {
    closeDialog: mockCloseDialog,
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
      renderWithTheme(<DialogAlert {...defaultProps} />)

      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should render AlertLottie component', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
    })

    it('should render dialog content text', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })

    it('should render button', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should render with default button text', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Custom Props', () => {
    it('should render custom message', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message="Custom error message"
        />,
      )

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
      expect(screen.queryByText('Something went wrong.')).not.toBeInTheDocument()
    })

    it('should render custom button text', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText="Close"
        />,
      )

      expect(screen.getByText('Close')).toBeInTheDocument()
      expect(screen.queryByText('OK')).not.toBeInTheDocument()
    })

    it('should render with both custom message and button text', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText="Retry"
          message="Network connection failed"
        />,
      )

      expect(screen.getByText('Network connection failed')).toBeInTheDocument()
      expect(screen.getByText('Retry')).toBeInTheDocument()
    })

    it('should pass windowHeight to CustomDialogContent', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          windowHeight={1024}
        />,
      )

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-window-height', '1024')
    })

    it('should handle different windowHeight values', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          windowHeight={600}
        />,
      )

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-window-height', '600')
    })
  })

  describe('Button Interaction', () => {
    it('should call closeDialog when button is clicked', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)
    })

    it('should call closeDialog when custom button is clicked', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText="Dismiss"
        />,
      )

      const button = screen.getByText('Dismiss')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)
    })

    it('should call closeDialog multiple times on multiple clicks', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(3)
    })
  })

  describe('Responsive Behavior', () => {
    it('should pass isMobileWidth as false on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(<DialogAlert {...defaultProps} />)

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-mobile', 'false')
    })

    it('should pass isMobileWidth as true on small screens', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(<DialogAlert {...defaultProps} />)

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-mobile', 'true')
    })

    it('should render correctly on mobile with custom message', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message="Mobile error message"
        />,
      )

      expect(screen.getByText('Mobile error message')).toBeInTheDocument()
      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-mobile', 'true')
    })
  })

  describe('Dialog Content Text Properties', () => {
    it('should render text with correct ID', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      const text = screen.getByText('Something went wrong.')
      expect(text).toHaveAttribute('id', 'dialog-api-alert')
    })

    it('should render text with body1 variant', () => {
      const { container } = renderWithTheme(<DialogAlert {...defaultProps} />)

      const text = container.querySelector('.MuiTypography-body1')
      expect(text).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string message', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message=""
        />,
      )

      // Empty string is still rendered (MUI handles it gracefully)
      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toBeInTheDocument()
    })

    it('should handle empty string button text', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText=""
        />,
      )

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle very long message', () => {
      const longMessage = 'A'.repeat(500)
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle very long button text', () => {
      const longButtonText = 'Very Long Button Text That Keeps Going'
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText={longButtonText}
        />,
      )

      expect(screen.getByText(longButtonText)).toBeInTheDocument()
    })

    it('should handle message with HTML entities', () => {
      const messageWithEntities = 'Error: <Component> failed & stopped'
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message={messageWithEntities}
        />,
      )

      expect(screen.getByText(messageWithEntities)).toBeInTheDocument()
    })

    it('should handle windowHeight of 0', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          windowHeight={0}
        />,
      )

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-window-height', '0')
    })

    it('should handle very large windowHeight', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          windowHeight={10000}
        />,
      )

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-window-height', '10000')
    })
  })

  describe('Component Structure', () => {
    it('should render all main components together', () => {
      renderWithTheme(<DialogAlert {...defaultProps} />)

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should maintain component structure with custom props', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText="Custom button"
          message="Custom message"
          windowHeight={1200}
        />,
      )

      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()
      expect(screen.getByText('Custom message')).toBeInTheDocument()
      expect(screen.getByText('Custom button')).toBeInTheDocument()
    })
  })

  describe('Default Values', () => {
    it('should use default message when message prop is undefined', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message={undefined}
        />,
      )

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
    })

    it('should use default button text when buttonText prop is undefined', () => {
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          buttonText={undefined}
        />,
      )

      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should handle all optional props being undefined', () => {
      renderWithTheme(
        <DialogAlert
          buttonText={undefined}
          closeDialog={mockCloseDialog}
          message={undefined}
          windowHeight={800}
        />,
      )

      expect(screen.getByText('Something went wrong.')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
    })
  })

  describe('Dialog Actions', () => {
    it('should render button within DialogActions', () => {
      const { container } = renderWithTheme(<DialogAlert {...defaultProps} />)

      const dialogActions = container.querySelector('.MuiDialogActions-root')
      expect(dialogActions).toBeInTheDocument()

      const button = screen.getByRole('button')
      expect(dialogActions).toContainElement(button)
    })

    it('should render contained variant button', () => {
      const { container } = renderWithTheme(<DialogAlert {...defaultProps} />)

      const button = container.querySelector('.MuiButton-contained')
      expect(button).toBeInTheDocument()
    })
  })

  describe('Integration', () => {
    it('should work correctly with all features combined on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(
        <DialogAlert
          buttonText="Confirm"
          closeDialog={mockCloseDialog}
          message="Integration test message"
          windowHeight={900}
        />,
      )

      expect(screen.getByText('Integration test message')).toBeInTheDocument()
      expect(screen.getByTestId('alert-lottie')).toBeInTheDocument()

      const button = screen.getByText('Confirm')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-mobile', 'false')
      expect(dialogContent).toHaveAttribute('data-window-height', '900')
    })

    it('should work correctly with all features combined on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(
        <DialogAlert
          buttonText="Got it"
          closeDialog={mockCloseDialog}
          message="Mobile integration test"
          windowHeight={600}
        />,
      )

      expect(screen.getByText('Mobile integration test')).toBeInTheDocument()

      const button = screen.getByText('Got it')
      fireEvent.click(button)

      expect(mockCloseDialog).toHaveBeenCalledTimes(1)

      const dialogContent = screen.getByTestId('custom-dialog-content')
      expect(dialogContent).toHaveAttribute('data-mobile', 'true')
      expect(dialogContent).toHaveAttribute('data-window-height', '600')
    })
  })

  describe('Multiline Messages', () => {
    it('should handle message with line breaks', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3'
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message={multilineMessage}
        />,
      )

      // Use a function matcher to handle whitespace normalization
      expect(
        screen.getByText((content, element) => {
          return element?.textContent === multilineMessage || content.includes('Line 1')
        }),
      ).toBeInTheDocument()
    })

    it('should handle message with special characters', () => {
      const specialMessage = "Error: Can't connect to server!"
      renderWithTheme(
        <DialogAlert
          {...defaultProps}
          message={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })
  })
})

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'

import { ConfirmationDialog } from './confirmation.dialog'

// Mock window.innerHeight
Object.defineProperty(window, 'innerHeight', {
  configurable: true,
  value: 800,
  writable: true,
})

// Mock the dependencies
jest.mock('../lottie/question-mark.lottie', () => ({
  QuestionMarkLottie: () => <div data-testid="question-lottie">Question Animation</div>,
}))

jest.mock('../lottie/cancel.lottie', () => ({
  CancelLottie: ({ complete }: any) => {
    React.useEffect(() => {
      if (complete) {
        const timer = setTimeout(() => complete(), 100)
        return () => clearTimeout(timer)
      }
    }, [complete])
    return <div data-testid="cancel-lottie">Cancel Animation</div>
  },
}))

jest.mock('../lottie/success.lottie', () => ({
  SuccessLottie: ({ complete }: any) => {
    React.useEffect(() => {
      if (complete) {
        const timer = setTimeout(() => complete(), 100)
        return () => clearTimeout(timer)
      }
    }, [complete])
    return <div data-testid="success-lottie">Success Animation</div>
  },
}))

jest.mock('./ui-wrapper.dialog', () => ({
  DialogWrapper: ({ children }: any) => <div data-testid="dialog-wrapper">{children}</div>,
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

describe('ConfirmationDialog', () => {
  const mockOnComplete = jest.fn()
  const defaultProps = {
    onComplete: mockOnComplete,
  }

  beforeEach(() => {
    mockUseMediaQuery.mockReturnValue(false) // Desktop by default
    jest.clearAllTimers()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('should render successfully', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
    })

    it('should show question mark lottie initially', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('question-lottie')).toBeInTheDocument()
    })

    it('should show default message', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })

    it('should show default OK button', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should not show cancel button by default', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })
  })

  describe('Custom Messages', () => {
    it('should show custom body message', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Delete this item?"
        />,
      )

      expect(screen.getByText('Delete this item?')).toBeInTheDocument()
      expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
    })

    it('should show custom HTML body message', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessageHtml={<div data-testid="custom-html">Custom HTML Content</div>}
        />,
      )

      expect(screen.getByTestId('custom-html')).toBeInTheDocument()
      expect(screen.getByText('Custom HTML Content')).toBeInTheDocument()
    })

    it('should show both bodyMessage and bodyMessageHtml', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Text message"
          bodyMessageHtml={<div>HTML content</div>}
        />,
      )

      expect(screen.getByText('Text message')).toBeInTheDocument()
      expect(screen.getByText('HTML content')).toBeInTheDocument()
    })

    it('should handle empty body message', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage=""
        />,
      )

      expect(screen.getByText('Are you sure?')).toBeInTheDocument()
    })
  })

  describe('Custom Button Text', () => {
    it('should show custom OK button text', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          okText="Confirm"
        />,
      )

      expect(screen.getByText('Confirm')).toBeInTheDocument()
      expect(screen.queryByText('OK')).not.toBeInTheDocument()
    })

    it('should show cancel button when cancelText is provided', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should show custom cancel button text', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="No thanks"
        />,
      )

      expect(screen.getByText('No thanks')).toBeInTheDocument()
    })

    it('should show both custom button texts', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="No, keep it"
          okText="Yes, delete"
        />,
      )

      expect(screen.getByText('Yes, delete')).toBeInTheDocument()
      expect(screen.getByText('No, keep it')).toBeInTheDocument()
    })
  })

  describe('Confirm Button Behavior', () => {
    it('should show success lottie when confirm button is clicked', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      expect(screen.getByTestId('success-lottie')).toBeInTheDocument()
      expect(screen.queryByTestId('question-lottie')).not.toBeInTheDocument()
    })

    it('should change message to OK text when confirm is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          okText="Confirmed"
        />,
      )

      const confirmButton = screen.getByText('Confirmed')
      fireEvent.click(confirmButton)

      expect(screen.getByText('Confirmed')).toBeInTheDocument()
    })

    it('should hide buttons when confirm is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      expect(screen.queryByText('OK')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should call onComplete with true after delay (default behavior)', async () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      // Wait for success lottie complete callback (100ms) + handleConfirmation delay (500ms)
      jest.advanceTimersByTime(600)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(true)
      })
    })

    it('should call onComplete with true immediately when noAwait is true', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          noAwait={true}
        />,
      )

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      expect(mockOnComplete).toHaveBeenCalledWith(true)
    })
  })

  describe('Cancel Button Behavior', () => {
    it('should show cancel lottie when cancel button is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(screen.getByTestId('cancel-lottie')).toBeInTheDocument()
      expect(screen.queryByTestId('question-lottie')).not.toBeInTheDocument()
    })

    it('should change message to "Cancelling" when cancel is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(screen.getByText('Cancelling')).toBeInTheDocument()
    })

    it('should hide buttons when cancel is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(screen.queryByText('OK')).not.toBeInTheDocument()
      expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
    })

    it('should call onComplete with false after cancel lottie completes', async () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      // Wait for cancel lottie complete callback (100ms)
      jest.advanceTimersByTime(100)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Lottie Animation Flow', () => {
    it('should transition from question to success lottie', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('question-lottie')).toBeInTheDocument()
      expect(screen.queryByTestId('success-lottie')).not.toBeInTheDocument()

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      expect(screen.queryByTestId('question-lottie')).not.toBeInTheDocument()
      expect(screen.getByTestId('success-lottie')).toBeInTheDocument()
    })

    it('should transition from question to cancel lottie', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      expect(screen.getByTestId('question-lottie')).toBeInTheDocument()
      expect(screen.queryByTestId('cancel-lottie')).not.toBeInTheDocument()

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      expect(screen.queryByTestId('question-lottie')).not.toBeInTheDocument()
      expect(screen.getByTestId('cancel-lottie')).toBeInTheDocument()
    })

    it('should not show multiple lotties at once', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      expect(screen.getByTestId('success-lottie')).toBeInTheDocument()
      expect(screen.queryByTestId('question-lottie')).not.toBeInTheDocument()
      expect(screen.queryByTestId('cancel-lottie')).not.toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false)

      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'false')
    })

    it('should render on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true)

      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-mobile', 'true')
    })

    it('should pass window height to CustomDialogContent', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const content = screen.getByTestId('custom-dialog-content')
      expect(content).toHaveAttribute('data-window-height', '800')
    })
  })

  describe('Component Structure', () => {
    it('should render DialogWrapper', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
    })

    it('should render CustomDialogContent', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
    })

    it('should have correct message ID', () => {
      renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const message = screen.getByText('Are you sure?')
      expect(message).toHaveAttribute('id', 'confirm-dialog-description')
    })

    it('should render all components together', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Custom message"
          cancelText="Cancel"
        />,
      )

      expect(screen.getByTestId('dialog-wrapper')).toBeInTheDocument()
      expect(screen.getByTestId('custom-dialog-content')).toBeInTheDocument()
      expect(screen.getByTestId('question-lottie')).toBeInTheDocument()
      expect(screen.getByText('Custom message')).toBeInTheDocument()
      expect(screen.getByText('OK')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined okText', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          okText={undefined}
        />,
      )

      expect(screen.getByText('OK')).toBeInTheDocument()
    })

    it('should handle empty okText', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          okText=""
        />,
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(1)
    })

    it('should handle undefined cancelText (no cancel button)', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText={undefined}
        />,
      )

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(1)
      expect(buttons[0]).toHaveTextContent('OK')
    })

    it('should handle long messages', () => {
      const longMessage = 'A'.repeat(200)
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage={longMessage}
        />,
      )

      expect(screen.getByText(longMessage)).toBeInTheDocument()
    })

    it('should handle special characters in message', () => {
      const specialMessage = 'Delete <file.txt> & confirm?'
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage={specialMessage}
        />,
      )

      expect(screen.getByText(specialMessage)).toBeInTheDocument()
    })
  })

  describe('Integration Scenarios', () => {
    it('should handle full confirmation flow with noAwait', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Delete file?"
          cancelText="Keep"
          noAwait={true}
          okText="Delete"
        />,
      )

      expect(screen.getByText('Delete file?')).toBeInTheDocument()

      const deleteButton = screen.getByText('Delete')
      fireEvent.click(deleteButton)

      expect(mockOnComplete).toHaveBeenCalledWith(true)
      expect(screen.getByTestId('success-lottie')).toBeInTheDocument()
    })

    it('should handle full confirmation flow with delay', async () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Save changes?"
          cancelText="Discard"
          okText="Save"
        />,
      )

      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      expect(screen.getByTestId('success-lottie')).toBeInTheDocument()

      // Advance timers for lottie completion (100ms) + delay (500ms)
      jest.advanceTimersByTime(600)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(true)
      })
    })

    it('should handle full cancellation flow', async () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Proceed?"
          cancelText="No"
          okText="Yes"
        />,
      )

      const noButton = screen.getByText('No')
      fireEvent.click(noButton)

      expect(screen.getByText('Cancelling')).toBeInTheDocument()
      expect(screen.getByTestId('cancel-lottie')).toBeInTheDocument()

      // Advance timer for lottie completion
      jest.advanceTimersByTime(100)

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledWith(false)
      })
    })
  })

  describe('Button Variants', () => {
    it('should render OK button as contained variant', () => {
      const { container } = renderWithTheme(<ConfirmationDialog {...defaultProps} />)

      const button = container.querySelector('.MuiButton-contained')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('OK')
    })

    it('should render Cancel button as outlined variant', () => {
      const { container } = renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          cancelText="Cancel"
        />,
      )

      const button = container.querySelector('.MuiButton-outlined')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Cancel')
    })
  })

  describe('Message State Changes', () => {
    it('should update message state when confirm is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Initial message"
          okText="Confirmed"
        />,
      )

      expect(screen.getByText('Initial message')).toBeInTheDocument()

      const confirmButton = screen.getByText('Confirmed')
      fireEvent.click(confirmButton)

      // Message should change to okText
      expect(screen.getByText('Confirmed')).toBeInTheDocument()
      expect(screen.queryByText('Initial message')).not.toBeInTheDocument()
    })

    it('should update message state when cancel is clicked', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Initial message"
          cancelText="Cancel"
        />,
      )

      expect(screen.getByText('Initial message')).toBeInTheDocument()

      const cancelButton = screen.getByText('Cancel')
      fireEvent.click(cancelButton)

      // Message should change to "Cancelling"
      expect(screen.getByText('Cancelling')).toBeInTheDocument()
      expect(screen.queryByText('Initial message')).not.toBeInTheDocument()
    })

    it('should show "Ok" as message when confirm is clicked without okText', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Are you sure?"
        />,
      )

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)

      // Message should change to "Ok" (default from okText || 'Ok')
      expect(screen.getByText('Ok')).toBeInTheDocument()
    })
  })

  describe('Complex Scenarios', () => {
    it('should handle bodyMessageHtml with complex React elements', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessageHtml={
            <div>
              <p>Line 1</p>
              <p>Line 2</p>
              <button type="button">Nested Button</button>
            </div>
          }
        />,
      )

      expect(screen.getByText('Line 1')).toBeInTheDocument()
      expect(screen.getByText('Line 2')).toBeInTheDocument()
      expect(screen.getByText('Nested Button')).toBeInTheDocument()
    })

    it('should handle rapid button clicks gracefully', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          noAwait={true}
        />,
      )

      const confirmButton = screen.getByText('OK')
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)
      fireEvent.click(confirmButton)

      // Should only call onComplete once
      expect(mockOnComplete).toHaveBeenCalledTimes(1)
      expect(mockOnComplete).toHaveBeenCalledWith(true)
    })
  })

  describe('Use Cases', () => {
    it('should work as a delete confirmation dialog', async () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Delete this item permanently?"
          cancelText="Cancel"
          okText="Delete"
        />,
      )

      expect(screen.getByText('Delete this item permanently?')).toBeInTheDocument()
      expect(screen.getByText('Delete')).toBeInTheDocument()
      expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    it('should work as a save confirmation dialog', async () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Save your changes?"
          cancelText="Discard"
          noAwait={true}
          okText="Save"
        />,
      )

      const saveButton = screen.getByText('Save')
      fireEvent.click(saveButton)

      expect(mockOnComplete).toHaveBeenCalledWith(true)
    })

    it('should work as a simple yes/no dialog', () => {
      renderWithTheme(
        <ConfirmationDialog
          {...defaultProps}
          bodyMessage="Do you want to continue?"
          cancelText="No"
          okText="Yes"
        />,
      )

      expect(screen.getByText('Do you want to continue?')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })
})

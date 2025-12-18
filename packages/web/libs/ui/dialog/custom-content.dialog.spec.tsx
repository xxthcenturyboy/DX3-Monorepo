import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { CustomDialogContent } from './custom-content.dialog'

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

describe('CustomDialogContent', () => {
  const defaultProps = {
    isMobileWidth: false,
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
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render with children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <div>Test Content</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render with multiple children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <div>Child 1</div>
          <div>Child 2</div>
          <div>Child 3</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
      expect(screen.getByText('Child 3')).toBeInTheDocument()
    })

    it('should render without children', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render as DialogContent component', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root')
      expect(dialogContent).toBeInTheDocument()
    })
  })

  describe('Height Calculation', () => {
    it('should calculate height on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={800}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = windowHeight - 140 = 800 - 140 = 660
      expect(dialogContent).toHaveStyle({ height: '660px' })
    })

    it('should not set height on desktop', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={false}
          windowHeight={800}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent.style.height).toBe('')
    })

    it('should handle different window heights on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={1024}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = 1024 - 140 = 884
      expect(dialogContent).toHaveStyle({ height: '884px' })
    })

    it('should handle small window height on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={400}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = 400 - 140 = 260
      expect(dialogContent).toHaveStyle({ height: '260px' })
    })

    it('should handle window height of 0 on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={0}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = 0 - 140 = -140
      expect(dialogContent).toHaveStyle({ height: '-140px' })
    })

    it('should handle very large window height on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={5000}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = 5000 - 140 = 4860
      expect(dialogContent).toHaveStyle({ height: '4860px' })
    })
  })

  describe('Default Styles', () => {
    it('should apply flex display', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ display: 'flex' })
    })

    it('should apply column flex direction', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ flexDirection: 'column' })
    })

    it('should apply default space-around justifyContent', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ justifyContent: 'space-around' })
    })

    it('should apply center alignItems', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ alignItems: 'center' })
    })

    it('should apply minimum height', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ minHeight: '360px' })
    })

    it('should apply default maximum width', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ maxWidth: '400px' })
    })

    it('should apply visible overflow', () => {
      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ overflow: 'visible' })
    })
  })

  describe('Custom JustifyContent', () => {
    it('should apply custom justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent="flex-start"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ justifyContent: 'flex-start' })
    })

    it('should apply flex-end justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent="flex-end"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ justifyContent: 'flex-end' })
    })

    it('should apply center justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent="center"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ justifyContent: 'center' })
    })

    it('should apply space-between justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent="space-between"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ justifyContent: 'space-between' })
    })
  })

  describe('Custom MaxWidth', () => {
    it('should apply custom maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth="600px"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ maxWidth: '600px' })
    })

    it('should apply small maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth="200px"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ maxWidth: '200px' })
    })

    it('should apply large maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth="1000px"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ maxWidth: '1000px' })
    })

    it('should handle percentage maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth="80%"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ maxWidth: '80%' })
    })
  })

  describe('Responsive MinWidth', () => {
    it('should apply minWidth on desktop', () => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop

      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ minWidth: '320px' })
    })

    it('should not apply minWidth on mobile', () => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile

      const { container } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ minWidth: '' })
    })

    it('should respond to breakpoint changes', () => {
      mockUseMediaQuery.mockReturnValue(false)

      const { container, rerender } = renderWithTheme(<CustomDialogContent {...defaultProps} />)

      let dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ minWidth: '320px' })

      // Switch to mobile
      mockUseMediaQuery.mockReturnValue(true)

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialogContent {...defaultProps} />
        </ThemeProvider>,
      )

      dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ minWidth: '' })
    })
  })

  describe('Mobile vs Desktop', () => {
    it('should handle mobile width prop', () => {
      renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={600}
        >
          <div>Mobile Content</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Mobile Content')).toBeInTheDocument()
    })

    it('should handle desktop width prop', () => {
      renderWithTheme(
        <CustomDialogContent
          isMobileWidth={false}
          windowHeight={800}
        >
          <div>Desktop Content</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Desktop Content')).toBeInTheDocument()
    })

    it('should transition from desktop to mobile', () => {
      const { container, rerender } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={false}
          windowHeight={800}
        />,
      )

      let dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent.style.height).toBe('')

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialogContent
            isMobileWidth={true}
            windowHeight={800}
          />
        </ThemeProvider>,
      )

      dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({ height: '660px' })
    })
  })

  describe('Children Rendering', () => {
    it('should render text children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>Plain text content</CustomDialogContent>,
      )

      expect(screen.getByText('Plain text content')).toBeInTheDocument()
    })

    it('should render React element children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <button type="button">Click me</button>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Click me')).toBeInTheDocument()
    })

    it('should render complex nested children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <div>
            <header>Header</header>
            <main>Content</main>
            <footer>Footer</footer>
          </div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Header')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should render conditional children', () => {
      const showContent = true
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          {showContent && <div>Conditional Content</div>}
          {!showContent && <div>Hidden Content</div>}
        </CustomDialogContent>,
      )

      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
      expect(screen.queryByText('Hidden Content')).not.toBeInTheDocument()
    })

    it('should render null children gracefully', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent {...defaultProps}>{null}</CustomDialogContent>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should render undefined children gracefully', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent {...defaultProps}>{undefined}</CustomDialogContent>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })

  describe('Combined Props', () => {
    it('should apply all custom props together', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          justifyContent="flex-start"
          maxWidth="500px"
          windowHeight={900}
        >
          <div>Custom Content</div>
        </CustomDialogContent>,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({
        height: '760px', // 900 - 140
        justifyContent: 'flex-start',
        maxWidth: '500px',
      })
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('should work with all props on desktop', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={false}
          justifyContent="center"
          maxWidth="800px"
          windowHeight={1000}
        >
          <div>Desktop Custom Content</div>
        </CustomDialogContent>,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({
        justifyContent: 'center',
        maxWidth: '800px',
      })
      expect(dialogContent.style.height).toBe('')
      expect(screen.getByText('Desktop Custom Content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent=""
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // Empty string should fall through to default
      expect(dialogContent).toHaveStyle({ justifyContent: 'space-around' })
    })

    it('should handle empty string maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth=""
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // Empty string should fall through to default
      expect(dialogContent).toHaveStyle({ maxWidth: '400px' })
    })

    it('should handle negative window height on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={-100}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = -100 - 140 = -240
      expect(dialogContent).toHaveStyle({ height: '-240px' })
    })

    it('should handle window height exactly 140 on mobile', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          windowHeight={140}
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      // height = 140 - 140 = 0
      expect(dialogContent).toHaveStyle({ height: '0px' })
    })
  })

  describe('Integration Scenarios', () => {
    it('should work in a typical mobile dialog scenario', () => {
      mockUseMediaQuery.mockReturnValue(true) // Mobile breakpoint

      renderWithTheme(
        <CustomDialogContent
          isMobileWidth={true}
          justifyContent="space-between" // iPhone SE height
          windowHeight={667}
        >
          <div>Dialog Title</div>
          <div>Dialog Content</div>
          <div>Dialog Actions</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Dialog Title')).toBeInTheDocument()
      expect(screen.getByText('Dialog Content')).toBeInTheDocument()
      expect(screen.getByText('Dialog Actions')).toBeInTheDocument()
    })

    it('should work in a typical desktop dialog scenario', () => {
      mockUseMediaQuery.mockReturnValue(false) // Desktop breakpoint

      renderWithTheme(
        <CustomDialogContent
          isMobileWidth={false}
          maxWidth="600px"
          windowHeight={1080}
        >
          <div>Desktop Dialog Content</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Desktop Dialog Content')).toBeInTheDocument()
    })

    it('should handle content updates', () => {
      const { rerender } = renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <div>Initial Content</div>
        </CustomDialogContent>,
      )

      expect(screen.getByText('Initial Content')).toBeInTheDocument()

      rerender(
        <ThemeProvider theme={testTheme}>
          <CustomDialogContent {...defaultProps}>
            <div>Updated Content</div>
          </CustomDialogContent>
        </ThemeProvider>,
      )

      expect(screen.getByText('Updated Content')).toBeInTheDocument()
      expect(screen.queryByText('Initial Content')).not.toBeInTheDocument()
    })
  })

  describe('Style Consistency', () => {
    it('should maintain base styles with custom justifyContent', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          justifyContent="flex-start"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start', // Custom
        minHeight: '360px',
      })
    })

    it('should maintain base styles with custom maxWidth', () => {
      const { container } = renderWithTheme(
        <CustomDialogContent
          {...defaultProps}
          maxWidth="700px"
        />,
      )

      const dialogContent = container.querySelector('.MuiDialogContent-root') as HTMLElement
      expect(dialogContent).toHaveStyle({
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '700px', // Custom
        minHeight: '360px',
      })
    })
  })

  describe('Accessibility', () => {
    it('should render accessible content', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <h2>Dialog Heading</h2>
          <main>Main Content</main>
        </CustomDialogContent>,
      )

      expect(screen.getByRole('heading')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })

    it('should support ARIA attributes in children', () => {
      renderWithTheme(
        <CustomDialogContent {...defaultProps}>
          <section aria-label="Dialog content area">Content</section>
        </CustomDialogContent>,
      )

      const element = screen.getByLabelText('Dialog content area')
      expect(element).toBeInTheDocument()
    })
  })
})

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

import { ContentWrapper, type ContentWrapperPropsType } from './content-wrapper.component'

// Create a test theme
const testTheme = createTheme()

// Helper function to render with theme provider
const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={testTheme}>{ui}</ThemeProvider>)
}

describe('ContentWrapper', () => {
  const defaultProps: ContentWrapperPropsType = {
    children: <div data-testid="test-content">Test Content</div>,
  }

  describe('Rendering', () => {
    it('should render children content', () => {
      renderWithTheme(<ContentWrapper {...defaultProps} />)

      expect(screen.getByTestId('test-content')).toBeInTheDocument()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      renderWithTheme(
        <ContentWrapper {...defaultProps}>
          <div data-testid="child-1">Child 1</div>
          <div data-testid="child-2">Child 2</div>
          <div data-testid="child-3">Child 3</div>
        </ContentWrapper>,
      )

      expect(screen.getByTestId('child-1')).toBeInTheDocument()
      expect(screen.getByTestId('child-2')).toBeInTheDocument()
      expect(screen.getByTestId('child-3')).toBeInTheDocument()
    })

    it('should render with null children without crashing', () => {
      const { container } = renderWithTheme(
        <ContentWrapper {...defaultProps}>{null}</ContentWrapper>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })

    it('should wrap content in MuiGrid container', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toBeInTheDocument()
    })

    it('should wrap content in MuiBox', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toBeInTheDocument()
    })
  })

  describe('Content Height', () => {
    it('should use default height when contentHeight is not provided', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toHaveStyle({ height: 'calc(100vh - 80px)' })
    })

    it('should apply custom contentHeight when provided', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentHeight="500px"
        />,
      )

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toHaveStyle({ height: '500px' })
    })

    it('should accept percentage-based contentHeight', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentHeight="100%"
        />,
      )

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toHaveStyle({ height: '100%' })
    })
  })

  describe('Content Padding', () => {
    it('should use zero padding when contentPaddding is not provided', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ padding: '0' })
    })

    it('should apply custom contentPaddding when provided', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentPaddding="24px"
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ padding: '24px' })
    })

    it('should handle complex padding values', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentPaddding="16px 24px 32px 8px"
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ padding: '16px 24px 32px 8px' })
    })
  })

  describe('Content Top Offset', () => {
    it('should not have marginTop when contentTopOffset is not provided', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      // When undefined, marginTop should not be explicitly set or be empty
      expect(box).toBeInTheDocument()
    })

    it('should apply marginTop when contentTopOffset is provided', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentTopOffset="20px"
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ marginTop: '20px' })
    })
  })

  describe('Overflow', () => {
    it('should use auto overflow by default', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ overflow: 'auto' })
    })

    it('should apply custom overflow when provided', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          overflow="hidden"
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ overflow: 'hidden' })
    })

    it('should apply scroll overflow when specified', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          overflow="scroll"
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ overflow: 'scroll' })
    })
  })

  describe('Spacer Div', () => {
    it('should not render spacer div by default', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      // Children count: only the test-content div
      expect(box?.children.length).toBe(1)
    })

    it('should render spacer div when spacerDiv is true', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          spacerDiv={true}
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      // Children count: test-content div + spacer div
      expect(box?.children.length).toBe(2)
    })

    it('should not render spacer div when spacerDiv is false', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          spacerDiv={false}
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      expect(box?.children.length).toBe(1)
    })

    it('should apply correct padding to spacer div', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          spacerDiv={true}
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      const spacerDiv = box?.children[1] as HTMLElement

      expect(spacerDiv).toHaveStyle({ paddingBottom: '24px' })
    })
  })

  describe('Layout Structure', () => {
    it('should render Grid with column direction', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-direction-xs-column')
      expect(grid).toBeInTheDocument()
    })

    it('should render Grid with nowrap', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-wrap-xs-nowrap')
      expect(grid).toBeInTheDocument()
    })

    it('should have hidden overflow on outer Grid', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const grid = container.querySelector('.MuiGrid-root')
      expect(grid).toHaveStyle({ overflow: 'hidden' })
    })

    it('should have full height Box container', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({ height: '100%' })
    })

    it('should have flex column display on Box', () => {
      const { container } = renderWithTheme(<ContentWrapper {...defaultProps} />)

      const box = container.querySelector('.MuiBox-root')
      expect(box).toHaveStyle({
        display: 'flex',
        flexDirection: 'column',
      })
    })
  })

  describe('Combined Props', () => {
    it('should apply all props together correctly', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          contentHeight="80vh"
          contentPaddding="16px"
          contentTopOffset="10px"
          overflow="scroll"
          spacerDiv={true}
        >
          <div data-testid="combined-content">Combined Test</div>
        </ContentWrapper>,
      )

      const grid = container.querySelector('.MuiGrid-root')
      const box = container.querySelector('.MuiBox-root')

      expect(grid).toHaveStyle({ height: '80vh' })
      expect(box).toHaveStyle({
        marginTop: '10px',
        overflow: 'scroll',
        padding: '16px',
      })
      expect(box?.children.length).toBe(2) // content + spacer
      expect(screen.getByTestId('combined-content')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty string padding', () => {
      const { container } = renderWithTheme(
        <ContentWrapper
          {...defaultProps}
          contentPaddding=""
        />,
      )

      const box = container.querySelector('.MuiBox-root')
      // Empty string is falsy, so defaults to '0'
      expect(box).toHaveStyle({ padding: '0' })
    })

    it('should render with complex nested children', () => {
      renderWithTheme(
        <ContentWrapper {...defaultProps}>
          <div>
            <span>Nested</span>
            <div>
              <p>Deeply Nested</p>
            </div>
          </div>
        </ContentWrapper>,
      )

      expect(screen.getByText('Nested')).toBeInTheDocument()
      expect(screen.getByText('Deeply Nested')).toBeInTheDocument()
    })

    it('should handle undefined children gracefully', () => {
      const { container } = renderWithTheme(
        <ContentWrapper {...defaultProps}>{undefined}</ContentWrapper>,
      )

      expect(container.firstChild).toBeInTheDocument()
    })
  })
})

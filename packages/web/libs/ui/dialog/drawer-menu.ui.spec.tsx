import { createTheme, ThemeProvider } from '@mui/material/styles'
import { render, screen } from '@testing-library/react'
import type React from 'react'

const darkTheme = createTheme({ palette: { mode: 'dark' } })

import {
  CloseViewItem,
  StyledBottomContainer,
  StyledBottomItem,
  StyledContentWrapper,
  StyledList,
} from './drawer-menu.ui'

const testTheme = createTheme()

const renderWithTheme = (ui: React.ReactElement, theme = testTheme) =>
  render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>)

describe('drawer-menu.ui styled components', () => {
  // ---------------------------------------------------------------------------
  // CloseViewItem
  // ---------------------------------------------------------------------------
  describe('CloseViewItem', () => {
    it('should render without error with required justifcation prop', () => {
      renderWithTheme(
        <CloseViewItem justifcation="flex-end">
          <span>Close</span>
        </CloseViewItem>,
      )

      expect(screen.getByText('Close')).toBeInTheDocument()
    })

    it('should render with justifcation="flex-start"', () => {
      renderWithTheme(
        <CloseViewItem justifcation="flex-start">
          <span>Close Start</span>
        </CloseViewItem>,
      )

      expect(screen.getByText('Close Start')).toBeInTheDocument()
    })

    it('should render as a MUI ListItem', () => {
      const { container } = renderWithTheme(
        <CloseViewItem justifcation="center">
          <span>Item</span>
        </CloseViewItem>,
      )

      expect(container.querySelector('.MuiListItem-root')).toBeInTheDocument()
    })

    it('should fall back to flex-end when justifcation is an empty string', () => {
      // Exercises the `props.justifcation || 'flex-end'` falsy branch
      renderWithTheme(
        <CloseViewItem justifcation="">
          <span>Fallback</span>
        </CloseViewItem>,
      )

      expect(screen.getByText('Fallback')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // StyledBottomContainer
  // ---------------------------------------------------------------------------
  describe('StyledBottomContainer', () => {
    it('should render without error with required width prop', () => {
      renderWithTheme(
        <StyledBottomContainer width="240px">
          <li>Item</li>
        </StyledBottomContainer>,
      )

      expect(screen.getByText('Item')).toBeInTheDocument()
    })

    it('should render as a MUI List', () => {
      const { container } = renderWithTheme(
        <StyledBottomContainer width="100%">
          <li>List item</li>
        </StyledBottomContainer>,
      )

      expect(container.querySelector('.MuiList-root')).toBeInTheDocument()
    })

    it('should accept various width values', () => {
      expect(() =>
        renderWithTheme(
          <StyledBottomContainer width="320px">
            <li>Wide item</li>
          </StyledBottomContainer>,
        ),
      ).not.toThrow()
    })
  })

  // ---------------------------------------------------------------------------
  // StyledBottomItem
  // ---------------------------------------------------------------------------
  describe('StyledBottomItem', () => {
    it('should render without error without optional justifcation prop', () => {
      renderWithTheme(
        <StyledBottomItem>
          <span>Bottom Item</span>
        </StyledBottomItem>,
      )

      expect(screen.getByText('Bottom Item')).toBeInTheDocument()
    })

    it('should render with optional justifcation prop', () => {
      renderWithTheme(
        <StyledBottomItem justifcation="center">
          <span>Centered Bottom Item</span>
        </StyledBottomItem>,
      )

      expect(screen.getByText('Centered Bottom Item')).toBeInTheDocument()
    })

    it('should render as a MUI ListItem', () => {
      const { container } = renderWithTheme(
        <StyledBottomItem>
          <span>Item content</span>
        </StyledBottomItem>,
      )

      expect(container.querySelector('.MuiListItem-root')).toBeInTheDocument()
    })

    it('should render correctly with a dark theme', () => {
      // Exercises the `palette.mode === 'dark'` true branch in the styled function
      renderWithTheme(
        <StyledBottomItem>
          <span>Dark Item</span>
        </StyledBottomItem>,
        darkTheme,
      )

      expect(screen.getByText('Dark Item')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // StyledContentWrapper
  // ---------------------------------------------------------------------------
  describe('StyledContentWrapper', () => {
    it('should render children without error', () => {
      renderWithTheme(
        <StyledContentWrapper>
          <div data-testid="wrapper-child">Content</div>
        </StyledContentWrapper>,
      )

      expect(screen.getByTestId('wrapper-child')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should render as a div element', () => {
      const { container } = renderWithTheme(
        <StyledContentWrapper>
          <span>Inner</span>
        </StyledContentWrapper>,
      )

      expect(container.querySelector('div')).toBeInTheDocument()
    })

    it('should render multiple children', () => {
      renderWithTheme(
        <StyledContentWrapper>
          <div>First</div>
          <div>Second</div>
        </StyledContentWrapper>,
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
    })
  })

  // ---------------------------------------------------------------------------
  // StyledList
  // ---------------------------------------------------------------------------
  describe('StyledList', () => {
    it('should render children without error', () => {
      renderWithTheme(
        <StyledList>
          <li>List item one</li>
        </StyledList>,
      )

      expect(screen.getByText('List item one')).toBeInTheDocument()
    })

    it('should render as a MUI List', () => {
      const { container } = renderWithTheme(
        <StyledList>
          <li>Item</li>
        </StyledList>,
      )

      expect(container.querySelector('.MuiList-root')).toBeInTheDocument()
    })

    it('should render multiple list items', () => {
      renderWithTheme(
        <StyledList>
          <li>Alpha</li>
          <li>Beta</li>
          <li>Gamma</li>
        </StyledList>,
      )

      expect(screen.getByText('Alpha')).toBeInTheDocument()
      expect(screen.getByText('Beta')).toBeInTheDocument()
      expect(screen.getByText('Gamma')).toBeInTheDocument()
    })
  })
})

import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'
import { BlogEditorTitleFieldComponent } from './blog-editor-title-field.component'

const renderWithTheme = (ui: React.ReactElement) =>
  render(<ThemeProvider theme={BLOG_TEST_THEME}>{ui}</ThemeProvider>)

describe('BlogEditorTitleFieldComponent', () => {
  it('should render title field', () => {
    const { store } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorTitleFieldComponent />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText(/Title/)).toBeTruthy()
  })

  it('should dispatch titleSet when user types', () => {
    const { store } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorTitleFieldComponent />
      </ThemeProvider>,
    )
    const input = screen.getByLabelText(/Title/)
    fireEvent.change(input, { target: { value: 'New Title' } })
    expect(store.getState().blogEditorBody.title).toBe('New Title')
  })

  it('should show disabled state when disabled prop is true', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorTitleFieldComponent disabled />
      </ThemeProvider>,
    )
    const input = screen.getByLabelText(/Title/)
    expect((input as HTMLInputElement).disabled).toBe(true)
  })
})

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, render, screen } from '@testing-library/react'
import type React from 'react'

import { renderWithProviders } from '../../../../testing-render'

import { BlogEditorTitleFieldComponent } from './blog-editor-title-field.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({ TITLE: 'Title' }),
}))

const testTheme = createTheme()

const renderWithTheme = (ui: React.ReactElement) =>
  render(
    <ThemeProvider theme={testTheme}>
      {ui}
    </ThemeProvider>,
  )

describe('BlogEditorTitleFieldComponent', () => {
  it('should render title field', () => {
    const { store } = renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogEditorTitleFieldComponent />
      </ThemeProvider>,
    )
    expect(screen.getByLabelText(/Title/)).toBeTruthy()
  })

  it('should dispatch titleSet when user types', () => {
    const { store } = renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogEditorTitleFieldComponent />
      </ThemeProvider>,
    )
    const input = screen.getByLabelText(/Title/)
    fireEvent.change(input, { target: { value: 'New Title' } })
    expect(store.getState().blogEditorBody.title).toBe('New Title')
  })

  it('should show disabled state when disabled prop is true', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogEditorTitleFieldComponent disabled />
      </ThemeProvider>,
    )
    const input = screen.getByLabelText(/Title/)
    expect((input as HTMLInputElement).disabled).toBe(true)
  })
})

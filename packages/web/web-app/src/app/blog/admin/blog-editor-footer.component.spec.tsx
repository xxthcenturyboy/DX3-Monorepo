import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_EDITOR_BODY_DIRTY_STATE, BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'

import { BlogEditorFooterComponent } from './blog-editor-footer.component'

describe('BlogEditorFooterComponent', () => {
  it('should render Save and Cancel/Close buttons', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorFooterComponent
          onCancel={jest.fn()}
          onSave={jest.fn()}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText('Save')).toBeTruthy()
    expect(screen.getByText('Close')).toBeTruthy()
  })

  it('should show Create when isNew', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorFooterComponent
          isNew
          onCancel={jest.fn()}
          onSave={jest.fn()}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText('Create')).toBeTruthy()
  })

  it('should call onSave when Save clicked', () => {
    const onSave = jest.fn()
    const { store } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorFooterComponent
          onCancel={jest.fn()}
          onSave={onSave}
        />
      </ThemeProvider>,
      {
        preloadedState: BLOG_EDITOR_BODY_DIRTY_STATE,
      },
    )
    const saveBtn = screen.getByText('Save')
    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalled()
  })

  it('should call onCancel when Cancel/Close clicked', () => {
    const onCancel = jest.fn()
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogEditorFooterComponent
          onCancel={onCancel}
          onSave={jest.fn()}
        />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Close'))
    expect(onCancel).toHaveBeenCalled()
  })
})

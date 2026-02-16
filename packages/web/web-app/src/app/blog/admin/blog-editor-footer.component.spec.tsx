import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BlogEditorFooterComponent } from './blog-editor-footer.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    CANCEL: 'Cancel',
    CANCELING: 'Canceling',
    CLOSE: 'Close',
    CREATE: 'Create',
    SAVE: 'Save',
  }),
}))

const testTheme = createTheme()

describe('BlogEditorFooterComponent', () => {
  it('should render Save and Cancel/Close buttons', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
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
      <ThemeProvider theme={testTheme}>
        <BlogEditorFooterComponent
          onCancel={jest.fn()}
          onSave={onSave}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorBody: {
            content: 'x',
            initialContent: '',
            initialTitle: '',
            title: 'Has Title',
          },
        },
      },
    )
    const saveBtn = screen.getByText('Save')
    fireEvent.click(saveBtn)
    expect(onSave).toHaveBeenCalled()
  })

  it('should call onCancel when Cancel/Close clicked', () => {
    const onCancel = jest.fn()
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
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

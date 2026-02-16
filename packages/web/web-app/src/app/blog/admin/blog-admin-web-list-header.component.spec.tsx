import { createTheme, ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BlogAdminListHeaderComponent } from './blog-admin-web-list-header.component'

jest.mock('../../data/rtk-query')
jest.mock('../../i18n', () => ({
  useStrings: () => ({
    ALL: 'All',
    BLOG: 'Blog',
    BLOG_CREATE_POST: 'Create Post',
    BLOG_EDITOR_TITLE: 'Blog Editor',
    BLOG_STATUS_ARCHIVED: 'Archived',
    BLOG_STATUS_DRAFT: 'Draft',
    BLOG_STATUS_PUBLISHED: 'Published',
    BLOG_STATUS_SCHEDULED: 'Scheduled',
    BLOG_STATUS_UNPUBLISHED: 'Unpublished',
    STATUS: 'Status',
    TOOLTIP_REFRESH_LIST: 'Refresh list',
  }),
}))

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  useMediaQuery: () => false,
}))

const testTheme = createTheme()

describe('BlogAdminListHeaderComponent', () => {
  it('should render create post button', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminListHeaderComponent
          onCreateClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText('Create Post')).toBeTruthy()
  })

  it('should call onCreateClick when create button clicked', () => {
    const onCreateClick = jest.fn()
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminListHeaderComponent
          onCreateClick={onCreateClick}
          onRefresh={jest.fn()}
        />
      </ThemeProvider>,
    )
    fireEvent.click(screen.getByText('Create Post'))
    expect(onCreateClick).toHaveBeenCalled()
  })

  it('should render header title', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminListHeaderComponent
          onCreateClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText('Blog Editor')).toBeTruthy()
  })
})

import { ThemeProvider } from '@mui/material/styles'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BLOG_TEST_THEME } from '../testing/blog-test.fixtures'
import '../testing/blog-test-setup'

import { BlogAdminListHeaderComponent } from './blog-admin-web-list-header.component'

describe('BlogAdminListHeaderComponent', () => {
  it('should render create post button', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
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
      <ThemeProvider theme={BLOG_TEST_THEME}>
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
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminListHeaderComponent
          onCreateClick={jest.fn()}
          onRefresh={jest.fn()}
        />
      </ThemeProvider>,
    )
    expect(screen.getByText('Blog Editor')).toBeTruthy()
  })
})

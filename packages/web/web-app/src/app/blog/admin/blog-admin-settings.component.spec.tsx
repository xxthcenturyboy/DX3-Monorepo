/**
 * Blog Admin Settings Component Tests
 */

import { ThemeProvider } from '@mui/material/styles'

import { BLOG_POST_STATUS } from '@dx3/models-shared'

import '../testing/blog-test-setup'
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import {
  BLOG_TEST_CATEGORIES,
  BLOG_TEST_TAGS,
  BLOG_TEST_THEME,
  DEFAULT_BLOG_EDITOR_SETTINGS,
} from '../testing/blog-test.fixtures'
import { BlogAdminSettingsComponent } from './blog-admin-settings.component'

const mockUpdatePostPassive = jest.fn().mockResolvedValue({})

jest.mock('../blog-web.api', () => ({
  useUpdateBlogPostPassiveMutation: () => [mockUpdatePostPassive, { isLoading: false }],
}))

describe('BlogAdminSettingsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render new post settings without slug field', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew
          postId={undefined}
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
    )

    expect(screen.queryByLabelText(/Slug/)).toBeNull()
    expect(screen.getByLabelText(/Excerpt/)).toBeTruthy()
    expect(screen.getByText(/Save post first/)).toBeTruthy()
  })

  it('should render slug field when not new post', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            ...DEFAULT_BLOG_EDITOR_SETTINGS,
            slug: 'my-post-slug',
          },
        },
      },
    )

    const slugInput = screen.getByLabelText(/Slug/)
    expect(slugInput).toBeTruthy()
    expect((slugInput as HTMLInputElement).value).toBe('my-post-slug')
  })

  it('should show unpublish to edit alert when post is published', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.PUBLISHED}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
    )

    expect(screen.getByText(/Unpublish to edit/)).toBeTruthy()
  })

  it('should show Publish Now and Schedule buttons for draft post', () => {
    const mockOnPublish = jest.fn()
    const mockOnSchedule = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          onPublishClick={mockOnPublish}
          onScheduleClick={mockOnSchedule}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
    )

    expect(screen.getByText('Publish Now')).toBeTruthy()
    expect(screen.getByText('Schedule Publish')).toBeTruthy()

    fireEvent.click(screen.getByText('Publish Now'))
    expect(mockOnPublish).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByText('Schedule Publish'))
    expect(mockOnSchedule).toHaveBeenCalledTimes(1)
  })

  it('should show Unpublish button for published post', () => {
    const mockOnUnpublish = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          onUnpublishClick={mockOnUnpublish}
          postId="post-1"
          postPublishedAt="2025-01-15"
          postStatus={BLOG_POST_STATUS.PUBLISHED}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
    )

    const unpublishBtn = screen.getByText('Unpublish')
    expect(unpublishBtn).toBeTruthy()
    fireEvent.click(unpublishBtn)
    expect(mockOnUnpublish).toHaveBeenCalledTimes(1)
  })

  it('should show Unschedule button for scheduled post', () => {
    const mockOnUnschedule = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          onUnscheduleClick={mockOnUnschedule}
          postId="post-1"
          postScheduledAt="2025-02-01"
          postStatus={BLOG_POST_STATUS.SCHEDULED}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
    )

    const unscheduleBtn = screen.getByText('Unschedule')
    expect(unscheduleBtn).toBeTruthy()
    fireEvent.click(unscheduleBtn)
    expect(mockOnUnschedule).toHaveBeenCalledTimes(1)
  })

  it('should dispatch settingsSet when slug input changes', () => {
    const { store } = renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            ...DEFAULT_BLOG_EDITOR_SETTINGS,
            slug: 'initial-slug',
          },
        },
      },
    )

    const slugInput = screen.getByLabelText(/Slug/)
    fireEvent.change(slugInput, { target: { value: 'updated-slug' } })

    const actions = store.getState()
    expect(actions.blogEditorSettings.slug).toBe('updated-slug')
  })

  it('should call onFeaturedImageClick when Set featured image clicked', () => {
    const mockOnFeaturedImage = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          onFeaturedImageClick={mockOnFeaturedImage}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: DEFAULT_BLOG_EDITOR_SETTINGS,
        },
      },
    )

    const setBtn = screen.getByText('Set featured image')
    fireEvent.click(setBtn)
    expect(mockOnFeaturedImage).toHaveBeenCalledTimes(1)
  })

  it('should render categories and tags autocomplete', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            ...DEFAULT_BLOG_EDITOR_SETTINGS,
            categories: ['cat-1'],
            tags: ['tag-1'],
          },
        },
      },
    )

    expect(screen.getByLabelText(/Categories/)).toBeTruthy()
    expect(screen.getByLabelText(/Tags/)).toBeTruthy()
  })

  it('should render anonymous toggle and SEO fields', () => {
    renderWithProviders(
      <ThemeProvider theme={BLOG_TEST_THEME}>
        <BlogAdminSettingsComponent
          categories={BLOG_TEST_CATEGORIES}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={BLOG_TEST_TAGS}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            ...DEFAULT_BLOG_EDITOR_SETTINGS,
            isAnonymous: true,
            seoDescription: 'Meta desc',
            seoTitle: 'SEO Title',
          },
        },
      },
    )

    expect(screen.getByText('Anonymous author')).toBeTruthy()
    expect((screen.getByLabelText(/SEO Title/) as HTMLInputElement).value).toBe('SEO Title')
    expect((screen.getByLabelText(/SEO Description/) as HTMLInputElement).value).toBe('Meta desc')
    expect(screen.getByLabelText(/Canonical URL/)).toBeTruthy()
  })
})

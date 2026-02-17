/**
 * Blog Admin Settings Component Tests
 */

import { BLOG_POST_STATUS } from '@dx3/models-shared'
import { createTheme, ThemeProvider } from '@mui/material/styles'

jest.mock('../../store/store-web.redux', () => ({
  store: {
    getState: () => ({
      i18n: { translations: {} },
    }),
  },
}))
import { fireEvent, screen } from '@testing-library/react'

import { renderWithProviders } from '../../../../testing-render'
import { BlogAdminSettingsComponent } from './blog-admin-settings.component'

jest.mock('../../config/config-web.service', () => ({
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}))

const mockUpdatePostPassive = jest.fn().mockResolvedValue({})

jest.mock('../blog-web.api', () => ({
  useUpdateBlogPostPassiveMutation: () => [
    mockUpdatePostPassive,
    { isLoading: false },
  ],
}))

jest.mock('../../i18n', () => ({
  useStrings: () => ({
    BLOG_ANONYMOUS: 'Anonymous author',
    BLOG_CANONICAL_URL: 'Canonical URL',
    BLOG_CANONICAL_URL_HELPER: 'Canonical URL helper',
    BLOG_CATEGORIES: 'Categories',
    BLOG_EXCERPT: 'Excerpt',
    BLOG_EXCERPT_HELPER: 'Excerpt helper',
    BLOG_FEATURED_IMAGE: 'Featured Image',
    BLOG_FEATURED_IMAGE_CHANGE: 'Change',
    BLOG_FEATURED_IMAGE_REMOVE: 'Remove',
    BLOG_FEATURED_IMAGE_SAVE_FIRST: 'Save post first',
    BLOG_FEATURED_IMAGE_SET: 'Set featured image',
    BLOG_PUBLISHING: 'Publishing',
    BLOG_PUBLISH_NOW: 'Publish Now',
    BLOG_SCHEDULE_PUBLISH: 'Schedule Publish',
    BLOG_SEO_DESCRIPTION: 'SEO Description',
    BLOG_SEO_TITLE: 'SEO Title',
    BLOG_SLUG_HELPER: 'URL slug helper',
    BLOG_TAGS: 'Tags',
    BLOG_UNPUBLISH: 'Unpublish',
    BLOG_UNPUBLISH_TO_EDIT: 'Unpublish to edit',
    BLOG_UNSCHEDULE: 'Unschedule',
    SLUG: 'Slug',
  }),
  useTranslation: () => (key: string) => key,
}))

const testTheme = createTheme()

const defaultCategories = [
  { id: 'cat-1', name: 'Category A', slug: 'category-a' },
  { id: 'cat-2', name: 'Category B', slug: 'category-b' },
]
const defaultTags = [
  { id: 'tag-1', name: 'Tag X', slug: 'tag-x' },
  { id: 'tag-2', name: 'Tag Y', slug: 'tag-y' },
]

describe('BlogAdminSettingsComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render new post settings without slug field', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew
          postId={undefined}
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    expect(screen.queryByLabelText(/Slug/)).toBeNull()
    expect(screen.getByLabelText(/Excerpt/)).toBeTruthy()
    expect(screen.getByText(/Save post first/)).toBeTruthy()
  })

  it('should render slug field when not new post', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            canonicalUrl: '',
            categories: [],
            excerpt: '',
            featuredImageId: '',
            isAnonymous: false,
            seoDescription: '',
            seoTitle: '',
            slug: 'my-post-slug',
            tags: [],
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.PUBLISHED}
          tags={defaultTags}
        />
      </ThemeProvider>,
    )

    expect(screen.getByText(/Unpublish to edit/)).toBeTruthy()
  })

  it('should show Publish Now and Schedule buttons for draft post', () => {
    const mockOnPublish = jest.fn()
    const mockOnSchedule = jest.fn()

    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          onPublishClick={mockOnPublish}
          onScheduleClick={mockOnSchedule}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          onUnpublishClick={mockOnUnpublish}
          postId="post-1"
          postPublishedAt="2025-01-15"
          postStatus={BLOG_POST_STATUS.PUBLISHED}
          tags={defaultTags}
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          onUnscheduleClick={mockOnUnschedule}
          postId="post-1"
          postScheduledAt="2025-02-01"
          postStatus={BLOG_POST_STATUS.SCHEDULED}
          tags={defaultTags}
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            canonicalUrl: '',
            categories: [],
            excerpt: '',
            featuredImageId: '',
            isAnonymous: false,
            seoDescription: '',
            seoTitle: '',
            slug: 'initial-slug',
            tags: [],
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          onFeaturedImageClick={mockOnFeaturedImage}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            canonicalUrl: '',
            categories: [],
            excerpt: '',
            featuredImageId: '',
            isAnonymous: false,
            seoDescription: '',
            seoTitle: '',
            slug: '',
            tags: [],
          },
        },
      },
    )

    const setBtn = screen.getByText('Set featured image')
    fireEvent.click(setBtn)
    expect(mockOnFeaturedImage).toHaveBeenCalledTimes(1)
  })

  it('should render categories and tags autocomplete', () => {
    renderWithProviders(
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            canonicalUrl: '',
            categories: ['cat-1'],
            excerpt: '',
            featuredImageId: '',
            isAnonymous: false,
            seoDescription: '',
            seoTitle: '',
            slug: '',
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
      <ThemeProvider theme={testTheme}>
        <BlogAdminSettingsComponent
          categories={defaultCategories}
          isNew={false}
          postId="post-1"
          postStatus={BLOG_POST_STATUS.DRAFT}
          tags={defaultTags}
        />
      </ThemeProvider>,
      {
        preloadedState: {
          blogEditorSettings: {
            canonicalUrl: '',
            categories: [],
            excerpt: '',
            featuredImageId: '',
            isAnonymous: true,
            seoDescription: 'Meta desc',
            seoTitle: 'SEO Title',
            slug: '',
            tags: [],
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

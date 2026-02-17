/**
 * Shared mock implementations for blog specs.
 * Use with jest.mock('path', () => require('./blog-test-mocks').MOCK_NAME)
 * or import and apply via blog-test-setup.
 */

/** Mutable override for store translations (e.g. schedule dialog needs BLOG_SCHEDULE_TZ_*) */
let storeTranslationsOverride: Record<string, string> = {}

/** Set store translations override. Call in beforeEach for specs that need specific translations. */
export const setStoreTranslations = (translations: Record<string, string>): void => {
  storeTranslationsOverride = translations
}

/** Clear store translations override. Call in afterEach when using setStoreTranslations. */
export const clearStoreTranslations = (): void => {
  storeTranslationsOverride = {}
}

/** Store mock - uses BLOG_I18N_STRINGS as base; storeTranslationsOverride overrides (for schedule dialog etc.) */
export const createStoreMock = () => ({
  store: {
    getState: () => ({
      i18n: { translations: { ...BLOG_I18N_STRINGS, ...storeTranslationsOverride } },
    }),
  },
})

/** All blog-related i18n keys used across specs */
const BLOG_I18N_STRINGS: Record<string, string> = {
  ALIGN_CENTER: 'Center',
  ALIGN_LEFT: 'Left',
  ALIGN_RIGHT: 'Right',
  ALL: 'All',
  BLOG: 'Blog',
  BLOG_ANONYMOUS: 'Anonymous author',
  BLOG_CANONICAL_URL: 'Canonical URL',
  BLOG_CANONICAL_URL_HELPER: 'Canonical URL helper',
  BLOG_CATEGORIES: 'Categories',
  BLOG_CREATE_POST: 'Create Post',
  BLOG_DATE_CREATED: 'Created',
  BLOG_DATE_PUBLISHED: 'Published',
  BLOG_DISCARD_CHANGES_CONFIRM: 'Discard changes?',
  BLOG_EDIT_POST_TITLE: 'Edit Post',
  BLOG_EDITOR_MENU: 'Blog Editor',
  BLOG_EDITOR_TITLE: 'Blog Editor',
  BLOG_EXCERPT: 'Excerpt',
  BLOG_EXCERPT_HELPER: 'Excerpt helper',
  BLOG_FEATURED_IMAGE: 'Featured image',
  BLOG_FEATURED_IMAGE_CHANGE: 'Change',
  BLOG_FEATURED_IMAGE_REMOVE: 'Remove',
  BLOG_FEATURED_IMAGE_SAVE_FIRST: 'Save post first',
  BLOG_FEATURED_IMAGE_SET: 'Set featured image',
  BLOG_IMAGE_UPLOAD_SAVE_POST_FIRST: 'Save post first',
  BLOG_INSERT_IMAGE: 'Insert Image',
  BLOG_INSERT_PDF: 'Insert PDF',
  BLOG_LOADING: 'Loading',
  BLOG_NEW_POST_TITLE: 'New Post',
  BLOG_NO_POSTS: 'No posts yet',
  BLOG_PAGE_TITLE: 'Latest posts',
  BLOG_PDF_UPLOAD_SAVE_POST_FIRST: 'Save post first',
  BLOG_POST_NOT_FOUND: 'Post not found',
  BLOG_PUBLISH: 'Publish',
  BLOG_PUBLISH_CONFIRM: 'Publish this post?',
  BLOG_PUBLISH_NOW: 'Publish Now',
  BLOG_PUBLISHING: 'Publishing',
  BLOG_READ_MORE: 'Read more',
  BLOG_READING_TIME_MIN: 'min read',
  BLOG_RELATED_POSTS: 'Related posts',
  BLOG_SCHEDULE: 'Schedule',
  BLOG_SCHEDULE_DATE: 'Date & Time',
  BLOG_SCHEDULE_IN_YOUR_TZ: 'In your timezone: {time}',
  BLOG_SCHEDULE_POST: 'Post',
  BLOG_SCHEDULE_PUBLISH: 'Schedule Publish',
  BLOG_SCHEDULE_TIMEZONE: 'Timezone',
  BLOG_SEO_DESCRIPTION: 'SEO Description',
  BLOG_SEO_TITLE: 'SEO Title',
  BLOG_SETTINGS: 'Settings',
  BLOG_SETTINGS_BUTTON: 'Settings',
  BLOG_SLUG_HELPER: 'URL slug helper',
  BLOG_STATUS_ARCHIVED: 'Archived',
  BLOG_STATUS_DRAFT: 'Draft',
  BLOG_STATUS_PUBLISHED: 'Published',
  BLOG_STATUS_SCHEDULED: 'Scheduled',
  BLOG_STATUS_UNPUBLISHED: 'Unpublished',
  BLOG_TAGS: 'Tags',
  BLOG_TOOLTIP_PUBLISH: 'Publish now',
  BLOG_TOOLTIP_SCHEDULE: 'Schedule for later',
  BLOG_TOOLTIP_UNPUBLISH: 'Unpublish',
  BLOG_TOOLTIP_UNSCHEDULE: 'Unschedule',
  BLOG_UNPUBLISH: 'Unpublish',
  BLOG_UNPUBLISH_CONFIRM: 'Unpublish this post?',
  BLOG_UNPUBLISH_TO_EDIT: 'Unpublish to edit',
  BLOG_UNSCHEDULE: 'Unschedule',
  BLOG_UNSCHEDULE_CONFIRM: 'Unschedule this post?',
  BLOG_UPLOAD_FEATURED_IMAGE: 'Featured Image',
  CANCEL: 'Cancel',
  CANCELING: 'Canceling',
  CLOSE: 'Close',
  CONFIRM: 'Confirm',
  CREATE: 'Create',
  DISCARD: 'Discard',
  IMAGE_ALIGN_CENTER: 'Center',
  IMAGE_ALIGN_LEFT: 'Left',
  IMAGE_ALIGN_RIGHT: 'Right',
  IMAGE_EDIT_ALIGNMENT: 'Alignment',
  IMAGE_EDIT_ALT: 'Alt text',
  IMAGE_EDIT_DIALOG_TITLE: 'Edit Image',
  IMAGE_EDIT_TITLE: 'Title',
  IMAGE_EDIT_USE_TOOLBAR: 'Use toolbar to add images',
  LINK_EDIT_ANCHOR_TEXT: 'Anchor text',
  LINK_EDIT_ANCHOR_TEXT_PLACEHOLDER: 'Link text',
  LINK_EDIT_COPIED: 'Copied',
  LINK_EDIT_COPY_TO_CLIPBOARD: 'Copy',
  LINK_EDIT_REMOVE_LINK: 'Remove link',
  LINK_EDIT_TITLE: 'Title',
  LINK_EDIT_TITLE_PLACEHOLDER: 'Link title',
  LINK_EDIT_URL: 'URL',
  LINK_EDIT_URL_PLACEHOLDER: 'https://',
  PREVIEW: 'Preview',
  PREVIEW_NOT_PUBLISHED: 'This post is not yet published',
  SAVE: 'Save',
  SLUG: 'Slug',
  STATUS: 'Status',
  TITLE: 'Title',
  TOOLTIP_REFRESH_LIST: 'Refresh list',
}

/**
 * Creates i18n mock. Merge overrides for spec-specific strings.
 */
export const createI18nMock = (overrides: Record<string, string> = {}) => ({
  useStrings: () => ({ ...BLOG_I18N_STRINGS, ...overrides }),
  useTranslation: () => (key: string) => key,
})

/** Config mock for WebConfigService */
export const BLOG_CONFIG_MOCK = {
  WebConfigService: {
    getWebUrls: () => ({
      API_URL: 'http://test.api',
      WEB_APP_URL: 'http://test.app',
    }),
  },
}

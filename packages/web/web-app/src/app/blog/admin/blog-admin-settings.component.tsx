import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import * as React from 'react'

import {
  BLOG_POST_STATUS,
  type BlogCategoryType,
  type BlogTagType,
  MEDIA_VARIANTS,
} from '@dx3/models-shared'
import { slugify } from '@dx3/utils-shared'
import { debounce } from '@dx3/web-libs/utils/debounce'

import { WebConfigService } from '../../config/config-web.service'
import { useStrings, useTranslation } from '../../i18n'
import { getPublicMediaUrl } from '../../media/media-web.util'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { useUpdateBlogPostPassiveMutation } from '../blog-web.api'
import { selectBlogEditorSettings } from './blog-admin-web.selectors'
import type { BlogEditorSettingsType } from './blog-admin-web.types'
import { blogEditorSettingsActions } from './blog-admin-web-settings.reducer'

export type BlogAdminSettingsComponentPropsType = {
  categories: BlogCategoryType[]
  isDirty?: boolean
  isMobileWidth?: boolean
  isNew?: boolean
  isSaving?: boolean
  onFeaturedImageClick?: () => void
  onPublishClick?: () => void
  onScheduleClick?: () => void
  onUnpublishClick?: () => void
  onUnscheduleClick?: () => void
  postId?: string
  postPublishedAt?: Date | string | null
  postScheduledAt?: Date | string | null
  postStatus?: string
  postTitle?: string
  tags: BlogTagType[]
}

/**
 * Post settings panel: slug, excerpt, categories, tags, anonymous toggle, SEO fields.
 * Renders on the edit post page. State is in Redux (blogEditor.settings).
 */
export const BlogAdminSettingsComponent: React.FC<BlogAdminSettingsComponentPropsType> = ({
  categories,
  isDirty = false,
  isMobileWidth = false,
  isNew = false,
  isSaving = false,
  onFeaturedImageClick,
  onPublishClick,
  onScheduleClick,
  onUnpublishClick,
  onUnscheduleClick,
  postId,
  postPublishedAt,
  postScheduledAt,
  postStatus,
  postTitle,
  tags,
}) => {
  const dispatch = useAppDispatch()
  const [updatePostPassive, { isLoading: isSettingsSaving }] = useUpdateBlogPostPassiveMutation()
  const settings = useAppSelector(selectBlogEditorSettings)
  const isInitialSettingsLoad = React.useRef(true)
  const t = useTranslation()
  const isReadOnly = postStatus === BLOG_POST_STATUS.PUBLISHED
  const isDisabled = isReadOnly || isSaving

  const debouncedAutoSave = React.useMemo(
    () =>
      debounce(async (currentSettings: BlogEditorSettingsType) => {
        if (!postId) return
        try {
          const slugifiedSlug = currentSettings.slug
            ? slugify(currentSettings.slug).trim() || undefined
            : undefined
          await updatePostPassive({
            id: postId,
            payload: {
              canonicalUrl: currentSettings.canonicalUrl || null,
              categories: currentSettings.categories,
              excerpt: currentSettings.excerpt || null,
              featuredImageId: currentSettings.featuredImageId || null,
              isAnonymous: currentSettings.isAnonymous,
              seoDescription: currentSettings.seoDescription || null,
              seoTitle: currentSettings.seoTitle || null,
              slug: slugifiedSlug,
              tags: currentSettings.tags,
            },
          }).unwrap()
          if (slugifiedSlug) {
            dispatch(blogEditorSettingsActions.settingsSet({ slug: slugifiedSlug }))
          }
        } catch {
          // Error handled by RTK Query / toast
        }
      }, 800),
    [dispatch, postId, updatePostPassive],
  )

  React.useEffect(() => {
    if (isNew || !postId || isReadOnly) return
    if (isInitialSettingsLoad.current) {
      isInitialSettingsLoad.current = false
      return
    }
    debouncedAutoSave(settings)
    return () => debouncedAutoSave.cancel()
  }, [debouncedAutoSave, isNew, isReadOnly, postId, settings])

  React.useEffect(() => {
    isInitialSettingsLoad.current = true
  }, [postId])

  const strings = useStrings([
    'BLOG_ANONYMOUS',
    'BLOG_CANONICAL_URL',
    'BLOG_CANONICAL_URL_HELPER',
    'BLOG_CATEGORIES',
    'BLOG_EXCERPT',
    'BLOG_EXCERPT_HELPER',
    'BLOG_FEATURED_IMAGE',
    'BLOG_FEATURED_IMAGE_CHANGE',
    'BLOG_FEATURED_IMAGE_REMOVE',
    'BLOG_FEATURED_IMAGE_SAVE_FIRST',
    'BLOG_FEATURED_IMAGE_SET',
    'BLOG_PUBLISHING',
    'BLOG_PUBLISH_NOW',
    'BLOG_SCHEDULE_PUBLISH',
    'BLOG_SEO_DESCRIPTION',
    'BLOG_SEO_TITLE',
    'BLOG_SLUG_HELPER',
    'BLOG_TAGS',
    'BLOG_UNPUBLISH',
    'BLOG_UNPUBLISH_TO_EDIT',
    'BLOG_UNSCHEDULE',
    'SLUG',
  ])

  const categoryOptions = React.useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name })),
    [categories],
  )
  const tagOptions = React.useMemo(() => tags.map((t) => ({ id: t.id, label: t.name })), [tags])

  const selectedCategories = React.useMemo(() => {
    return settings.categories.map((c) => {
      const found = categoryOptions.find((opt) => opt.id === c)
      return found ?? { id: c, label: c }
    })
  }, [categoryOptions, settings.categories])
  const selectedTags = React.useMemo(() => {
    return settings.tags.map((t) => {
      const found = tagOptions.find((opt) => opt.id === t)
      return found ?? { id: t, label: t }
    })
  }, [settings.tags, tagOptions])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 280,
      }}
    >
      {isReadOnly && (
        <Alert
          severity="info"
          sx={{ marginBottom: 0 }}
        >
          {strings.BLOG_UNPUBLISH_TO_EDIT}
        </Alert>
      )}
      {!isNew && (
        <TextField
          disabled={isDisabled || isSettingsSaving}
          fullWidth
          helperText={strings.BLOG_SLUG_HELPER}
          label={strings.SLUG}
          onChange={(e) =>
            dispatch(blogEditorSettingsActions.settingsSet({ slug: e.target.value }))
          }
          size="small"
          value={settings.slug}
          variant="outlined"
        />
      )}

      <TextField
        disabled={isDisabled}
        fullWidth
        helperText={strings.BLOG_EXCERPT_HELPER}
        label={strings.BLOG_EXCERPT}
        maxRows={3}
        multiline
        onChange={(e) =>
          dispatch(blogEditorSettingsActions.settingsSet({ excerpt: e.target.value }))
        }
        size="small"
        value={settings.excerpt}
        variant="outlined"
      />

      <Box>
        <Typography
          color="text.secondary"
          component="label"
          sx={{ display: 'block', fontSize: '0.875rem', marginBottom: 0.5 }}
        >
          {strings.BLOG_FEATURED_IMAGE}
        </Typography>
        {!postId || isNew ? (
          <Typography
            color="text.disabled"
            sx={{ fontSize: '0.875rem' }}
            variant="body2"
          >
            {strings.BLOG_FEATURED_IMAGE_SAVE_FIRST}
          </Typography>
        ) : settings.featuredImageId ? (
          <Box
            sx={{
              alignItems: 'flex-start',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            <Box
              alt=""
              component="img"
              src={getPublicMediaUrl(
                WebConfigService.getWebUrls().API_URL,
                settings.featuredImageId,
                MEDIA_VARIANTS.MEDIUM,
              )}
              sx={{
                borderRadius: 1,
                maxHeight: 120,
                maxWidth: '100%',
                objectFit: 'cover',
              }}
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                disabled={isDisabled}
                onClick={onFeaturedImageClick}
                size="small"
                variant="outlined"
              >
                {strings.BLOG_FEATURED_IMAGE_CHANGE}
              </Button>
              <Button
                disabled={isDisabled}
                onClick={() =>
                  dispatch(blogEditorSettingsActions.settingsSet({ featuredImageId: '' }))
                }
                size="small"
                variant="outlined"
              >
                {strings.BLOG_FEATURED_IMAGE_REMOVE}
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            disabled={isDisabled}
            onClick={onFeaturedImageClick}
            size="small"
            variant="outlined"
          >
            {strings.BLOG_FEATURED_IMAGE_SET}
          </Button>
        )}
      </Box>

      <Autocomplete
        disabled={isDisabled}
        freeSolo
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
        isOptionEqualToValue={(opt, val) =>
          (typeof opt === 'string' ? opt : opt.id) === (typeof val === 'string' ? val : val.id)
        }
        multiple
        onChange={(_, value) =>
          dispatch(
            blogEditorSettingsActions.settingsSet({
              categories: value.map((v) => (typeof v === 'string' ? v : v.id)),
            }),
          )
        }
        options={categoryOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label={strings.BLOG_CATEGORIES}
            size="small"
          />
        )}
        size="small"
        value={selectedCategories}
      />

      <Autocomplete
        disabled={isDisabled}
        freeSolo
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
        isOptionEqualToValue={(opt, val) =>
          (typeof opt === 'string' ? opt : opt.id) === (typeof val === 'string' ? val : val.id)
        }
        multiple
        onChange={(_, value) =>
          dispatch(
            blogEditorSettingsActions.settingsSet({
              tags: value.map((v) => (typeof v === 'string' ? v : v.id)),
            }),
          )
        }
        options={tagOptions}
        renderInput={(params) => (
          <TextField
            {...params}
            label={strings.BLOG_TAGS}
            size="small"
          />
        )}
        size="small"
        value={selectedTags}
      />

      <FormControlLabel
        control={
          <Switch
            checked={settings.isAnonymous}
            color="primary"
            disabled={isDisabled}
            onChange={(_, checked) =>
              dispatch(blogEditorSettingsActions.settingsSet({ isAnonymous: checked }))
            }
          />
        }
        label={strings.BLOG_ANONYMOUS}
      />

      <TextField
        disabled={isDisabled}
        fullWidth
        helperText="Defaults to post title"
        label={strings.BLOG_SEO_TITLE}
        onChange={(e) =>
          dispatch(blogEditorSettingsActions.settingsSet({ seoTitle: e.target.value }))
        }
        placeholder={strings.BLOG_SEO_TITLE}
        size="small"
        value={settings.seoTitle}
        variant="outlined"
      />

      <TextField
        disabled={isDisabled}
        fullWidth
        helperText="Meta description for search results (~160 chars)"
        inputProps={{ maxLength: 165 }}
        label={strings.BLOG_SEO_DESCRIPTION}
        maxRows={2}
        multiline
        onChange={(e) =>
          dispatch(
            blogEditorSettingsActions.settingsSet({
              seoDescription: e.target.value,
            }),
          )
        }
        size="small"
        value={settings.seoDescription}
        variant="outlined"
      />

      <TextField
        disabled={isDisabled}
        fullWidth
        helperText={strings.BLOG_CANONICAL_URL_HELPER}
        label={strings.BLOG_CANONICAL_URL}
        onChange={(e) =>
          dispatch(
            blogEditorSettingsActions.settingsSet({
              canonicalUrl: e.target.value,
            }),
          )
        }
        placeholder="https://example.com/blog/my-post"
        size="small"
        value={settings.canonicalUrl}
        variant="outlined"
      />

      {!isNew &&
        postId &&
        (postStatus === BLOG_POST_STATUS.DRAFT ||
          postStatus === BLOG_POST_STATUS.PUBLISHED ||
          postStatus === BLOG_POST_STATUS.SCHEDULED ||
          postStatus === BLOG_POST_STATUS.UNPUBLISHED) && (
          <Box
            sx={{
              borderColor: 'divider',
              borderTop: '1px solid',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              paddingTop: 2,
            }}
          >
            <Typography
              color="text.secondary"
              component="h3"
              sx={{
                fontSize: '1rem',
                fontWeight: 700,
                textAlign: 'center',
                textTransform: 'uppercase',
              }}
              variant="overline"
            >
              {strings.BLOG_PUBLISHING}
            </Typography>
            {postStatus === BLOG_POST_STATUS.SCHEDULED && postScheduledAt && (
              <Alert
                severity="info"
                sx={{ marginBottom: 0 }}
              >
                {t('BLOG_SCHEDULED_TO_POST_ON', {
                  date: dayjs(postScheduledAt).format('LL'),
                })}
              </Alert>
            )}
            {postStatus === BLOG_POST_STATUS.PUBLISHED && postPublishedAt && (
              <>
                <Alert
                  severity="success"
                  sx={{ marginBottom: 0 }}
                >
                  {t('BLOG_PUBLISHED_ON', {
                    date: dayjs(postPublishedAt).format('LL'),
                  })}
                </Alert>
                <Button
                  disabled={isDirty || isSaving}
                  fullWidth
                  onClick={onUnpublishClick}
                  size={isMobileWidth ? 'medium' : 'small'}
                  sx={isMobileWidth ? { minHeight: 48, padding: '12px 16px' } : undefined}
                  variant="outlined"
                >
                  {strings.BLOG_UNPUBLISH}
                </Button>
              </>
            )}
            {postStatus === BLOG_POST_STATUS.UNPUBLISHED && postPublishedAt && (
              <Alert
                severity="error"
                sx={{ marginBottom: 0 }}
              >
                {t('BLOG_UNPUBLISHED_PREVIOUSLY_ON', {
                  date: dayjs(postPublishedAt).format('LL'),
                })}
              </Alert>
            )}
            {(postStatus === BLOG_POST_STATUS.DRAFT ||
              postStatus === BLOG_POST_STATUS.UNPUBLISHED) && (
              <>
                <Button
                  disabled={isDirty || isSaving}
                  fullWidth
                  onClick={onPublishClick}
                  size={isMobileWidth ? 'medium' : 'small'}
                  sx={isMobileWidth ? { minHeight: 48, padding: '12px 16px' } : undefined}
                  variant="contained"
                >
                  {strings.BLOG_PUBLISH_NOW}
                </Button>
                <Button
                  disabled={isDirty || isSaving}
                  fullWidth
                  onClick={onScheduleClick}
                  size={isMobileWidth ? 'medium' : 'small'}
                  sx={isMobileWidth ? { minHeight: 48, padding: '12px 16px' } : undefined}
                  variant="outlined"
                >
                  {strings.BLOG_SCHEDULE_PUBLISH}
                </Button>
              </>
            )}
            {postStatus === BLOG_POST_STATUS.SCHEDULED && (
              <Button
                disabled={isDirty || isSaving}
                fullWidth
                onClick={onUnscheduleClick}
                size={isMobileWidth ? 'medium' : 'small'}
                sx={isMobileWidth ? { minHeight: 48, padding: '12px 16px' } : undefined}
                variant="outlined"
              >
                {strings.BLOG_UNSCHEDULE}
              </Button>
            )}
          </Box>
        )}
    </Box>
  )
}

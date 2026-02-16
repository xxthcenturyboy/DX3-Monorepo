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

import { BLOG_POST_STATUS, type BlogCategoryType, type BlogTagType } from '@dx3/models-shared'

import { useStrings, useTranslation } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { blogEditorActions } from './blog-admin-web.reducer'
import { selectBlogEditorSettings } from './blog-admin-web.selectors'

export type BlogAdminSettingsComponentPropsType = {
  categories: BlogCategoryType[]
  isDirty?: boolean
  isMobileWidth?: boolean
  isNew?: boolean
  isSaving?: boolean
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
export const BlogAdminSettingsComponent: React.FC<
  BlogAdminSettingsComponentPropsType
> = ({
  categories,
  isDirty = false,
  isMobileWidth = false,
  isNew = false,
  isSaving = false,
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
  const settings = useAppSelector(selectBlogEditorSettings)
  const t = useTranslation()

  const strings = useStrings([
    'BLOG_ANONYMOUS',
    'BLOG_CANONICAL_URL',
    'BLOG_CATEGORIES',
    'BLOG_EXCERPT',
    'BLOG_EXCERPT_HELPER',
    'BLOG_PUBLISHING',
    'BLOG_PUBLISH_NOW',
    'BLOG_SCHEDULE_PUBLISH',
    'BLOG_SEO_DESCRIPTION',
    'BLOG_SEO_TITLE',
    'BLOG_SLUG_HELPER',
    'BLOG_TAGS',
    'BLOG_UNPUBLISH',
    'BLOG_UNSCHEDULE',
    'SLUG',
  ])

  const categoryOptions = React.useMemo(
    () => categories.map((c) => ({ id: c.id, label: c.name })),
    [categories],
  )
  const tagOptions = React.useMemo(
    () => tags.map((t) => ({ id: t.id, label: t.name })),
    [tags],
  )

  const selectedCategories = React.useMemo(
    () =>
      categoryOptions.filter((opt) => settings.categories.includes(opt.id)),
    [categoryOptions, settings.categories],
  )
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
      {!isNew && (
        <TextField
          fullWidth
          helperText={strings.BLOG_SLUG_HELPER}
          label={strings.SLUG}
          onChange={(e) =>
            dispatch(blogEditorActions.settingsSet({ slug: e.target.value }))
          }
          size="small"
          value={settings.slug}
          variant="outlined"
        />
      )}

      <TextField
        fullWidth
        helperText={strings.BLOG_EXCERPT_HELPER}
        label={strings.BLOG_EXCERPT}
        maxRows={3}
        multiline
        onChange={(e) =>
          dispatch(blogEditorActions.settingsSet({ excerpt: e.target.value }))
        }
        size="small"
        value={settings.excerpt}
        variant="outlined"
      />

      <Autocomplete
        getOptionLabel={(opt) => opt.label}
        isOptionEqualToValue={(opt, val) => opt.id === val.id}
        multiple
        onChange={(_, value) =>
          dispatch(
            blogEditorActions.settingsSet({
              categories: value.map((v) => v.id),
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
        freeSolo
        getOptionLabel={(opt) => (typeof opt === 'string' ? opt : opt.label)}
        isOptionEqualToValue={(opt, val) =>
          (typeof opt === 'string' ? opt : opt.id) ===
          (typeof val === 'string' ? val : val.id)
        }
        multiple
        onChange={(_, value) =>
          dispatch(
            blogEditorActions.settingsSet({
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
            onChange={(_, checked) =>
              dispatch(blogEditorActions.settingsSet({ isAnonymous: checked }))
            }
          />
        }
        label={strings.BLOG_ANONYMOUS}
      />

      <TextField
        fullWidth
        helperText="Defaults to post title"
        label={strings.BLOG_SEO_TITLE}
        onChange={(e) =>
          dispatch(
            blogEditorActions.settingsSet({ seoTitle: e.target.value }),
          )
        }
        placeholder={strings.BLOG_SEO_TITLE}
        size="small"
        value={settings.seoTitle}
        variant="outlined"
      />

      <TextField
        fullWidth
        helperText="Meta description for search results (~160 chars)"
        inputProps={{ maxLength: 165 }}
        label={strings.BLOG_SEO_DESCRIPTION}
        maxRows={2}
        multiline
        onChange={(e) =>
          dispatch(
            blogEditorActions.settingsSet({ seoDescription: e.target.value }),
          )
        }
        size="small"
        value={settings.seoDescription}
        variant="outlined"
      />

      <TextField
        fullWidth
        helperText="Optional, for cross-posting / syndication"
        label={strings.BLOG_CANONICAL_URL}
        onChange={(e) =>
          dispatch(
            blogEditorActions.settingsSet({ canonicalUrl: e.target.value }),
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
            borderTop: '1px solid',
            borderColor: 'divider',
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
          {postStatus === BLOG_POST_STATUS.SCHEDULED &&
            postScheduledAt && (
              <Alert
                severity="info"
                sx={{ marginBottom: 0 }}
              >
                {t('BLOG_SCHEDULED_TO_POST_ON', {
                  date: dayjs(postScheduledAt).format('LL'),
                })}
              </Alert>
            )}
          {postStatus === BLOG_POST_STATUS.PUBLISHED &&
            postPublishedAt && (
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
                  sx={
                    isMobileWidth
                      ? { minHeight: 48, padding: '12px 16px' }
                      : undefined
                  }
                  variant="outlined"
                >
                  {strings.BLOG_UNPUBLISH}
                </Button>
              </>
            )}
          {postStatus === BLOG_POST_STATUS.UNPUBLISHED &&
            postPublishedAt && (
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
                sx={
                  isMobileWidth
                    ? { minHeight: 48, padding: '12px 16px' }
                    : undefined
                }
                variant="contained"
              >
                {strings.BLOG_PUBLISH_NOW}
              </Button>
              <Button
                disabled={isDirty || isSaving}
                fullWidth
                onClick={onScheduleClick}
                size={isMobileWidth ? 'medium' : 'small'}
                sx={
                  isMobileWidth
                    ? { minHeight: 48, padding: '12px 16px' }
                    : undefined
                }
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
              sx={
                isMobileWidth
                  ? { minHeight: 48, padding: '12px 16px' }
                  : undefined
              }
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

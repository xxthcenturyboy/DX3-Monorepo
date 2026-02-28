import Close from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import * as React from 'react'
import { createPortal } from 'react-dom'

import { ConfirmationDialog } from '@dx3/web-libs/ui/dialog/confirmation.dialog'
import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'
import { MODAL_ROOT_ELEM_ID } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../../i18n'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import {
  usePublishBlogPostMutation,
  useUnpublishBlogPostMutation,
  useUnscheduleBlogPostMutation,
} from '../blog-web.api'
import {
  BlogAdminSettingsComponent,
  type BlogAdminSettingsComponentPropsType,
} from './blog-admin-settings.component'
import { selectBlogEditorIsDirty } from './blog-admin-web.selectors'
import { BlogScheduleDialogComponent } from './blog-schedule-dialog.component'

export type BlogAdminSettingsDrawerPropsType = BlogAdminSettingsComponentPropsType & {
  isSaving?: boolean
  onClose: () => void
  onFeaturedImageClick?: () => void
  onPublishSuccess?: () => void
  onScheduleSuccess?: () => void
  onUnpublishSuccess?: () => void
  onUnscheduleSuccess?: () => void
  open: boolean
}

const DRAWER_WIDTH_DESKTOP = 360
const DRAWER_HEIGHT_MOBILE_PERCENT = 96

/**
 * Fly-in drawer for post settings. Right-side on desktop, bottom sheet on mobile.
 * Triggered by a floating gear button on the right edge of the screen.
 */
export const BlogAdminSettingsDrawerComponent: React.FC<BlogAdminSettingsDrawerPropsType> = ({
  categories,
  isNew,
  isSaving = false,
  onClose,
  onFeaturedImageClick,
  onPublishSuccess,
  onScheduleSuccess,
  onUnpublishSuccess,
  onUnscheduleSuccess,
  open,
  postId,
  postPublishedAt,
  postScheduledAt,
  postStatus,
  postTitle = '',
  tags,
}) => {
  const isDirty = useAppSelector(selectBlogEditorIsDirty)
  const theme = useTheme()
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('md'))
  const anchor = isMobileWidth ? 'bottom' : 'right'

  const strings = useStrings([
    'BLOG_PUBLISH',
    'BLOG_PUBLISH_CONFIRM',
    'BLOG_PUBLISH_NOW',
    'BLOG_SETTINGS',
    'BLOG_UNPUBLISH',
    'BLOG_UNPUBLISH_CONFIRM',
    'BLOG_UNSCHEDULE',
    'BLOG_UNSCHEDULE_CONFIRM',
    'CANCEL',
    'CANCELING',
    'CLOSE',
  ])

  const [publishPost] = usePublishBlogPostMutation()
  const [unpublishPost] = useUnpublishBlogPostMutation()
  const [unschedulePost] = useUnscheduleBlogPostMutation()

  const [publishConfirmOpen, setPublishConfirmOpen] = React.useState(false)
  const [unpublishConfirmOpen, setUnpublishConfirmOpen] = React.useState(false)
  const [publishConfirmView, setPublishConfirmView] = React.useState<'confirm' | 'success'>(
    'confirm',
  )
  const [scheduleDialogOpen, setScheduleDialogOpen] = React.useState(false)
  const [unscheduleConfirmOpen, setUnscheduleConfirmOpen] = React.useState(false)

  const handlePublishConfirm = React.useCallback(
    async (confirmed: boolean) => {
      if (!confirmed) {
        setPublishConfirmOpen(false)
        return
      }
      if (!postId) return
      try {
        await publishPost(postId).unwrap()
        setPublishConfirmView('success')
      } catch {
        // Error handled by RTK Query / toast
      }
    },
    [postId, publishPost],
  )
  const handlePublishSuccessLottieComplete = React.useCallback(() => {
    setPublishConfirmOpen(false)
    setPublishConfirmView('confirm')
    onPublishSuccess?.()
  }, [onPublishSuccess])
  const handleScheduleClose = React.useCallback(() => {
    setScheduleDialogOpen(false)
  }, [])
  const handleUnpublishConfirm = React.useCallback(
    async (confirmed: boolean) => {
      setUnpublishConfirmOpen(false)
      if (confirmed && postId) {
        try {
          await unpublishPost(postId).unwrap()
          onClose()
          onUnpublishSuccess?.()
        } catch {
          // Error handled by RTK Query / toast
        }
      }
    },
    [onClose, onUnpublishSuccess, postId, unpublishPost],
  )
  const handleUnpublishClose = React.useCallback(() => {
    setUnpublishConfirmOpen(false)
  }, [])
  const handleUnscheduleConfirm = React.useCallback(
    async (confirmed: boolean) => {
      setUnscheduleConfirmOpen(false)
      if (confirmed && postId) {
        try {
          await unschedulePost(postId).unwrap()
          onClose()
          onUnscheduleSuccess?.()
        } catch {
          // Error handled by RTK Query / toast
        }
      }
    },
    [onClose, onUnscheduleSuccess, postId, unschedulePost],
  )
  const handleUnscheduleClose = React.useCallback(() => {
    setUnscheduleConfirmOpen(false)
  }, [])

  const handleScheduleSuccess = React.useCallback(() => {
    setScheduleDialogOpen(false)
    onClose()
    onScheduleSuccess?.()
  }, [onClose, onScheduleSuccess])

  return (
    <>
      <Drawer
        anchor={anchor}
        onClose={onClose}
        open={open}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            height: isMobileWidth ? `${DRAWER_HEIGHT_MOBILE_PERCENT}%` : '100%',
            maxHeight: '100%',
            padding: 2,
            width: isMobileWidth ? '100%' : DRAWER_WIDTH_DESKTOP,
            ...(isMobileWidth && {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
            }),
          },
          zIndex: 1300,
        }}
        transitionDuration={{ enter: 300, exit: 250 }}
        variant="temporary"
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              alignItems: 'center',
              display: 'flex',
              flexShrink: 0,
              marginBottom: 2,
            }}
          >
            <Box sx={{ flexShrink: 0, width: 40 }} />
            <Typography
              component="h2"
              sx={{ flex: 1, textAlign: 'center' }}
              variant="h6"
            >
              {strings.BLOG_SETTINGS}
            </Typography>
            <IconButton
              aria-label={strings.CLOSE}
              onClick={onClose}
              size="small"
              sx={{ flexShrink: 0 }}
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              paddingBottom: isMobileWidth ? 6 : 2,
              paddingTop: 2,
            }}
          >
            <BlogAdminSettingsComponent
              categories={categories}
              isDirty={isDirty}
              isMobileWidth={isMobileWidth}
              isNew={isNew}
              isSaving={isSaving}
              onFeaturedImageClick={onFeaturedImageClick}
              onPublishClick={() => {
                onClose()
                setPublishConfirmOpen(true)
              }}
              onScheduleClick={() => {
                onClose()
                setScheduleDialogOpen(true)
              }}
              onUnpublishClick={() => {
                onClose()
                setUnpublishConfirmOpen(true)
              }}
              onUnscheduleClick={() => {
                onClose()
                setUnscheduleConfirmOpen(true)
              }}
              postId={postId}
              postPublishedAt={postPublishedAt}
              postScheduledAt={postScheduledAt}
              postStatus={postStatus}
              postTitle={postTitle}
              tags={tags}
            />
          </Box>
        </Box>
      </Drawer>

      <BlogScheduleDialogComponent
        onClose={handleScheduleClose}
        onSuccess={handleScheduleSuccess}
        open={scheduleDialogOpen}
        postId={postId ?? null}
        postTitle={postTitle}
      />

      {createPortal(
        <CustomDialog
          body={
            publishConfirmView === 'success' ? (
              <SuccessLottie complete={handlePublishSuccessLottieComplete} />
            ) : (
              <ConfirmationDialog
                bodyMessage={strings.BLOG_PUBLISH_CONFIRM}
                cancellingText={strings.CANCELING}
                cancelText={strings.CANCEL}
                noAwait
                okText={strings.BLOG_PUBLISH_NOW}
                onComplete={handlePublishConfirm}
              />
            )
          }
          closeDialog={() => {
            setPublishConfirmOpen(false)
            setPublishConfirmView('confirm')
          }}
          isMobileWidth={isMobileWidth}
          open={publishConfirmOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}

      {createPortal(
        <CustomDialog
          body={
            <ConfirmationDialog
              bodyMessage={strings.BLOG_UNPUBLISH_CONFIRM}
              cancellingText={strings.CANCELING}
              cancelText={strings.CANCEL}
              okText={strings.BLOG_UNPUBLISH}
              onComplete={handleUnpublishConfirm}
            />
          }
          closeDialog={handleUnpublishClose}
          isMobileWidth={isMobileWidth}
          open={unpublishConfirmOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}

      {createPortal(
        <CustomDialog
          body={
            <ConfirmationDialog
              bodyMessage={strings.BLOG_UNSCHEDULE_CONFIRM}
              cancellingText={strings.CANCELING}
              cancelText={strings.CANCEL}
              okText={strings.BLOG_UNSCHEDULE}
              onComplete={handleUnscheduleConfirm}
            />
          }
          closeDialog={handleUnscheduleClose}
          isMobileWidth={isMobileWidth}
          open={unscheduleConfirmOpen}
        />,
        document.getElementById(MODAL_ROOT_ELEM_ID) as HTMLElement,
      )}
    </>
  )
}

export type BlogAdminSettingsTriggerButtonPropsType = {
  onClick: () => void
  variant?: 'header'
}

/**
 * Settings button that opens the settings drawer. Always rendered in header (desktop and mobile).
 */
export const BlogAdminSettingsTriggerButton: React.FC<BlogAdminSettingsTriggerButtonPropsType> = ({
  onClick,
}) => {
  const strings = useStrings(['BLOG_SETTINGS', 'BLOG_SETTINGS_BUTTON'])

  return (
    <Button
      aria-label={strings.BLOG_SETTINGS_BUTTON}
      onClick={onClick}
      size="small"
      variant="outlined"
    >
      {strings.BLOG_SETTINGS_BUTTON}
    </Button>
  )
}

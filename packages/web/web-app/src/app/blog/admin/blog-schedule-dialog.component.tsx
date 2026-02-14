import {
  Autocomplete,
  Box,
  Button,
  Fade,
  ListSubheader,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import * as React from 'react'

import { CustomDialog } from '@dx3/web-libs/ui/dialog/dialog.component'

import { useStrings } from '../../i18n'
import { store } from '../../store/store-web.redux'
import { useScheduleBlogPostMutation } from '../blog-web.api'

dayjs.extend(utc)
dayjs.extend(timezone)

/** Curated list of major timezones for content scheduling (no African zones) */
const SCHEDULE_TIMEZONE_OPTIONS = [
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Sao_Paulo',
  'America/Buenos_Aires',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Australia/Perth',
  'Pacific/Auckland',
  'UTC',
]

const USER_TIMEZONE =
  Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC'

function getTimezoneOptions(): string[] {
  if (USER_TIMEZONE && SCHEDULE_TIMEZONE_OPTIONS.includes(USER_TIMEZONE)) {
    const rest = SCHEDULE_TIMEZONE_OPTIONS.filter((z) => z !== USER_TIMEZONE)
    return [USER_TIMEZONE, ...rest]
  }
  return [...SCHEDULE_TIMEZONE_OPTIONS]
}

function getTimezoneGroupLabel(option: string): string {
  const strings = store.getState()?.i18n?.translations
  const yours = strings?.BLOG_SCHEDULE_TZ_YOURS ?? 'Your timezone'
  const other = strings?.BLOG_SCHEDULE_TZ_OTHER ?? 'Other timezones'
  return option === USER_TIMEZONE ? yours : other
}

const TIMEZONE_OPTIONS = getTimezoneOptions()

export type BlogScheduleDialogPropsType = {
  onClose: () => void
  onSuccess?: () => void
  open: boolean
  postId: string | null
  postTitle: string
}

/**
 * Modal dialog for scheduling a blog post publish time.
 * Includes datetime picker, timezone selector, and "In your timezone" preview.
 */
export const BlogScheduleDialogComponent: React.FC<
  BlogScheduleDialogPropsType
> = ({ onClose, onSuccess, open, postId, postTitle }) => {
  const theme = useTheme()
  const isMobileWidth = useMediaQuery(theme.breakpoints.down('sm'))
  const [schedulePost] = useScheduleBlogPostMutation()

  const strings = useStrings([
    'BLOG_SCHEDULE_DATE',
    'BLOG_SCHEDULE_IN_YOUR_TZ',
    'BLOG_SCHEDULE_POST',
    'BLOG_SCHEDULE_PUBLISH',
    'BLOG_SCHEDULE_TIMEZONE',
    'CANCEL',
    'CONFIRM',
  ])

  const [scheduleDateTime, setScheduleDateTime] = React.useState(() =>
    dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'),
  )
  const [scheduleTimezone, setScheduleTimezone] = React.useState(() => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    return SCHEDULE_TIMEZONE_OPTIONS.includes(tz) ? tz : 'UTC'
  })

  React.useEffect(() => {
    if (open) {
      setScheduleDateTime(dayjs().add(1, 'hour').format('YYYY-MM-DDTHH:mm'))
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      setScheduleTimezone(
        SCHEDULE_TIMEZONE_OPTIONS.includes(tz) ? tz : 'UTC',
      )
    }
  }, [open])

  const handleConfirm = React.useCallback(async () => {
    if (!postId) return
    try {
      const scheduledAt = dayjs
        .tz(scheduleDateTime, scheduleTimezone)
        .toISOString()
      await schedulePost({
        id: postId,
        payload: { scheduledAt },
      }).unwrap()
      onClose()
      onSuccess?.()
    } catch {
      // Error handled by RTK Query / toast
    }
  }, [
    onClose,
    onSuccess,
    postId,
    scheduleDateTime,
    schedulePost,
    scheduleTimezone,
  ])

  return (
    <CustomDialog
      body={
        <Box
          sx={{
            alignSelf: 'stretch',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            height: '100%',
            maxWidth: '100%',
            minWidth: 280,
            width: 320,
          }}
        >
          <Typography
            component="h2"
            sx={{ textAlign: 'center' }}
            variant="h6"
          >
            {strings.BLOG_SCHEDULE_PUBLISH}
          </Typography>
          {postTitle && (
            <Box sx={{ overflowWrap: 'break-word', wordBreak: 'break-word' }}>
              <Typography
                component="p"
                sx={{ color: 'text.secondary', fontSize: '0.75rem' }}
                variant="caption"
              >
                {strings.BLOG_SCHEDULE_POST}
              </Typography>
              <Typography
                component="p"
                sx={{ fontWeight: 500 }}
                variant="body2"
              >
                {postTitle}
              </Typography>
            </Box>
          )}
          <TextField
            fullWidth
            label={strings.BLOG_SCHEDULE_DATE}
            sx={{ marginTop: 1 }}
            onChange={(e) => setScheduleDateTime(e.target.value)}
            type="datetime-local"
            value={scheduleDateTime}
            InputLabelProps={{ shrink: true }}
            inputProps={{
              min: dayjs().format('YYYY-MM-DDTHH:mm'),
            }}
          />
          <Autocomplete
            getOptionLabel={(option) => option}
            groupBy={(option) => getTimezoneGroupLabel(option)}
            onChange={(_, value) => setScheduleTimezone(value ?? 'UTC')}
            options={TIMEZONE_OPTIONS}
            renderGroup={(params) => (
              <li key={params.key}>
                <ListSubheader
                  component="div"
                  sx={{
                    backgroundColor: (t) =>
                      t.palette.mode === 'dark'
                        ? t.palette.background.paper
                        : t.palette.grey[100],
                    lineHeight: 2,
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  {params.group}
                </ListSubheader>
                <ul>{params.children}</ul>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={strings.BLOG_SCHEDULE_TIMEZONE}
                size="medium"
              />
            )}
            size="medium"
            value={scheduleTimezone}
          />
          <Box
            sx={{
              minHeight: 32,
              minWidth: 0,
              overflowWrap: 'break-word',
            }}
          >
            <Fade in={scheduleTimezone !== USER_TIMEZONE}>
              <Typography
                component="p"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.875rem',
                  overflowWrap: 'break-word',
                  whiteSpace: 'pre-line',
                  wordBreak: 'break-word',
                }}
                variant="body2"
              >
                {(strings.BLOG_SCHEDULE_IN_YOUR_TZ ??
                  'In your timezone:\n{time}').replace(
                  '{time}',
                  dayjs
                    .tz(scheduleDateTime, scheduleTimezone)
                    .tz(USER_TIMEZONE)
                    .format('dddd, MMM D, YYYY [at] h:mm A'),
                )}
              </Typography>
            </Fade>
          </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              justifyContent: 'flex-end',
              marginTop: 'auto',
            }}
          >
            <Button onClick={onClose} variant="outlined">
              {strings.CANCEL}
            </Button>
            <Button onClick={handleConfirm} variant="contained">
              {strings.CONFIRM}
            </Button>
          </Box>
        </Box>
      }
      closeDialog={onClose}
      isMobileWidth={isMobileWidth}
      open={open}
    />
  )
}

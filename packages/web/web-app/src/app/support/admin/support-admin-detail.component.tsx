import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import PersonIcon from '@mui/icons-material/Person'
import {
  Box,
  Chip,
  Divider,
  Fade,
  Grid,
  IconButton,
  Paper,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { BeatLoader } from 'react-spinners'
import { toast } from 'react-toastify'

import {
  SUPPORT_STATUS_ARRAY,
  SUPPORT_STATUS_COLORS,
  type SupportCategoryType,
  type SupportStatusType,
} from '@dx3/models-shared'
import { DxDateUtilClass } from '@dx3/utils-shared'
import { ContentHeader } from '@dx3/web-libs/ui/content/content-header.component'
import { ContentWrapper } from '@dx3/web-libs/ui/content/content-wrapper.component'
import { NotFoundLottie } from '@dx3/web-libs/ui/lottie/not-found.lottie'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { WebConfigService } from '../../config/config-web.service'
import { useStrings } from '../../i18n'
import { useAppDispatch, useAppSelector } from '../../store/store-web-redux.hooks'
import { setDocumentTitle } from '../../ui/ui-web-set-document-title'
import { supportAdminActions } from '../store/support-admin-web.reducer'
import { CATEGORY_LABEL_KEYS, STATUS_LABEL_KEYS } from '../support.consts'
import type { StatusChipColor } from '../support.types'
import {
  useGetSupportRequestByIdQuery,
  useMarkSupportAsViewedMutation,
  useUpdateSupportRequestStatusMutation,
} from '../support-web.api'
import { SUPPORT_ADMIN_ROUTES } from '../support-web.consts'

export const SupportAdminDetailComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const { id } = useParams<{ id: string }>()
  const [fadeIn, setFadeIn] = React.useState(false)
  const currentUserId = useAppSelector((state) => state.userProfile?.id)

  const strings = useStrings([
    'BACK',
    'CLICK_TO_VIEW_USER',
    'SAVE',
    'STATUS',
    'SUPPORT_CATEGORY',
    'SUPPORT_CATEGORY_ISSUE',
    'SUPPORT_CATEGORY_NEW_FEATURE',
    'SUPPORT_CATEGORY_OTHER',
    'SUPPORT_CATEGORY_QUESTION',
    'SUPPORT_MESSAGE',
    'SUPPORT_REQUEST_NOT_FOUND',
    'SUPPORT_REQUEST_UPDATED',
    'SUPPORT_REQUESTS',
    'SUPPORT_STATUS_CLOSED',
    'SUPPORT_STATUS_IN_PROGRESS',
    'SUPPORT_STATUS_OPEN',
    'SUPPORT_STATUS_RESOLVED',
    'SUPPORT_SUBJECT',
    'UPDATE_STATUS',
  ])

  const {
    data: request,
    isError,
    isLoading,
    refetch,
  } = useGetSupportRequestByIdQuery(id || '', { skip: !id })

  const [markAsViewed] = useMarkSupportAsViewedMutation()
  const [updateStatus, { isLoading: isUpdating }] = useUpdateSupportRequestStatusMutation()

  React.useEffect(() => {
    setFadeIn(true)
    setDocumentTitle(strings.SUPPORT_REQUESTS)
  }, [strings.SUPPORT_REQUESTS])

  // Mark as viewed when loading and update list store
  React.useEffect(() => {
    if (request && !request.viewedByAdmin && id) {
      markAsViewed(id)
        .unwrap()
        .then(() => {
          // Update the list store so when we navigate back, the record shows as viewed
          dispatch(supportAdminActions.updateRequestViewed(id))
        })
        .catch(() => {
          // Silent fail - not critical
        })
    }
  }, [request, id, markAsViewed, dispatch])

  const handleBack = () => {
    navigate(SUPPORT_ADMIN_ROUTES.LIST)
  }

  const handleNavigateToUser = () => {
    if (request?.userId) {
      const ROUTES = WebConfigService.getWebRoutes()
      navigate(`${ROUTES.ADMIN.USER.DETAIL}/${request.userId}`)
    }
  }

  const handleStatusClick = async (newStatus: SupportStatusType) => {
    if (!id || !request || newStatus === request.status || isUpdating) return

    try {
      // Auto-assign current user if unassigned
      const payload: { assignedTo?: string; status: SupportStatusType } = {
        status: newStatus,
      }

      if (!request.assignedTo && currentUserId) {
        payload.assignedTo = currentUserId
      }

      await updateStatus({
        id,
        payload,
      }).unwrap()
      toast.success(strings.SUPPORT_REQUEST_UPDATED)
      // Refetch to update UI with new status
      refetch()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const getCategoryLabel = (category: SupportCategoryType): string => {
    return strings[CATEGORY_LABEL_KEYS[category] as keyof typeof strings] || category
  }

  const getStatusLabel = (status: SupportStatusType): string => {
    return strings[STATUS_LABEL_KEYS[status] as keyof typeof strings] || status
  }

  const getStatusChipColor = (status: SupportStatusType): StatusChipColor => {
    return (SUPPORT_STATUS_COLORS[status] as StatusChipColor) || 'default'
  }

  // Build header title with subject
  const headerTitle = request
    ? `${strings.SUPPORT_REQUESTS} - ${request.subject.length > 50 ? `${request.subject.substring(0, 50)}...` : request.subject}`
    : strings.SUPPORT_REQUESTS

  if (isLoading) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <ContentHeader
          headerTitle={strings.SUPPORT_REQUESTS}
          navigation={handleBack}
          tooltip={strings.BACK}
        />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          spacing={0}
          style={{ minHeight: '50vh' }}
        >
          <BeatLoader
            color={theme.palette.secondary.main}
            margin="2px"
            size={30}
          />
        </Grid>
      </ContentWrapper>
    )
  }

  if (isError || !request) {
    return (
      <ContentWrapper
        contentHeight="calc(100vh - 80px)"
        contentTopOffset={SM_BREAK ? '124px' : '74px'}
      >
        <ContentHeader
          headerTitle={strings.SUPPORT_REQUESTS}
          navigation={handleBack}
          tooltip={strings.BACK}
        />
        <Grid
          alignItems="center"
          container
          direction="column"
          justifyContent="center"
          padding="48px"
          spacing={0}
        >
          <NotFoundLottie />
          <Typography
            color="error"
            sx={{ marginTop: '16px' }}
            variant="h6"
          >
            {strings.SUPPORT_REQUEST_NOT_FOUND}
          </Typography>
        </Grid>
      </ContentWrapper>
    )
  }

  return (
    <ContentWrapper
      contentHeight="calc(100vh - 80px)"
      contentTopOffset={SM_BREAK ? '124px' : '74px'}
    >
      <ContentHeader
        headerTitle={headerTitle}
        navigation={handleBack}
        tooltip={strings.BACK}
      />

      <Fade
        in={fadeIn}
        timeout={FADE_TIMEOUT_DUR}
      >
        <Grid padding="18px 24px">
          {/* Main Content */}
          <Paper
            elevation={2}
            sx={{ padding: '32px' }}
          >
            {/* Request Header Info */}
            <Box
              alignItems="flex-start"
              display="flex"
              flexWrap="wrap"
              gap={4}
              justifyContent="space-between"
              marginBottom="24px"
            >
              {/* Left side info */}
              <Box>
                {/* Subject */}
                <Typography
                  sx={{ marginBottom: '8px' }}
                  variant="h6"
                >
                  {request.subject}
                </Typography>

                {/* Category */}
                <Box sx={{ marginBottom: '12px' }}>
                  <Chip
                    color="primary"
                    label={getCategoryLabel(request.category)}
                    size="small"
                    variant="outlined"
                  />
                </Box>

                {/* Metadata */}
                <Typography
                  color="textSecondary"
                  variant="body2"
                >
                  Created: {DxDateUtilClass.formatAbsoluteTime(request.createdAt)}
                </Typography>
                {request.resolvedAt && (
                  <Typography
                    color="textSecondary"
                    variant="body2"
                  >
                    Resolved: {DxDateUtilClass.formatAbsoluteTime(request.resolvedAt)}
                  </Typography>
                )}
              </Box>

              {/* User Info */}
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  padding: '16px',
                }}
              >
                <Box
                  alignItems="center"
                  display="flex"
                  gap={2}
                >
                  <PersonIcon color="primary" />
                  <Box>
                    <Typography variant="subtitle2">{request.userDisplayName}</Typography>
                    {request.userFullName && request.userFullName !== request.userDisplayName && (
                      <Typography
                        color="textSecondary"
                        variant="caption"
                      >
                        {request.userFullName}
                      </Typography>
                    )}
                  </Box>
                  <Tooltip title={strings.CLICK_TO_VIEW_USER}>
                    <IconButton
                      color="primary"
                      onClick={handleNavigateToUser}
                      size="small"
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            </Box>

            <Divider sx={{ marginBottom: '24px' }} />

            {/* Message */}
            <Box marginBottom="32px">
              <Typography
                color="textSecondary"
                variant="caption"
              >
                {strings.SUPPORT_MESSAGE}
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  backgroundColor: theme.palette.action.hover,
                  marginTop: '8px',
                  padding: '16px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                <Typography variant="body1">{request.message}</Typography>
              </Paper>
            </Box>

            <Divider sx={{ marginBottom: '24px' }} />

            {/* Status Update Section */}
            <Box>
              <Typography
                color="textSecondary"
                sx={{ marginBottom: '16px' }}
                variant="subtitle2"
              >
                {strings.UPDATE_STATUS}
              </Typography>
              <Box
                display="flex"
                flexWrap="wrap"
                gap={1}
              >
                {SUPPORT_STATUS_ARRAY.map((status) => {
                  const isCurrentStatus = request.status === status
                  return (
                    <Chip
                      color={getStatusChipColor(status as SupportStatusType)}
                      disabled={isUpdating}
                      key={status}
                      label={getStatusLabel(status as SupportStatusType)}
                      onClick={() => handleStatusClick(status as SupportStatusType)}
                      sx={{
                        cursor: isCurrentStatus ? 'default' : 'pointer',
                        opacity: isUpdating ? 0.5 : 1,
                      }}
                      variant={isCurrentStatus ? 'filled' : 'outlined'}
                    />
                  )
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Fade>
    </ContentWrapper>
  )
}

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import {
  Alert,
  Box,
  Button,
  Chip,
  Fade,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import * as React from 'react'
import { toast } from 'react-toastify'

import {
  SUPPORT_CATEGORY_ARRAY,
  SUPPORT_VALIDATION,
  type SupportCategoryType,
} from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useApiError } from '../data/errors'
import { getErrorStringFromApiResponse } from '../data/errors/error-web.service'
import { useI18n } from '../i18n'
import { useAppDispatch, useAppSelector } from '../store/store-web-redux.hooks'
import { uiActions } from '../ui/store/ui-web.reducer'
import { CATEGORY_LABEL_KEYS } from './support.consts'
import { useCreateSupportRequestMutation } from './support-web.api'

export const ContactUsFormComponent: React.FC = () => {
  const dispatch = useAppDispatch()
  const { getErrorMessage } = useApiError()
  const hasSecuredAccount = useAppSelector((state) => state.userProfile?.hasSecuredAccount ?? false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  const [category, setCategory] = React.useState<SupportCategoryType | ''>('')
  const [subject, setSubject] = React.useState('')
  const [message, setMessage] = React.useState('')
  const [submittedData, setSubmittedData] = React.useState<{
    category: SupportCategoryType
    message: string
    subject: string
  } | null>(null)
  const [errors, setErrors] = React.useState<{
    category?: string
    message?: string
    subject?: string
  }>({})

  const { t, translations: strings } = useI18n()

  const [createRequest, { error: createError, isLoading: isCreating, isSuccess: createSuccess }] =
    useCreateSupportRequestMutation()

  React.useEffect(() => {
    if (createSuccess && category) {
      // Store submitted data and show success
      setSubmittedData({
        category: category as SupportCategoryType,
        message,
        subject,
      })
      setShowSuccess(true)
    }
  }, [createSuccess, category, message, subject])

  React.useEffect(() => {
    if (createError) {
      const errorMsg = getErrorStringFromApiResponse(createError)
      dispatch(uiActions.apiDialogSet(errorMsg))
    }
  }, [createError, dispatch])

  const validateForm = React.useCallback((): boolean => {
    const newErrors: typeof errors = {}

    if (!category) {
      newErrors.category = t('SUPPORT_SELECT_CATEGORY')
    }

    if (!subject.trim()) {
      newErrors.subject = t('VALIDATION_SUBJECT_REQUIRED')
    } else if (subject.length > SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH) {
      newErrors.subject = t('VALIDATION_SUBJECT_MAX_LENGTH', {
        max: SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH,
      })
    }

    if (!message.trim()) {
      newErrors.message = t('VALIDATION_MESSAGE_REQUIRED')
    } else if (message.length > SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH) {
      newErrors.message = t('VALIDATION_MESSAGE_MAX_LENGTH', {
        max: SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH,
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [category, message, subject, t])

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!validateForm()) {
        return
      }

      try {
        await createRequest({
          category: category as SupportCategoryType,
          message: message.trim(),
          subject: subject.trim(),
        })
      } catch (err) {
        toast.error(getErrorMessage(null, (err as Error).message))
      }
    },
    [category, createRequest, getErrorMessage, message, subject, validateForm],
  )

  const handleClear = React.useCallback(() => {
    setCategory('')
    setSubject('')
    setMessage('')
    setErrors({})
  }, [])

  const hasFormData = Boolean(category || subject.trim() || message.trim())

  const handleSubmitAnother = React.useCallback(() => {
    // Reset form and hide success
    setCategory('')
    setSubject('')
    setMessage('')
    setErrors({})
    setSubmittedData(null)
    setShowSuccess(false)
  }, [])

  const subjectCharsRemaining = SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH - subject.length
  const messageCharsRemaining = SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH - message.length

  const getCategoryLabel = React.useCallback(
    (cat: SupportCategoryType): string => {
      return strings[CATEGORY_LABEL_KEYS[cat] as keyof typeof strings] || cat
    },
    [strings],
  )

  return (
    <Box>
      <Typography
        color="primary"
        gutterBottom
        variant="h4"
      >
        {strings.CONTACT_US}
      </Typography>

      {/* Success State */}
      <Fade
        in={showSuccess}
        timeout={FADE_TIMEOUT_DUR}
        unmountOnExit
      >
        <Paper
          elevation={2}
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'column',
            padding: '48px 32px',
          }}
        >
          {/* Success Icon */}
          <CheckCircleOutlineIcon
            color="success"
            sx={{ fontSize: 80, marginBottom: '24px' }}
          />

          {/* Success Title */}
          <Typography
            align="center"
            color="primary"
            gutterBottom
            variant="h5"
          >
            {strings.SUPPORT_REQUEST_SUBMITTED_SUCCESS}
          </Typography>

          {/* Success Message */}
          <Typography
            align="center"
            color="textSecondary"
            sx={{ marginBottom: '32px' }}
            variant="body1"
          >
            {strings.SUPPORT_REQUEST_SUBMITTED}
          </Typography>

          {/* Request Details */}
          {submittedData && (
            <Paper
              elevation={0}
              sx={{
                backgroundColor: 'action.hover',
                marginBottom: '32px',
                maxWidth: '100%',
                padding: '24px',
                width: '500px',
              }}
            >
              {/* Category */}
              <Box sx={{ marginBottom: '16px' }}>
                <Typography
                  color="textSecondary"
                  variant="caption"
                >
                  {strings.SUPPORT_CATEGORY}
                </Typography>
                <Box sx={{ marginTop: '4px' }}>
                  <Chip
                    color="primary"
                    label={getCategoryLabel(submittedData.category)}
                    size="small"
                  />
                </Box>
              </Box>

              {/* Subject */}
              <Box sx={{ marginBottom: '16px' }}>
                <Typography
                  color="textSecondary"
                  variant="caption"
                >
                  {strings.SUPPORT_SUBJECT}
                </Typography>
                <Typography variant="body1">{submittedData.subject}</Typography>
              </Box>

              {/* Message */}
              <Box>
                <Typography
                  color="textSecondary"
                  variant="caption"
                >
                  {strings.SUPPORT_MESSAGE}
                </Typography>
                <Typography
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  variant="body2"
                >
                  {submittedData.message}
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Submit Another Button */}
          <Button
            color="primary"
            onClick={handleSubmitAnother}
            variant="contained"
          >
            {strings.SUPPORT_SUBMIT_ANOTHER}
          </Button>
        </Paper>
      </Fade>

      {/* Form State */}
      <Fade
        in={!showSuccess}
        timeout={FADE_TIMEOUT_DUR}
        unmountOnExit
      >
        <Paper
          elevation={2}
          sx={{ padding: '32px' }}
        >
          {/* Account Not Secured Warning */}
          {!hasSecuredAccount && (
            <Alert
              icon={<WarningAmberIcon />}
              severity="warning"
              sx={{ marginBottom: '24px' }}
            >
              {strings.USER_ACCOUNT_NOT_SECURED}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
          >
            {/* Category Select */}
            <FormControl
              disabled={!hasSecuredAccount}
              error={!!errors.category}
              fullWidth
              sx={{ marginBottom: '24px' }}
            >
              <InputLabel id="category-label">{strings.SUPPORT_CATEGORY}</InputLabel>
              <Select
                disabled={!hasSecuredAccount}
                label={strings.SUPPORT_CATEGORY}
                labelId="category-label"
                onChange={(e) => {
                  setCategory(e.target.value as SupportCategoryType)
                  setErrors((prev) => ({ ...prev, category: undefined }))
                }}
                value={category}
              >
                {SUPPORT_CATEGORY_ARRAY.map((cat) => (
                  <MenuItem
                    key={cat}
                    value={cat}
                  >
                    {strings[CATEGORY_LABEL_KEYS[cat] as keyof typeof strings]}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && <FormHelperText>{errors.category}</FormHelperText>}
            </FormControl>

            {/* Subject Input */}
            <TextField
              disabled={!hasSecuredAccount}
              error={!!errors.subject}
              fullWidth
              helperText={
                errors.subject || t('CHARACTERS_REMAINING', { count: subjectCharsRemaining })
              }
              label={strings.SUPPORT_SUBJECT}
              onChange={(e) => {
                setSubject(e.target.value)
                setErrors((prev) => ({ ...prev, subject: undefined }))
              }}
              slotProps={{ htmlInput: { maxLength: SUPPORT_VALIDATION.SUBJECT_MAX_LENGTH } }}
              sx={{ marginBottom: '24px' }}
              value={subject}
            />

            {/* Message Input */}
            <TextField
              disabled={!hasSecuredAccount}
              error={!!errors.message}
              fullWidth
              helperText={
                errors.message || t('CHARACTERS_REMAINING', { count: messageCharsRemaining })
              }
              label={strings.SUPPORT_MESSAGE}
              minRows={6}
              multiline
              onChange={(e) => {
                setMessage(e.target.value)
                setErrors((prev) => ({ ...prev, message: undefined }))
              }}
              slotProps={{ htmlInput: { maxLength: SUPPORT_VALIDATION.MESSAGE_MAX_LENGTH } }}
              sx={{ marginBottom: '32px' }}
              value={message}
            />

            {/* Action Buttons */}
            <Box
              display="flex"
              gap={2}
              justifyContent="flex-end"
            >
              <Button
                color="inherit"
                disabled={isCreating || !hasFormData}
                onClick={handleClear}
                variant="outlined"
              >
                {strings.CANCEL}
              </Button>
              <Button
                color="primary"
                disabled={isCreating || !hasSecuredAccount}
                type="submit"
                variant="contained"
              >
                {strings.SUBMIT}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Fade>
    </Box>
  )
}

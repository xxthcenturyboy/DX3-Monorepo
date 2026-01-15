import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  type SelectChangeEvent,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import DialogActions from '@mui/material/DialogActions'
import DialogTitle from '@mui/material/DialogTitle'
import type React from 'react'
import { useEffect, useState } from 'react'
import { BeatLoader } from 'react-spinners'

import {
  FEATURE_FLAG_STATUS,
  FEATURE_FLAG_STATUS_ARRAY,
  FEATURE_FLAG_TARGET,
  FEATURE_FLAG_TARGET_ARRAY,
  type FeatureFlagStatusType,
  type FeatureFlagTargetType,
  type FeatureFlagType,
} from '@dx3/models-shared'
import { sleep } from '@dx3/utils-shared'
import { logger } from '@dx3/web-libs/logger'
import { CustomDialogContent } from '@dx3/web-libs/ui/dialog/custom-content.dialog'
import { DialogError } from '@dx3/web-libs/ui/dialog/error.dialog'
import { DialogWrapper } from '@dx3/web-libs/ui/dialog/ui-wrapper.dialog'
import { SuccessLottie } from '@dx3/web-libs/ui/lottie/success.lottie'

import { getErrorStringFromApiResponse } from '../../data/errors/error-web.service'
import { useAppSelector } from '../../store/store-web-redux.hooks'
import { selectIsMobileWidth, selectWindowHeight } from '../../ui/store/ui-web.selector'
import { useUpdateFeatureFlagMutation } from './feature-flag-admin-web.api'
import { FeatureFlagForm } from './feature-flag-admin-web.ui'

type EditDialogPropsType = {
  closeDialog: () => void
  flag: FeatureFlagType | null
  onSuccess: () => void
}

export const FeatureFlagAdminEditDialog: React.FC<EditDialogPropsType> = (props) => {
  const theme = useTheme()
  const isMobileWidth = useAppSelector(selectIsMobileWidth)
  const windowHeight = useAppSelector(selectWindowHeight)
  const SM_BREAK = useMediaQuery(theme.breakpoints.down('sm'))
  const [allSucceeded, setAllSucceeded] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [description, setDescription] = useState(props.flag?.description || '')
  const [status, setStatus] = useState<FeatureFlagStatusType>(
    props.flag?.status || FEATURE_FLAG_STATUS.DISABLED,
  )
  const [target, setTarget] = useState<FeatureFlagTargetType>(
    props.flag?.target || FEATURE_FLAG_TARGET.ALL,
  )
  const [percentage, setPercentage] = useState<number | ''>(props.flag?.percentage ?? '')

  const [
    updateFlag,
    {
      error: updateError,
      isLoading: isUpdating,
      isSuccess: updateSuccess,
      isUninitialized: updateUninitialized,
      reset: resetUpdate,
    },
  ] = useUpdateFeatureFlagMutation()

  useEffect(() => {
    if (props.flag) {
      setDescription(props.flag.description || '')
      setStatus(props.flag.status)
      setTarget(props.flag.target)
      setPercentage(props.flag.percentage ?? '')
    }
  }, [props.flag])

  const reset = () => {
    resetUpdate()
    setAllSucceeded(false)
    setShowError(false)
    setErrorMessage('')
  }

  const handleClose = (): void => {
    props.closeDialog()
    sleep(500).then(reset)
  }

  const handleUpdate = async (): Promise<void> => {
    if (!props.flag) return

    try {
      await updateFlag({
        description,
        id: props.flag.id,
        percentage: percentage !== '' ? percentage : null,
        status,
        target,
      })
    } catch (err) {
      logger.error((err as Error).message, err)
    }
  }

  useEffect(() => {
    if (!isUpdating && !updateUninitialized) {
      if (updateError) {
        setErrorMessage(getErrorStringFromApiResponse(updateError))
        setShowError(true)
      } else if (updateSuccess) {
        setAllSucceeded(true)
      }
    }
  }, [isUpdating, updateError, updateUninitialized, updateSuccess])

  const submitDisabled = (): boolean => {
    return isUpdating
  }

  const renderFormContent = (): React.ReactElement => {
    return (
      <CustomDialogContent
        isMobileWidth={isMobileWidth}
        justifyContent={SM_BREAK ? 'flex-start' : 'space-around'}
        windowHeight={windowHeight}
      >
        <FeatureFlagForm
          name="form-add-feature-flag"
          onSubmit={handleUpdate}
        >
          <FormControl
            fullWidth
            margin="normal"
            sx={{
              minWidth: 300,
            }}
          >
            <InputLabel htmlFor="description">Description</InputLabel>
            <OutlinedInput
              id="description"
              label="Description"
              multiline
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              value={description}
            />
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
          >
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              onChange={(e: SelectChangeEvent) =>
                setStatus(e.target.value as FeatureFlagStatusType)
              }
              value={status}
            >
              {FEATURE_FLAG_STATUS_ARRAY.map((s) => (
                <MenuItem
                  key={s}
                  value={s}
                >
                  {s}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl
            fullWidth
            margin="normal"
          >
            <InputLabel>Target</InputLabel>
            <Select
              label="Target"
              onChange={(e: SelectChangeEvent) =>
                setTarget(e.target.value as FeatureFlagTargetType)
              }
              value={target}
            >
              {FEATURE_FLAG_TARGET_ARRAY.map((t) => (
                <MenuItem
                  key={t}
                  value={t}
                >
                  {t}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {(target === FEATURE_FLAG_TARGET.PERCENTAGE ||
            status === FEATURE_FLAG_STATUS.ROLLOUT) && (
            <FormControl
              fullWidth
              margin="normal"
            >
              <InputLabel htmlFor="percentage">Percentage</InputLabel>
              <OutlinedInput
                id="percentage"
                inputProps={{ max: 100, min: 0 }}
                label="Percentage"
                onChange={(e) => setPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                type="number"
                value={percentage}
              />
            </FormControl>
          )}
        </FeatureFlagForm>
      </CustomDialogContent>
    )
  }

  if (!props.flag) return null

  return (
    <DialogWrapper maxWidth={500}>
      <DialogTitle style={{ textAlign: 'center' }}>Edit: {props.flag.name}</DialogTitle>

      {!allSucceeded && !showError && renderFormContent()}

      {showError && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <DialogError
            message={errorMessage}
            windowHeight={windowHeight}
          />
        </CustomDialogContent>
      )}

      {allSucceeded && (
        <CustomDialogContent
          isMobileWidth={isMobileWidth}
          windowHeight={windowHeight}
        >
          <SuccessLottie
            complete={() =>
              sleep(500).then(() => {
                props.onSuccess()
                handleClose()
              })
            }
          />
        </CustomDialogContent>
      )}

      {!allSucceeded && (
        <DialogActions style={{ justifyContent: isMobileWidth ? 'center' : 'flex-end' }}>
          <Button
            disabled={isUpdating}
            onClick={handleClose}
            variant="outlined"
          >
            {showError ? 'Close' : 'Cancel'}
          </Button>
          {!showError && (
            <Button
              disabled={submitDisabled()}
              onClick={handleUpdate}
              variant="contained"
            >
              {isUpdating ? (
                <BeatLoader
                  color={theme.palette.secondary.main}
                  margin="2px"
                  size={16}
                />
              ) : (
                'Update'
              )}
            </Button>
          )}
        </DialogActions>
      )}
    </DialogWrapper>
  )
}

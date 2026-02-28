import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Fade from '@mui/material/Fade'
import { useTheme } from '@mui/material/styles'
import React from 'react'
import { BeatLoader } from 'react-spinners'

import { OTP_LENGTH } from '@dx3/models-shared'
import { FADE_TIMEOUT_DUR } from '@dx3/web-libs/ui/ui.consts'

import { useStrings } from '../i18n'
import { AuthWebOtpEntry } from './auth-web-otp.component'

type AuthWebRequestOtpEntryPropsType = {
  hasCallbackError: boolean
  onCompleteCallback: (code: string) => void
  onClickStartOver: () => void
  selectedMethod: 'EMAIL' | 'PHONE' | ''
}

export const AuthWebRequestOtpEntry: React.FC<AuthWebRequestOtpEntryPropsType> = (props) => {
  const [hasFiredCallback, setHasFiredCallback] = React.useState(false)
  const [otp, setOtp] = React.useState('')
  const strings = useStrings(['START_OVER'])
  const theme = useTheme()

  React.useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      props.onCompleteCallback(otp)
      setHasFiredCallback(true)
    }
  }, [otp])

  return (
    <Fade
      in={true}
      timeout={FADE_TIMEOUT_DUR}
    >
      <Box
        display="flex"
        flexDirection="column"
        height={'200px'}
        justifyContent="center"
      >
        {!hasFiredCallback && (
          <AuthWebOtpEntry
            method={props.selectedMethod}
            onCompleteCallback={setOtp}
          />
        )}
        {hasFiredCallback && !props.hasCallbackError && (
          <BeatLoader
            color={theme.palette.secondary.main}
            margin="2px"
            size={24}
          />
        )}
        {hasFiredCallback && props.hasCallbackError && (
          <Button
            fullWidth
            onClick={() => {
              props.onClickStartOver()
              setHasFiredCallback(false)
            }}
            startIcon={<ChevronLeftIcon />}
            style={{
              justifyContent: 'center',
              marginTop: '50px',
            }}
            variant="text"
          >
            {strings.START_OVER}
          </Button>
        )}
      </Box>
    </Fade>
  )
}

import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { MuiOtpInput } from 'mui-one-time-password-input'
import React, { type ReactElement } from 'react'

import { OTP_LENGTH } from '@dx3/models-shared'
import { stringToTitleCase } from '@dx3/utils-shared'

import { useI18n, useStrings } from '../i18n'

type AuthWebOtpPropsType = {
  method: 'EMAIL' | 'PHONE' | ''
  onCompleteCallback: (value: string) => void
}

export const AuthWebOtpEntry: React.FC<AuthWebOtpPropsType> = (props): ReactElement => {
  const [otp, setOtp] = React.useState('')
  const { t } = useI18n()
  const strings = useStrings(['EMAIL', 'ENTER_THE_CODE_SENT_TO_YOUR_VAR', 'PHONE'])

  React.useEffect(() => {
    if (otp.length === OTP_LENGTH && typeof props.onCompleteCallback === 'function') {
      props.onCompleteCallback(otp)
    }
  }, [otp])

  const handleChangeOtp = (value: string): void => {
    setOtp(value)
  }

  const handleOtpComplete = (value: string): void => {
    if (value !== otp) {
      setOtp(value)
    }
  }

  const getMessage = (): string => {
    const methodString = props.method === 'EMAIL' ? strings.EMAIL : strings.PHONE
    return t('ENTER_THE_CODE_SENT_TO_YOUR_VAR', {
      method: methodString || stringToTitleCase(props.method),
    })
  }

  return (
    <Grid>
      <Typography
        style={{
          margin: '0px auto 24px',
          textAlign: 'center',
        }}
        variant="h6"
      >
        {getMessage()}
      </Typography>
      <MuiOtpInput
        autoFocus={true}
        length={OTP_LENGTH}
        onChange={handleChangeOtp}
        onComplete={handleOtpComplete}
        TextFieldsProps={{
          autoComplete: 'one-time-code',
        }}
        value={otp}
      />
    </Grid>
  )
}

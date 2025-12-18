import { Grid2, Typography } from '@mui/material'
import { MuiOtpInput } from 'mui-one-time-password-input'
import React, { type ReactElement } from 'react'

import { OTP_LENGTH } from '@dx3/models-shared'
import { stringToTitleCase } from '@dx3/utils-shared'

type AuthWebOtpPropsType = {
  method: 'EMAIL' | 'PHONE' | ''
  onCompleteCallback: (value: string) => void
}

export const AuthWebOtpEntry: React.FC<AuthWebOtpPropsType> = (props): ReactElement => {
  const [otp, setOtp] = React.useState('')

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

  return (
    <Grid2>
      <Typography
        style={{
          margin: '0px auto 24px',
          textAlign: 'center',
        }}
        variant="h6"
      >
        {`Enter the code sent to your ${stringToTitleCase(props.method)}`}
      </Typography>
      <MuiOtpInput
        autoFocus={true}
        length={OTP_LENGTH}
        onChange={handleChangeOtp}
        onComplete={handleOtpComplete}
        value={otp}
      />
    </Grid2>
  )
}

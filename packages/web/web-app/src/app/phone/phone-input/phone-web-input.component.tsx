import { useTheme } from '@mui/material'
import React from 'react'
import PhoneInput, { type CountryData } from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css';
// import 'react-phone-input-2/lib/high-res.css';
import 'react-phone-input-2/lib/material.css'

import { APP_COLOR_PALETTE } from '@dx3/web-libs/ui/system/mui-overrides/styles'

import { getDefaultStyles } from './phone-web-input.config'
import type { PhoneInputProps } from './phone-web-input.types'

export const PhoneNumberInput: React.FC<PhoneInputProps> = (props): React.ReactElement => {
  const {
    defaultCountry,
    defaultValue,
    disabled,
    inputId,
    preferredCountries,
    required,
    value,
    label,
    onChange,
    onFocus,
    onBlur,
    onClick,
    onKeyDown,
  } = props
  const [focused, setFocused] = React.useState<boolean>(false)
  const theme = useTheme()

  const {
    buttonStyleDefaults,
    containerStyleDefaults,
    dropdownStyleDefaults,
    inputStyleDefaults,
    searchStyleDefaults,
  } = getDefaultStyles(theme)

  const getBorderColor = (): string => {
    if (focused) {
      return APP_COLOR_PALETTE.SECONDARY[700]
    }

    return theme.palette.mode === 'light'
      ? // ? 'rgba(0, 0, 0, 0.23)'
        theme.palette.grey[400]
      : theme.palette.grey[400]
  }

  const getBorderWidth = (): string => {
    return focused ? '1px' : '1px'
  }

  const buttonStyle = {
    ...buttonStyleDefaults,
    borderColor: getBorderColor(),
    borderWidth: getBorderWidth(),
    ...props.buttonStyle,
  }

  const containerStyle = {
    ...containerStyleDefaults,
    ...props.containerStyle,
  }

  const inputStyle = {
    ...inputStyleDefaults,
    backgroundColor: focused ? APP_COLOR_PALETTE.SECONDARY[50] : 'transparent',
    borderColor: getBorderColor(),
    borderWidth: getBorderWidth(),
    ...props.inputStyle,
  }

  const searchStyle = {
    ...searchStyleDefaults,
    ...props.searchStyle,
  }

  return (
    <PhoneInput
      buttonStyle={buttonStyle}
      containerStyle={containerStyle}
      country={defaultCountry}
      disabled={disabled}
      disableSearchIcon={true}
      dropdownStyle={dropdownStyleDefaults}
      enableSearch={true}
      inputProps={{
        id: inputId,
        name: inputId,
        required,
        type: 'tel',
      }}
      inputStyle={inputStyle}
      onBlur={(event: React.FocusEvent<HTMLInputElement>, data: object | CountryData) => {
        setFocused(false)
        if (typeof onBlur === 'function') {
          onBlur(event, data)
        }
      }}
      onChange={onChange}
      onClick={onClick}
      // disableCountryCode={true}
      // disableCountryGuess={true}
      onFocus={(event: React.FocusEvent<HTMLInputElement>, data: object | CountryData) => {
        setFocused(true)
        if (typeof onFocus === 'function') {
          onFocus(event, data)
        }
      }}
      onKeyDown={onKeyDown}
      preferredCountries={preferredCountries}
      searchStyle={searchStyle}
      specialLabel={label || 'Phone'}
      value={value || defaultValue}
    />
  )
}

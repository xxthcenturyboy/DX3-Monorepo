import { useTheme } from '@mui/material/styles'
import React from 'react'

import { useStrings } from '../../i18n'
import PhoneInput, { type CountryData } from 'react-phone-input-2'
// import 'react-phone-input-2/lib/style.css';
// import 'react-phone-input-2/lib/high-res.css';
import 'react-phone-input-2/lib/material.css'

import { getDefaultStyles } from './phone-web-input.config'
import type { PhoneInputProps } from './phone-web-input.types'

export const PhoneNumberInput: React.FC<PhoneInputProps> = (props): React.ReactElement => {
  const strings = useStrings(['PHONE'])
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

  const getBorderColor = (): string => {
    if (focused) {
      return theme.palette.primary.main
    }

    return theme.palette.mode === 'light'
      ? // ? 'rgba(0, 0, 0, 0.23)'
        theme.palette.grey[400]
      : theme.palette.grey[600]
  }

  const getLabelStyles = (): string => {
    let color = getBorderColor()
    let backgroundColor = theme.palette.background.paper

    if (focused && theme.palette.mode === 'light') {
      backgroundColor = theme.lighten(theme.palette.secondary.main, 0.9)
    }

    if (!focused && theme.palette.mode === 'light') {
      backgroundColor = theme.palette.background.default
      color = theme.palette.grey[600]
    }

    if (!focused && theme.palette.mode === 'dark') {
      color = theme.palette.grey[300]
    }

    return `background-color: ${backgroundColor}; color: ${color}; left: 12px`
  }

  const getInputBackground = (): string => {
    if (focused && theme.palette.mode === 'light') {
      return theme.lighten(theme.palette.secondary.main, 0.9)
    }

    if (focused && theme.palette.mode === 'dark') {
      return theme.palette.background.paper
    }

    return 'transparent'
  }

  React.useEffect(() => {
    const result = document?.getElementsByClassName('special-label')
    if (result && result.length > 0) {
      result[0].setAttribute('style', getLabelStyles())
    }
  })

  const {
    buttonStyleDefaults,
    containerStyleDefaults,
    dropdownStyleDefaults,
    inputStyleDefaults,
    searchStyleDefaults,
  } = getDefaultStyles(theme)

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
    backgroundColor: getInputBackground(),
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
        autoComplete: 'tel',
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
      specialLabel={label || strings.PHONE}
      value={value || defaultValue}
    />
  )
}

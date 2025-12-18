import type React from 'react'
import type { CountryData } from 'react-phone-input-2'

export type PhoneInputProps = {
  defaultCountry: string
  defaultValue: string
  inputId: string
  preferredCountries: string[]
  required: boolean
  value: string
  disabled?: boolean
  label?: string
  buttonStyle?: React.CSSProperties
  containerStyle?: React.CSSProperties
  dropdownStyle?: React.CSSProperties
  inputStyle?: React.CSSProperties
  searchStyle?: React.CSSProperties
  onChange?: (value: string, data: CountryData) => void
  onFocus?: (event: React.FocusEvent<HTMLInputElement>, data: object | CountryData) => void
  onBlur?: (event: React.FocusEvent<HTMLInputElement>, data: object | CountryData) => void
  onClick?: (event: React.MouseEvent<HTMLInputElement>, data: object | CountryData) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

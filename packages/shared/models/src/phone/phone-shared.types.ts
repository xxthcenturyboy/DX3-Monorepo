export type PhoneType = {
  id: string
  countryCode: string
  regionCode?: string
  default: boolean
  phone: string
  label: string
  isDeleted: boolean
  isSent: boolean
  isVerified: boolean
  uiFormatted?: string
}

export type CreatePhonePayloadType = {
  code?: string
  countryCode?: string
  regionCode?: string
  def: boolean
  label: string
  phone: string
  signature?: string
  userId: string
}

export type UpdatePhonePayloadType = {
  id: string
  def?: boolean
  label?: string
}

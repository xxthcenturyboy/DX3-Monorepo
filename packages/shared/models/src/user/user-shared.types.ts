import type { EmailType } from '../email/email-shared.types'
import type { PhoneType } from '../phone/phone-shared.types'

export type UserType = {
  id: string
  createdAt: string
  firstName: string
  lastName: string
  fullName: string
  isAdmin: boolean
  isSuperAdmin: boolean
  emails: EmailType[]
  phones: PhoneType[]
  optInBeta: boolean
  roles: string[]
  username: string
  restrictions: string[]
}

export type CreateUserPayloadType = {
  email: string
  roles: string[]
  username: string
  countryCode?: string
  shouldValidate?: boolean
  regionCode?: string
  firstName?: string
  lastName?: string
  phone?: string
}

export type UserProfileDeviceType = {
  id: string
  hasBiometricSetup: boolean
}

export type UserProfileStateType = {
  a: boolean
  b: boolean
  device: UserProfileDeviceType
  emails: EmailType[]
  firstName: string
  fullName: string
  hasSecuredAccount: boolean
  hasVerifiedEmail: boolean
  hasVerifiedPhone: boolean
  id: string
  lastName: string
  phones: PhoneType[]
  profileImage: string | null
  restrictions: string[]
  role: string[]
  sa: boolean
  timezone: string
  username: string
}

export type UserRoleUi = {
  role: string
  hasRole: boolean
}

export type OtpCodeResponseType = {
  codeSent: boolean
}

export type UpdatePasswordPayloadType = {
  id: string
  password: string
  passwordConfirm: string
  signature?: string
  otp?: {
    code: string
    id: string
    method: 'PHONE' | 'EMAIL'
  }
}

export type GetUserProfileReturnType = {
  profile: UserProfileStateType | string | null
}

export type GetUsersListQueryType = {
  filterValue?: string
  limit?: string | number
  offset?: string | number
  orderBy?: string
  sortDir?: string
}

export type GetUserListResponseType = {
  count: number
  rows: UserType[]
}

export type GetUserQueryType = {
  id?: string
}

export type GetUserResponseType = UserType

export type UpdateUserPayloadType = {
  firstName?: string
  id: string
  lastName?: string
  restrictions?: string[]
  roles?: string[]
  timezone?: string
}

export type UpdateUsernamePayloadType = {
  otpCode?: string
  signature?: string
  username: string
}

export type UpdateUserResponseType = {
  userId: string
}

export type CreateUserResponseType = {
  id: string
  invited: boolean
}

export type ResendInvitePayloadType = {
  id: string
  email: string
}

export type SendInviteResponseType = {
  invited: boolean
}

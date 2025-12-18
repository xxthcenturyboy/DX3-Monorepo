export type SessionData = {
  userId?: string
  refreshToken?: string
  redirectTo?: string
  cancelUrl?: string
  referralToken?: string
  oauthRequestToken?: undefined
  oauthRequestTokenSecret?: undefined
  destroy?: (arg0: unknown) => void
}

export type SignupPayloadType = {
  email: string
  password: string
  passwordConfirm: string
  recaptcha?: string
  redirectUrl?: string
}

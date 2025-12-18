export type UserSessionType = {
  id: string
  fullName: string
  hasSecuredAccount: boolean
  isAdmin: boolean
  isSuperAdmin: boolean
  optInBeta: boolean
  roles: string[]
  username: string
  restrictions: string[]
}

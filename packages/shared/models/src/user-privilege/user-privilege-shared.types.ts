import type { USER_ROLE } from './user-privilege-shared.consts'

export type PrivilegeSetDataType = {
  id: string
  name: keyof typeof USER_ROLE
  order: number
  description: string
}

export type UpdatePrivilegeSetPayloadType = {
  id?: string
  name?: keyof typeof USER_ROLE
  order?: number
  description?: string
}

import type { PrivilegeSetDataType } from '@dx3/models-shared'

import type { USER_ROLE } from './user-privilege-web.consts'

export type UpdatePrivilegeSetPayloadType = {
  id?: string
  name?: keyof typeof USER_ROLE
  order?: number
  description?: string
}

export type PrivilegeSetStateType = {
  sets: PrivilegeSetDataType[]
}

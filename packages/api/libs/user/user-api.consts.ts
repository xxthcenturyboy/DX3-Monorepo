import { convertpHyphensToUnderscores } from '@dx3/utils-shared'

export const USER_ENTITY_NAME = 'user'
export const USER_ENTITY_POSTGRES_DB_NAME = convertpHyphensToUnderscores(USER_ENTITY_NAME)

export const USER_SORT_FIELDS = [
  'firstName',
  'fullName',
  'isAdmin',
  'isSuperAdmin',
  'optInBeta',
  'restrictions',
  'username',
]

export const USER_FIND_ATTRIBUTES = [
  'id',
  'createdAt',
  'firstName',
  'lastName',
  'fullName',
  'isAdmin',
  'isSuperAdmin',
  'optInBeta',
  'roles',
  'username',
  'restrictions',
]

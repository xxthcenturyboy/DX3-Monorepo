import { convertpHyphensToUnderscores } from '@dx3/utils-shared'

// User Privilege
export const USER_PRIVILEGES_ENTITY_NAME = 'user-privileges'
export const USER_PRIVILEGES_POSTGRES_DB_NAME = convertpHyphensToUnderscores(
  USER_PRIVILEGES_ENTITY_NAME,
)

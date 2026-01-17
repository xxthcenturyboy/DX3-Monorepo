import type { IncludeOptions } from 'sequelize'

export const EMAIL_ENTITY_NAME = 'email'
export const EMAIL_POSTGRES_DB_NAME = 'email'

export const EMAIL_MODEL_OPTIONS: IncludeOptions = {
  association: 'emails',
  attributes: [
    'id',
    'default',
    'emailObfuscated',
    'isVerified',
    'label',
    'verifiedAt',
    'deletedAt',
  ],
  required: false,
  where: {
    deletedAt: null,
  },
}

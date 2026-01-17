import type { IncludeOptions } from 'sequelize'

export const PHONE_ENTITY_NAME = 'phone'
export const PHONE_POSTGRES_DB_NAME = 'phone'
export const PHONE_MODEL_OPTIONS: IncludeOptions = {
  association: 'phones',
  attributes: [
    'id',
    'countryCode',
    'default',
    'isVerified',
    'label',
    'phoneObfuscated',
    'phoneFormatted',
    'verifiedAt',
    'deletedAt',
  ],
  where: {
    deletedAt: null,
  },
}

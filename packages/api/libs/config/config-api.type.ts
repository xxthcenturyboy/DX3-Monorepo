import type { Sequelize } from 'sequelize-typescript'

import type { ApiLoggingClassType } from '../logger'
import type { RedisServiceType } from '../redis'

export type SendgridConfigType = {
  apiKey: string
  url: string
}

export type ApiConfigType = {
  appName: string
  debug: boolean
  host: string
  isLocal: boolean
  logger: ApiLoggingClassType
  nodeEnv: string
  port: number
  postgresDbh: typeof Sequelize.prototype
  redis: RedisServiceType
  sendgrid: SendgridConfigType
  sessionSecret: string
  webUrl: string
}

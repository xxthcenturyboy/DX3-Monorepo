/** biome-ignore-all lint/suspicious/noExplicitAny: Type ok> */
import type { ModelCtor } from 'sequelize-typescript'

export type PostgresUrlObject = {
  params: any
  protocol?: string
  user?: string
  password?: string
  host?: string
  hostname?: string
  port?: number
  segments?: string[]
}

export type PostgresConnectionParamsType = {
  // logger: ApiLoggingClassType;
  models: ModelCtor[]
  postgresUri: string
}

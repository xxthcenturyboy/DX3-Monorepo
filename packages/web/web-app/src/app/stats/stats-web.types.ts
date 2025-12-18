import type {
  HealthzHttpType,
  HealthzMemoryType,
  HealthzPostgresType,
  HealthzRedisType,
} from '@dx3/models-shared'

export type StatsApiHealthType = {
  http?: HealthzHttpType
  memory?: HealthzMemoryType
  postgres?: HealthzPostgresType
  redis?: HealthzRedisType
}

export type StatsStateType = {
  api?: StatsApiHealthType
}

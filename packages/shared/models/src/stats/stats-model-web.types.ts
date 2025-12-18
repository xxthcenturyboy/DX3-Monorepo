import type {
  HealthzHttpType,
  HealthzMemoryType,
  HealthzPostgresType,
  HealthzRedisType,
} from '../healthz/heathz-shared.types'

export type StatsApiHealthType = {
  http?: HealthzHttpType
  memory?: HealthzMemoryType
  postgres?: HealthzPostgresType
  redis?: HealthzRedisType
}

export type StatsStateType = {
  api?: StatsApiHealthType
}

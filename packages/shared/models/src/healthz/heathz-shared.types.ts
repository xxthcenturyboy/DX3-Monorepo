export type RedisHealthzResponse = {
  ping: boolean
  read: boolean
  write: boolean
}

export type HealthzHttpType = {
  status: string | number
}

export type HealthzMemoryType = {
  status: string
  usage: NodeJS.MemoryUsage
  // usage: {
  //   rss: number;
  //   heapTotal: number;
  //   heapUsed: number;
  //   external: number;
  //   arrayBuffers: number;
  // }
}

export type HealthzRedisType = {
  status: string
  profile: RedisHealthzResponse
}

export type HealthzPostgresType = {
  status: string
  version: string
}

export type HealthzStatusType = {
  status: string
  http: HealthzHttpType
  memory: HealthzMemoryType
  redis: HealthzRedisType
  postgres: HealthzPostgresType
}

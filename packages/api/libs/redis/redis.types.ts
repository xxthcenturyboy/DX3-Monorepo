export type RedisExpireOptions = {
  token: 'EX' | 'PX' | 'EXAT' | 'PXAT' | 'KEEPTTL'
  time: number
}

export type RedisConfigType = {
  port: number
  prefix: string
  url: string
}

export type RedisConstructorType = {
  isLocal: boolean
  redis: RedisConfigType
}

// export type RedisHealthzConstructorType = {
//   logger: ApiLoggingClassType;
//   cacheService: RedisServiceType;
// };

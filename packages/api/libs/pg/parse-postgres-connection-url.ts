import { regexPostgresUrl } from '@dx3/utils-shared'

import type { PostgresUrlObject } from './postgres.types'

export function parsePostgresConnectionUrl(postgresUrl: string): PostgresUrlObject | undefined {
  const matches = postgresUrl.match(regexPostgresUrl)
  if (!(Array.isArray(matches) && matches.length)) {
    return
  }

  const params = {}
  if (matches[5]) {
    matches[5].split('&').map((x) => {
      const a = x.split('=')
      params[a[0]] = a[1]
    })
  }

  const protocol = matches[1] || undefined
  const user = matches[2] ? matches[2].split(':')[0] : undefined
  const password = matches[2] ? matches[2].split(':')[1] : undefined
  const host = matches[3] || undefined
  const hostname = matches[3] ? matches[3].split(/:(?=\d+$)/)[0] : undefined
  const port = matches[3] ? Number(matches[3].split(/:(?=\d+$)/)[1]) : undefined
  const segments = matches[4] ? matches[4].split('/') : undefined

  if (!protocol && !user && !password && !hostname && !host && !port && !segments?.length) {
    return
  }

  return {
    host,
    hostname,
    params,
    password,
    port,
    protocol,
    segments,
    user,
  }
}

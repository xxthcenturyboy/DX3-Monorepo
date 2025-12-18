/* eslint-disable */
// import { POSTGRES_URI } from '../../../../config/src';
const POSTGRES_URI = ''
const configObj = url2obj(POSTGRES_URI)

// console.log(configObj);

module.exports = {
  development: {
    database: configObj.segments[0],
    dialect: 'postgres',
    host: configObj.hostname,
    password: configObj.password,
    port: configObj.port || 5432,
    username: configObj.user,
  },
  production: {
    database: configObj.segments[0],
    dialect: 'postgres',
    host: configObj.hostname,
    password: configObj.password,
    port: configObj.port || 5432,
    username: configObj.user,
  },
  test: {
    database: 'test',
    dialect: 'postgres',
    host: '127.0.0.0',
    password: null,
    port: configObj.port || 5432,
    username: 'root',
  },
}

// Used to parse the POSTGRES_URI env var so that we don't have to pass a bunch
// of env vars instead of just a single POSTGRES_URI env var.
function url2obj(url) {
  var pattern =
    /^(?:([^:/?#\s]+):\/{2})?(?:([^@/?#\s]+)@)?([^/?#\s]+)?(?:\/([^?#\s]*))?(?:[?]([^#\s]+))?\S*$/
  var matches = url.match(pattern)
  var params = {}
  if (matches[5] !== undefined) {
    matches[5].split('&').map((x) => {
      var a = x.split('=')
      params[a[0]] = a[1]
    })
  }

  return {
    host: matches[3],
    hostname: matches[3] !== undefined ? matches[3].split(/:(?=\d+$)/)[0] : undefined,
    params: params,
    password: matches[2] !== undefined ? matches[2].split(':')[1] : undefined,
    port: matches[3] !== undefined ? matches[3].split(/:(?=\d+$)/)[1] : undefined,
    protocol: matches[1],
    segments: matches[4] !== undefined ? matches[4].split('/') : undefined,
    user: matches[2] !== undefined ? matches[2].split(':')[0] : undefined,
  }
}

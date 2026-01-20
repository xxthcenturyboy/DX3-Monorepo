const { context } = require('esbuild')
const fs = require('node:fs')
const path = require('node:path')

const outdir = path.resolve(__dirname, '../api-app-dist/')

// Clean the output directory before building.
if (fs.existsSync(outdir)) {
  fs.rmSync(outdir, { force: true, recursive: true })
}

// Read package.json to collect all npm dependencies
const packageJson = require('./package.json')

// Packages that MUST be bundled (not external) due to ESM/CJS issues
const FORCE_BUNDLE = [
  'bad-words', // Has ESM/CJS conflict when loaded at runtime (v4.0.0 bug)
  'badwords-list', // Dependency of bad-words
]

// Collect all npm dependencies (but not @dx3/* workspace packages)
function collectAllNpmDependencies() {
  const allDeps = new Set()

  // Add API's direct dependencies (excluding force-bundled packages)
  Object.keys(packageJson.dependencies || {}).forEach((dep) => {
    if (!dep.startsWith('@dx3/') && !FORCE_BUNDLE.includes(dep)) {
      allDeps.add(dep)
    }
  })

  // Add common workspace library dependencies
  // These are packages used by workspace libs that should be external
  const commonLibDeps = [
    'winston',
    'winston-daily-rotate-file',
    'ioredis',
    'ioredis-mock',
    'sequelize',
    'sequelize-typescript',
    'socket.io',
    '@socket.io/redis-adapter',
    '@aws-sdk/client-s3',
    '@aws-sdk/s3-request-presigner',
    'dayjs',
    // NOTE: 'bad-words' is in FORCE_BUNDLE array above (ESM/CJS conflict)
    'google-libphonenumber',
    'node-rsa',
  ]

  commonLibDeps.forEach((dep) => allDeps.add(dep))

  return Array.from(allDeps)
}

// Mark npm dependencies as external, workspace packages (@dx3/*) will be bundled
const external = collectAllNpmDependencies()

// Check for a --watch flag
const isWatching = process.argv.includes('--watch')
const isProduction = process.env.NODE_ENV === 'production'

const buildOptions = {
  // Ensure CommonJS output is recognized as such
  banner: {
    js: '"use strict";',
  },
  bundle: true,
  entryPoints: ['src/main.ts'],
  external,
  format: 'cjs',
  logLevel: 'info',
  // Add proper module resolution hints
  mainFields: ['module', 'main'],
  // outbase: 'src',
  outdir,
  platform: 'node',
  sourcemap: isProduction ? false : 'linked',
  target: 'node22',
  // Use the tsconfig.json to get paths and compiler options
  tsconfig: 'tsconfig.app.json',
}

function copyGeoIpDb() {
  const sourcePath = path.resolve(
    __dirname,
    '..',
    'libs/geoip/GeoLite2-City_20260116/GeoLite2-City.mmdb',
  )

  if (!fs.existsSync(sourcePath)) {
    console.log('ℹ️ GeoIP database not found; skipping copy step.')
    return
  }

  const destinationPath = path.resolve(outdir, 'geoip/GeoLite2-City.mmdb')
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true })
  fs.copyFileSync(sourcePath, destinationPath)
  console.log(`✅ GeoIP database copied to ${destinationPath}`)
}

context(buildOptions)
  .then((ctx) => {
    if (isWatching) {
      console.log('👀 Watching for changes...')
      return ctx.watch().then(() => copyGeoIpDb())
    } else {
      console.log('🚀 Building...')
      return ctx
        .rebuild()
        .then(() => copyGeoIpDb())
        .then(() => ctx.dispose())
    }
  })
  .catch(() => process.exit(1))

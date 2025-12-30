import { DEVELOPMENT } from './config-web.consts'

type WebAppEnvType = {
  API_PORT: string
  API_URL: string
  ENV: string
  NODE_ENV: string
  WEB_APP_PORT: string
  WEB_APP_URL: string
}

declare global {
  interface Window {
    WEB_APP_ENV: WebAppEnvType
  }
}

// Read environment variables from process.env (injected by dotenv-webpack)
const webAppEnvVars: WebAppEnvType = {
  API_PORT: process.env.API_PORT || '',
  API_URL: process.env.API_URL || '',
  ENV: process.env.ENV || process.env.NODE_ENV || DEVELOPMENT,
  NODE_ENV: process.env.NODE_ENV || DEVELOPMENT,
  WEB_APP_PORT: process.env.WEB_APP_PORT || '3000',
  WEB_APP_URL: process.env.WEB_APP_URL || 'http://localhost:3000',
}

window.WEB_APP_ENV = webAppEnvVars

export const WEB_APP_ENV: WebAppEnvType = {
  ...webAppEnvVars,
}

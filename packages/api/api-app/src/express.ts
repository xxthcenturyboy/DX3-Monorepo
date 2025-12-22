// import { DxDateUtilClass } from '@dx/util-dates';

import cookieParser from 'cookie-parser'
import cors from 'cors'
import type { Express, NextFunction, Request, Response } from 'express'
import express from 'express'
import { logger as expressWinston } from 'express-winston'
import helmet from 'helmet'

import { handleError } from '@dx3/api-libs/error-handler/error-handler'
import { ApiLoggingClass } from '@dx3/api-libs/logger'

import { isProd, isStaging, webUrl } from './config/config-api.service'

type DxApiSettingsType = {
  DEBUG: boolean
  SESSION_SECRET: string
}

export async function configureExpress(app: Express, _settings: DxApiSettingsType) {
  const allowedOrigin = webUrl()

  // Trust the first proxy only when in production/staging
  // This ensures req.ip reflects the real client IP when behind a load balancer
  // and prevents X-Forwarded-For header spoofing from bypassing rate limits
  if (isProd() || isStaging()) {
    app.set('trust proxy', 1)
  }

  // Security headers via Helmet
  app.use(
    helmet({
      // Content Security Policy - API typically doesn't serve HTML
      contentSecurityPolicy: false,
      // Cross-Origin settings for API
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      // Prevent clickjacking (API doesn't serve pages, but good practice)
      frameguard: { action: 'deny' },
      // Hide X-Powered-By header
      hidePoweredBy: true,
      // Strict-Transport-Security for HTTPS
      hsts:
        isProd() || isStaging()
          ? {
              includeSubDomains: true,
              maxAge: 31536000, // 1 year
              preload: true,
            }
          : false,
      // Prevent MIME type sniffing
      noSniff: true,
      // XSS filter (legacy browsers)
      xssFilter: true,
    }),
  )

  app.use(
    cors({
      credentials: true,
      origin: allowedOrigin,
    }),
  )
  // Support json & urlencoded requests.
  app.use(express.json({ limit: '10mb', type: 'application/json' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Parse Cookies
  app.use(cookieParser())

  // Log HTTP requests
  app.use(
    expressWinston({
      meta: true,
      msg: 'HTTP {{res.statusCode}} {{req.method}} {{req.url}} {{req.ip}} - userId: {{req.user?.id || "NONE"}} {{res.responseTime}}ms',
      winstonInstance: ApiLoggingClass.instance.logger,
    }),
  )

  // Serve files in the /public directory as static files.
  // app.use('/bundles', express.static(`${API_ROOT}/dist/bundles`));
  // app.use(express.static(`${API_ROOT}/dist`));

  // Redirect HTTP to HTTPS (if enabled)
  // if (settings.REDIRECT_HTTPS) {
  //   app.use('*', (req, res, next) => {
  //     if (req.protocol !== 'https') {
  //       return res.redirect(`https://${req.headers.host}${req.url}`);
  //     }
  //     return next();
  //   });
  // }

  // Check basic auth if enabled
  // app.use('*', (req, res, next) => {
  //   // redirect www to non-www
  //   if (/^www\.advancedbasics\.com/.test(req.hostname)) {
  //     const next = `https://advancedbasics.com${req.originalUrl}`;

  //     return res.redirect(next);
  //   }

  //   if (settings.BASIC_AUTH) {
  //     const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  //     const [login, password] =
  //       new Buffer(b64auth, 'base64').toString().split(':');
  //     const [l, p] = settings.BASIC_AUTH.split(':');

  //     if (!login || !password || login !== l || password !== p) {
  //       res.set('WWW-Authenticate', 'Basic realm="web"');
  //       res.status(401).send('Authorization required.');
  //     } else {
  //       next();
  //     }
  //   } else {
  //     next();
  //   }
  // });

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    handleError(req, res, err, '')
  })
}

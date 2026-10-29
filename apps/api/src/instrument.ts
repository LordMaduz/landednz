// Imported first by server.ts so Sentry can patch modules before they load. No DSN = no-op.
import * as Sentry from '@sentry/node'
import { config } from './shared/config.js'

if (config.sentryDsn) {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: config.nodeEnv,
    release: config.release,
    tracesSampleRate: 0.1,
    // Sentry 11 replaced sendDefaultPii: collect no user info, cookies, headers (Authorization), bodies (chat messages) or query strings
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
  })
}

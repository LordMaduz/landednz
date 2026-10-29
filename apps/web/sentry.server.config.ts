import * as Sentry from "@sentry/nextjs";

// No DSN (local, CI) = Sentry stays off.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    // Sentry 11 replaced sendDefaultPii: collect no user info, cookies, headers, bodies or query strings
    dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
  });
}

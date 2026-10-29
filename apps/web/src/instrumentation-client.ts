// Loaded only when a DSN is set, so the Sentry browser bundle stays out of the landing page budget otherwise.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  void import("@sentry/nextjs").then((Sentry) =>
    Sentry.init({
      dsn,
      tracesSampleRate: 0.1,
      dataCollection: { userInfo: false, cookies: false, httpHeaders: false, httpBodies: [], urlQueryParams: false },
    }),
  );
}

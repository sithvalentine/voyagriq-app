import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set environment
  environment: process.env.NODE_ENV,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Replay configuration for session replay (optional - requires additional setup)
  // replaysOnErrorSampleRate: 1.0, // Capture 100% of errors
  // replaysSessionSampleRate: 0.1, // Capture 10% of sessions

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Don't send events in development
    if (process.env.NODE_ENV !== 'production') {
      return null;
    }

    // Remove sensitive data from context
    if (event.request) {
      delete event.request.cookies;

      // Remove Authorization headers
      if (event.request.headers) {
        delete event.request.headers['Authorization'];
        delete event.request.headers['authorization'];
      }
    }

    return event;
  },
});

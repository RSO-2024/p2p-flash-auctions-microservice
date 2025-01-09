import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import dotenv from 'dotenv';
dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_URL,
  integrations: [
    nodeProfilingIntegration(),
  ],
});

export function logErrorToSentry(errorMessage : String, req : any) {
  const routePath = req.path;
  const method = req.method;
  const fullUrl = req.originalUrl;

  const sentryMessage = `
      ${errorMessage}
      Route: ${routePath}
      Method: ${method}
      Full URL: ${fullUrl}
  `;

  Sentry.captureMessage(sentryMessage, {
      level: "error",
      extra: {
          routePath,
          method,
          fullUrl,
          query: req.query,
          body: req.body
      },
  });
}
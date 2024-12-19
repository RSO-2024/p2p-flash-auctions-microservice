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
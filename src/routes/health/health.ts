import { Router } from 'express';
import { configManager } from './../../config/configmanager';
import * as Sentry from "@sentry/node";

const router = Router();

function checkConfigHealth() {

  // Just hardcoded
  var requiredEnvVars = [
    'NODE_ENV',
    'SUPABASE_URL',
    'SUPABASE_KEY',
    'SENTRY_URL'
  ]

  const config = configManager.getConfig();
  const loadedVars = Object.keys(config);
  
  // Check for missing required variables
  const missingVars = requiredEnvVars.filter(
      varName => !config[varName] && !process.env[varName]
  );

  return {
      status: missingVars.length === 0 ? 'healthy' : 'unhealthy',
      missingRequiredVars: missingVars,
      loadedVars
  };
}

function getMemoryUsage() {
  const memory = process.memoryUsage();
  return {
      heapUsed: Math.round(memory.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(memory.heapTotal / 1024 / 1024), // MB
      external: Math.round(memory.external / 1024 / 1024), // MB
      rss: Math.round(memory.rss / 1024 / 1024) // MB
  };
}

// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: Health API
 *     responses:
 *       200:
 *          description: Returns a healthy microservice status
 *       500:
 *          description: Returns a json with errors
 */
router.get('/', (req, res) => {

  var config = configManager.getConfig()
  
  try {
    // Check required environment variables
    const missingEnvVars = checkConfigHealth();
    const memoryUsage = getMemoryUsage();

    if (missingEnvVars.status == 'unhealthy') {
      console.log(missingEnvVars)
      res.status(503).json({
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.missingRequiredVars.join(", ")}`,
        details: {
          'memoryUsage': memoryUsage,
          'environmentVars': missingEnvVars
        }
      });
      return;
    }

    res.status(200).json({
      status: "success",
      message: "Service is healthy and environment variables are set.",
      details: {
        'memoryUsage': memoryUsage,
        'environmentVars': missingEnvVars
      }
    });
  } catch (e) {
    // Log to Sentry
    if (config.NODE_ENV === "prod") {
      Sentry.captureException(e);
    }
    console.error(e);
    res.status(500).json({
      status: "success",
      message: "Internal server error when checking health.",
    });
  }

});

export default router
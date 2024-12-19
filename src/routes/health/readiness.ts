import { Router } from 'express';

const router = Router();
import * as Sentry from "@sentry/node";
import { configManager } from './../../config/configmanager';

// Readiness check endpoint
/**
 * @swagger
 * /health/readiness:
 *   get:
 *     tags:
 *       - Health
 *     summary: Readiness API
 *     responses:
 *       200:
 *          description: Returns a healthy microservice status, if the microservice is ready to serve traffic
 *       500:
 *          description: Returns a json with errors
 */
router.get('/readiness', (_, res) => {
    res.status(200).json({ status: 'healthy' });
});

export default router
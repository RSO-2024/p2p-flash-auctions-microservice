import { Router } from 'express';

const router = Router();

// Liveness check endpoint
/**
 * @swagger
 * /health/liveness:
 *   get:
 *     tags:
 *       - Health
 *     summary: Liveness API
 *     responses:
 *       200:
 *          description: Returns a healthy microservice status, if the microservice is alive
 *       500:
 *          description: Returns a json with errors
 */
router.get('/liveness', (_, res) => {
    res.status(200).json({ status: 'healthy' });
});

export default router
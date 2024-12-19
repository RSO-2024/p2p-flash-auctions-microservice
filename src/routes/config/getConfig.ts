import { Router } from "express";
import { configManager } from './../../config/configmanager';

const router = Router();
/**
 * @swagger
 * /config:
 *   get:
 *     tags:
 *       - Config
 *     summary: Config API
 *     responses:
 *       200:
 *          description: Returns current configuration
 */
router.get("/", (req, res) => {
    res.json({ config: configManager.getConfig() });
});

export default router;
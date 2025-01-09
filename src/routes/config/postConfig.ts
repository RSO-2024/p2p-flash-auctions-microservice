import { Router } from "express";
import { configManager } from './../../config/configmanager';

const router = Router();

/**
 * @swagger
 * /config/reload:
 *   post:
 *     tags:
 *       - Config
 *     summary: Config API
 *     responses:
 *       200:
 *          description: Reloads the new configuration dynamically
 */
router.post('/reload', (req, res) => {
    configManager.reloadConfig();
    res.status(200).send({ message: 'Configuration reloaded', config: configManager.getConfig() });
});

export default router;
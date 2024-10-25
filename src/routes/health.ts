import { Router } from 'express';

const router = Router();


// Health check endpoint
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health API
 *     responses:
 *       200:
 *          description: Returns a healthy microservice status
 *       500:
 *          description: Returns a json with errors
 */
router.get('/health', (req, res) => {

    // Check required environment variables
    const missingEnvVars = [];
    if (!process.env.SUPABASE_URL) missingEnvVars.push("SUPABASE_URL");
    if (!process.env.SUPABASE_KEY) missingEnvVars.push("SUPABASE_KEY");
    if (!process.env.SUPABASE_JWKS_URI) missingEnvVars.push("SUPABASE_JWKS_URI");
    if (!process.env.SUPABASE_AUDIENCE) missingEnvVars.push("SUPABASE_AUDIENCE");
  
    if (missingEnvVars.length > 0) {
      res.status(500).json({
        status: "error",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      });
      return;
    }
  
    res.status(200).json({
      status: "success",
      message: "Service is healthy and environment variables are set.",
    });
});

export default router
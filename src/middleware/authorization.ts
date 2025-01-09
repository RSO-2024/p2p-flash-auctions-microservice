import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload, SigningKeyCallback, VerifyErrors } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import supabase from '../supabase/client';
import { configManager } from '../config/configmanager';
import { logErrorToSentry } from '../sentry/instrument';

// Define custom types for request with user information
interface AuthenticatedRequest extends Request {
    user?: JwtPayload | string;
}

// Initialize JWKS client to fetch signing keys
const client = jwksClient({
    jwksUri: process.env.SUPABASE_JWKS_URI as string,
});

// Helper function to get the signing key
async function getSigningKey(kid: string): Promise<string> {
    const key = await client.getSigningKey(kid);
    return key.getPublicKey();
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {

      res.status(401).json({ error: 'Authorization token required' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const response = await supabase.auth.getUser(token);
  
    if (response.error) {

      let errorMessage = `Authorization token is incorrect. | ${response.error.code}`;

      // Log to Sentry
      if (configManager.getConfig().NODE_ENV === "prod") {
        logErrorToSentry(errorMessage, req)
      }
      res.status(401).json({ status: response.error.status, error: errorMessage });
      
      return;
    }
  
    req.body.user = response.data.user;
    next();
  } catch (error) {
    console.error("Error authenticating the request.")

    // Log to Sentry
    if (configManager.getConfig().NODE_ENV === "prod") {
      logErrorToSentry(`${error}`, req)
    }

    res.status(500).json({
      status: "error",
      message: `Error authenticating the user request. ${error}`,
    });
  }
}

// Middleware to verify JWT and enforce authentication
export async function verifyJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Authorization token required' });
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = await verifyToken(token);
    
        if (!decoded) {
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }
    
        // Attach decoded token to request for further handling
        (req as any).user = decoded;
        next();
      } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
      }
}
  
// Middleware for role-based access control
export function requireRole(role: string) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
        const userRoles = req.user && (req.user as JwtPayload).role; // Adjust according to JWT structure

        if (!userRoles || (Array.isArray(userRoles) && !userRoles.includes(role))) {
        res.status(403).json({ error: 'Forbidden: Insufficient privileges' });
        return;
        }
        next();
    };
}

// Helper function to verify the JWT asynchronously
async function verifyToken(token: string): Promise<JwtPayload | undefined> {
    const decodedToken = await new Promise<JwtPayload | undefined>((resolve, reject) => {
      jwt.verify(
        token,
        async (header, callback) => {
          try {
            const signingKey = await getSigningKey(header.kid!);
            callback(null, signingKey);
          } catch (error) {
            callback(error instanceof Error ? error : new Error(String(error)));;
          }
        },
        { algorithms: ['HS256'], audience: process.env.SUPABASE_AUDIENCE },
        (err, decoded) => {
          if (err) {
            reject(err);
          } else {
            resolve(decoded as JwtPayload);
          }
        }
      );
    });
  
    return decodedToken;
}


// Vercel serverless function that handles all API routes
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app (reused across requests in same instance)
let app: express.Express | null = null;

async function getApp() {
  if (!app) {
    app = express();
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: false, limit: '2mb' }));
    
    // registerRoutes returns a Server, but we just need the app with routes registered
    // The function registers routes as a side effect
    await registerRoutes(app);
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const expressApp = await getApp();
    
    // Convert Vercel request to Express-compatible request
    return new Promise((resolve, reject) => {
      expressApp(req as any, res as any, (err: any) => {
        if (err) {
          console.error('Express error:', err);
          res.status(500).json({ error: 'Internal server error' });
          reject(err);
        } else {
          res.status(404).json({ error: 'Not found' });
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}

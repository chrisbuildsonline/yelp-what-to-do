// Vercel serverless function that handles all API routes
import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';

// Create Express app (reused across requests in same instance)
let app: express.Express | null = null;
let initialized = false;

async function getApp() {
  if (!app) {
    app = express();
    app.use(express.json({ limit: '2mb' }));
    app.use(express.urlencoded({ extended: false, limit: '2mb' }));
    await registerRoutes(app);
    initialized = true;
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await getApp();
  
  // Convert Vercel request to Express-compatible request
  return new Promise((resolve) => {
    expressApp(req as any, res as any, () => {
      res.status(404).json({ error: 'Not found' });
      resolve(undefined);
    });
  });
}

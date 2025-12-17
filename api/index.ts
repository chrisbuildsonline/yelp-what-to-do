import type { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { app } from '../server/app';

let initialized = false;

async function initApp() {
  if (!initialized) {
    await registerRoutes(app);
    initialized = true;
  }
  return app;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = await initApp();
  return expressApp(req as any, res as any);
}
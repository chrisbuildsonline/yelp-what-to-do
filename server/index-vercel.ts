import fs from "node:fs";
import path from "node:path";
import express, { type Express, type Request, type Response } from "express";
import { registerRoutes } from "./routes";
import { app } from "./app";

let initialized = false;

async function initApp() {
  if (!initialized) {
    // Register API routes
    await registerRoutes(app);
    
    // Serve static files
    const distPath = path.resolve(process.cwd(), "dist/public");
    
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      
      // fall through to index.html if the file doesn't exist
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(distPath, "index.html"));
      });
    }
    
    initialized = true;
  }
  return app;
}

// Vercel serverless function handler
export default async function handler(req: Request, res: Response) {
  const expressApp = await initApp();
  return expressApp(req, res);
}
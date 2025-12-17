// Standalone API server for local development
import 'dotenv/config';
import express from 'express';
import { registerRoutes } from './routes';

const app = express();

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false, limit: '2mb' }));

// Register all API routes
registerRoutes(app).then((server) => {
  const port = parseInt(process.env.API_PORT || '3001', 10);
  
  server.listen(port, '0.0.0.0', () => {
    console.log(`🚀 API server running on http://localhost:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start API server:', err);
  process.exit(1);
});

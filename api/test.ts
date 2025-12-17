import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  res.json({ 
    message: 'Test endpoint working',
    method: req.method,
    timestamp: new Date().toISOString(),
    env: {
      hasYelpKey: !!process.env.YELP_API_KEY,
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      nodeEnv: process.env.NODE_ENV
    }
  });
}
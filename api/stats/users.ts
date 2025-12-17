import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseDB } from '../../server/supabase-db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userCount = await supabaseDB.getUserCount();
    res.json({ count: userCount });
  } catch (error) {
    console.error('Get user count error:', error);
    res.json({ count: 0 });
  }
}
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { deleteSession } from '../../server/session-manager';

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId } = req.body;
  if (sessionId) {
    deleteSession(sessionId);
  }
  res.json({ success: true });
}
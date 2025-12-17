import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // For now, just return success without actually creating user
    // This tests if the basic function structure works
    res.json({
      message: 'Signup endpoint working',
      received: { username, email, hasPassword: !!password },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Signup failed' });
  }
}
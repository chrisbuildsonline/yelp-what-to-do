import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseDB } from '../../server/supabase-db';
import { requireAuth } from '../../server/session-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireAuth(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    // Create trip
    try {
      const { name, location, interests, companions } = req.body;
      const userId = session.userId;

      if (!name || !location) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const newTrip = await supabaseDB.createTrip(
        userId,
        name,
        location,
        interests || [],
        companions || []
      );

      res.json(newTrip);
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to create trip' });
    }
  } else if (req.method === 'GET') {
    // Get all trips
    try {
      const userId = session.userId;
      const userTrips = await supabaseDB.getTripsByUserId(userId);
      res.json(userTrips);
    } catch (error) {
      console.error('Get trips error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch trips' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
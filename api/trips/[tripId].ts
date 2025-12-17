import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseDB } from '../../server/supabase-db';
import { requireAuth } from '../../server/session-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const session = requireAuth(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { tripId } = req.query;
  if (!tripId || typeof tripId !== 'string') {
    return res.status(400).json({ error: 'Trip ID is required' });
  }

  const userId = session.userId;

  if (req.method === 'GET') {
    // Get trip details
    try {
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (tripData.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const places = await supabaseDB.getSavedPlacesByTripId(tripId);
      res.json({
        trip: tripData,
        places,
      });
    } catch (error) {
      console.error('Get trip error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch trip' });
    }
  } else if (req.method === 'DELETE') {
    // Delete trip
    try {
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      if (tripData.userId !== userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await supabaseDB.deleteTrip(tripId);
      res.json({ success: true });
    } catch (error) {
      console.error('Delete trip error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to delete trip' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
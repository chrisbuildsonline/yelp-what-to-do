import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabaseDB } from '../../../server/supabase-db';
import { requireAuth } from '../../../server/session-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireAuth(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { tripId } = req.query;
    const { yelpBusinessId, businessName, businessData, customNotes, aiReason } = req.body;
    const userId = session.userId;

    if (!tripId || typeof tripId !== 'string') {
      return res.status(400).json({ error: 'Trip ID is required' });
    }

    const tripData = await supabaseDB.getTripById(tripId);
    if (!tripData || tripData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newPlace = await supabaseDB.createSavedPlace(
      tripId,
      yelpBusinessId,
      businessName,
      businessData || {},
      customNotes,
      aiReason
    );

    res.json(newPlace);
  } catch (error) {
    console.error('Save place error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to save place' });
  }
}
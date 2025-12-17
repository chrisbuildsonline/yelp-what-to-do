import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { getCachedYelpResults, setCachedYelpResults } from '../../../server/yelp-cache';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id } = req.query;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Business ID is required' });
    }

    const cachedBusiness = getCachedYelpResults('business', id, '');
    if (cachedBusiness) {
      return res.json(cachedBusiness);
    }

    const response = await axios.get(`https://api.yelp.com/v3/businesses/${id}`, {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      },
    });

    setCachedYelpResults('business', id, '', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Yelp API error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch business details' });
  }
}
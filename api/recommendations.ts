import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAuth } from '../server/session-manager';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const session = requireAuth(req);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { businesses, interests, companions, location, userAge, travelingWithKids, kidsAges } = req.body;

    if (!businesses || !Array.isArray(businesses)) {
      return res.status(400).json({ error: 'Invalid businesses data' });
    }

    const recommendations = businesses.slice(0, 5).map((b: any, idx: number) => {
      const matchedInterests = interests.filter(
        (interest: string) => b.categories.some((c: any) => c.title.toLowerCase().includes(interest.toLowerCase()))
      );

      let reason = `Highly rated with ${b.review_count} reviews`;
      if (matchedInterests.length > 0) {
        reason = `Perfect for your interest in ${matchedInterests[0]}`;
      }

      if (travelingWithKids && kidsAges && kidsAges.length > 0) {
        reason += ` and family-friendly`;
      }

      if (companions && companions.length > 0) {
        const companionInterests = companions.flatMap((c: any) => c.interests);
        const sharedInterests = interests.filter((i: string) => companionInterests.includes(i));
        if (sharedInterests.length > 0) {
          reason += ` - everyone will enjoy it`;
        } else {
          reason += ` - great for your group`;
        }
      }

      return {
        businessId: b.id,
        businessName: b.name,
        reason,
      };
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Recommendation error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate recommendations' });
  }
}
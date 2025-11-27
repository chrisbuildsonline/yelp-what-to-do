import { useMutation } from '@tanstack/react-query';
import type { Companion } from '@/lib/store';

export interface RecommendationRequest {
  businesses: any[];
  interests: string[];
  companions: Companion[];
  location: string;
  userAge?: number;
  travelingWithKids?: boolean;
  kidsAges?: number[];
}

export interface Recommendation {
  businessId: string;
  businessName: string;
  reason: string;
}

export function useRecommendations(sessionId: string | null) {
  return useMutation({
    mutationFn: async (data: RecommendationRequest) => {
      if (!sessionId) throw new Error('Not authenticated');

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to get recommendations');
      }

      return response.json() as Promise<Recommendation[]>;
    },
  });
}

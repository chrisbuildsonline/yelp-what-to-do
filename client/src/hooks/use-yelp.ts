import { useQuery } from '@tanstack/react-query';

export interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  image_url: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
  };
  categories: Array<{ title: string }>;
  price?: string;
  distance: number;
  url: string;
  phone: string;
}

export function useYelpSearch(location: string, term: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['yelp', location, term],
    queryFn: async () => {
      const response = await fetch(
        `/api/yelp/search?location=${encodeURIComponent(location)}&term=${encodeURIComponent(term)}&limit=20`
      );
      if (!response.ok) throw new Error('Failed to fetch Yelp data');
      return response.json();
    },
    enabled: enabled && !!location,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

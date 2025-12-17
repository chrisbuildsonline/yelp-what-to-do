import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { getCachedYelpResults, setCachedYelpResults } from '../../server/yelp-cache';

// Map user interests to Yelp search queries and categories
const interestMapping: Record<string, { terms: string[]; categories: string[] }> = {
  "Fine Dining": { terms: ["fine dining", "upscale restaurants"], categories: ["restaurants"] },
  "Street Food": { terms: ["street food", "food trucks", "street vendor"], categories: ["foodtrucks", "street_vendors"] },
  "Hiking": { terms: ["hiking trails", "outdoor adventure"], categories: ["hiking", "parks", "outdoor"] },
  "Museums": { terms: ["museums", "art galleries"], categories: ["museums", "galleries"] },
  "Nightlife": { terms: ["bars", "nightclubs", "cocktail bars"], categories: ["nightlife", "bars", "clubs"] },
  "Coffee": { terms: ["coffee shops", "cafes"], categories: ["coffee", "cafes"] },
  "Shopping": { terms: ["shopping", "boutiques", "shopping centers"], categories: ["shopping", "malls"] },
  "Live Music": { terms: ["live music", "music venues", "concerts"], categories: ["musicvenues", "nightlife"] },
  "History": { terms: ["historical sites", "historical tours", "heritage"], categories: ["landmarks", "tours"] },
  "Architecture": { terms: ["architecture", "architectural tours", "buildings"], categories: ["landmarks", "tours"] },
  "Nature": { terms: ["parks", "nature", "natural attractions"], categories: ["parks", "hiking", "outdoors"] },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      location,
      term,
      categories,
      limit = 50,
      interests,
      travelingWithKids,
      kidsAges,
      groupSize,
      companionAges,
      userAge,
    } = req.query;

    if (!location || typeof location !== 'string') {
      return res.status(400).json({ error: 'location parameter is required' });
    }

    const apiKey = process.env.YELP_API_KEY;
    if (!apiKey) {
      console.error('YELP_API_KEY not set');
      return res.status(500).json({ error: 'Yelp API key not configured' });
    }

    const interestsList = interests ? (interests as string).split(',').filter(Boolean) : [];
    const hasKids = travelingWithKids === 'true';
    const kidsAgesList = kidsAges ? (kidsAges as string).split(',').map(Number).filter(Boolean) : [];
    const groupSizeNum = parseInt(groupSize as string) || 1;
    const companionAgesList = companionAges ? (companionAges as string).split(',').map(Number).filter(Boolean) : [];
    const userAgeNum = parseInt(userAge as string) || 30;

    let searchTerm = (term as string) || '';
    let searchCategories = (categories as string) || '';

    const additionalAttributes = [];
    if (hasKids) {
      additionalAttributes.push('family-friendly');
      if (kidsAgesList.some((age) => age < 5)) {
        additionalAttributes.push('kid-friendly');
      }
      if (kidsAgesList.some((age) => age >= 5 && age <= 12)) {
        additionalAttributes.push('good for kids');
      }
    }

    if (groupSizeNum >= 6) {
      additionalAttributes.push('good for groups');
    }

    const allAges = [userAgeNum, ...companionAgesList].filter(Boolean);
    const avgAge = allAges.length > 0 ? allAges.reduce((a, b) => a + b, 0) / allAges.length : 30;

    if (avgAge < 25) {
      if (!searchTerm) searchTerm = 'trendy popular';
    } else if (avgAge > 55) {
      additionalAttributes.push('quiet');
    }

    const contextTerms = additionalAttributes.length > 0 ? `${searchTerm} ${additionalAttributes.join(' ')}`.trim() : searchTerm || 'restaurants';

    const cacheKey = `${location}-${contextTerms}-${searchCategories}-${hasKids}-${groupSizeNum}`;
    const cachedResults = getCachedYelpResults(location, contextTerms, cacheKey);
    if (cachedResults) {
      return res.json(cachedResults);
    }

    const allBusinesses: any[] = [];
    const seenIds = new Set<string>();

    // Primary search
    const primaryResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: {
        location,
        term: contextTerms,
        categories: searchCategories,
        limit: 50,
        sort_by: 'best_match',
      },
    });

    primaryResponse.data.businesses?.forEach((b: any) => {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        allBusinesses.push(b);
      }
    });

    // Rating-based search
    const ratingResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${apiKey}` },
      params: {
        location,
        term: searchTerm || 'best',
        limit: 50,
        sort_by: 'rating',
      },
    });

    ratingResponse.data.businesses?.forEach((b: any) => {
      if (!seenIds.has(b.id)) {
        seenIds.add(b.id);
        allBusinesses.push(b);
      }
    });

    // Interest-based searches
    for (const interest of interestsList.slice(0, 4)) {
      try {
        const interestTerms = interestMapping[interest]?.terms || [interest.toLowerCase()];
        const interestCategories = interestMapping[interest]?.categories?.join(',') || '';

        const interestResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
          headers: { Authorization: `Bearer ${apiKey}` },
          params: {
            location,
            term: interestTerms[0],
            categories: interestCategories,
            limit: 30,
            sort_by: 'best_match',
          },
        });

        interestResponse.data.businesses?.forEach((b: any) => {
          if (!seenIds.has(b.id)) {
            seenIds.add(b.id);
            allBusinesses.push(b);
          }
        });
      } catch (err) {
        console.log(`Interest search for ${interest} failed, continuing...`);
      }
    }

    // Family-friendly search
    if (hasKids) {
      try {
        const familyResponse = await axios.get('https://api.yelp.com/v3/businesses/search', {
          headers: { Authorization: `Bearer ${apiKey}` },
          params: {
            location,
            term: 'family friendly kids activities',
            categories: 'kids_activities,amusementparks,zoos,aquariums,playgrounds',
            limit: 30,
            sort_by: 'best_match',
          },
        });

        familyResponse.data.businesses?.forEach((b: any) => {
          if (!seenIds.has(b.id)) {
            seenIds.add(b.id);
            allBusinesses.push(b);
          }
        });
      } catch (err) {
        console.log('Family search failed, continuing...');
      }
    }

    // Add custom tags and sort
    const taggedBusinesses = allBusinesses.map((business) => {
      const customTags = ['All'];
      const categoryTitles = (business.categories || []).map((c: any) => c.title.toLowerCase());
      const categoryAliases = (business.categories || []).map((c: any) => c.alias?.toLowerCase() || '');
      const allCategories = [...categoryTitles, ...categoryAliases].join(' ');

      if (/restaurant|food|cafe|coffee|dining|bar|bakery|dessert|pizza|burger|sushi|mexican|italian|chinese|thai|indian|breakfast|brunch|lunch|dinner|eatery|bistro|grill|deli|sandwich/i.test(allCategories)) {
        customTags.push('Food');
      }
      if (/activity|tour|entertainment|recreation|sport|adventure|museum|gallery|theater|cinema|bowling|arcade|escape|game|park|zoo|aquarium|attraction|sightseeing|hiking|biking|kayak|boat/i.test(allCategories)) {
        customTags.push('Activities');
      }
      if (/nightlife|bar|club|lounge|pub|cocktail|wine|beer|brewery|distillery|dance|dj|live music|karaoke/i.test(allCategories)) {
        customTags.push('Nightlife');
      }
      if (/landmark|scenic|viewpoint|park|museum|gallery|historic|architecture|monument|observation|tower|bridge|garden|botanical|beach|waterfront|overlook|vista/i.test(allCategories)) {
        customTags.push('Culture');
      }

      return {
        ...business,
        customTags,
      };
    });

    // Sort by rating and review count
    taggedBusinesses.sort((a, b) => {
      const scoreA = (a.rating || 0) * Math.log10((a.review_count || 1) + 1);
      const scoreB = (b.rating || 0) * Math.log10((b.review_count || 1) + 1);
      return scoreB - scoreA;
    });

    const result = {
      businesses: taggedBusinesses,
      total: taggedBusinesses.length,
      region: primaryResponse.data.region,
    };

    setCachedYelpResults(location, contextTerms, cacheKey, result);
    res.json(result);
  } catch (error) {
    console.error('Yelp API error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch from Yelp',
    });
  }
}
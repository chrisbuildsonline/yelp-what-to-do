import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import { supabaseDB } from "./supabase-db";
import bcrypt from "bcrypt";
import { OpenAI } from "openai";
import { getCachedYelpResults, setCachedYelpResults } from "./yelp-cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Session storage (in production, use proper session management)
const sessions = new Map<string, { userId: string; username: string }>();

// Map user interests to Yelp search queries and categories
const interestMapping: Record<string, { terms: string[]; categories: string[] }> = {
  "Fine Dining": { terms: ["fine dining", "upscale restaurants"], categories: ["restaurants"] },
  "Street Food": { terms: ["street food", "food trucks", "street vendor"], categories: ["foodtrucks", "street_vendors"] },
  "Hiking": { terms: ["hiking trails", "outdoor adventure"], categories: ["hiking", "parks", "outdoor"] },
  "Museums": { terms: ["museums", "art galleries"], categories: ["museums", "galleries"] },
  "Nightlife": { terms: ["bars", "nightclubs", "cocktail bars"], categories: ["nightlife", "bars", "clubs"] },
  "Coffee": { terms: ["coffee shops", "cafes"], categories: ["coffee", "cafes"] },
  "Shopping": { terms: ["shopping", "boutiques", "shopping centers"], categories: ["shopping", "malls"] },
  "Photography": { terms: ["scenic views", "landmarks", "viewpoints"], categories: ["landmarks", "parks"] },
  "Live Music": { terms: ["live music", "music venues", "concerts"], categories: ["musicvenues", "nightlife"] },
  "History": { terms: ["historical sites", "historical tours", "heritage"], categories: ["landmarks", "tours"] },
  "Architecture": { terms: ["architecture", "architectural tours", "buildings"], categories: ["landmarks", "tours"] },
  "Nature": { terms: ["parks", "nature", "natural attractions"], categories: ["parks", "hiking", "outdoors"] },
};

function generateSessionId() {
  return Math.random().toString(36).substr(2, 32);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Check if user exists
      const existingUser = await supabaseDB.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const newUser = await supabaseDB.createUser(username, email, hashedPassword);

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        userId: newUser.id,
        username: newUser.username,
      });

      res.json({
        sessionId,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message || "Signup failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }

      // Find user
      const user = await supabaseDB.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Create session
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        userId: user.id,
        username: user.username,
      });

      res.json({
        sessionId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    const sessionId = req.headers["x-session-id"];
    if (!sessionId || !sessions.has(sessionId as string)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.session = sessions.get(sessionId as string);
    next();
  };

  // Trip Routes
  app.post("/api/trips", requireAuth, async (req: any, res) => {
    try {
      const { name, location, interests, companions } = req.body;
      const userId = req.session.userId;

      if (!name || !location) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const newTrip = await supabaseDB.createTrip(
        userId,
        name,
        location,
        interests || [],
        companions || []
      );

      res.json(newTrip);
    } catch (error: any) {
      console.error("Create trip error:", error);
      res.status(500).json({ error: error.message || "Failed to create trip" });
    }
  });

  app.get("/api/trips", requireAuth, async (req: any, res) => {
    try {
      const userId = req.session.userId;
      const userTrips = await supabaseDB.getTripsByUserId(userId);
      res.json(userTrips);
    } catch (error: any) {
      console.error("Get trips error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch trips" });
    }
  });

  app.get("/api/trips/:tripId", requireAuth, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const userId = req.session.userId;

      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      const places = await supabaseDB.getSavedPlacesByTripId(tripId);

      res.json({
        trip: tripData,
        places,
      });
    } catch (error: any) {
      console.error("Get trip error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch trip" });
    }
  });

  app.delete("/api/trips/:tripId", requireAuth, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const userId = req.session.userId;

      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData) {
        return res.status(404).json({ error: "Trip not found" });
      }

      if (tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      await supabaseDB.deleteTrip(tripId);

      res.json({ success: true });
    } catch (error: any) {
      console.error("Delete trip error:", error);
      res.status(500).json({ error: error.message || "Failed to delete trip" });
    }
  });

  // Yelp API Routes - Enhanced with user profile personalization
  app.get("/api/yelp/search", async (req, res) => {
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
        userAge
      } = req.query;

      if (!location || typeof location !== "string") {
        return res.status(400).json({ error: "location parameter is required" });
      }

      const apiKey = process.env.YELP_API_KEY;
      if (!apiKey) {
        console.error("YELP_API_KEY not set");
        return res.status(500).json({ error: "Yelp API key not configured" });
      }

      // Build smart search terms based on user profile
      const interestsList = interests ? (interests as string).split(',').filter(Boolean) : [];
      const hasKids = travelingWithKids === 'true';
      const kidsAgesList = kidsAges ? (kidsAges as string).split(',').map(Number).filter(Boolean) : [];
      const groupSizeNum = parseInt(groupSize as string) || 1;
      const companionAgesList = companionAges ? (companionAges as string).split(',').map(Number).filter(Boolean) : [];
      const userAgeNum = parseInt(userAge as string) || 30;

      // Build personalized search term
      let searchTerm = (term as string) || "";
      let searchCategories = (categories as string) || "";
      const additionalAttributes: string[] = [];

      // Family-friendly modifications
      if (hasKids) {
        additionalAttributes.push("family-friendly");
        if (kidsAgesList.some(age => age < 5)) {
          additionalAttributes.push("kid-friendly");
        }
        if (kidsAgesList.some(age => age >= 5 && age <= 12)) {
          additionalAttributes.push("good for kids");
        }
      }

      // Group size considerations
      if (groupSizeNum >= 6) {
        additionalAttributes.push("good for groups");
      }

      // Age-based preferences
      const allAges = [userAgeNum, ...companionAgesList].filter(Boolean);
      const avgAge = allAges.length > 0 ? allAges.reduce((a, b) => a + b, 0) / allAges.length : 30;
      
      if (avgAge < 25) {
        // Younger crowd - trendy, hip places
        if (!searchTerm) searchTerm = "trendy popular";
      } else if (avgAge > 55) {
        // Older crowd - quieter, more refined
        additionalAttributes.push("quiet");
      }

      // Build the final search term with context
      const contextTerms = additionalAttributes.length > 0 
        ? `${searchTerm} ${additionalAttributes.join(' ')}`.trim()
        : searchTerm || "restaurants";

      // Check cache with full context
      const cacheKey = `${location}-${contextTerms}-${searchCategories}-${hasKids}-${groupSizeNum}`;
      const cachedResults = getCachedYelpResults(location, contextTerms, cacheKey);
      if (cachedResults) {
        return res.json(cachedResults);
      }

      // Make multiple API calls to get more diverse results
      const allBusinesses: any[] = [];
      const seenIds = new Set<string>();

      // Primary search with user's term
      const primaryResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: {
          location,
          term: contextTerms,
          categories: searchCategories,
          limit: 50,
          sort_by: "best_match",
        },
      });

      primaryResponse.data.businesses?.forEach((b: any) => {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          allBusinesses.push(b);
        }
      });

      // Secondary search by rating
      const ratingResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: {
          location,
          term: searchTerm || "best",
          limit: 50,
          sort_by: "rating",
        },
      });

      ratingResponse.data.businesses?.forEach((b: any) => {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          allBusinesses.push(b);
        }
      });

      // Search for each user interest to get diverse results
      for (const interest of interestsList.slice(0, 4)) {
        try {
          const interestTerms = interestMapping[interest]?.terms || [interest.toLowerCase()];
          const interestCategories = interestMapping[interest]?.categories?.join(',') || '';
          
          const interestResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: {
              location,
              term: interestTerms[0],
              categories: interestCategories,
              limit: 30,
              sort_by: "best_match",
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

      // If traveling with kids, add family-specific searches
      if (hasKids) {
        try {
          const familyResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: {
              location,
              term: "family friendly kids activities",
              categories: "kids_activities,amusementparks,zoos,aquariums,playgrounds",
              limit: 30,
              sort_by: "best_match",
            },
          });

          familyResponse.data.businesses?.forEach((b: any) => {
            if (!seenIds.has(b.id)) {
              seenIds.add(b.id);
              allBusinesses.push(b);
            }
          });
        } catch (err) {
          console.log("Family search failed, continuing...");
        }
      }

      // Sort all results by a combination of rating and review count
      allBusinesses.sort((a, b) => {
        const scoreA = (a.rating || 0) * Math.log10((a.review_count || 1) + 1);
        const scoreB = (b.rating || 0) * Math.log10((b.review_count || 1) + 1);
        return scoreB - scoreA;
      });

      const result = {
        businesses: allBusinesses,
        total: allBusinesses.length,
        region: primaryResponse.data.region,
      };

      // Cache the combined results
      setCachedYelpResults(location, contextTerms, cacheKey, result);

      res.json(result);
    } catch (error: any) {
      console.error(
        "Yelp API error:",
        error.response?.status,
        error.response?.data || error.message
      );
      res
        .status(error.response?.status || 500)
        .json({
          error: error.response?.data || error.message || "Failed to fetch from Yelp",
        });
    }
  });

  app.get("/api/yelp/business/:id", async (req, res) => {
    try {
      const { id } = req.params;

      // Check cache for business details
      const cachedBusiness = getCachedYelpResults("business", id, "");
      if (cachedBusiness) {
        return res.json(cachedBusiness);
      }

      const response = await axios.get(`https://api.yelp.com/v3/businesses/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        },
      });

      // Cache the business details
      setCachedYelpResults("business", id, "", response.data);

      res.json(response.data);
    } catch (error: any) {
      console.error("Yelp API error:", error.message);
      res
        .status(500)
        .json({ error: error.message || "Failed to fetch business details" });
    }
  });

  // AI Recommendations Route
  app.post("/api/recommendations", requireAuth, async (req: any, res) => {
    try {
      const { businesses, interests, companions, location, userAge, travelingWithKids, kidsAges } = req.body;

      if (!businesses || !Array.isArray(businesses)) {
        return res.status(400).json({ error: "Invalid businesses data" });
      }

      // If OpenAI key is not configured, use mock recommendations
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-placeholder") {
        // Enhanced mock recommendations based on interests and context
        const recommendations = businesses
          .slice(0, 5)
          .map((b: any, idx: number) => {
            const matchedInterests = interests.filter((interest: string) =>
              b.categories.some((c: any) => c.title.toLowerCase().includes(interest.toLowerCase()))
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

        return res.json(recommendations);
      }

      // Build comprehensive context for AI
      const companionDetails = companions && companions.length > 0
        ? companions.map((c: any) => {
            const details = [`${c.name} (${c.age || 'age unknown'})`];
            if (c.interests && c.interests.length > 0) {
              details.push(`interests: ${c.interests.join(", ")}`);
            }
            return details.join(", ");
          }).join("; ")
        : "Solo traveler";

      const familyContext = travelingWithKids && kidsAges && kidsAges.length > 0
        ? `\nTraveling with kids aged: ${kidsAges.join(", ")} - prioritize family-friendly venues with good atmosphere for children.`
        : "";

      const groupDynamics = companions && companions.length > 0
        ? `\nGroup composition: ${companions.length} travel companions. Consider places that appeal to diverse interests and work well for groups.`
        : "";

      // Use real OpenAI API with enhanced prompt
      const prompt = `You are an expert travel recommendation AI specializing in personalized destination discovery. Your goal is to recommend the most suitable places based on the traveler's unique profile, group dynamics, and preferences.

TRAVELER PROFILE:
- Primary interests: ${interests.join(", ")}
- Age: ${userAge || "not specified"}
- Travel companions: ${companionDetails}${familyContext}${groupDynamics}
- Destination: ${location}

RECOMMENDATION CRITERIA:
1. Interest Alignment: Prioritize places that match the traveler's stated interests
2. Group Compatibility: For group travel, find places that appeal to multiple people's interests
3. Experience Quality: Consider ratings and review counts as indicators of quality
4. Variety: Suggest diverse types of experiences (don't recommend similar places)
5. Accessibility: For families with kids, prioritize welcoming, safe environments
6. Unique Value: Explain what makes each place special and why it's worth visiting

AVAILABLE BUSINESSES:
${businesses
  .slice(0, 15)
  .map(
    (b: any, idx: number) =>
      `${idx + 1}. ${b.name}
   Rating: ${b.rating}/5 (${b.review_count} reviews)
   Categories: ${b.categories.map((c: any) => c.title).join(", ")}
   Price: ${b.price || "Not specified"}
   Distance: ${(b.distance / 1609).toFixed(1)} miles`
  )
  .join("\n\n")}

TASK:
Select the top 3-5 most suitable recommendations. For each recommendation:
1. Explain why it matches their interests
2. Consider how it fits with their travel companions
3. Highlight what makes it special for their specific trip
4. Keep reasoning concise but compelling (1-2 sentences max)

RESPONSE FORMAT:
Return ONLY valid JSON array, no other text:
[
  {
    "businessId": "yelp_business_id",
    "businessName": "exact_business_name",
    "reason": "Compelling reason why this is perfect for them"
  }
]`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = completion.choices[0].message.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }

      const recommendations = JSON.parse(content);
      res.json(recommendations);
    } catch (error: any) {
      console.error("AI recommendation error:", error);
      res
        .status(500)
        .json({ error: error.message || "Failed to generate recommendations" });
    }
  });

  // Smart Itinerary Generation Route (uses saved Yelp data only - no new API calls)
  app.post("/api/itinerary/generate", requireAuth, async (req: any, res) => {
    try {
      const { tripId, numDays, location, businesses } = req.body;
      const userId = req.session.userId;

      // Verify trip ownership if tripId provided
      if (tripId) {
        const tripData = await supabaseDB.getTripById(tripId);
        if (tripData && tripData.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }

      // Use the businesses passed from the frontend (already fetched from Yelp)
      const allPlaces = businesses || [];

      if (allPlaces.length === 0) {
        return res.status(400).json({ 
          error: "No places available. Please search for places on the dashboard first." 
        });
      }

      // Categorize places based on their Yelp categories
      const categorizePlace = (place: any) => {
        const cats = place.categories?.map((c: any) => c.alias || c.title?.toLowerCase()).join(' ') || '';
        
        if (cats.includes('breakfast') || cats.includes('coffee') || cats.includes('cafe') || cats.includes('bakeries') || cats.includes('brunch')) {
          return 'breakfast';
        }
        if (cats.includes('museums') || cats.includes('landmarks') || cats.includes('parks') || cats.includes('tours') || cats.includes('arts')) {
          return 'morning';
        }
        if (cats.includes('bars') || cats.includes('nightlife') || cats.includes('cocktail') || cats.includes('pubs') || cats.includes('lounges')) {
          return 'evening';
        }
        if (cats.includes('restaurants') || cats.includes('food')) {
          return place.price === '$$$$' || place.price === '$$$' ? 'dinner' : 'lunch';
        }
        return 'afternoon';
      };

      // Group places by category
      const placesByCategory: Record<string, any[]> = {
        breakfast: [],
        morning: [],
        lunch: [],
        afternoon: [],
        dinner: [],
        evening: [],
      };

      allPlaces.forEach((place: any) => {
        const category = categorizePlace(place);
        placesByCategory[category].push(place);
      });

      // Sort each category by rating (highest first)
      Object.keys(placesByCategory).forEach(key => {
        placesByCategory[key].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
      });

      // Track used places across all days to avoid repetition
      const globalUsedIds = new Set<string>();

      // Build itinerary
      const itinerary = Array.from({ length: numDays }, (_, dayIndex) => {
        const dayActivities: any[] = [];

        // Define time slots for each day
        const dayTimeSlots = [
          { time: '9:00 AM', category: 'breakfast', label: 'Breakfast' },
          { time: '11:00 AM', category: 'morning', label: 'Morning Activity' },
          { time: '1:00 PM', category: 'lunch', label: 'Lunch' },
          { time: '3:30 PM', category: 'afternoon', label: 'Afternoon' },
          { time: '7:00 PM', category: 'dinner', label: 'Dinner' },
        ];

        // Add evening activity on alternating days
        if (dayIndex % 2 === 0) {
          dayTimeSlots.push({ time: '9:00 PM', category: 'evening', label: 'Evening' });
        }

        dayTimeSlots.forEach((slot, slotIdx) => {
          // Find available places not yet used
          let availablePlaces = placesByCategory[slot.category].filter(
            (p: any) => !globalUsedIds.has(p.id)
          );
          
          // If no places in this category, try to find from other categories
          if (availablePlaces.length === 0) {
            const fallbackCategories = ['afternoon', 'lunch', 'morning'];
            for (const fallback of fallbackCategories) {
              availablePlaces = placesByCategory[fallback].filter(
                (p: any) => !globalUsedIds.has(p.id)
              );
              if (availablePlaces.length > 0) break;
            }
          }
          
          const place = availablePlaces[0];
          
          if (place) {
            globalUsedIds.add(place.id);
            
            // Calculate estimated travel time based on distance
            const prevActivity = dayActivities[dayActivities.length - 1];
            let travelTime: number | undefined;
            if (prevActivity && place.distance) {
              // Rough estimate: 2 min per 0.1 miles
              travelTime = Math.max(5, Math.min(30, Math.round((place.distance / 1609) * 5)));
            }

            dayActivities.push({
              id: `${dayIndex}-${slotIdx}`,
              time: slot.time,
              title: place.name,
              location: place.location?.city || location?.split(',')[0] || 'City Center',
              address: place.location?.display_address?.join(', ') || '',
              yelpBusinessId: place.id,
              rating: place.rating,
              reviewCount: place.review_count,
              price: place.price,
              image_url: place.image_url,
              categories: place.categories?.map((c: any) => c.title) || [],
              completed: false,
              travelTimeFromPrevious: slotIdx > 0 ? travelTime || 15 : undefined,
              slotType: slot.label,
            });
          }
        });

        return {
          date: `Day ${dayIndex + 1}`,
          activities: dayActivities,
        };
      });

      res.json({ itinerary });
    } catch (error: any) {
      console.error("Itinerary generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  });

  // Save Itinerary Route
  app.post("/api/trips/:tripId/itinerary", requireAuth, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const { itinerary } = req.body;
      const userId = req.session.userId;

      // Verify trip ownership
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData || tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Store itinerary in trip data (you can add an itinerary column to trips table)
      // For now, we'll store it in memory or you can extend the database schema
      // This is a placeholder - implement based on your database structure
      
      res.json({ success: true, itinerary });
    } catch (error: any) {
      console.error("Save itinerary error:", error);
      res.status(500).json({ error: error.message || "Failed to save itinerary" });
    }
  });

  // Get Itinerary Route
  app.get("/api/trips/:tripId/itinerary", requireAuth, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const userId = req.session.userId;

      // Verify trip ownership
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData || tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }

      // Retrieve itinerary from storage
      // Placeholder - implement based on your database structure
      
      res.json({ itinerary: [] });
    } catch (error: any) {
      console.error("Get itinerary error:", error);
      res.status(500).json({ error: error.message || "Failed to get itinerary" });
    }
  });

  // Save Place Route
  app.post("/api/trips/:tripId/places", requireAuth, async (req: any, res) => {
    try {
      const { tripId } = req.params;
      const { yelpBusinessId, businessName, businessData, customNotes, aiReason } =
        req.body;
      const userId = req.session.userId;

      // Verify trip ownership
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData || tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
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
    } catch (error: any) {
      console.error("Save place error:", error);
      res.status(500).json({ error: error.message || "Failed to save place" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  const httpServer = createServer(app);

  return httpServer;
}

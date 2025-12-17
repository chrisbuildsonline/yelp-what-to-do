// server/index-vercel.ts
import fs2 from "node:fs";
import path2 from "node:path";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import axios from "axios";

// server/supabase-db.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error("\u274C Supabase credentials not configured! Please set SUPABASE_URL and SUPABASE_ANON_KEY in .env file");
}
var supabase = createClient(supabaseUrl, supabaseKey);
console.log("\u2705 Supabase connected:", supabaseUrl);
var SupabaseDB = class {
  // User operations
  async createUser(username, email, password) {
    try {
      const { data, error } = await supabase.from("users").insert([
        {
          username,
          email,
          password,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]).select().single();
      if (error) throw error;
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  async getUserByUsername(username) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("username", username).single();
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return void 0;
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error getting user by username:", error);
      return void 0;
    }
  }
  async getUserById(id) {
    try {
      const { data, error } = await supabase.from("users").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return void 0;
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error getting user by id:", error);
      return void 0;
    }
  }
  // Trip operations
  async createTrip(userId, name, location, interests = [], companions = []) {
    try {
      const { data, error } = await supabase.from("trips").insert([
        {
          user_id: userId,
          name,
          location,
          interests,
          companions,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]).select().single();
      if (error) throw error;
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        location: data.location,
        interests: data.interests || [],
        companions: data.companions || [],
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error creating trip:", error);
      throw error;
    }
  }
  async getTripsByUserId(userId) {
    try {
      const { data, error } = await supabase.from("trips").select("*").eq("user_id", userId);
      if (error) throw error;
      return (data || []).map((trip) => ({
        id: trip.id,
        userId: trip.user_id,
        name: trip.name,
        location: trip.location,
        interests: trip.interests || [],
        companions: trip.companions || [],
        startDate: trip.start_date ? new Date(trip.start_date) : null,
        endDate: trip.end_date ? new Date(trip.end_date) : null,
        createdAt: new Date(trip.created_at)
      }));
    } catch (error) {
      console.error("Error getting trips by user:", error);
      return [];
    }
  }
  async getTripById(id) {
    try {
      const { data, error } = await supabase.from("trips").select("*").eq("id", id).single();
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return void 0;
      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        location: data.location,
        interests: data.interests || [],
        companions: data.companions || [],
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error getting trip by id:", error);
      return void 0;
    }
  }
  // Saved places operations
  async createSavedPlace(tripId, yelpBusinessId, businessName, businessData = {}, customNotes, aiReason) {
    try {
      const { data, error } = await supabase.from("saved_places").insert([
        {
          trip_id: tripId,
          yelp_business_id: yelpBusinessId,
          business_name: businessName,
          business_data: businessData,
          custom_notes: customNotes || null,
          ai_reason: aiReason || null,
          created_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      ]).select().single();
      if (error) throw error;
      return {
        id: data.id,
        tripId: data.trip_id,
        yelpBusinessId: data.yelp_business_id,
        businessName: data.business_name,
        businessData: data.business_data || {},
        customNotes: data.custom_notes,
        aiReason: data.ai_reason,
        dayOrder: data.day_order,
        createdAt: new Date(data.created_at)
      };
    } catch (error) {
      console.error("Error creating saved place:", error);
      throw error;
    }
  }
  async getSavedPlacesByTripId(tripId) {
    try {
      const { data, error } = await supabase.from("saved_places").select("*").eq("trip_id", tripId);
      if (error) throw error;
      return (data || []).map((place) => ({
        id: place.id,
        tripId: place.trip_id,
        yelpBusinessId: place.yelp_business_id,
        businessName: place.business_name,
        businessData: place.business_data || {},
        customNotes: place.custom_notes,
        aiReason: place.ai_reason,
        dayOrder: place.day_order,
        createdAt: new Date(place.created_at)
      }));
    } catch (error) {
      console.error("Error getting saved places:", error);
      return [];
    }
  }
  async deleteTrip(tripId) {
    try {
      await supabase.from("saved_places").delete().eq("trip_id", tripId);
      const { error } = await supabase.from("trips").delete().eq("id", tripId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting trip:", error);
      throw error;
    }
  }
  async getUserCount() {
    try {
      const { count, error } = await supabase.from("users").select("*", { count: "exact", head: true });
      if (error) {
        console.error("Supabase error getting user count:", error);
        throw error;
      }
      console.log("User count from Supabase:", count);
      return count || 0;
    } catch (error) {
      console.error("Error getting user count:", error);
      return 0;
    }
  }
};
var supabaseDB = new SupabaseDB();

// server/routes.ts
import bcrypt from "bcrypt";

// server/yelp-cache.ts
import fs from "fs";
import path from "path";
var CACHE_DIR = path.join(process.cwd(), ".yelp-cache");
var CACHE_TTL = 24 * 60 * 60 * 1e3;
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}
function getCacheKey(location, term, categories) {
  const key = `${location}|${term}|${categories}`;
  return Buffer.from(key).toString("base64").replace(/[^a-zA-Z0-9]/g, "");
}
function getCacheFilePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}
function getCachedYelpResults(location, term, categories) {
  const key = getCacheKey(location, term, categories);
  const filePath = getCacheFilePath(key);
  try {
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, "utf-8");
    const entry = JSON.parse(content);
    if (Date.now() - entry.timestamp > entry.ttl) {
      fs.unlinkSync(filePath);
      return null;
    }
    console.log(`[YELP-CACHE] Cache hit for: ${location} | ${term}`);
    return entry.data;
  } catch (error) {
    console.error("Error reading cache:", error);
    return null;
  }
}
function setCachedYelpResults(location, term, categories, data) {
  const key = getCacheKey(location, term, categories);
  const filePath = getCacheFilePath(key);
  try {
    const entry = {
      data,
      timestamp: Date.now(),
      ttl: CACHE_TTL
    };
    fs.writeFileSync(filePath, JSON.stringify(entry), "utf-8");
    console.log(`[YELP-CACHE] Cached results for: ${location} | ${term}`);
  } catch (error) {
    console.error("Error writing cache:", error);
  }
}

// server/routes.ts
var sessions = /* @__PURE__ */ new Map();
var interestMapping = {
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
  "Nature": { terms: ["parks", "nature", "natural attractions"], categories: ["parks", "hiking", "outdoors"] }
};
function generateSessionId() {
  return Math.random().toString(36).substring(2, 34);
}
async function registerRoutes(app2) {
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const existingUser = await supabaseDB.getUserByUsername(username);
      if (existingUser) {
        return res.status(409).json({ error: "Username already exists" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await supabaseDB.createUser(username, email, hashedPassword);
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        userId: newUser.id,
        username: newUser.username
      });
      res.json({
        sessionId,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: error.message || "Signup failed" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: "Missing username or password" });
      }
      const user = await supabaseDB.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const sessionId = generateSessionId();
      sessions.set(sessionId, {
        userId: user.id,
        username: user.username
      });
      res.json({
        sessionId,
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: error.message || "Login failed" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    const { sessionId } = req.body;
    if (sessionId) {
      sessions.delete(sessionId);
    }
    res.json({ success: true });
  });
  const requireAuth = (req, res, next) => {
    const sessionId = req.headers["x-session-id"];
    if (!sessionId || !sessions.has(sessionId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.session = sessions.get(sessionId);
    next();
  };
  app2.post("/api/trips", requireAuth, async (req, res) => {
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
    } catch (error) {
      console.error("Create trip error:", error);
      res.status(500).json({ error: error.message || "Failed to create trip" });
    }
  });
  app2.get("/api/trips", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId;
      const userTrips = await supabaseDB.getTripsByUserId(userId);
      res.json(userTrips);
    } catch (error) {
      console.error("Get trips error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch trips" });
    }
  });
  app2.get("/api/trips/:tripId", requireAuth, async (req, res) => {
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
        places
      });
    } catch (error) {
      console.error("Get trip error:", error);
      res.status(500).json({ error: error.message || "Failed to fetch trip" });
    }
  });
  app2.delete("/api/trips/:tripId", requireAuth, async (req, res) => {
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
    } catch (error) {
      console.error("Delete trip error:", error);
      res.status(500).json({ error: error.message || "Failed to delete trip" });
    }
  });
  app2.get("/api/yelp/search", async (req, res) => {
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
      const interestsList = interests ? interests.split(",").filter(Boolean) : [];
      const hasKids = travelingWithKids === "true";
      const kidsAgesList = kidsAges ? kidsAges.split(",").map(Number).filter(Boolean) : [];
      const groupSizeNum = parseInt(groupSize) || 1;
      const companionAgesList = companionAges ? companionAges.split(",").map(Number).filter(Boolean) : [];
      const userAgeNum = parseInt(userAge) || 30;
      let searchTerm = term || "";
      let searchCategories = categories || "";
      const additionalAttributes = [];
      if (hasKids) {
        additionalAttributes.push("family-friendly");
        if (kidsAgesList.some((age) => age < 5)) {
          additionalAttributes.push("kid-friendly");
        }
        if (kidsAgesList.some((age) => age >= 5 && age <= 12)) {
          additionalAttributes.push("good for kids");
        }
      }
      if (groupSizeNum >= 6) {
        additionalAttributes.push("good for groups");
      }
      const allAges = [userAgeNum, ...companionAgesList].filter(Boolean);
      const avgAge = allAges.length > 0 ? allAges.reduce((a, b) => a + b, 0) / allAges.length : 30;
      if (avgAge < 25) {
        if (!searchTerm) searchTerm = "trendy popular";
      } else if (avgAge > 55) {
        additionalAttributes.push("quiet");
      }
      const contextTerms = additionalAttributes.length > 0 ? `${searchTerm} ${additionalAttributes.join(" ")}`.trim() : searchTerm || "restaurants";
      const cacheKey = `${location}-${contextTerms}-${searchCategories}-${hasKids}-${groupSizeNum}`;
      const cachedResults = getCachedYelpResults(location, contextTerms, cacheKey);
      if (cachedResults) {
        return res.json(cachedResults);
      }
      const allBusinesses = [];
      const seenIds = /* @__PURE__ */ new Set();
      const primaryResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: {
          location,
          term: contextTerms,
          categories: searchCategories,
          limit: 50,
          sort_by: "best_match"
        }
      });
      primaryResponse.data.businesses?.forEach((b) => {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          allBusinesses.push(b);
        }
      });
      const ratingResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
        headers: { Authorization: `Bearer ${apiKey}` },
        params: {
          location,
          term: searchTerm || "best",
          limit: 50,
          sort_by: "rating"
        }
      });
      ratingResponse.data.businesses?.forEach((b) => {
        if (!seenIds.has(b.id)) {
          seenIds.add(b.id);
          allBusinesses.push(b);
        }
      });
      for (const interest of interestsList.slice(0, 4)) {
        try {
          const interestTerms = interestMapping[interest]?.terms || [interest.toLowerCase()];
          const interestCategories = interestMapping[interest]?.categories?.join(",") || "";
          const interestResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: {
              location,
              term: interestTerms[0],
              categories: interestCategories,
              limit: 30,
              sort_by: "best_match"
            }
          });
          interestResponse.data.businesses?.forEach((b) => {
            if (!seenIds.has(b.id)) {
              seenIds.add(b.id);
              allBusinesses.push(b);
            }
          });
        } catch (err) {
          console.log(`Interest search for ${interest} failed, continuing...`);
        }
      }
      if (hasKids) {
        try {
          const familyResponse = await axios.get("https://api.yelp.com/v3/businesses/search", {
            headers: { Authorization: `Bearer ${apiKey}` },
            params: {
              location,
              term: "family friendly kids activities",
              categories: "kids_activities,amusementparks,zoos,aquariums,playgrounds",
              limit: 30,
              sort_by: "best_match"
            }
          });
          familyResponse.data.businesses?.forEach((b) => {
            if (!seenIds.has(b.id)) {
              seenIds.add(b.id);
              allBusinesses.push(b);
            }
          });
        } catch (err) {
          console.log("Family search failed, continuing...");
        }
      }
      const taggedBusinesses = allBusinesses.map((business) => {
        const customTags = ["All"];
        const categoryTitles = (business.categories || []).map((c) => c.title.toLowerCase());
        const categoryAliases = (business.categories || []).map((c) => c.alias?.toLowerCase() || "");
        const allCategories = [...categoryTitles, ...categoryAliases].join(" ");
        if (/restaurant|food|cafe|coffee|dining|bar|bakery|dessert|pizza|burger|sushi|mexican|italian|chinese|thai|indian|breakfast|brunch|lunch|dinner|eatery|bistro|grill|deli|sandwich/i.test(allCategories)) {
          customTags.push("Food");
        }
        if (/activity|tour|entertainment|recreation|sport|adventure|museum|gallery|theater|cinema|bowling|arcade|escape|game|park|zoo|aquarium|attraction|sightseeing|hiking|biking|kayak|boat/i.test(allCategories)) {
          customTags.push("Activities");
        }
        if (/nightlife|bar|club|lounge|pub|cocktail|wine|beer|brewery|distillery|dance|dj|live music|karaoke/i.test(allCategories)) {
          customTags.push("Nightlife");
        }
        if (/landmark|scenic|viewpoint|park|museum|gallery|historic|architecture|monument|observation|tower|bridge|garden|botanical|beach|waterfront|overlook|vista/i.test(allCategories)) {
          customTags.push("Culture");
        }
        return {
          ...business,
          customTags
          // Add our custom tags
        };
      });
      taggedBusinesses.sort((a, b) => {
        const scoreA = (a.rating || 0) * Math.log10((a.review_count || 1) + 1);
        const scoreB = (b.rating || 0) * Math.log10((b.review_count || 1) + 1);
        return scoreB - scoreA;
      });
      const result = {
        businesses: taggedBusinesses,
        total: taggedBusinesses.length,
        region: primaryResponse.data.region
      };
      setCachedYelpResults(location, contextTerms, cacheKey, result);
      res.json(result);
    } catch (error) {
      console.error(
        "Yelp API error:",
        error.response?.status,
        error.response?.data || error.message
      );
      res.status(error.response?.status || 500).json({
        error: error.response?.data || error.message || "Failed to fetch from Yelp"
      });
    }
  });
  app2.get("/api/yelp/business/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cachedBusiness = getCachedYelpResults("business", id, "");
      if (cachedBusiness) {
        return res.json(cachedBusiness);
      }
      const response = await axios.get(`https://api.yelp.com/v3/businesses/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`
        }
      });
      setCachedYelpResults("business", id, "", response.data);
      res.json(response.data);
    } catch (error) {
      console.error("Yelp API error:", error.message);
      res.status(500).json({ error: error.message || "Failed to fetch business details" });
    }
  });
  app2.post("/api/recommendations", requireAuth, async (req, res) => {
    try {
      const { businesses, interests, companions, location, userAge, travelingWithKids, kidsAges } = req.body;
      if (!businesses || !Array.isArray(businesses)) {
        return res.status(400).json({ error: "Invalid businesses data" });
      }
      const recommendations = businesses.slice(0, 5).map((b, idx) => {
        const matchedInterests = interests.filter(
          (interest) => b.categories.some((c) => c.title.toLowerCase().includes(interest.toLowerCase()))
        );
        let reason = `Highly rated with ${b.review_count} reviews`;
        if (matchedInterests.length > 0) {
          reason = `Perfect for your interest in ${matchedInterests[0]}`;
        }
        if (travelingWithKids && kidsAges && kidsAges.length > 0) {
          reason += ` and family-friendly`;
        }
        if (companions && companions.length > 0) {
          const companionInterests = companions.flatMap((c) => c.interests);
          const sharedInterests = interests.filter((i) => companionInterests.includes(i));
          if (sharedInterests.length > 0) {
            reason += ` - everyone will enjoy it`;
          } else {
            reason += ` - great for your group`;
          }
        }
        return {
          businessId: b.id,
          businessName: b.name,
          reason
        };
      });
      res.json(recommendations);
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
    }
  });
  app2.post("/api/itinerary/generate", requireAuth, async (req, res) => {
    try {
      const { tripId, numDays, location, businesses } = req.body;
      const userId = req.session.userId;
      if (tripId) {
        const tripData = await supabaseDB.getTripById(tripId);
        if (tripData && tripData.userId !== userId) {
          return res.status(403).json({ error: "Unauthorized" });
        }
      }
      const allPlaces = businesses || [];
      if (allPlaces.length === 0) {
        return res.status(400).json({
          error: "No places available. Please search for places on the dashboard first."
        });
      }
      const categorizePlace = (place) => {
        const cats = place.categories?.map((c) => c.alias || c.title?.toLowerCase()).join(" ") || "";
        if (cats.includes("breakfast") || cats.includes("coffee") || cats.includes("cafe") || cats.includes("bakeries") || cats.includes("brunch")) {
          return "breakfast";
        }
        if (cats.includes("museums") || cats.includes("landmarks") || cats.includes("parks") || cats.includes("tours") || cats.includes("arts")) {
          return "morning";
        }
        if (cats.includes("bars") || cats.includes("nightlife") || cats.includes("cocktail") || cats.includes("pubs") || cats.includes("lounges")) {
          return "evening";
        }
        if (cats.includes("restaurants") || cats.includes("food")) {
          return place.price === "$$$$" || place.price === "$$$" ? "dinner" : "lunch";
        }
        return "afternoon";
      };
      const placesByCategory = {
        breakfast: [],
        morning: [],
        lunch: [],
        afternoon: [],
        dinner: [],
        evening: []
      };
      allPlaces.forEach((place) => {
        const category = categorizePlace(place);
        placesByCategory[category].push(place);
      });
      Object.keys(placesByCategory).forEach((key) => {
        placesByCategory[key].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      });
      const globalUsedIds = /* @__PURE__ */ new Set();
      const itinerary = Array.from({ length: numDays }, (_, dayIndex) => {
        const dayActivities = [];
        const dayTimeSlots = [
          { time: "9:00 AM", category: "breakfast", label: "Breakfast" },
          { time: "11:00 AM", category: "morning", label: "Morning Activity" },
          { time: "1:00 PM", category: "lunch", label: "Lunch" },
          { time: "3:30 PM", category: "afternoon", label: "Afternoon" },
          { time: "7:00 PM", category: "dinner", label: "Dinner" }
        ];
        if (dayIndex % 2 === 0) {
          dayTimeSlots.push({ time: "9:00 PM", category: "evening", label: "Evening" });
        }
        dayTimeSlots.forEach((slot, slotIdx) => {
          let availablePlaces = placesByCategory[slot.category].filter(
            (p) => !globalUsedIds.has(p.id)
          );
          if (availablePlaces.length === 0) {
            const fallbackCategories = ["afternoon", "lunch", "morning"];
            for (const fallback of fallbackCategories) {
              availablePlaces = placesByCategory[fallback].filter(
                (p) => !globalUsedIds.has(p.id)
              );
              if (availablePlaces.length > 0) break;
            }
          }
          const place = availablePlaces[0];
          if (place) {
            globalUsedIds.add(place.id);
            let travelTimeFromPrevious;
            const prevActivity = dayActivities[dayActivities.length - 1];
            if (slotIdx > 0 && prevActivity?.coordinates && place.coordinates) {
              const lat1 = prevActivity.coordinates.latitude;
              const lon1 = prevActivity.coordinates.longitude;
              const lat2 = place.coordinates.latitude;
              const lon2 = place.coordinates.longitude;
              if (isFinite(lat1) && isFinite(lon1) && isFinite(lat2) && isFinite(lon2)) {
                const R = 6371;
                const dLat = (lat2 - lat1) * Math.PI / 180;
                const dLon = (lon2 - lon1) * Math.PI / 180;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distanceKm = R * c;
                const walkingSpeedKmh = 5;
                const realWorldFactor = 1.2;
                const timeHours = distanceKm / walkingSpeedKmh * realWorldFactor;
                const timeMinutes = Math.round(timeHours * 60);
                if (timeMinutes > 0) {
                  travelTimeFromPrevious = Math.max(1, Math.min(120, timeMinutes));
                }
              }
            }
            dayActivities.push({
              id: `${dayIndex}-${slotIdx}`,
              time: slot.time,
              title: place.name,
              location: place.location?.city || location?.split(",")[0] || "City Center",
              address: place.location?.display_address?.join(", ") || "",
              yelpBusinessId: place.id,
              rating: place.rating,
              reviewCount: place.review_count,
              price: place.price,
              image_url: place.image_url,
              categories: place.categories?.map((c) => c.title) || [],
              coordinates: place.coordinates,
              completed: false,
              travelTimeFromPrevious,
              slotType: slot.label
            });
          }
        });
        return {
          date: `Day ${dayIndex + 1}`,
          activities: dayActivities
        };
      });
      res.json({ itinerary });
    } catch (error) {
      console.error("Itinerary generation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate itinerary" });
    }
  });
  const itineraryStorage = /* @__PURE__ */ new Map();
  app2.post("/api/trips/:tripId/itinerary", requireAuth, async (req, res) => {
    try {
      const { tripId } = req.params;
      const { itinerary } = req.body;
      const userId = req.session.userId;
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData || tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      itineraryStorage.set(tripId, itinerary);
      res.json({ success: true, itinerary });
    } catch (error) {
      console.error("Save itinerary error:", error);
      res.status(500).json({ error: error.message || "Failed to save itinerary" });
    }
  });
  app2.get("/api/trips/:tripId/itinerary", requireAuth, async (req, res) => {
    try {
      const { tripId } = req.params;
      const userId = req.session.userId;
      const tripData = await supabaseDB.getTripById(tripId);
      if (!tripData || tripData.userId !== userId) {
        return res.status(403).json({ error: "Unauthorized" });
      }
      const itinerary = itineraryStorage.get(tripId) || [];
      res.json({ itinerary });
    } catch (error) {
      console.error("Get itinerary error:", error);
      res.status(500).json({ error: error.message || "Failed to get itinerary" });
    }
  });
  app2.post("/api/trips/:tripId/places", requireAuth, async (req, res) => {
    try {
      const { tripId } = req.params;
      const { yelpBusinessId, businessName, businessData, customNotes, aiReason } = req.body;
      const userId = req.session.userId;
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
    } catch (error) {
      console.error("Save place error:", error);
      res.status(500).json({ error: error.message || "Failed to save place" });
    }
  });
  app2.get("/api/stats/users", async (req, res) => {
    try {
      const userCount = await supabaseDB.getUserCount();
      res.json({ count: userCount });
    } catch (error) {
      console.error("Get user count error:", error);
      res.json({ count: 0 });
    }
  });
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
import "dotenv/config";
import express from "express";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
var app = express();
app.use(express.json({
  limit: "2mb",
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false, limit: "2mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});

// server/index-vercel.ts
var initialized = false;
async function initApp() {
  if (!initialized) {
    await registerRoutes(app);
    const distPath = path2.resolve(process.cwd(), "dist/public");
    if (fs2.existsSync(distPath)) {
      app.use(express2.static(distPath));
      app.use("*", (_req, res) => {
        res.sendFile(path2.resolve(distPath, "index.html"));
      });
    }
    initialized = true;
  }
  return app;
}
async function handler(req, res) {
  const expressApp = await initApp();
  return expressApp(req, res);
}
export {
  handler as default
};

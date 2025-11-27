// server/index-prod.ts
import fs from "node:fs";
import path from "node:path";
import express2 from "express";

// server/app.ts
import "dotenv/config";
import express from "express";

// server/routes.ts
import { createServer } from "http";
import axios from "axios";

// server/supabase-db.ts
import { createClient } from "@supabase/supabase-js";
var supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
var supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase credentials not configured");
}
var supabase = createClient(supabaseUrl || "", supabaseKey || "");
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
};
var supabaseDB = new SupabaseDB();

// server/routes.ts
import bcrypt from "bcrypt";
import { OpenAI } from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
var sessions = /* @__PURE__ */ new Map();
function generateSessionId() {
  return Math.random().toString(36).substr(2, 32);
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
  app2.get("/api/yelp/search", async (req, res) => {
    try {
      const { location, term, categories, limit = 20 } = req.query;
      if (!location || typeof location !== "string") {
        return res.status(400).json({ error: "location parameter is required" });
      }
      const apiKey = process.env.YELP_API_KEY;
      if (!apiKey) {
        console.error("YELP_API_KEY not set");
        return res.status(500).json({ error: "Yelp API key not configured" });
      }
      const response = await axios.get("https://api.yelp.com/v3/businesses/search", {
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        params: {
          location,
          term: term || "restaurants",
          categories: categories || "",
          limit: Math.min(parseInt(limit) || 20, 50),
          sort_by: "rating"
        }
      });
      res.json(response.data);
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
      const response = await axios.get(`https://api.yelp.com/v3/businesses/${id}`, {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`
        }
      });
      res.json(response.data);
    } catch (error) {
      console.error("Yelp API error:", error.message);
      res.status(500).json({ error: error.message || "Failed to fetch business details" });
    }
  });
  app2.post("/api/recommendations", requireAuth, async (req, res) => {
    try {
      const { businesses, interests, companions, location } = req.body;
      if (!businesses || !Array.isArray(businesses)) {
        return res.status(400).json({ error: "Invalid businesses data" });
      }
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === "sk-placeholder") {
        const recommendations2 = businesses.slice(0, 5).map((b, idx) => {
          const matchedInterests = interests.filter(
            (interest) => b.categories.some((c) => c.title.toLowerCase().includes(interest.toLowerCase()))
          );
          let reason = `Highly rated with ${b.review_count} reviews`;
          if (matchedInterests.length > 0) {
            reason = `Matches your interests in ${matchedInterests.join(", ")}`;
          }
          if (companions && companions.length > 0) {
            reason += ` and great for groups`;
          }
          return {
            businessId: b.id,
            businessName: b.name,
            reason
          };
        });
        return res.json(recommendations2);
      }
      const companionText = companions && companions.length > 0 ? `Travel companions: ${companions.map((c) => `${c.name} (interests: ${c.interests.join(", ")})`).join(", ")}` : "Solo traveler";
      const prompt = `You are a travel recommendation expert. Given the following Yelp businesses and user preferences, select the top 3-5 most suitable recommendations and provide a brief reason for each.

User interests: ${interests.join(", ")}
${companionText}
Location: ${location}

Businesses:
${businesses.slice(0, 10).map(
        (b) => `- ${b.name} (Rating: ${b.rating}/5, Reviews: ${b.review_count}, Categories: ${b.categories.map((c) => c.title).join(", ")})`
      ).join("\n")}

Provide recommendations in JSON format:
[
  {
    "businessId": "yelp_id",
    "businessName": "name",
    "reason": "brief reason why this is recommended"
  }
]

Only return valid JSON, no other text.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      });
      const content = completion.choices[0].message.content;
      if (!content) {
        return res.status(500).json({ error: "No response from AI" });
      }
      const recommendations = JSON.parse(content);
      res.json(recommendations);
    } catch (error) {
      console.error("AI recommendation error:", error);
      res.status(500).json({ error: error.message || "Failed to generate recommendations" });
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
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/app.ts
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
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path2 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path2.startsWith("/api")) {
      let logLine = `${req.method} ${path2} ${res.statusCode} in ${duration}ms`;
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
async function runApp(setup) {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  await setup(app, server);
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
}

// server/index-prod.ts
async function serveStatic(app2, server) {
  const distPath = path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express2.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
(async () => {
  await runApp(serveStatic);
})();
export {
  serveStatic
};

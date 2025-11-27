# Yelp! What to do?

A travel recommendation app that uses the Yelp Fusion API to help groups find places everyone will enjoy. Built for the Yelp API Hackathon.

## Why I Built This

Travel planning for groups is harder than it should be. When you're traveling with friends, family, or kids, everyone has different interests. This app takes your group's preferences and finds places from Yelp that actually work for everyone - not just generic "top rated" results.

## Yelp API Integration

The app is built around the Yelp Fusion API:

**Business Search API**
- Fetches up to 50 businesses per location
- Smart caching for instant client-side filtering
- Custom category mapping (Yelp categories → user-friendly filters like Food, Activities, Nightlife)

**Business Details API**
- Full business info including photos, hours, contact details
- Coordinates used for walking time calculations between places

**Coordinates & Distance**
- Haversine formula calculates real distances between businesses
- Walking time estimates (5 km/h average with real-world buffer)
- Powers the trip planner's "time between places" feature

## Features

- **Group-aware recommendations** - Add travel companions and their interests, get places that work for everyone
- **Smart filtering** - Filter by Popular, Top Rated, Together, Food, Activities, Nightlife, Culture, Nature
- **Trip planner** - Drag-and-drop itinerary with calculated walking times between places
- **Favorites & visited tracking** - Save places, mark as visited, track progress
- **Multi-trip support** - Separate trips with different companions and contexts

## Tech Stack

**Frontend:** React 19, TypeScript, Tailwind CSS, Framer Motion, React Query  
**Backend:** Node.js, Express, TypeScript  
**APIs:** Yelp Fusion API, OpenAI (optional)  
**Database:** In-memory (PostgreSQL-ready via Drizzle ORM)

## Quick Start

```bash
npm install
```

Create `.env`:
```env
YELP_API_KEY=your_yelp_api_key
YELP_CLIENT_ID=your_yelp_client_id
OPENAI_API_KEY=your_openai_key  # optional
```

```bash
npm run dev
```

Open http://localhost:5002

## Project Structure

```
├── client/           # React frontend
│   └── src/
│       ├── pages/    # Auth, Dashboard, Trip Planner, Profile
│       ├── components/
│       └── lib/      # State management, utilities
├── server/           # Express backend
│   ├── routes.ts     # API endpoints
│   └── memory-db.ts  # In-memory storage
└── shared/           # Shared types and schemas
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `POST /api/auth/signup` | User registration |
| `POST /api/auth/login` | User login |
| `GET /api/yelp/search` | Search Yelp businesses |
| `GET /api/yelp/business/:id` | Get business details |
| `POST /api/trips` | Create new trip |
| `GET /api/trips/:tripId/itinerary` | Get trip itinerary |
| `POST /api/itinerary/generate` | Generate AI itinerary |

## How It Works

1. **Onboarding** - User enters destination, interests, and travel companions
2. **Search** - App fetches businesses from Yelp based on location and interests
3. **Categorization** - Backend maps Yelp categories to filter groups
4. **Recommendations** - Each place shows why it matches the user's group
5. **Planning** - Users build itineraries with real walking times between places

## License

MIT

---

Built by Chris Johansson for the Yelp API Hackathon

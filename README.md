# Yelp! What to do? 🗺️

> **AI-powered travel recommendations for groups using Yelp Fusion API**

A smart travel companion that helps groups discover places everyone will love. Built for the Yelp API Hackathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)

## 🎯 What It Does

Planning trips with friends, family, or kids? This app uses **Yelp Fusion API** to find places that match everyone's interests - not just generic "top rated" results.

**Key Features:**
- 🤖 AI-powered recommendations based on group preferences
- 🗺️ Real Yelp business data with ratings, reviews, and photos
- 👥 Group-aware suggestions (add companions and their interests)
- 📍 Location autocomplete using OpenStreetMap
- 💾 Save trips and favorite places
- 🎨 Beautiful, responsive UI with smooth animations

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js 20+ installed
- Yelp API key ([Get one here](https://www.yelp.com/developers/v3/manage_app))

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd yelp-ai-tour-guide-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
# Required - Get from https://www.yelp.com/developers/v3/manage_app
YELP_API_KEY=your_yelp_api_key_here
YELP_CLIENT_ID=your_yelp_client_id_here

# Optional - For AI recommendations (has mock fallback)
OPENAI_API_KEY=your_openai_key_here

# Server configuration
PORT=5002
NODE_ENV=development
```

4. **Start the development server**
```bash
npm run dev
```

5. **Open your browser**
```
http://localhost:5002
```

That's it! 🎉

## 📖 How to Use

### 1. Sign Up
- Create an account with username, email, and password
- Secure authentication with bcrypt password hashing

### 2. Create Your Trip
**Step 1: Basic Info**
- Enter your name
- Search for your destination using location autocomplete (e.g., "Tokyo, Japan")

**Step 2: Select Interests**
- Choose from: Fine Dining, Street Food, Hiking, Museums, Nightlife, Coffee, Shopping, Photography, Live Music, History, Architecture, Nature

**Step 3: Add Travel Companions (Optional)**
- Add friends/family and their interests
- Get recommendations that work for everyone

**Step 4: Name Your Trip**
- Give your adventure a memorable name

### 3. Explore Recommendations
- View AI-powered place recommendations from Yelp
- See ratings, reviews, and distance
- Search for specific types of places
- Filter by interests

### 4. Save & Plan
- Save places to your trip
- Create multiple trips
- Switch between trips easily

## 🔧 Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type-safe backend
- **Bcrypt** - Secure password hashing
- **Axios** - HTTP client

### APIs
- **Yelp Fusion API** - Business search and details
- **OpenStreetMap Nominatim** - Location autocomplete (free, no API key)
- **OpenAI API** - AI recommendations (optional)

### Database
- **In-Memory** - Development (data resets on restart)
- **PostgreSQL-ready** - Production (Drizzle ORM configured)

## 📁 Project Structure

```
yelp-ai-tour-guide-main/
├── client/                    # React frontend
│   └── src/
│       ├── pages/            # Auth, Onboarding, Dashboard
│       ├── components/       # Reusable UI components
│       │   ├── ui/          # Radix UI components
│       │   └── location-autocomplete.tsx
│       ├── hooks/           # Custom React hooks
│       └── lib/             # State management & utilities
│
├── server/                   # Express backend
│   ├── routes.ts            # API endpoints
│   ├── memory-db.ts         # In-memory database
│   ├── app.ts               # Express configuration
│   └── index-dev.ts         # Development server
│
├── shared/                  # Shared types
│   └── schema.ts            # Data schemas
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md               # This file
```

## 🔌 API Endpoints

### Authentication
```
POST /api/auth/signup      - Register new user
POST /api/auth/login       - Login user
POST /api/auth/logout      - Logout user
```

### Trips
```
POST /api/trips            - Create new trip
GET  /api/trips            - Get all user trips
GET  /api/trips/:tripId    - Get trip details
```

### Yelp Integration
```
GET  /api/yelp/search      - Search Yelp businesses
     ?location=Tokyo&term=restaurants&limit=20
     
GET  /api/yelp/business/:id - Get business details
```

### AI Recommendations
```
POST /api/recommendations  - Get AI-powered recommendations
     Body: { businesses, interests, companions, location }
```

### Saved Places
```
POST /api/trips/:tripId/places - Save place to trip
```

## 🎨 Yelp API Integration Details

### Business Search API
- **Endpoint**: `GET /v3/businesses/search`
- **Usage**: Fetches businesses based on location and search terms
- **Parameters**: location, term, categories, limit, sort_by
- **Response**: Array of businesses with ratings, reviews, photos, distance

### Business Details API
- **Endpoint**: `GET /v3/businesses/{id}`
- **Usage**: Gets detailed information about a specific business
- **Response**: Full business details including hours, photos, reviews

### Key Features
- ✅ Proper authentication with Bearer token
- ✅ Error handling for invalid locations
- ✅ Rate limiting awareness
- ✅ Caching with React Query
- ✅ Proper attribution (Yelp logo and links)

## 🛠️ Development Commands

```bash
# Install dependencies
npm install

# Start development server (port 5002)
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start
```

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates:
- `dist/public/` - Frontend build
- `dist/index.js` - Backend bundle

### Run Production Server
```bash
PORT=5002 npm start
```

### Environment Variables for Production
```env
YELP_API_KEY=your_production_key
YELP_CLIENT_ID=your_client_id
PORT=5002
NODE_ENV=production
```

### Deployment Options
- **Heroku**: `git push heroku main`
- **AWS EC2**: Use PM2 for process management
- **Docker**: Dockerfile included
- **Vercel**: Frontend only (backend separate)

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

## 🧪 Testing

### Manual Testing Checklist
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Complete onboarding flow
- [ ] Search for locations (try "Tokyo, Japan")
- [ ] View Yelp recommendations
- [ ] Add companions with interests
- [ ] Save places to trip
- [ ] Create multiple trips
- [ ] Logout and login again

### API Testing
```bash
# Health check
curl http://localhost:5002/api/health

# Search Yelp (requires running server)
curl "http://localhost:5002/api/yelp/search?location=Tokyo&term=sushi"
```

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `YELP_API_KEY` | ✅ Yes | Yelp Fusion API key | `7_tnoU4o...` |
| `YELP_CLIENT_ID` | ✅ Yes | Yelp Client ID | `VwstclHy...` |
| `OPENAI_API_KEY` | ❌ No | OpenAI API key (optional) | `sk-proj-...` |
| `PORT` | ❌ No | Server port | `5002` |
| `NODE_ENV` | ❌ No | Environment | `development` |

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 5002
lsof -i :5002

# Kill the process
kill -9 <PID>
```

### Yelp API Errors
- **LOCATION_NOT_FOUND**: Use format "City, Country" (e.g., "Tokyo, Japan")
- **Invalid API Key**: Check your `.env` file has correct key
- **Rate Limit**: Yelp has rate limits, wait a moment and retry

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run check
```

## 📚 Documentation

- [QUICKSTART.md](QUICKSTART.md) - 5-minute setup guide
- [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) - Technical details
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [STATUS.md](STATUS.md) - Project status
- [LICENSE](LICENSE) - MIT License

## 🎯 Hackathon Submission

### What Makes This Special
1. **Real Yelp Integration** - Uses Yelp Fusion API for authentic business data
2. **Group-Aware** - Considers all travelers' interests, not just one person
3. **AI-Powered** - Smart recommendations with reasoning
4. **Production-Ready** - Full authentication, database, error handling
5. **Beautiful UI** - Smooth animations, responsive design
6. **Open Source** - MIT licensed, well-documented

### Key Yelp API Features Used
- ✅ Business Search with location and categories
- ✅ Business Details for full information
- ✅ Rating and review display
- ✅ Distance calculations
- ✅ Proper error handling
- ✅ Yelp attribution and branding

## 🤝 Contributing

Contributions welcome! Please read the code and follow the existing patterns.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

### Third-Party Services
- **Yelp Fusion API** - [Terms of Service](https://www.yelp.com/developers/api_terms)
- **OpenStreetMap** - [Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- **OpenAI API** - [Terms of Use](https://openai.com/policies/terms-of-use)

## 👨‍💻 Author

Built with ❤️ for the Yelp API Hackathon

## 🙏 Acknowledgments

- Yelp for the amazing Fusion API
- OpenStreetMap for free geocoding
- The open-source community

---

**Ready to explore?** Start with `npm run dev` 🚀

For questions or issues, check the [documentation](IMPLEMENTATION_SUMMARY.md) or open an issue.

# Yelp! What to do? 🗺️

> **AI-powered travel recommendations for groups using Yelp Fusion API**

A smart travel companion that helps groups discover places everyone will love. Built for the Yelp API Hackathon.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://reactjs.org/)

## 🎯 What It Does

Planning trips with friends, family, or kids? This app uses **Yelp Fusion API** to find places that match everyone's interests - not just generic "top rated" results.

**Key Features:**
- 🤖 Smart recommendations based on group preferences
- 🗺️ Real Yelp business data with ratings, reviews, and photos
- 👥 Group-aware suggestions (add companions and their interests)
- 📍 Location autocomplete using OpenStreetMap
- 💾 Persistent storage with Supabase
- 🎨 Beautiful, responsive UI with smooth animations

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Node.js 20+** ([Download](https://nodejs.org/))
- **Yelp API key** ([Get free key](https://www.yelp.com/developers/v3/manage_app))
- **Supabase account** ([Sign up free](https://supabase.com))

### Step 1: Clone & Install

```bash
git clone <your-repo-url>
cd yelp-ai-tour-guide-main
npm install
```

### Step 2: Get API Keys

#### Yelp API Keys
1. Go to [Yelp Developers](https://www.yelp.com/developers/v3/manage_app)
2. Create a new app
3. Copy your **API Key** and **Client ID**

#### Supabase Credentials
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project (wait 2-3 minutes for setup)
3. Go to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### Step 3: Configure Environment

Copy the example file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Yelp API (Required)
YELP_API_KEY=your_yelp_api_key_here
YELP_CLIENT_ID=your_yelp_client_id_here

# Supabase (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Server
PORT=5002
NODE_ENV=development
```

### Step 4: Set Up Database

Run the setup helper:
```bash
bash scripts/setup-database.sh
```

This will display the SQL you need to run. Then:

1. Open your [Supabase SQL Editor](https://supabase.com/dashboard/project/_/sql)
2. Click **"New Query"**
3. Copy the SQL from `scripts/setup-supabase.sql` (or from the terminal output)
4. Paste and click **"Run"**

You should see: ✅ Database setup complete!

**Database Schema Created:**
- `users` - User accounts with authentication
- `trips` - Trip records with location, interests, companions
- `saved_places` - Places saved to trips with Yelp data
- Indexes for performance
- Row Level Security policies

### Step 5: Start the App

```bash
npm run dev
```

Open your browser to: **http://localhost:5002**

### Step 6: Test It Out

1. **Sign up** for a new account
2. **Complete onboarding** (name, destination, interests, companions)
3. **Search for places** in your destination
4. **Save places** to your trip
5. **Restart the server** - your data persists! 🎉

---

## 📖 How to Use

### 1. Sign Up & Login
- Create an account with username, email, and password
- Secure authentication with bcrypt password hashing
- Your data is stored in Supabase

### 2. Create Your Trip

**Step 1: Basic Info**
- Enter your name
- Search for your destination (e.g., "Tokyo, Japan")

**Step 2: Select Interests**
- Choose from: Fine Dining, Street Food, Hiking, Museums, Nightlife, Coffee, Shopping, Live Music, History, Architecture, Nature

**Step 3: Add Travel Companions (Optional)**
- Add friends/family with their ages and interests
- Get recommendations that work for everyone

**Step 4: Name Your Trip**
- Give your adventure a memorable name

### 3. Explore Recommendations
- View smart recommendations from Yelp
- See ratings, reviews, photos, and distance
- Search for specific types of places
- Filter by categories (Food, Activities, Nightlife, Culture)

### 4. Save & Plan
- Save places to your trip
- Create multiple trips
- Switch between trips easily
- All data persists in Supabase

---

## 🔧 Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Radix UI** - Accessible components

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type-safe backend
- **Bcrypt** - Secure password hashing
- **Axios** - HTTP client

### Database
- **Supabase** - PostgreSQL-based cloud database
- **@supabase/supabase-js** - Supabase client

### External APIs
- **Yelp Fusion API** - Business search and details (required)
- **OpenStreetMap Nominatim** - Location autocomplete (free)

---

## 📁 Project Structure

```
yelp-ai-tour-guide-main/
├── client/                    # React frontend
│   └── src/
│       ├── pages/            # Auth, Onboarding, Dashboard
│       ├── components/       # Reusable UI components
│       ├── hooks/           # Custom React hooks
│       └── lib/             # State management & utilities
│
├── server/                   # Express backend
│   ├── routes.ts            # API endpoints
│   ├── supabase-db.ts       # Supabase database client
│   ├── memory-db.ts         # In-memory fallback
│   └── index-dev.ts         # Development server
│
├── shared/                  # Shared types
│   └── schema.ts            # Data schemas
│
├── scripts/                 # Setup scripts
│   ├── setup-database.sh    # Database setup helper
│   └── setup-supabase.sql   # Database schema
│
├── .env                     # Environment variables
├── package.json             # Dependencies
└── README.md               # This file
```

---

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
DELETE /api/trips/:tripId  - Delete trip
```

### Yelp Integration
```
GET  /api/yelp/search      - Search Yelp businesses
     ?location=Tokyo&term=restaurants&interests=Fine Dining
     
GET  /api/yelp/business/:id - Get business details
```

### Recommendations
```
POST /api/recommendations  - Get smart recommendations
     Body: { businesses, interests, companions, location }
```

### Saved Places
```
POST /api/trips/:tripId/places - Save place to trip
```

### Stats
```
GET /api/stats/users       - Get user count
GET /api/health            - Health check
```

---

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

---

## 🚢 Deployment

### Build for Production
```bash
npm run build
```

This creates:
- `dist/public/` - Frontend build
- `dist/index.js` - Backend bundle

### Environment Variables for Production
```env
YELP_API_KEY=your_production_key
YELP_CLIENT_ID=your_client_id
SUPABASE_URL=your_production_supabase_url
SUPABASE_ANON_KEY=your_production_supabase_key
PORT=5002
NODE_ENV=production
```

### Deployment Options

#### Heroku
```bash
heroku create your-app-name
heroku config:set YELP_API_KEY=your_key
heroku config:set YELP_CLIENT_ID=your_id
heroku config:set SUPABASE_URL=your_url
heroku config:set SUPABASE_ANON_KEY=your_key
git push heroku main
```

#### AWS EC2
```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone your-repo
cd your-repo
npm install
npm run build

# Set environment variables
export YELP_API_KEY=your_key
export SUPABASE_URL=your_url
export SUPABASE_ANON_KEY=your_key

# Start with PM2
npm install -g pm2
pm2 start npm --name "yelp-app" -- start
pm2 save
pm2 startup
```

#### Docker
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5002
ENV PORT=5002
ENV NODE_ENV=production
CMD ["npm", "start"]
```

```bash
docker build -t yelp-app .
docker run -p 5002:5002 \
  -e YELP_API_KEY=your_key \
  -e SUPABASE_URL=your_url \
  -e SUPABASE_ANON_KEY=your_key \
  yelp-app
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] Database setup: Run SQL in Supabase
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Complete onboarding flow
- [ ] Search for locations (try "Tokyo, Japan")
- [ ] View Yelp recommendations
- [ ] Add companions with interests
- [ ] Save places to trip
- [ ] Create multiple trips
- [ ] Logout and login again
- [ ] Restart server - verify data persists

### API Testing
```bash
# Health check
curl http://localhost:5002/api/health
# Response: {"status":"ok"}

# User count
curl http://localhost:5002/api/stats/users
# Response: {"count":2}

# Search Yelp
curl "http://localhost:5002/api/yelp/search?location=Tokyo&term=sushi"
```

---

## 📝 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `YELP_API_KEY` | ✅ Yes | Yelp Fusion API key | `7_tnoU4o...` |
| `YELP_CLIENT_ID` | ✅ Yes | Yelp Client ID | `VwstclHy...` |
| `SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon key | `eyJhbGc...` |
| `PORT` | ❌ No | Server port | `5002` |
| `NODE_ENV` | ❌ No | Environment | `development` |

---

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

### Supabase Errors
- **Connection Failed**: Verify `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env`
- **Table Not Found**: Run the SQL setup script in Supabase SQL Editor
- **Permission Denied**: Check Row Level Security policies in Supabase dashboard
- **Can't connect**: Restart your dev server after adding env vars

### Build Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npm run check
```

### Database Reset
If you need to reset the database:
1. Go to Supabase SQL Editor
2. Run: `DROP TABLE IF EXISTS saved_places, trips, users CASCADE;`
3. Run the full setup SQL from `scripts/setup-supabase.sql`

---

## 🎨 Yelp API Integration

### Business Search API
- **Endpoint**: `GET /v3/businesses/search`
- **Features**: Location-based search, categories, sorting
- **Response**: Businesses with ratings, reviews, photos, distance

### Business Details API
- **Endpoint**: `GET /v3/businesses/{id}`
- **Features**: Full business information, hours, photos

### Implementation Highlights
- ✅ Proper Bearer token authentication
- ✅ Error handling for invalid locations
- ✅ Rate limiting awareness
- ✅ Result caching with React Query
- ✅ Proper Yelp attribution and branding
- ✅ Multiple search strategies for diverse results
- ✅ Custom tagging system (Food, Activities, Nightlife, Culture)

---

## 🎯 Hackathon Submission

### What Makes This Special
1. **Real Yelp Integration** - Uses Yelp Fusion API for authentic business data
2. **Group-Aware** - Considers all travelers' interests, not just one person
3. **Smart Recommendations** - Context-aware suggestions based on preferences
4. **Production-Ready** - Full authentication, persistent database, error handling
5. **Beautiful UI** - Smooth animations, responsive design, great UX
6. **Open Source** - MIT licensed, well-documented

### Key Yelp API Features Used
- ✅ Business Search with location and categories
- ✅ Business Details for full information
- ✅ Rating and review display
- ✅ Distance calculations
- ✅ Multiple search strategies for better results
- ✅ Proper error handling
- ✅ Yelp attribution and branding

---

## 🤝 Contributing

Contributions welcome! Please read the code and follow the existing patterns.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

### Third-Party Services
- **Yelp Fusion API** - [Terms of Service](https://www.yelp.com/developers/api_terms)
- **OpenStreetMap** - [Usage Policy](https://operations.osmfoundation.org/policies/nominatim/)
- **Supabase** - [Terms of Service](https://supabase.com/terms)

### Data Storage
This software:
- Stores user data in Supabase (PostgreSQL)
- Does not collect or transmit user data to third parties beyond the integrated APIs
- Requires users to review and comply with GDPR, CCPA, and other privacy regulations

---

## 👨‍💻 Author

Built with ❤️ for the Yelp API Hackathon

---

## 🙏 Acknowledgments

- Yelp for the amazing Fusion API
- Supabase for the excellent database platform
- OpenStreetMap for free geocoding
- The open-source community

---

**Ready to explore?** Start with `npm run dev` 🚀

For questions or issues, open an issue on GitHub.

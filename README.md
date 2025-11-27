# Yelp! What to do? - AI-Powered Travel Recommendation App

A production-ready full-stack application that helps travelers discover personalized recommendations using Yelp data and AI. The system intelligently analyzes who's traveling, their interests, and group dynamics to deliver truly personalized suggestions.

## How It Works

### 🎯 The Smart Recommendation System

Our AI recommendation engine goes beyond simple interest matching. Here's how it works:

#### 1. **Comprehensive Traveler Profiling**
When you sign up and complete onboarding, we gather:
- **Your Profile**: Name, age, and primary interests
- **Travel Companions**: Who's joining you, their ages, and their interests
- **Family Context**: Whether you're traveling with kids and their ages
- **Destination**: Where you're exploring

#### 2. **Intelligent Analysis**
The AI considers:
- **Interest Alignment**: Matches places to your stated interests
- **Group Compatibility**: For group travel, finds places that appeal to multiple people
- **Experience Quality**: Uses ratings and review counts to identify quality venues
- **Variety**: Suggests diverse experiences, not just similar places
- **Family-Friendliness**: For trips with kids, prioritizes welcoming, safe environments
- **Unique Value**: Explains what makes each place special for YOUR specific trip

#### 3. **Personalized Reasoning**
Each recommendation includes a reason explaining:
- Why it matches your interests
- How it fits with your travel companions
- What makes it special for your specific group
- Why it's worth visiting

**Example**: Instead of just "Highly rated restaurant", you get "Perfect for your interest in Fine Dining and great for your group of 4 - everyone will enjoy it"

### 🔄 The Complete User Journey

#### Step 1: Sign Up
Create an account with email and password. Your credentials are securely hashed with bcrypt.

#### Step 2: Onboarding (4 Steps)
1. **Tell Us About You**
   - Your name and age
   - Your destination (city/country)

2. **What Do You Love?**
   - Select from 15+ interest categories
   - Examples: Fine Dining, Hiking, Museums, Nightlife, Coffee, Shopping, Photography, Live Music, History, Architecture, Nature, Family Friendly, For Kids, Parks & Playgrounds
   - Pick multiple interests for better recommendations

3. **Who's Coming With?**
   - Add travel companions (optional)
   - For each companion: name, age, and their interests
   - Indicate if traveling with kids and their ages
   - The system uses this to find places everyone will enjoy

4. **Name Your Trip**
   - Give your adventure a memorable name
   - Example: "Summer in Tokyo 2025" or "Family Beach Week"

#### Step 3: Explore & Discover
- **Search**: Use the search bar to find specific types of places
- **Filter**: Browse by "For You", "Trending", or "New"
- **Quick Filters**: Click your interests to see related places
- **Save**: Heart your favorite places to save them to your trip
- **Details**: View ratings, reviews, distance, and AI reasoning

#### Step 4: Manage Your Trip
- **View Saved Places**: See all places you've saved to this trip
- **Create New Trips**: Start planning another adventure
- **Switch Trips**: Jump between different trips
- **Edit Preferences**: Update your interests or add companions mid-trip

## Features

### ✅ Authentication
- User registration with email and password
- Secure login with bcrypt password hashing
- Session-based authentication
- Persistent sessions using localStorage

### ✅ Trip Management
- Create and manage multiple trips
- Save trip details (location, interests, companions)
- View all saved trips
- Switch between trips
- Edit trip preferences anytime

### ✅ Yelp Integration
- Real-time search of Yelp businesses
- Filter by location and category
- Display business ratings, reviews, and distance
- Support for multiple search terms
- Business details including phone, website, and photos

### ✅ AI Recommendations
- **Context-Aware**: Considers age, interests, companions, and family status
- **Group-Optimized**: Finds places that appeal to multiple people
- **Family-Friendly**: Prioritizes kid-appropriate venues when traveling with children
- **Personalized Reasoning**: Each recommendation explains why it's perfect for you
- **Fallback Support**: Mock recommendations when OpenAI is unavailable

### ✅ Data Persistence
- In-memory database for development
- Ready for PostgreSQL migration
- Saved places and trip itineraries
- User preferences and companions

## Understanding the Recommendation Algorithm

### What Makes Recommendations Smart?

The system uses a multi-factor analysis:

1. **Interest Matching** (Primary Factor)
   - Analyzes business categories against your interests
   - Prioritizes exact matches over partial matches
   - Considers all companions' interests for group trips

2. **Group Dynamics** (Secondary Factor)
   - For solo travelers: Focuses on your preferences
   - For groups: Finds common ground between different interests
   - Ensures recommendations appeal to the majority

3. **Quality Signals** (Tertiary Factor)
   - Rating: 4.5+ stars are prioritized
   - Review count: More reviews = more reliable quality signal
   - Recent activity: Popular places tend to be better

4. **Context Awareness** (Special Cases)
   - **Family Trips**: Filters for kid-friendly venues, safe atmospheres
   - **Age Groups**: Considers if companions are seniors, young adults, or kids
   - **Variety**: Avoids recommending similar places in sequence

### Example Scenarios

**Scenario 1: Solo Foodie in Tokyo**
- Interests: Fine Dining, Coffee
- Result: High-end restaurants + specialty coffee shops
- Reasoning: "Matches your passion for fine dining with excellent reviews"

**Scenario 2: Family Trip to NYC**
- You: Photography, History
- Kids (ages 6, 9): For Kids, Parks & Playgrounds
- Result: Museums with kid areas + scenic parks for photos
- Reasoning: "Perfect for your interest in history and great for the kids"

**Scenario 3: Group Adventure in Barcelona**
- You: Hiking, Architecture
- Friend 1: Nightlife, Live Music
- Friend 2: Museums, History
- Result: Architectural landmarks + museums + evening venues
- Reasoning: "Combines everyone's interests - architecture for you, history for Alex, and great nightlife nearby"

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **Wouter** - Routing

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **Bcrypt** - Password hashing
- **OpenAI** - AI recommendations
- **Axios** - HTTP client

### APIs
- **Yelp Fusion API** - Business data
- **OpenAI API** - AI recommendations (optional)

## User Interface & Experience

### Dashboard Layout
The main dashboard is organized for easy discovery:

- **Header**: Search bar, notifications, user profile, trip switcher
- **Trip Info**: Current trip name, destination, and travel companions
- **Filter Bar**: Quick access to "For You", "Trending", "New", and your interests
- **Featured Section**: Large hero card highlighting top recommendations
- **Recommendation Grid**: 2-column grid of AI-recommended places
- **Sidebar**: Map view and travel buddies list

### Place Cards
Each recommendation shows:
- **Image**: Visual preview of the place
- **Name & Type**: Business name and category
- **Rating**: Star rating with review count
- **Distance**: How far from your location
- **AI Reason**: Why we recommend it (in a highlighted box)
- **Tags**: Business categories
- **Heart Button**: Save to favorites

### Search & Discovery
- **Smart Search**: Type what you're looking for (e.g., "coffee", "hiking trails")
- **Interest Filters**: Click your interests to see related places
- **Category Filters**: Browse by "For You", "Trending", or "New"
- **Real-time Results**: Instant results from Yelp API

### Mobile Responsive
- Fully responsive design for phones, tablets, and desktops
- Touch-friendly buttons and interactions
- Optimized layout for small screens
- Smooth animations and transitions

## Getting Started

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Environment Variables

```env
# Yelp API
YELP_API_KEY=your_yelp_api_key
YELP_CLIENT_ID=your_yelp_client_id

# OpenAI (optional)
OPENAI_API_KEY=your_openai_api_key

# Database (for future PostgreSQL integration)
DATABASE_URL=postgresql://user:password@localhost:5432/yelp_app

# Supabase (optional)
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_key
```

### Running the App

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type checking
npm run check
```

The app will be available at `http://localhost:5002`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Trips
- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:tripId` - Get trip details with saved places

### Yelp Search
- `GET /api/yelp/search?location=...&term=...` - Search businesses
- `GET /api/yelp/business/:id` - Get business details

### AI Recommendations
- `POST /api/recommendations` - Get AI recommendations

### Saved Places
- `POST /api/trips/:tripId/places` - Save a place to trip

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── pages/         # Page components
│       ├── components/    # UI components
│       ├── hooks/         # Custom hooks
│       └── lib/           # Utilities and store
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── memory-db.ts       # In-memory database
│   ├── app.ts             # Express app setup
│   └── index-dev.ts       # Dev server
├── shared/                # Shared types
│   └── schema.ts          # Data schemas
└── dist/                  # Production build
```

## Database Schema

### Users
- `id` - UUID
- `username` - Unique username
- `email` - Unique email
- `password` - Hashed password
- `createdAt` - Timestamp

### Trips
- `id` - UUID
- `userId` - Foreign key to users
- `name` - Trip name
- `location` - Destination
- `interests` - JSON array of interests
- `companions` - JSON array of companions
- `createdAt` - Timestamp

### Saved Places
- `id` - UUID
- `tripId` - Foreign key to trips
- `yelpBusinessId` - Yelp business ID
- `businessName` - Business name
- `businessData` - JSON business details
- `customNotes` - User notes
- `aiReason` - AI recommendation reason
- `createdAt` - Timestamp

## Frequently Asked Questions

### How does the AI know what I'll like?
The AI analyzes your interests, age, travel companions, and their interests to find places that match your profile. It's not just keyword matching—it understands context and group dynamics.

### Can I change my interests after starting a trip?
Yes! Click "Edit Preferences" on the dashboard to update your interests, add companions, or change your destination. Recommendations will update accordingly.

### What if I'm traveling with people who have very different interests?
The system finds common ground. It looks for places that appeal to multiple interests or that have something for everyone. For example, a restaurant with both fine dining and casual options.

### How are recommendations ranked?
Recommendations are ranked by:
1. How well they match your interests
2. Quality signals (ratings, reviews)
3. Relevance to your group composition
4. Variety (avoiding similar recommendations)

### What if I don't have an OpenAI API key?
The app includes a smart fallback system. Without OpenAI, it uses rule-based recommendations that still consider your interests and companions. The experience is slightly less personalized but still useful.

### Can I save places for later?
Yes! Click the heart icon on any place card to save it to your trip. You can view all saved places in your trip details.

### How do I create a new trip?
Click the menu icon (three lines) in the top left, then click "New Trip". You'll go through the onboarding process again to set up your new adventure.

### Is my data secure?
Yes. Passwords are hashed with bcrypt, sessions are secure, and all API calls use HTTPS. We don't store sensitive information unnecessarily.

### Can I use this offline?
Currently, the app requires internet to search Yelp and get recommendations. Future versions may include offline caching.

### What if I find a place I don't like?
Simply don't save it. The system learns from your interactions and will adjust future recommendations.

## Tips & Tricks for Better Recommendations

### 1. Be Specific with Interests
- Instead of just "Dining", choose "Fine Dining" or "Street Food"
- Mix interests: "Photography" + "History" gets you scenic historical sites
- Add multiple interests to see diverse recommendations

### 2. Add Travel Companions
- Even if they're not joining every activity, their interests help the AI understand your group
- The system finds places that appeal to multiple people
- Add kids' ages for family-friendly recommendations

### 3. Use Search Strategically
- Search for specific types: "coffee shops", "hiking trails", "museums"
- Try variations: "restaurants" vs "fine dining" vs "street food"
- Use the interest filters for quick browsing

### 4. Check the AI Reasoning
- Read why each place is recommended
- This helps you understand the system's logic
- You'll get better recommendations as you interact more

### 5. Save Your Favorites
- Heart places you're interested in
- This helps you remember them later
- Build a personalized itinerary

### 6. Create Multiple Trips
- One for each destination or time period
- Different companions = different trips
- Keeps your recommendations organized

### 7. Update Preferences Mid-Trip
- Found new interests? Add them
- New travel companion joining? Add them
- The system will adjust recommendations

## Future Enhancements

- [ ] PostgreSQL database integration
- [ ] Real-time collaboration for group trips
- [ ] Map view with business locations
- [ ] Itinerary scheduling with day-by-day planning
- [ ] Photo gallery from Yelp
- [ ] User reviews and ratings
- [ ] Social sharing of trips and recommendations
- [ ] Mobile app (iOS/Android)
- [ ] Advanced filtering and sorting
- [ ] Offline mode with cached recommendations
- [ ] Integration with Google Maps and Apple Maps
- [ ] Restaurant reservation system
- [ ] Weather-based recommendations
- [ ] Time-based suggestions (best time to visit)

## Production Deployment

### Database Migration
To migrate from in-memory to PostgreSQL:

1. Set up PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Replace `memory-db.ts` with Drizzle ORM integration
4. Run migrations

### Environment Setup
```bash
# Production environment
NODE_ENV=production
PORT=5002
```

### Build and Deploy
```bash
npm run build
npm start
```

## Testing

The app includes:
- TypeScript type checking
- API endpoint validation
- Real Yelp API integration
- Mock AI recommendations fallback

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.

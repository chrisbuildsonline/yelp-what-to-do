# Tech Stack & Build System

## Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety and developer experience
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **React Query** - Data fetching and caching
- **Wouter** - Lightweight routing
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library

## Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Bcrypt** - Password hashing
- **OpenAI SDK** - AI recommendations
- **Axios** - HTTP client for API calls

## External APIs
- **Yelp Fusion API** - Business search and details (required)
- **OpenAI API** - AI recommendations (optional, has mock fallback)

## Database
- **In-Memory** - Development (using Map-based storage)
- **PostgreSQL** - Production ready (Drizzle ORM configured)
- **Drizzle ORM** - Type-safe database queries

## Build & Development

### Common Commands
```bash
# Install dependencies
npm install

# Development server (full-stack)
npm run dev

# Type checking
npm run check

# Production build
npm run build

# Start production server
npm start

# Database migrations (when using PostgreSQL)
npm run db:push
```

### Development Setup
- **Dev Server**: Runs on port 5002
- **Frontend**: Vite dev server with hot module replacement
- **Backend**: Express server with TypeScript compilation
- **Environment**: Uses .env file for configuration

### Build Output
- **Frontend**: Vite builds to `dist/public`
- **Backend**: esbuild bundles to `dist/index.js`
- **Format**: ESM (ES modules)

## Environment Variables
```env
# Required
YELP_API_KEY=your_yelp_api_key
YELP_CLIENT_ID=your_yelp_client_id

# Optional
OPENAI_API_KEY=your_openai_api_key

# Server
PORT=5002
NODE_ENV=development|production

# Database (future PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/yelp_app
```

## Code Quality
- **TypeScript**: Strict mode enabled
- **Type Checking**: `npm run check` validates all code
- **Module System**: ESM throughout (type: "module" in package.json)
- **Path Aliases**: `@/*` for client, `@shared/*` for shared code

## Performance Considerations
- Vite for fast dev server and optimized builds
- React Query for efficient data fetching
- Framer Motion for GPU-accelerated animations
- Tailwind CSS for minimal CSS output
- esbuild for fast production builds

## Deployment
- **Build**: `npm run build` creates optimized production bundle
- **Start**: `npm start` runs production server
- **Port**: Configurable via PORT environment variable
- **Node Version**: 20+ recommended

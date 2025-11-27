# Project Structure

## Directory Organization

```
yelp-ai-tour-guide/
├── client/                    # React frontend application
│   ├── src/
│   │   ├── pages/            # Page components (auth, dashboard, onboarding)
│   │   ├── components/       # Reusable UI components
│   │   │   └── ui/          # Radix UI component library
│   │   ├── hooks/           # Custom React hooks (use-yelp, use-toast, use-mobile)
│   │   ├── lib/             # Utilities and state management
│   │   │   ├── store.tsx    # Global user state (React Context)
│   │   │   ├── supabase.ts  # Supabase client (optional)
│   │   │   ├── queryClient.ts # React Query setup
│   │   │   └── utils.ts     # Helper functions
│   │   ├── index.css        # Global styles
│   │   └── main.tsx         # React entry point
│   ├── index.html           # HTML template
│   └── public/              # Static assets
│
├── server/                   # Express backend
│   ├── routes.ts            # API route handlers
│   ├── memory-db.ts         # In-memory database implementation
│   ├── storage.ts           # File storage utilities
│   ├── app.ts               # Express app configuration
│   ├── db.ts                # Database connection (PostgreSQL ready)
│   ├── index-dev.ts         # Development server entry
│   └── index-prod.ts        # Production server entry
│
├── shared/                  # Shared code between client and server
│   └── schema.ts            # Data types and Zod schemas
│
├── attached_assets/         # Generated images for UI
│   └── images/    # Sample images for places
│
├── dist/                    # Production build output
│   ├── index.js            # Bundled backend
│   └── public/             # Built frontend
│
├── Configuration Files
│   ├── package.json         # Dependencies and scripts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite build configuration
│   ├── tailwind.config.js   # Tailwind CSS configuration
│   ├── postcss.config.js    # PostCSS configuration
│   ├── drizzle.config.ts    # Drizzle ORM configuration
│   ├── components.json      # shadcn/ui configuration
│   └── .env                 # Environment variables
│
└── Documentation
    ├── README.md                    # Main documentation
    ├── QUICKSTART.md               # Quick start guide
    ├── IMPLEMENTATION_SUMMARY.md   # What's been built
    ├── DEPLOYMENT.md               # Deployment guide
    ├── STATUS.md                   # Project status
    └── TODO.md                     # Remaining tasks
```

## Key Files & Responsibilities

### Frontend Pages
- **auth.tsx**: Login/signup forms with authentication
- **onboarding.tsx**: 4-step trip setup wizard
- **dashboard.tsx**: Main app with Yelp search and recommendations
- **not-found.tsx**: 404 error page

### Backend Routes
- **POST /api/auth/signup** - User registration
- **POST /api/auth/login** - User login
- **POST /api/auth/logout** - User logout
- **POST /api/trips** - Create trip
- **GET /api/trips** - Get user's trips
- **GET /api/trips/:tripId** - Get trip details with saved places
- **GET /api/yelp/search** - Search Yelp businesses
- **GET /api/yelp/business/:id** - Get business details
- **POST /api/recommendations** - Get AI recommendations
- **POST /api/trips/:tripId/places** - Save place to trip

### State Management
- **store.tsx**: React Context for user profile, authentication, and trip data
- Session storage in localStorage for persistence
- In-memory database for development

### Database Schema
- **users**: User accounts with authentication
- **trips**: Trip records with location, interests, companions
- **savedPlaces**: Places saved to trips with AI reasoning

## Naming Conventions

### Files
- **Components**: PascalCase (e.g., `LocationAutocomplete.tsx`)
- **Hooks**: kebab-case with `use-` prefix (e.g., `use-yelp.ts`)
- **Utilities**: kebab-case (e.g., `query-client.ts`)
- **Pages**: kebab-case (e.g., `dashboard.tsx`)

### Code
- **React Components**: PascalCase
- **Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **CSS Classes**: kebab-case (Tailwind)

## Architecture Patterns

### Frontend
- **Component-Based**: Modular, reusable components
- **Context API**: Global state management
- **Custom Hooks**: Encapsulated logic (e.g., use-yelp for API calls)
- **Routing**: Wouter for lightweight client-side routing

### Backend
- **RESTful API**: Standard HTTP methods and status codes
- **Middleware**: Authentication via session headers
- **Error Handling**: Try-catch with meaningful error messages
- **External APIs**: Axios for HTTP requests

### Shared
- **Zod Schemas**: Runtime validation and type inference
- **TypeScript**: Strict mode for type safety

## Development Workflow

1. **Frontend Development**: `npm run dev` starts Vite dev server
2. **Backend Development**: `npm run dev` starts Express server
3. **Type Checking**: `npm run check` validates TypeScript
4. **Production Build**: `npm run build` creates optimized bundle
5. **Production Run**: `npm start` runs built application

## Key Dependencies

### Frontend
- react, react-dom - UI framework
- @tanstack/react-query - Data fetching
- framer-motion - Animations
- tailwindcss - Styling
- wouter - Routing
- @radix-ui/* - Accessible components

### Backend
- express - Web framework
- bcrypt - Password hashing
- openai - AI recommendations
- axios - HTTP client
- drizzle-orm - Database ORM

### Development
- typescript - Type checking
- vite - Build tool
- esbuild - Production bundler
- tsx - TypeScript execution

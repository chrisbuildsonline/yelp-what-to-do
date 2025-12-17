# Vercel Deployment Guide

## Architecture

This app now uses a **Vite + Vercel Serverless Functions** architecture:

- **Frontend**: Vite builds static React app → `dist/public/`
- **Backend**: Serverless functions in `api/` folder handle all API routes
- **Local Dev**: Vite proxy forwards `/api/*` requests to local Express server on port 3001

## Local Development

```bash
# Start both frontend (port 3000) and API server (port 3001)
npm run dev

# Or run separately:
npm run dev:client  # Frontend only on port 3000
npm run dev:api     # API server only on port 3001
```

Visit: http://localhost:3000

## Vercel Deployment

### 1. In Vercel Dashboard

**Project Settings:**
- Framework Preset: **Vite**
- Build Command: `npm run build` (default)
- Output Directory: `dist/public` (default)
- Install Command: `npm install` (default)

**Environment Variables** (Settings → Environment Variables):
```
YELP_API_KEY=your_actual_key
YELP_CLIENT_ID=your_actual_client_id
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
NODE_ENV=production
```

### 2. How It Works

**Development:**
```
Browser → http://localhost:3000 (Vite)
          ↓ /api/* requests
          → http://localhost:3001 (Express server)
```

**Production (Vercel):**
```
Browser → https://your-app.vercel.app
          ↓ /api/* requests
          → Vercel Serverless Function (api/[...path].ts)
          → Express routes (server/routes.ts)
```

### 3. Files Structure

```
api/
  └── [...path].ts          # Vercel serverless function (catches all /api/* routes)

server/
  ├── routes.ts             # All API route handlers
  ├── index-api.ts          # Local dev API server
  ├── index-dev.ts          # Old dev server (not used)
  └── index-prod.ts         # Old prod server (not used)

client/
  └── src/                  # React app

dist/
  └── public/               # Built frontend (Vercel serves this)

vercel.json                 # Vercel configuration
```

### 4. Deployment Checklist

- [x] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Set Framework Preset to "Vite"
- [ ] Add environment variables
- [ ] Deploy!

### 5. Troubleshooting

**API routes not working?**
- Check environment variables are set in Vercel
- Check Vercel function logs: Deployments → Functions tab
- Verify `vercel.json` rewrites are correct

**Build failing?**
- Make sure all dependencies are in `dependencies` (not `devDependencies`)
- Check build logs in Vercel dashboard

**Local dev not working?**
- Make sure both servers are running: `npm run dev`
- Check ports 3000 and 3001 are available
- Verify `.env` file has all required variables

## Key Changes Made

1. ✅ Created `api/[...path].ts` - Vercel serverless function wrapper
2. ✅ Created `server/index-api.ts` - Standalone API server for local dev
3. ✅ Updated `vite.config.ts` - Added proxy for local API requests
4. ✅ Updated `package.json` - New dev/build scripts
5. ✅ Created `vercel.json` - Vercel configuration
6. ✅ Updated `.gitignore` - Allow vercel.json to be committed
7. ✅ Changed ports - Frontend: 3000, API: 3001

## Production URL

After deployment: https://yelp-what-to-do.vercel.app

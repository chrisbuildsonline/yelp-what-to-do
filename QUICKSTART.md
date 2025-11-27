# Quick Start Guide

## 🚀 Get Running in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
```bash
export YELP_API_KEY=7_tnoU4odAMwGrJDm1sjHwCE-sUW4qit17w1cgwd2Qx8CMq-KB0pTSv5sNsy4o_ZNGSbR6mtyw2LABGRtWalSkktDZE_CUQ0FWkyyHajeSY3uSyqKTTxwDavmsocaXYx
export YELP_CLIENT_ID=VwstclHyRzgZdaFFphqCYg
export PORT=5002
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Open in Browser
```
http://localhost:5002
```

## 📝 First Steps

### Sign Up
1. Click "Sign up"
2. Enter username, email, password
3. Click "Create Account"

### Create a Trip
1. Enter your name
2. Enter destination (e.g., "Tokyo, Japan")
3. Select interests (Sushi, Hiking, Coffee, etc.)
4. Add travel companions (optional)
5. Name your trip
6. Click "Generate Plan"

### Explore
1. View recommended places
2. Search for specific types
3. See AI-powered recommendations
4. Save places to your trip

## 🛠️ Development Commands

```bash
# Start dev server
npm run dev

# Type checking
npm run check

# Build for production
npm run build

# Start production server
npm start
```

## 📚 Documentation

- **README.md** - Full documentation
- **IMPLEMENTATION_SUMMARY.md** - What's been built
- **DEPLOYMENT.md** - How to deploy
- **STATUS.md** - Project status

## 🔑 API Keys

### Required
- **Yelp API Key**: Get from https://www.yelp.com/developers/v3/manage_app

### Optional
- **OpenAI API Key**: Get from https://platform.openai.com/api-keys

## 🌐 API Endpoints

### Authentication
```
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
```

### Trips
```
POST /api/trips
GET /api/trips
GET /api/trips/:tripId
```

### Yelp
```
GET /api/yelp/search?location=...&term=...
GET /api/yelp/business/:id
```

### Recommendations
```
POST /api/recommendations
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
lsof -i :5002
kill -9 <PID>
```

### Dependencies Issue
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors
```bash
npm run check
```

## 📦 What's Included

✅ Full authentication system
✅ Trip management
✅ Real Yelp API integration
✅ AI recommendations
✅ Beautiful UI
✅ Type-safe code
✅ Production-ready

## 🚀 Deploy to Production

### Build
```bash
npm run build
```

### Run
```bash
PORT=5002 npm start
```

### Docker
```bash
docker build -t yelp-app .
docker run -p 5002:5002 \
  -e YELP_API_KEY=your_key \
  -e YELP_CLIENT_ID=your_id \
  yelp-app
```

## 📞 Support

Check the documentation files for more information:
- README.md - Full guide
- DEPLOYMENT.md - Deployment options
- STATUS.md - Project status

## ✨ Features

- 🔐 Secure authentication
- 🗺️ Trip planning
- 🍽️ Yelp integration
- 🤖 AI recommendations
- 📱 Responsive design
- ⚡ Fast performance
- 🔒 Type-safe code

---

**Ready to go!** Start with `npm run dev` 🎉

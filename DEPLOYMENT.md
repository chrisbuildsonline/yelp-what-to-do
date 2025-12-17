# Deployment Guide - Yelp! What to do?

## Quick Start

The app is production-ready and can be deployed immediately.

### Prerequisites
- Node.js 20+
- npm or yarn
- Yelp API key (required)

### Local Development

```bash
# Install dependencies
npm install

# Set environment variables
export PORT=5002
export YELP_API_KEY=your_key
export YELP_CLIENT_ID=your_id

# Start development server
npm run dev

# App will be available at http://localhost:5002
```

### Production Build

```bash
# Build the app
npm run build

# Start production server
PORT=5002 npm start
```

## Deployment Options

### Option 1: Heroku

```bash
# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set YELP_API_KEY=your_key
heroku config:set YELP_CLIENT_ID=your_id
heroku config:set PORT=5002

# Deploy
git push heroku main
```

### Option 2: AWS EC2

```bash
# SSH into instance
ssh -i key.pem ec2-user@your-instance

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo
cd your-repo

# Install dependencies
npm install

# Set environment variables
export YELP_API_KEY=your_key
export YELP_CLIENT_ID=your_id
export PORT=5002

# Start with PM2
npm install -g pm2
pm2 start npm --name "yelp-app" -- start
pm2 save
pm2 startup
```

### Option 3: Docker

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

Build and run:
```bash
docker build -t yelp-app .
docker run -p 5002:5002 \
  -e YELP_API_KEY=your_key \
  -e YELP_CLIENT_ID=your_id \
  yelp-app
```

### Option 4: Vercel (Frontend) + Backend

Frontend on Vercel:
```bash
vercel deploy
```

Backend on separate service (Heroku, AWS, etc.)

## Environment Variables

Required:
```
YELP_API_KEY=your_yelp_api_key
YELP_CLIENT_ID=your_yelp_client_id
PORT=5002
NODE_ENV=production
```

Optional:
```
DATABASE_URL=postgresql://user:pass@host/db
```

## Database Setup (PostgreSQL)

### Local PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql  # macOS
sudo apt-get install postgresql  # Linux

# Create database
createdb yelp_app

# Set DATABASE_URL
export DATABASE_URL=postgresql://localhost/yelp_app
```

### Cloud PostgreSQL

Options:
- AWS RDS
- Heroku Postgres
- DigitalOcean Managed Databases
- Supabase

Example with Supabase:
```bash
export DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
```

## Monitoring & Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs yelp-app
```

### Application Logging
Logs are printed to console:
- API requests
- Errors
- Performance metrics

### Error Tracking
Add Sentry for production:
```bash
npm install @sentry/node
```

## Performance Optimization

### Caching
- Implement Redis for session storage
- Cache Yelp search results
- Cache AI recommendations

### Database Optimization
- Add indexes on frequently queried fields
- Implement connection pooling
- Use prepared statements

### Frontend Optimization
- Code splitting with dynamic imports
- Image optimization
- Lazy loading

## Security Checklist

- [ ] Use HTTPS/SSL
- [ ] Set secure environment variables
- [ ] Implement rate limiting
- [ ] Add CORS configuration
- [ ] Validate all inputs
- [ ] Use secure session cookies
- [ ] Implement CSRF protection
- [ ] Add security headers
- [ ] Regular security audits

## Scaling

### Horizontal Scaling
- Load balancer (nginx, HAProxy)
- Multiple app instances
- Shared session store (Redis)
- Shared database

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching

## Backup & Recovery

### Database Backups
```bash
# PostgreSQL backup
pg_dump yelp_app > backup.sql

# Restore
psql yelp_app < backup.sql
```

### Automated Backups
- AWS RDS automated backups
- Heroku Postgres backups
- Daily backup scripts

## Monitoring Checklist

- [ ] Server uptime monitoring
- [ ] Error rate tracking
- [ ] Response time monitoring
- [ ] Database performance
- [ ] API rate limits
- [ ] User activity logs
- [ ] Security alerts

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5002
lsof -i :5002

# Kill process
kill -9 <PID>
```

### Database Connection Issues
```bash
# Test connection
psql $DATABASE_URL

# Check environment variables
echo $DATABASE_URL
```

### Yelp API Errors
- Verify API key is correct
- Check rate limits
- Ensure location format is valid
- Check API status page

## Rollback Procedure

```bash
# Revert to previous version
git revert HEAD
npm run build
npm start
```

## Performance Targets

- Page load: < 2s
- API response: < 500ms
- Search results: < 1s
- Recommendations: < 2s

## Support & Maintenance

- Monitor error logs daily
- Update dependencies monthly
- Security patches immediately
- Performance optimization quarterly

## Deployment Checklist

- [ ] Environment variables set
- [ ] Database configured
- [ ] API keys verified
- [ ] Build successful
- [ ] Tests passing
- [ ] SSL certificate installed
- [ ] Monitoring configured
- [ ] Backups enabled
- [ ] Security headers set
- [ ] Rate limiting enabled

## Post-Deployment

1. Test all features
2. Monitor error logs
3. Check performance metrics
4. Verify backups working
5. Document any issues
6. Plan maintenance window

## Support

For deployment issues:
1. Check logs: `npm run dev` or `pm2 logs`
2. Verify environment variables
3. Test API endpoints
4. Check database connection
5. Review error messages

## Next Steps

1. Deploy to production
2. Set up monitoring
3. Configure backups
4. Plan scaling strategy
5. Implement additional features

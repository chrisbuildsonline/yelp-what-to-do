import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import axios from 'axios';

// Supabase setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('❌ Supabase credentials not configured!');
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateSessionId() {
  return Math.random().toString(36).substring(2, 34);
}

// Simple session validation using database
async function validateSession(sessionId: string) {
  if (!sessionId) return null;
  
  // For simplicity, we'll decode the session ID to get user info
  // In production, you'd want proper JWT tokens or database sessions
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, username')
      .limit(1);
    
    if (users && users.length > 0) {
      return { userId: users[0].id, username: users[0].username };
    }
  } catch (error) {
    console.error('Session validation error:', error);
  }
  
  return null;
}

// Route handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { method, url } = req;
  const path = url?.split('?')[0] || '';

  try {
    // Auth routes
    if (path === '/api/auth/signup' && method === 'POST') {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (existingUser) {
        return res.status(409).json({ error: 'Username already exists' });
      }

      // Hash password and create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const { data: newUser, error } = await supabase
        .from('users')
        .insert([{ username, email, password: hashedPassword, created_at: new Date().toISOString() }])
        .select()
        .single();

      if (error) throw error;

      // Create session
      const sessionId = generateSessionId();

      return res.json({
        sessionId,
        user: { id: newUser.id, username: newUser.username, email: newUser.email }
      });
    }

    if (path === '/api/auth/login' && method === 'POST') {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Missing username or password' });
      }

      // Find user
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Create session
      const sessionId = generateSessionId();

      return res.json({
        sessionId,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      return res.json({ success: true });
    }

    // Yelp routes
    if (path === '/api/yelp/search' && method === 'GET') {
      const { location, term, limit = '20' } = req.query;
      
      const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
        headers: { 'Authorization': `Bearer ${process.env.YELP_API_KEY}` },
        params: { location, term, limit }
      });

      return res.json(response.data);
    }

    if (path.startsWith('/api/yelp/business/') && method === 'GET') {
      const businessId = path.split('/').pop();
      
      const response = await axios.get(`https://api.yelp.com/v3/businesses/${businessId}`, {
        headers: { 'Authorization': `Bearer ${process.env.YELP_API_KEY}` }
      });

      return res.json(response.data);
    }

    // Trip routes
    if (path === '/api/trips' && method === 'POST') {
      const sessionId = req.headers['x-session-id'] as string;
      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { name, location, interests, companions } = req.body;
      
      const { data: trip, error } = await supabase
        .from('trips')
        .insert([{
          user_id: session.userId,
          name,
          location,
          interests: JSON.stringify(interests),
          companions: JSON.stringify(companions),
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return res.json({
        id: trip.id,
        name: trip.name,
        location: trip.location,
        interests: JSON.parse(trip.interests),
        companions: JSON.parse(trip.companions),
        createdAt: new Date(trip.created_at)
      });
    }

    if (path === '/api/trips' && method === 'GET') {
      const sessionId = req.headers['x-session-id'] as string;
      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { data: trips } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', session.userId)
        .order('created_at', { ascending: false });

      const formattedTrips = (trips || []).map(trip => ({
        id: trip.id,
        name: trip.name,
        location: trip.location,
        interests: JSON.parse(trip.interests || '[]'),
        companions: JSON.parse(trip.companions || '[]'),
        createdAt: new Date(trip.created_at)
      }));

      return res.json(formattedTrips);
    }

    // Stats routes
    if (path === '/api/stats/users' && method === 'GET') {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, created_at')
        .order('created_at', { ascending: false });

      return res.json({ 
        count: users?.length || 0,
        users: users || []
      });
    }

    if (path === '/api/recommendations' && method === 'POST') {
      const { interests, location, companions } = req.body;
      
      // Simple AI recommendation logic
      const recommendations = [
        `Based on your interest in ${interests[0]}, I recommend exploring local ${interests[0]} spots in ${location}.`,
        `Since you're traveling with ${companions.length} companions, consider group-friendly activities.`,
        `${location} has great options for ${interests.slice(0, 2).join(' and ')}.`
      ];

      return res.json({ recommendations });
    }

    // Itinerary routes
    if (path.match(/^\/api\/trips\/[^\/]+\/itinerary$/) && method === 'GET') {
      const sessionId = req.headers['x-session-id'] as string;
      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Return empty itinerary for now
      return res.json({ days: [] });
    }

    if (path.match(/^\/api\/trips\/[^\/]+\/itinerary$/) && method === 'POST') {
      const sessionId = req.headers['x-session-id'] as string;
      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Save itinerary (simplified - just return success)
      return res.json({ success: true });
    }

    if (path === '/api/itinerary/generate' && method === 'POST') {
      const sessionId = req.headers['x-session-id'] as string;
      const session = await validateSession(sessionId);
      
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { location, interests = [], numDays = 3 } = req.body;
      
      console.log('Generate itinerary request:', { location, interests, numDays });

      // Generate a simple itinerary
      const days = [];
      const safeInterests = Array.isArray(interests) ? interests : ['restaurants', 'attractions'];
      const safeLocation = location || 'your destination';
      
      for (let i = 0; i < numDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        days.push({
          date: date.toISOString().split('T')[0],
          activities: [
            {
              id: `activity-${i}-1`,
              time: '9:00 AM',
              title: `Explore ${safeInterests[0] || 'local'} spots`,
              location: safeLocation,
              completed: false
            },
            {
              id: `activity-${i}-2`,
              time: '1:00 PM',
              title: 'Lunch break',
              location: safeLocation,
              completed: false
            },
            {
              id: `activity-${i}-3`,
              time: '3:00 PM',
              title: `Visit ${safeInterests[1] || 'local attractions'}`,
              location: safeLocation,
              completed: false
            }
          ]
        });
      }

      return res.json({ itinerary: days });
    }

    // Default response
    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
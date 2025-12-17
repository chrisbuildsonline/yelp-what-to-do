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

// Session storage
const sessions = new Map<string, { userId: string; username: string }>();

function generateSessionId() {
  return Math.random().toString(36).substring(2, 34);
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
      sessions.set(sessionId, { userId: newUser.id, username: newUser.username });

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
      sessions.set(sessionId, { userId: user.id, username: user.username });

      return res.json({
        sessionId,
        user: { id: user.id, username: user.username, email: user.email }
      });
    }

    if (path === '/api/auth/logout' && method === 'POST') {
      const sessionId = req.headers['x-session-id'] as string;
      if (sessionId) {
        sessions.delete(sessionId);
      }
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
      const session = sessions.get(sessionId);
      
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
      const session = sessions.get(sessionId);
      
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

      return res.json(users || []);
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

    // Default response
    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
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

    // Default response
    return res.status(404).json({ error: 'Route not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
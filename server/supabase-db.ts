import { createClient } from '@supabase/supabase-js';
import { User, Trip, SavedPlace } from "@shared/schema";

interface StoredUser extends User {
  password: string;
}

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not configured');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export class SupabaseDB {
  // User operations
  async createUser(username: string, email: string, password: string): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            username,
            email,
            password,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        createdAt: new Date(data.created_at),
      } as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<StoredUser | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async getUserById(id: string): Promise<StoredUser | undefined> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        username: data.username,
        email: data.email,
        password: data.password,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error getting user by id:', error);
      return undefined;
    }
  }

  // Trip operations
  async createTrip(
    userId: string,
    name: string,
    location: string,
    interests: any[] = [],
    companions: any[] = []
  ): Promise<Trip> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .insert([
          {
            user_id: userId,
            name,
            location,
            interests,
            companions,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        location: data.location,
        interests: data.interests || [],
        companions: data.companions || [],
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      return (data || []).map(trip => ({
        id: trip.id,
        userId: trip.user_id,
        name: trip.name,
        location: trip.location,
        interests: trip.interests || [],
        companions: trip.companions || [],
        startDate: trip.start_date ? new Date(trip.start_date) : null,
        endDate: trip.end_date ? new Date(trip.end_date) : null,
        createdAt: new Date(trip.created_at),
      }));
    } catch (error) {
      console.error('Error getting trips by user:', error);
      return [];
    }
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    try {
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (!data) return undefined;

      return {
        id: data.id,
        userId: data.user_id,
        name: data.name,
        location: data.location,
        interests: data.interests || [],
        companions: data.companions || [],
        startDate: data.start_date ? new Date(data.start_date) : null,
        endDate: data.end_date ? new Date(data.end_date) : null,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error getting trip by id:', error);
      return undefined;
    }
  }

  // Saved places operations
  async createSavedPlace(
    tripId: string,
    yelpBusinessId: string,
    businessName: string,
    businessData: any = {},
    customNotes?: string,
    aiReason?: string
  ): Promise<SavedPlace> {
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .insert([
          {
            trip_id: tripId,
            yelp_business_id: yelpBusinessId,
            business_name: businessName,
            business_data: businessData,
            custom_notes: customNotes || null,
            ai_reason: aiReason || null,
            created_at: new Date().toISOString(),
          }
        ])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        tripId: data.trip_id,
        yelpBusinessId: data.yelp_business_id,
        businessName: data.business_name,
        businessData: data.business_data || {},
        customNotes: data.custom_notes,
        aiReason: data.ai_reason,
        dayOrder: data.day_order,
        createdAt: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error creating saved place:', error);
      throw error;
    }
  }

  async getSavedPlacesByTripId(tripId: string): Promise<SavedPlace[]> {
    try {
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('trip_id', tripId);

      if (error) throw error;

      return (data || []).map(place => ({
        id: place.id,
        tripId: place.trip_id,
        yelpBusinessId: place.yelp_business_id,
        businessName: place.business_name,
        businessData: place.business_data || {},
        customNotes: place.custom_notes,
        aiReason: place.ai_reason,
        dayOrder: place.day_order,
        createdAt: new Date(place.created_at),
      }));
    } catch (error) {
      console.error('Error getting saved places:', error);
      return [];
    }
  }

  async deleteTrip(tripId: string): Promise<void> {
    try {
      // First delete all saved places for this trip
      await supabase
        .from('saved_places')
        .delete()
        .eq('trip_id', tripId);

      // Then delete the trip
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  }

  async getUserCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;

      return count || 0;
    } catch (error) {
      console.error('Error getting user count:', error);
      return 0;
    }
  }
}

export const supabaseDB = new SupabaseDB();

import { User, Trip, SavedPlace } from "@shared/schema";

interface StoredUser extends User {
  password: string;
}

export class MemoryDB {
  private users: Map<string, StoredUser> = new Map();
  private trips: Map<string, Trip> = new Map();
  private savedPlaces: Map<string, SavedPlace> = new Map();
  private userIdCounter = 0;
  private tripIdCounter = 0;
  private placeIdCounter = 0;

  // User operations
  async createUser(username: string, email: string, password: string): Promise<User> {
    const id = `user_${++this.userIdCounter}`;
    const user: StoredUser = {
      id,
      username,
      email,
      password,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  async getUserByUsername(username: string): Promise<StoredUser | undefined> {
    return Array.from(this.users.values()).find(u => u.username === username);
  }

  async getUserById(id: string): Promise<StoredUser | undefined> {
    return this.users.get(id);
  }

  // Trip operations
  async createTrip(
    userId: string,
    name: string,
    location: string,
    interests: any[] = [],
    companions: any[] = []
  ): Promise<Trip> {
    const id = `trip_${++this.tripIdCounter}`;
    const trip: Trip = {
      id,
      userId,
      name,
      location,
      interests,
      companions,
      startDate: null,
      endDate: null,
      createdAt: new Date(),
    };
    this.trips.set(id, trip);
    return trip;
  }

  async getTripsByUserId(userId: string): Promise<Trip[]> {
    return Array.from(this.trips.values()).filter(t => t.userId === userId);
  }

  async getTripById(id: string): Promise<Trip | undefined> {
    return this.trips.get(id);
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
    const id = `place_${++this.placeIdCounter}`;
    const place: SavedPlace = {
      id,
      tripId,
      yelpBusinessId,
      businessName,
      businessData,
      customNotes: customNotes || null,
      aiReason: aiReason || null,
      dayOrder: null,
      createdAt: new Date(),
    };
    this.savedPlaces.set(id, place);
    return place;
  }

  async getSavedPlacesByTripId(tripId: string): Promise<SavedPlace[]> {
    return Array.from(this.savedPlaces.values()).filter(p => p.tripId === tripId);
  }
}

export const memoryDB = new MemoryDB();

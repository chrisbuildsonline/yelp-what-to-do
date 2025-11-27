import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Companion {
  name: string;
  interests: string[];
  age?: number;
}

export interface SavedPlace {
  id: string;
  yelpBusinessId: string;
  businessName: string;
  businessData: any;
  aiReason?: string;
  isFavorite?: boolean;
}

export interface Trip {
  id: string;
  name: string;
  country: string;
  interests: string[];
  companions: Companion[];
  savedPlaces?: SavedPlace[];
}

export interface UserProfile {
  name: string;
  country: string;
  interests: string[];
  companions: Companion[];
  currentTripName: string;
  currentTripId: string;
  isOnboarded: boolean;
  trips: Trip[];
  age?: number;
  travelingWithKids?: boolean;
  kidsAges?: number[];
}

export interface User {
  id: string;
  username: string;
  email: string;
}

interface UserContextType {
  profile: UserProfile;
  user: User | null;
  sessionId: string | null;
  isAuthenticated: boolean;
  isLoadingSession: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleInterest: (interest: string) => void;
  addCompanion: (companion: Companion) => void;
  removeCompanion: (index: number) => void;
  completeOnboarding: () => void;
  createNewTrip: () => void;
  loadTrip: (tripId: string) => void;
  setSession: (sessionId: string, user: User) => void;
  logout: () => void;
  toggleFavorite: (placeId: string) => void;
  isFavorite: (placeId: string) => boolean;
  getFavorites: () => SavedPlace[];
  updateCompanion: (index: number, companion: Companion) => void;
  loadTripsFromBackend: (sessionId: string) => Promise<void>;
  deleteTrip: (tripId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const DEFAULT_PROFILE: UserProfile = {
  name: '',
  country: '',
  interests: [],
  companions: [],
  currentTripName: '',
  currentTripId: '',
  isOnboarded: false,
  trips: [],
};

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  // Load session from localStorage on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const savedSessionId = localStorage.getItem('sessionId');
        const savedUser = localStorage.getItem('user');
        if (savedSessionId && savedUser) {
          setSessionId(savedSessionId);
          setUser(JSON.parse(savedUser));
          // Load trips from backend when session is restored
          await loadTripsFromBackendInternal(savedSessionId);
        }
      } catch (error) {
        console.error('Error loading session:', error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    loadSession();
  }, []);

  const loadTripsFromBackendInternal = async (sid: string) => {
    try {
      const response = await fetch('/api/trips', {
        headers: {
          'x-session-id': sid,
        },
      });

      if (response.status === 401) {
        // Session is unauthorized, clear it
        console.warn('Session unauthorized, logging out');
        setSessionId(null);
        setUser(null);
        localStorage.removeItem('sessionId');
        localStorage.removeItem('user');
        return;
      }

      if (response.ok) {
        const trips = await response.json();
        if (trips && trips.length > 0) {
          // Load the most recent trip
          const mostRecentTrip = trips[trips.length - 1];
          
          // Convert API response to Trip format
          const formattedTrips: Trip[] = trips.map((trip: any) => ({
            id: trip.id,
            name: trip.name,
            country: trip.location,
            interests: trip.interests || [],
            companions: trip.companions || [],
            savedPlaces: trip.savedPlaces || [],
          }));

          setProfile(prev => ({
            ...prev,
            trips: formattedTrips,
            currentTripId: mostRecentTrip.id,
            currentTripName: mostRecentTrip.name,
            country: mostRecentTrip.location,
            interests: mostRecentTrip.interests || [],
            companions: mostRecentTrip.companions || [],
            isOnboarded: true,
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load trips from backend:', error);
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const toggleInterest = (interest: string) => {
    setProfile(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      return {
        ...prev,
        interests: newInterests,
      };
    });
  };

  const addCompanion = (companion: Companion) => {
    setProfile(prev => ({
      ...prev,
      companions: [...prev.companions, companion],
    }));
  };

  const removeCompanion = (index: number) => {
    setProfile(prev => ({
      ...prev,
      companions: prev.companions.filter((_, i) => i !== index),
    }));
  };

  const completeOnboarding = () => {
    const newTrip: Trip = {
      id: Math.random().toString(36).substr(2, 9),
      name: profile.currentTripName,
      country: profile.country,
      interests: profile.interests,
      companions: profile.companions,
    };

    setProfile(prev => ({
      ...prev,
      isOnboarded: true,
      currentTripId: newTrip.id,
      trips: [...prev.trips, newTrip],
    }));
  };

  const createNewTrip = () => {
    setProfile(prev => ({
      ...prev,
      name: '',
      country: '',
      interests: [],
      companions: [],
      currentTripName: '',
      currentTripId: '',
      isOnboarded: false,
    }));
  };

  const loadTrip = (tripId: string) => {
    const trip = profile.trips.find(t => t.id === tripId);
    if (trip) {
      setProfile(prev => ({
        ...prev,
        currentTripId: trip.id,
        currentTripName: trip.name,
        country: trip.country,
        interests: trip.interests,
        companions: trip.companions,
      }));
    }
  };

  const setSession = (newSessionId: string, newUser: User) => {
    console.log('Setting session:', newSessionId);
    setSessionId(newSessionId);
    setUser(newUser);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setSessionId(null);
    setUser(null);
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem('sessionId');
    localStorage.removeItem('user');
  };

  const toggleFavorite = (businessId: string) => {
    setProfile(prev => {
      const updatedTrips = prev.trips.map(trip => {
        if (trip.id === prev.currentTripId) {
          const existingPlace = (trip.savedPlaces || []).find(p => p.yelpBusinessId === businessId);
          if (existingPlace) {
            return {
              ...trip,
              savedPlaces: (trip.savedPlaces || []).map(place =>
                place.yelpBusinessId === businessId
                  ? { ...place, isFavorite: !place.isFavorite }
                  : place
              ),
            };
          } else {
            // Add new favorite
            const newPlace: SavedPlace = {
              id: Math.random().toString(36).substr(2, 9),
              yelpBusinessId: businessId,
              businessName: '',
              businessData: {},
              isFavorite: true,
            };
            return {
              ...trip,
              savedPlaces: [...(trip.savedPlaces || []), newPlace],
            };
          }
        }
        return trip;
      });
      return { ...prev, trips: updatedTrips };
    });
  };

  const isFavorite = (businessId: string): boolean => {
    const currentTrip = profile.trips.find(t => t.id === profile.currentTripId);
    return currentTrip?.savedPlaces?.some(p => p.yelpBusinessId === businessId && p.isFavorite) || false;
  };

  const getFavorites = (): SavedPlace[] => {
    const currentTrip = profile.trips.find(t => t.id === profile.currentTripId);
    return (currentTrip?.savedPlaces || []).filter(p => p.isFavorite);
  };

  const updateCompanion = (index: number, companion: Companion) => {
    setProfile(prev => ({
      ...prev,
      companions: prev.companions.map((c, i) => (i === index ? companion : c)),
    }));
  };

  const loadTripsFromBackend = async (sid: string) => {
    await loadTripsFromBackendInternal(sid);
  };

  const deleteTrip = (tripId: string) => {
    setProfile(prev => ({
      ...prev,
      trips: prev.trips.filter(t => t.id !== tripId),
      // If the deleted trip was the current one, clear it
      currentTripId: prev.currentTripId === tripId ? '' : prev.currentTripId,
      currentTripName: prev.currentTripId === tripId ? '' : prev.currentTripName,
      country: prev.currentTripId === tripId ? '' : prev.country,
      interests: prev.currentTripId === tripId ? [] : prev.interests,
      companions: prev.currentTripId === tripId ? [] : prev.companions,
    }));
  };

  return (
    <UserContext.Provider
      value={{
        profile,
        user,
        sessionId,
        isAuthenticated: !!sessionId && !!user,
        isLoadingSession,
        updateProfile,
        toggleInterest,
        addCompanion,
        removeCompanion,
        completeOnboarding,
        createNewTrip,
        loadTrip,
        setSession,
        logout,
        toggleFavorite,
        isFavorite,
        getFavorites,
        updateCompanion,
        loadTripsFromBackend,
        deleteTrip,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
}

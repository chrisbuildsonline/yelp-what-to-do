import { useUser } from '@/lib/store';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Bell, Heart, Users, Plus, List, Edit2, ArrowRight, Sparkles, Loader, LogOut, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { ManageFriendsModal } from '@/components/manage-friends-modal';
import { MapView } from '@/components/map-view';

import cafeImg from '@assets/generated_images/modern_brunch_cafe_interior.png';
import hikingImg from '@assets/generated_images/scenic_hiking_trail.png';
import burgerImg from '@assets/generated_images/gourmet_burger_meal.png';
import museumImg from '@assets/generated_images/modern_art_museum.png';
import diningImg from '@assets/generated_images/friends_dining_at_night.png';

interface YelpBusiness {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  image_url: string;
  categories: Array<{ title: string }>;
  distance: number;
  price?: string;
  coordinates?: { latitude: number; longitude: number };
  phone?: string;
  url?: string;
}

type FilterType = 'For You' | 'Trending' | 'New';

export default function Dashboard() {
  const { profile, user, sessionId, logout, createNewTrip, loadTrip, toggleFavorite, isFavorite, deleteTrip } = useUser();
  const [, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [yelpData, setYelpData] = useState<YelpBusiness[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('restaurants');
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>('For You');
  const [cachedData, setCachedData] = useState<Record<string, YelpBusiness[]>>({});

  useEffect(() => {
    if (!profile.isOnboarded) {
      setLocation('/onboarding');
    }
  }, [profile.isOnboarded, setLocation]);

  useEffect(() => {
    if (profile.isOnboarded && profile.country && sessionId) {
      fetchYelpData();
      setError(null);
    }
  }, [profile.country, profile.currentTripId, profile.isOnboarded, sessionId]);

  const fetchYelpData = async (filter: FilterType = 'For You', term: string = searchTerm) => {
    // Validate location before searching
    if (!profile.country || !profile.country.trim()) {
      setError('Location is required. Please update your profile to add a location.');
      setYelpData([]);
      return;
    }

    const trimmedLocation = profile.country.trim();
    if (trimmedLocation.length < 2) {
      setError('Location is too short. Use format: "City, Country" (e.g., "Tokyo, Japan")');
      setYelpData([]);
      return;
    }

    // Extract just the city and country/state from the location
    // Handle formats like "Dubai Emirate, Dubai, United Arab Emirates" -> "Dubai, United Arab Emirates"
    const locationParts = trimmedLocation.split(',').map(p => p.trim());
    let simplifiedLocation = trimmedLocation;
    
    if (locationParts.length > 2) {
      // Take the first and last parts (city and country)
      simplifiedLocation = `${locationParts[0]}, ${locationParts[locationParts.length - 1]}`;
    } else if (locationParts.length === 2) {
      simplifiedLocation = trimmedLocation;
    } else {
      setError('Location must include city and country/state (e.g., "Paris, France" or "New York, NY"). Please update your location in Edit Preferences.');
      setYelpData([]);
      return;
    }

    // Check cache first
    const cacheKey = `${filter}-${term}`;
    if (cachedData[cacheKey]) {
      setYelpData(cachedData[cacheKey]);
      setActiveFilter(filter);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const interests = profile.interests.join(',');
      const response = await fetch(
        `/api/yelp/search?location=${encodeURIComponent(simplifiedLocation)}&term=${encodeURIComponent(term)}&interests=${encodeURIComponent(interests)}&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        const businesses = data.businesses || [];
        
        // Cache the results
        setCachedData(prev => ({
          ...prev,
          [cacheKey]: businesses,
        }));
        
        setYelpData(businesses);
        setActiveFilter(filter);

        if (!businesses || businesses.length === 0) {
          setError('No results found. Try a different location or search term.');
        }
      } else {
        const errorData = await response.json();
        let errorMsg = 'Failed to search. ';
        if (errorData.error?.suggestion) {
          errorMsg += errorData.error.suggestion;
        } else if (errorData.error?.error?.description) {
          errorMsg += errorData.error.error.description;
        } else if (typeof errorData.error === 'string') {
          errorMsg += errorData.error;
        } else {
          errorMsg += 'Please try a more specific location.';
        }
        setError(errorMsg);
        setYelpData([]);
      }
    } catch (err) {
      console.error('Failed to fetch Yelp data:', err);
      setError('Connection error. Please try again.');
      setYelpData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    setLocation('/auth');
  };

  const handleNewTrip = () => {
    createNewTrip();
    setLocation('/onboarding');
  };

  const handleDeleteTrip = async (tripId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip?')) return;

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'DELETE',
        headers: {
          'x-session-id': sessionId || '',
        },
      });

      if (response.ok) {
        deleteTrip(tripId);
        // If we deleted the current trip, redirect to onboarding
        if (tripId === profile.currentTripId) {
          setLocation('/onboarding');
        }
      }
    } catch (error) {
      console.error('Failed to delete trip:', error);
    }
  };

  if (!profile.isOnboarded) return null;

  const displayPlaces = yelpData.slice(0, 6).map((business, idx) => ({
    id: business.id,
    name: business.name,
    type: business.categories[0]?.title || 'Place',
    rating: business.rating,
    reviews: business.review_count,
    image: [cafeImg, hikingImg, burgerImg, museumImg, diningImg][idx % 5],
    tags: business.categories.slice(0, 3).map(c => c.title),
    distance: `${(business.distance / 1609).toFixed(1)} mi`,
    price: business.price || '$',
    aiReason: `Highly rated ${business.categories[0]?.title || 'place'} with ${business.review_count} reviews`,
  }));

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <List className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px]">
                <SheetHeader>
                  <SheetTitle>My Trips</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  <Button onClick={handleNewTrip} className="w-full gap-2">
                    <Plus className="w-4 h-4" /> New Trip
                  </Button>
                  
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground px-2">Past Trips</h4>
                    {profile.trips.map(trip => (
                      <div 
                        key={trip.id} 
                        onClick={() => { loadTrip(trip.id); setSheetOpen(false); }}
                        className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted flex items-center justify-between group"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{trip.name}</div>
                          <div className="text-xs text-muted-foreground">{trip.country}</div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <button
                            onClick={(e) => handleDeleteTrip(trip.id, e)}
                            className="p-1 hover:bg-destructive/10 hover:text-destructive rounded transition-colors"
                            title="Delete trip"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {profile.trips.length === 0 && (
                      <div className="text-sm text-muted-foreground px-2 italic">No saved trips yet</div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl">Y!</div>
              <span className="font-bold text-lg tracking-tight text-foreground hidden sm:block">Yelp! What to do?</span>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4 hidden sm:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder={`Search places in ${profile.country}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void fetchYelpData(activeFilter, searchTerm)}
                disabled={isLoading}
                className="pl-9 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full disabled:opacity-50" 
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
            </button>
            <Avatar className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
              <AvatarFallback>{user?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {profile.currentTripName || "Your Trip"}
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary" />
              <span>Exploring <span className="font-semibold text-foreground">{profile.country}</span></span>
              {profile.companions.length > 0 && (
                <>
                  <span className="mx-2">•</span>
                  <span>With {profile.companions.length} friends</span>
                </>
              )}
            </div>
          </div>
          
          <Button variant="outline" className="gap-2" onClick={() => setLocation('/edit-preferences')}>
            <Edit2 className="w-4 h-4" /> Edit Preferences
          </Button>
        </motion.div>

        {!error && yelpData.length > 0 && (
          <div className="mb-8">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-4 min-w-max">
                {(['For You', 'Trending', 'New'] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      let term = searchTerm;
                      if (filter === 'Trending') term = 'popular';
                      if (filter === 'New') term = 'new';
                      void fetchYelpData(filter, term);
                    }}
                    className={`
                      px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap
                      ${activeFilter === filter
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-white border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground shadow-sm'}
                    `}
                  >
                    {filter}
                  </button>
                ))}
                {profile.interests.map((interest) => (
                  <button
                    key={interest}
                    onClick={() => void fetchYelpData('For You', interest)}
                    className="px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap bg-white border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground shadow-sm"
                  >
                    {interest}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {!error && yelpData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-3xl overflow-hidden aspect-2/1 group cursor-pointer"
              >
                <img
                  src={hikingImg}
                  alt="Featured"
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white">
                  <div className="flex gap-2 mb-3">
                    <Badge className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border-none">
                      Top Pick
                    </Badge>
                    <Badge className="bg-primary/80 backdrop-blur-md hover:bg-primary/90 text-white border-none flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> AI Choice
                    </Badge>
                  </div>
                  <h2 className="text-2xl md:text-4xl font-bold mb-2">Discover Amazing Places</h2>
                  <p className="text-white/80 max-w-lg line-clamp-2">
                    Based on your interests in <span className="font-semibold text-white">{profile.interests.join(', ')}</span>, we found incredible spots for you.
                  </p>
                </div>
              </motion.div>

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">We think you'll love these</h3>
                <button onClick={() => void fetchYelpData(activeFilter, searchTerm)} disabled={isLoading} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
                  {isLoading ? 'Searching...' : 'Refresh'}
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <Loader className="w-6 h-6 animate-spin text-primary" />
                </div>
              )}
              
              {!isLoading && yelpData.length === 0 && !error && (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <p>No places loaded yet. Try searching or refreshing.</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayPlaces.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.2 }}
                  >
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                      <div className="relative aspect-4/3 overflow-hidden">
                        <img 
                          src={place.image} 
                          alt={place.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <button 
                          onClick={() => toggleFavorite(place.id)}
                          className={`absolute top-3 right-3 p-2 backdrop-blur rounded-full transition-colors ${
                            isFavorite(place.id)
                              ? 'bg-red-500/90 text-white'
                              : 'bg-white/90 text-muted-foreground hover:text-red-500'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${isFavorite(place.id) ? 'fill-current' : ''}`} />
                        </button>
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          {place.rating}
                        </div>
                      </div>
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{place.name}</h4>
                            <p className="text-sm text-muted-foreground">{place.type}</p>
                          </div>
                          <span className="text-sm font-medium text-muted-foreground">{place.distance}</span>
                        </div>
                        
                        <div className="bg-primary/5 p-2 rounded-md my-3">
                          <p className="text-xs text-primary/80 italic flex gap-2">
                            <Sparkles className="w-3 h-3 shrink-0 mt-0.5" />
                            {place.aiReason}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-auto pt-2">
                          {place.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                              {tag}
                            </span>
                          ))}
                          <span className="text-xs ml-auto font-medium text-foreground px-2 py-1">{place.price}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <Card className="p-0 overflow-hidden border-none shadow-lg">
              <div className="bg-slate-200 h-48 w-full relative flex items-center justify-center">
                <MapPin className="w-8 h-8 text-primary animate-bounce" />
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                  {profile.country} Area
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold mb-1">Your Map</h3>
                <p className="text-sm text-muted-foreground mb-4">View all {displayPlaces.length} recommended spots on the map.</p>
                <MapView places={yelpData.map(b => {
                  const place = {
                    id: b.id,
                    name: b.name,
                    rating: b.rating,
                    review_count: b.review_count,
                    image_url: b.image_url,
                    coordinates: b.coordinates,
                    phone: b.phone,
                    url: b.url,
                    categories: b.categories,
                    distance: b.distance,
                  };
                  if (!place.coordinates) {
                    console.warn(`Place ${place.name} missing coordinates`);
                  }
                  return place;
                })} location={profile.country} />
              </div>
            </Card>

            <Card className="p-5 border-none shadow-md">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Travel Buddies
              </h3>
              <div className="space-y-4">
                {profile.companions.map((friend, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 bg-orange-100">
                      <AvatarFallback className="text-orange-600 text-xs">{friend.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium leading-none">{friend.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {friend.interests.length ? friend.interests.join(', ') : 'Just tagging along'}
                      </p>
                    </div>
                  </div>
                ))}
                {profile.companions.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Flying solo on this one.</p>
                )}
                <ManageFriendsModal />
              </div>
            </Card>
          </div>
        </div>
        )}

        {(error || yelpData.length === 0) && (
          <div className="flex items-center justify-center py-16 text-center">
            <div>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 max-w-md">
                  {error}
                </div>
              )}
              {!error && yelpData.length === 0 && (
                <div className="space-y-4">
                  <p className="text-lg font-medium text-muted-foreground">No places loaded yet</p>
                  <p className="text-sm text-muted-foreground">Try refreshing or update your location in Edit Preferences</p>
                  <button onClick={() => void fetchYelpData(activeFilter, searchTerm)} disabled={isLoading} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                    {isLoading ? 'Searching...' : 'Refresh'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

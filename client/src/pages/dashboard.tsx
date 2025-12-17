import { useUser } from '@/lib/store';
import { useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Heart, Users, Plus, List, Edit2, ArrowRight, Sparkles, LogOut, Trash2, X, Calendar, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ManageFriendsModal } from '@/components/manage-friends-modal';
import { MapView } from '@/components/map-view';
import { PlaceDetailModal } from '@/components/place-detail-modal';
import { CityHeader } from '@/components/city-header';


import cafeImg from '@assets/images/modern_brunch_cafe_interior.png';
import hikingImg from '@assets/images/scenic_hiking_trail.png';
import burgerImg from '@assets/images/gourmet_burger_meal.png';
import museumImg from '@assets/images/modern_art_museum.png';
import diningImg from '@assets/images/friends_dining_at_night.png';

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
  customTags?: string[]; // Custom tags from backend
}



export default function Dashboard() {
  const { profile, user, sessionId, logout, createNewTrip, loadTrip, toggleFavorite, isFavorite, deleteTrip, getFavorites, toggleVisited, isVisited, getVisited } = useUser();
  const [, setLocation] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [allYelpData, setAllYelpData] = useState<YelpBusiness[]>([]); // Store all fetched data
  const [filteredData, setFilteredData] = useState<YelpBusiness[]>([]); // Display filtered data
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedPlace, setSelectedPlace] = useState<YelpBusiness | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    if (!profile.isOnboarded) {
      setLocation('/onboarding');
    }
  }, [profile.isOnboarded, setLocation]);

  useEffect(() => {
    if (profile.isOnboarded && profile.country && sessionId) {
      // Fetch Yelp data when dashboard loads
      fetchYelpData();
      setError(null);
    }
  }, [profile.isOnboarded, sessionId]);

  // Search function to filter data by search term
  const searchData = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      // If no search term, apply current filter
      filterData(activeFilter);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const searchResults = allYelpData.filter(business => 
      business.name.toLowerCase().includes(query) ||
      business.categories.some(cat => cat.title.toLowerCase().includes(query)) ||
      (business.price && business.price.toLowerCase().includes(query))
    );
    
    setFilteredData(searchResults);
  };

  // Filter existing data based on category
  const filterData = (filterType: string) => {
    setActiveFilter(filterType);
    
    // If there's a search term, apply search first then filter
    let dataToFilter = allYelpData;
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      dataToFilter = allYelpData.filter(business => 
        business.name.toLowerCase().includes(query) ||
        business.categories.some(cat => cat.title.toLowerCase().includes(query)) ||
        (business.price && business.price.toLowerCase().includes(query))
      );
    }
    
    if (filterType === 'All') {
      setFilteredData(dataToFilter);
      return;
    }

    let filtered = dataToFilter;

    // First try to use custom tags from backend (faster and more accurate)
    if (allYelpData.length > 0 && allYelpData[0].customTags) {
      filtered = allYelpData.filter(business => 
        business.customTags?.includes(filterType)
      );
    } else {
      // Fallback to category keyword matching
      const categoryMap: Record<string, string[]> = {
        'Food': ['restaurant', 'food', 'cafe', 'coffee', 'dining', 'bakery', 'dessert', 'brunch', 'breakfast', 'lunch', 'dinner'],
        'Activities': ['activity', 'tour', 'entertainment', 'recreation', 'sport', 'adventure', 'attraction', 'amusement'],
        'Nightlife': ['nightlife', 'bar', 'club', 'lounge', 'pub', 'cocktail', 'wine', 'beer'],
        'Culture': ['museum', 'gallery', 'art', 'theater', 'theatre', 'historic', 'landmark', 'monument'],
        'Nature': ['park', 'garden', 'hiking', 'beach', 'outdoor', 'nature', 'scenic', 'viewpoint'],
        'Shopping': ['shopping', 'mall', 'market', 'boutique', 'store', 'shop'],
        'Wellness': ['spa', 'gym', 'yoga', 'fitness', 'wellness', 'massage', 'beauty'],
      };

      // Special filters that use rating/review count instead of categories
      if (filterType === 'Popular') {
        filtered = [...allYelpData]
          .sort((a, b) => (b.review_count || 0) - (a.review_count || 0))
          .slice(0, 20);
        setFilteredData(filtered);
        return;
      }
      
      if (filterType === 'Top Rated') {
        filtered = [...allYelpData]
          .filter(b => b.rating >= 4.5)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setFilteredData(filtered.length > 0 ? filtered : allYelpData);
        return;
      }

      if (filterType === 'Together') {
        // Group-friendly activities: tours, entertainment, restaurants, activities
        const groupKeywords = ['tour', 'entertainment', 'restaurant', 'activity', 'attraction', 'amusement', 'escape', 'bowling', 'karaoke', 'game'];
        filtered = allYelpData.filter(business => 
          business.categories.some(cat => 
            groupKeywords.some(keyword => 
              cat.title.toLowerCase().includes(keyword)
            )
          )
        );
        setFilteredData(filtered.length > 0 ? filtered : allYelpData);
        return;
      }

      const keywords = categoryMap[filterType] || [filterType.toLowerCase()];
      
      filtered = allYelpData.filter(business => 
        business.categories.some(cat => 
          keywords.some(keyword => 
            cat.title.toLowerCase().includes(keyword)
          )
        )
      );
    }

    // If no results, show all data (or search results if searching)
    if (searchTerm.trim()) {
      setFilteredData(filtered.length > 0 ? filtered : dataToFilter);
    } else {
      setFilteredData(filtered.length > 0 ? filtered : allYelpData);
    }
  };

  // Fetch fresh data from Yelp API
  const fetchYelpData = async () => {
    // Validate location before searching
    if (!profile.country || !profile.country.trim()) {
      setError('Location is required. Please update your profile to add a location.');
      setAllYelpData([]);
      setFilteredData([]);
      return;
    }

    const trimmedLocation = profile.country.trim();
    if (trimmedLocation.length < 2) {
      setError('Location is too short. Use format: "City, Country" (e.g., "Tokyo, Japan")');
      setAllYelpData([]);
      setFilteredData([]);
      return;
    }

    // Extract just the city and country/state from the location
    const locationParts = trimmedLocation.split(',').map(p => p.trim());
    let simplifiedLocation = trimmedLocation;
    
    if (locationParts.length > 2) {
      simplifiedLocation = `${locationParts[0]}, ${locationParts[locationParts.length - 1]}`;
    } else if (locationParts.length === 2) {
      simplifiedLocation = trimmedLocation;
    } else {
      setError('Location must include city and country/state (e.g., "Paris, France" or "New York, NY"). Please update your location in Edit Preferences.');
      setAllYelpData([]);
      setFilteredData([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Build comprehensive search params with full user profile
      const searchParams = new URLSearchParams({
        location: simplifiedLocation,
        term: 'attractions restaurants activities',
        interests: profile.interests.join(','),
        limit: '50', // Get maximum results
        travelingWithKids: String(profile.travelingWithKids || false),
        kidsAges: (profile.kidsAges || []).join(','),
        groupSize: String((profile.companions?.length || 0) + 1),
        companionAges: profile.companions?.map(c => c.age).filter(Boolean).join(',') || '',
        userAge: String(profile.age || 30),
      });
      
      const response = await fetch(`/api/yelp/search?${searchParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const businesses = data.businesses || [];
        
        setAllYelpData(businesses);
        setFilteredData(businesses);
        setActiveFilter('All');

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
        setAllYelpData([]);
        setFilteredData([]);
      }
    } catch (err) {
      console.error('Failed to fetch Yelp data:', err);
      setError('Connection error. Please try again.');
      setAllYelpData([]);
      setFilteredData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Append new data when companion is added (without replacing existing)
  const appendYelpData = async (companionInterests: string[]) => {
    if (!profile.country || companionInterests.length === 0) return;

    const trimmedLocation = profile.country.trim();
    const locationParts = trimmedLocation.split(',').map(p => p.trim());
    let simplifiedLocation = trimmedLocation;
    
    if (locationParts.length > 2) {
      simplifiedLocation = `${locationParts[0]}, ${locationParts[locationParts.length - 1]}`;
    }

    try {
      const searchParams = new URLSearchParams({
        location: simplifiedLocation,
        term: companionInterests.slice(0, 2).join(' '),
        interests: companionInterests.join(','),
        limit: '20',
      });
      
      const response = await fetch(`/api/yelp/search?${searchParams.toString()}`);
      if (response.ok) {
        const data = await response.json();
        const newBusinesses = data.businesses || [];
        
        // Append only new businesses (avoid duplicates)
        const existingIds = new Set(allYelpData.map(b => b.id));
        const uniqueNewBusinesses = newBusinesses.filter((b: YelpBusiness) => !existingIds.has(b.id));
        
        if (uniqueNewBusinesses.length > 0) {
          const combined = [...allYelpData, ...uniqueNewBusinesses];
          setAllYelpData(combined);
          setFilteredData(combined);
        }
      }
    } catch (err) {
      console.error('Failed to append Yelp data:', err);
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

  const displayPlaces = filteredData.slice(0, 6).map((business, idx) => ({
    id: business.id,
    name: business.name,
    type: business.categories[0]?.title || 'Place',
    rating: business.rating,
    reviews: business.review_count,
    image: business.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&h=600&fit=crop',
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
                  
                  {/* Current Trip */}
                  {profile.currentTripId && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-sm font-medium text-muted-foreground px-2">Current Trip</h4>
                      {profile.trips.filter(trip => trip.id === profile.currentTripId).map(trip => (
                        <div 
                          key={trip.id} 
                          className="p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between"
                        >
                          <div className="flex-1">
                            <div className="font-medium text-primary">{trip.name}</div>
                            <div className="text-xs text-muted-foreground">{trip.country}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-primary font-medium">Active</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Past Trips */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium text-muted-foreground px-2">Past Trips</h4>
                    {profile.trips.filter(trip => trip.id !== profile.currentTripId).map(trip => (
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
                    {profile.trips.filter(trip => trip.id !== profile.currentTripId).length === 0 && (
                      <div className="text-sm text-muted-foreground px-2 italic">No past trips yet</div>
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
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  searchData(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    searchData(searchTerm);
                  }
                  if (e.key === 'Escape') {
                    setSearchTerm('');
                    searchData('');
                  }
                }}
                disabled={isLoading}
                className="pl-9 pr-9 bg-secondary/50 border-none focus-visible:ring-1 focus-visible:ring-primary/20 rounded-full disabled:opacity-50" 
              />
              {searchTerm && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    searchData('');
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-primary border border-primary/30 px-3 py-1 rounded-full">
              <span>Level {Math.min(profile.trips.length + 1, 4)}</span>
              <span className="text-primary/40">•</span>
              <span>
                {profile.trips.length === 0 ? 'First Timer' :
                 profile.trips.length === 10 ? 'Explorer' :
                 profile.trips.length <= 20 ? 'Adventurer' :
                 'Globe Trotter'}
              </span>
            </div>
            <Avatar 
              className="h-9 w-9 border-2 border-white shadow-sm cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all"
              onClick={() => setLocation('/profile')}
            >
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

        {(allYelpData.length > 0 || isLoading) && (
          <div className="mb-8">
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-4 min-w-max">
                {(['All', 'Popular', 'Top Rated', 'Together', 'Food', 'Activities', 'Nightlife', 'Culture', 'Nature'] as const).map((filter) => {
                  const isActive = activeFilter === filter;
                  const filterIcons: Record<string, string> = {
                    'All': '🌍',
                    'Popular': '🔥',
                    'Top Rated': '⭐',
                    'Together': '👥',
                    'Food': '🍽️',
                    'Activities': '🎯',
                    'Nightlife': '🌙',
                    'Culture': '🏛️',
                    'Nature': '🌿',
                  };
                  return (
                    <button
                      key={filter}
                      onClick={() => filterData(filter)}
                      disabled={isLoading}
                      className={`
                        px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap flex items-center gap-1.5
                        ${isActive
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-white border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground shadow-sm'}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      <span>{filterIcons[filter]}</span>
                      {filter}
                    </button>
                  );
                })}
                {profile.interests
                  .filter(interest => !['All', 'Popular', 'Top Rated', 'Together', 'Food', 'Activities', 'Nightlife', 'Culture', 'Nature'].includes(interest))
                  .slice(0, 2)
                  .map((interest) => (
                    <button
                      key={interest}
                      onClick={() => filterData(interest)}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                        activeFilter === interest
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-white border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground shadow-sm'
                      } disabled:opacity-50`}
                    >
                      {interest}
                    </button>
                  ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        )}

        {!error && filteredData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <PlaceDetailModal
              open={detailModalOpen}
              onOpenChange={setDetailModalOpen}
              place={selectedPlace || {
                id: '',
                name: '',
                rating: 0,
                review_count: 0,
                image_url: '',
                categories: [],
                distance: 0,
              }}
            />
            
            <div className="lg:col-span-8 space-y-8">
              <CityHeader 
                city={profile.country} 
                country={profile.country}
                interests={profile.interests}
              />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">We think you'll love these</h3>
                <button onClick={() => void fetchYelpData()} disabled={isLoading} className="text-sm font-medium text-primary hover:underline disabled:opacity-50">
                  {isLoading ? 'Searching...' : 'Refresh'}
                </button>
              </div>
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden border-none shadow-md h-full flex flex-col">
                      <Skeleton className="aspect-4/3 w-full" />
                      <CardContent className="p-4 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                          </div>
                          <Skeleton className="h-4 w-12" />
                        </div>
                        
                        <Skeleton className="h-12 w-full my-3 rounded-md" />
                        
                        <div className="flex flex-wrap gap-2 mt-auto pt-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-6 w-14" />
                        </div>
                        
                        <Skeleton className="h-9 w-full mt-3 rounded-md" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayPlaces.map((place, i) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i + 0.2 }}
                  >
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 group h-full flex flex-col">
                      <div 
                        className="relative aspect-4/3 overflow-hidden cursor-pointer"
                        onClick={() => {
                          const yelpBusiness = allYelpData.find(b => b.id === place.id);
                          if (yelpBusiness) {
                            setSelectedPlace(yelpBusiness);
                            setDetailModalOpen(true);
                          }
                        }}
                      >
                        <img 
                          src={place.image} 
                          alt={place.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute top-3 right-3 flex gap-2">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisited(place.id);
                            }}
                            className={`p-2 backdrop-blur rounded-full transition-colors ${
                              isVisited(place.id)
                                ? 'bg-green-500/90 text-white'
                                : 'bg-white/90 text-muted-foreground hover:text-green-500'
                            }`}
                            title={isVisited(place.id) ? 'Visited' : 'Mark as visited'}
                          >
                            <Check className={`w-4 h-4 ${isVisited(place.id) ? 'fill-current' : ''}`} />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(place.id);
                            }}
                            className={`p-2 backdrop-blur rounded-full transition-colors ${
                              isFavorite(place.id)
                                ? 'bg-red-500/90 text-white'
                                : 'bg-white/90 text-muted-foreground hover:text-red-500'
                            }`}
                            title={isFavorite(place.id) ? 'Favorited' : 'Add to favorites'}
                          >
                            <Heart className={`w-4 h-4 ${isFavorite(place.id) ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current text-yellow-400" />
                          {place.rating}
                        </div>
                        {isVisited(place.id) && (
                          <div className="absolute top-3 left-3 bg-green-500/90 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Visited
                          </div>
                        )}
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
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-8">
            {/* Favorites Sidebar */}
            <Card className="p-5 border-none shadow-md">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                Favorites
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getFavorites().length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No favorites yet. Heart a place to add it here!</p>
                ) : (
                  getFavorites().map((fav) => {
                    const yelpBusiness = allYelpData.find(b => b.id === fav.yelpBusinessId);
                    if (!yelpBusiness) return null;
                    
                    return (
                      <div
                        key={fav.yelpBusinessId}
                        className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedPlace(yelpBusiness);
                          setDetailModalOpen(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {yelpBusiness.image_url && (
                            <img
                              src={yelpBusiness.image_url}
                              alt={yelpBusiness.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors truncate">
                              {yelpBusiness.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{yelpBusiness.rating}</span>
                              <span className="text-xs text-muted-foreground">({yelpBusiness.review_count})</span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {(yelpBusiness.distance / 1609).toFixed(1)} mi away
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(yelpBusiness.id);
                            }}
                            className="p-1 hover:bg-red-500/10 hover:text-red-500 rounded transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Card>

            {getVisited().length > 0 && (
              <Card className="p-5 border-none shadow-md">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500 fill-green-500" />
                  Visited Places
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getVisited().map((visited) => {
                    const yelpBusiness = allYelpData.find(b => b.id === visited.yelpBusinessId);
                    if (!yelpBusiness) return null;
                    
                    return (
                      <div
                        key={visited.yelpBusinessId}
                        className="p-3 rounded-lg border border-border/50 hover:border-green-500/30 hover:bg-green-500/5 transition-all cursor-pointer group"
                        onClick={() => {
                          setSelectedPlace(yelpBusiness);
                          setDetailModalOpen(true);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {yelpBusiness.image_url && (
                            <img
                              src={yelpBusiness.image_url}
                              alt={yelpBusiness.name}
                              className="w-12 h-12 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm leading-tight group-hover:text-green-600 transition-colors truncate">
                              {yelpBusiness.name}
                            </h4>
                            <div className="flex items-center gap-1 mt-1">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-medium">{yelpBusiness.rating}</span>
                              <span className="text-xs text-muted-foreground">({yelpBusiness.review_count})</span>
                            </div>
                            {visited.visitedDate && (
                              <p className="text-xs text-green-600 mt-1">
                                ✓ {new Date(visited.visitedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleVisited(yelpBusiness.id);
                            }}
                            className="p-1 hover:bg-green-500/10 hover:text-green-500 rounded transition-colors shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card className="p-4 border-none shadow-lg">
              <h3 className="font-bold mb-1">Your Map</h3>
              <p className="text-sm text-muted-foreground mb-4">View all {allYelpData.length} recommended spots on the map.</p>
              <MapView places={allYelpData.map(b => ({
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
              }))} location={profile.country} />
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
                <ManageFriendsModal onCompanionAdded={() => fetchYelpData()} />
              </div>
            </Card>

            <Card className="p-5 border-none shadow-md">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Trip Planner
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Plan your daily activities and let Yelp help you discover the best spots.
              </p>
              <Button 
                onClick={() => setLocation('/trip-planner')} 
                className="w-full gap-2"
                variant="outline"
              >
                <Calendar className="w-4 h-4" />
                Open Planner
              </Button>
            </Card>
          </div>
        </div>
        )}

        {/* Loading Skeleton */}
        {isLoading && allYelpData.length === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              {/* Hero skeleton */}
              <Skeleton className="w-full aspect-21/9 rounded-2xl" />
              
              {/* Cards skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="w-full aspect-4/3" />
                    <div className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-16" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="lg:col-span-4 space-y-6">
              <Skeleton className="h-64 rounded-lg" />
              <Skeleton className="h-48 rounded-lg" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-16 text-center">
            <div className="max-w-md">
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
              <Button onClick={() => void fetchYelpData()}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Empty State (no loading, no error, no data) */}
        {!isLoading && !error && allYelpData.length === 0 && (
          <div className="flex items-center justify-center py-16 text-center">
            <div className="max-w-md space-y-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-10 h-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No places loaded yet</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Why don't you add some? Update your location and interests to discover amazing places.
                </p>
              </div>
              <Button onClick={() => setLocation('/edit-preferences')} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Update Preferences
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useUser } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar as CalendarIcon, Clock, MapPin, Plus, Check, X, Sparkles, Loader, Navigation, Star, List, LayoutGrid } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Activity {
  id: string;
  time: string;
  title: string;
  location: string;
  address?: string;
  yelpBusinessId?: string;
  rating?: number;
  price?: string;
  image_url?: string;
  categories?: string[];
  completed: boolean;
  travelTimeFromPrevious?: number;
  slotType?: string;
}

interface DayPlan {
  date: string;
  activities: Activity[];
}

export default function TripPlanner() {
  const [, setLocation] = useLocation();
  const { profile, sessionId } = useUser();
  const [days, setDays] = useState<DayPlan[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [numDays, setNumDays] = useState(3);
  const [cachedBusinesses, setCachedBusinesses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (!profile.isOnboarded) {
      setLocation('/dashboard');
    }
  }, [profile.isOnboarded, setLocation]);

  // Fetch Yelp data on mount (same as dashboard)
  useEffect(() => {
    const fetchYelpData = async () => {
      if (!profile.country || !sessionId) return;
      
      try {
        const response = await fetch(
          `/api/yelp/search?location=${encodeURIComponent(profile.country)}&term=restaurants&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setCachedBusinesses(data.businesses || []);
        }
      } catch (err) {
        console.error('Failed to fetch Yelp data:', err);
      }
    };

    fetchYelpData();
  }, [profile.country, sessionId]);

  const generateItinerary = async () => {
    if (!sessionId) return;

    if (cachedBusinesses.length === 0) {
      setError('No places available. Please go back to the dashboard and search for places first.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/itinerary/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-id': sessionId,
        },
        body: JSON.stringify({
          tripId: profile.currentTripId,
          numDays,
          location: profile.country,
          interests: profile.interests,
          businesses: cachedBusinesses, // Pass cached Yelp data
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDays(data.itinerary);
      } else {
        const errData = await response.json();
        setError(errData.error || 'Failed to generate itinerary');
      }
    } catch (err) {
      console.error('Error generating itinerary:', err);
      setError('Connection error. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleActivity = (dayIndex: number, activityId: string) => {
    setDays(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: day.activities.map(act => 
            act.id === activityId ? { ...act, completed: !act.completed } : act
          ),
        };
      }
      return day;
    }));
  };

  const removeActivity = (dayIndex: number, activityId: string) => {
    setDays(prev => prev.map((day, idx) => {
      if (idx === dayIndex) {
        return {
          ...day,
          activities: day.activities.filter(act => act.id !== activityId),
        };
      }
      return day;
    }));
  };

  const addDay = () => {
    setDays(prev => [...prev, {
      date: `Day ${prev.length + 1}`,
      activities: [],
    }]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold">{profile.currentTripName || 'Trip Planner'}</h1>
              <p className="text-xs text-muted-foreground">{profile.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {days.length > 0 && (
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'calendar' | 'list')}>
                <TabsList>
                  <TabsTrigger value="calendar" className="gap-2">
                    <LayoutGrid className="w-4 h-4" />
                    Calendar
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2">
                    <List className="w-4 h-4" />
                    List
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            )}
            
            <Button onClick={generateItinerary} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {days.length > 0 ? 'Regenerate' : 'Generate Itinerary'}
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* AI Generation Section */}
        {days.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="max-w-2xl mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-4">Smart Trip Planning</h2>
              <p className="text-muted-foreground mb-8">
                Create a personalized day-by-day itinerary based on Yelp's top-rated places,
                interests, and travel companions. We'll optimize routes, consider opening hours,
                and plan perfect meal times.
              </p>

              <div className="flex items-center justify-center gap-4 mb-8">
                <label className="text-sm font-medium">Number of days:</label>
                <Input
                  type="number"
                  min="1"
                  max="14"
                  value={numDays}
                  onChange={(e) => setNumDays(parseInt(e.target.value) || 3)}
                  className="w-20 text-center"
                />
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={generateItinerary}
                disabled={isGenerating || cachedBusinesses.length === 0}
                className="gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Building Your Itinerary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate {numDays}-Day Itinerary
                  </>
                )}
              </Button>

              {cachedBusinesses.length > 0 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Using {cachedBusinesses.length} places from Yelp in {profile.country}
                </p>
              )}

              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <Card className="p-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Navigation className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Optimized Routes</h3>
                  <p className="text-sm text-muted-foreground">
                    Minimize travel time with smart location sequencing
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Perfect Timing</h3>
                  <p className="text-sm text-muted-foreground">
                    Considers opening hours and ideal visit times
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Personalized</h3>
                  <p className="text-sm text-muted-foreground">
                    Based on your interests and travel style
                  </p>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {/* Itinerary Days */}
        {days.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Your Itinerary</h2>
                <p className="text-sm text-muted-foreground">
                  {days.reduce((acc, day) => acc + day.activities.filter(a => a.completed).length, 0)} of{' '}
                  {days.reduce((acc, day) => acc + day.activities.length, 0)} activities completed
                </p>
              </div>
              <Button variant="outline" onClick={generateItinerary} disabled={isGenerating} className="gap-2">
                <Sparkles className="w-4 h-4" />
                Regenerate
              </Button>
            </div>

            {/* Calendar View */}
            {viewMode === 'calendar' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {days.map((day, dayIndex) => (
                  <motion.div
                    key={dayIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: dayIndex * 0.05 }}
                  >
                    <Card className="h-full flex flex-col">
                      <div className="p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                              {dayIndex + 1}
                            </div>
                            <div>
                              <h3 className="font-bold">{day.date}</h3>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {day.activities.length} activities
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-96">
                        {day.activities.map((activity) => (
                          <div
                            key={activity.id}
                            className={`p-3 rounded-lg border text-sm transition-all ${
                              activity.completed
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-border hover:border-primary/30'
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <button
                                onClick={() => toggleActivity(dayIndex, activity.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                  activity.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {activity.completed && <Check className="w-3 h-3 text-white" />}
                              </button>
                              
                              <div className="flex-1 min-w-0">
                                <div className={`font-medium leading-tight ${activity.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {activity.title}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                  <Clock className="w-3 h-3" />
                                  {activity.time}
                                </div>
                                {activity.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xs font-medium">{activity.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && days.map((day, dayIndex) => (
              <motion.div
                key={dayIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <CalendarIcon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">{day.date}</h3>
                        <Badge variant="secondary" className="mt-1">
                          {day.activities.filter(a => a.completed).length}/{day.activities.length} completed
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add Activity
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {day.activities.map((activity, actIndex) => (
                      <div key={activity.id}>
                        {actIndex > 0 && activity.travelTimeFromPrevious && (
                          <div className="flex items-center gap-2 py-2 pl-8 text-xs text-muted-foreground">
                            <Navigation className="w-3 h-3" />
                            <span>{activity.travelTimeFromPrevious} min travel time</span>
                          </div>
                        )}
                        
                        <div
                          className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
                            activity.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-white border-border hover:border-primary/30 hover:shadow-sm'
                          }`}
                        >
                          <button
                            onClick={() => toggleActivity(dayIndex, activity.id)}
                            className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors shrink-0 ${
                              activity.completed
                                ? 'bg-green-500 border-green-500'
                                : 'border-gray-300 hover:border-primary'
                            }`}
                          >
                            {activity.completed && <Check className="w-4 h-4 text-white" />}
                          </button>

                          {activity.image_url && (
                            <img 
                              src={activity.image_url} 
                              alt={activity.title}
                              className="w-20 h-20 rounded-lg object-cover shrink-0"
                            />
                          )}

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className={activity.completed ? 'line-through text-muted-foreground' : ''}>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-lg">{activity.title}</span>
                                  {activity.slotType && (
                                    <Badge variant="secondary" className="text-xs">{activity.slotType}</Badge>
                                  )}
                                </div>
                                
                                {activity.rating && (
                                  <div className="flex items-center gap-2 mt-1">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{activity.rating}</span>
                                    {activity.price && (
                                      <span className="text-sm text-muted-foreground">{activity.price}</span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    {activity.time}
                                  </span>
                                  <span className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4" />
                                    {activity.location}
                                  </span>
                                </div>
                                {activity.address && (
                                  <p className="text-xs text-muted-foreground mt-1">{activity.address}</p>
                                )}
                                {activity.categories && activity.categories.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {activity.categories.slice(0, 3).map((cat, i) => (
                                      <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded">{cat}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => removeActivity(dayIndex, activity.id)}
                                className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded transition-colors shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {day.activities.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-sm">No activities planned for this day</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}

            <Button variant="outline" onClick={addDay} className="w-full gap-2">
              <Plus className="w-4 h-4" />
              Add Another Day
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

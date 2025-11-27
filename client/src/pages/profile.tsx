import { useUser } from '@/lib/store';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Heart, Check, Calendar, Users, Sparkles, Trophy, TrendingUp, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function Profile() {
  const { profile, user } = useUser();
  const [, setLocation] = useLocation();

  // Calculate statistics
  const totalTrips = profile.trips.length;
  const totalFavorites = profile.trips.reduce((acc, trip) => {
    return acc + (trip.savedPlaces?.filter(p => p.isFavorite)?.length || 0);
  }, 0);
  const totalVisited = profile.trips.reduce((acc, trip) => {
    return acc + (trip.savedPlaces?.filter(p => p.isVisited)?.length || 0);
  }, 0);
  const totalSavedPlaces = profile.trips.reduce((acc, trip) => {
    return acc + (trip.savedPlaces?.length || 0);
  }, 0);

  // Get all unique interests across all trips
  const allInterests = Array.from(new Set(profile.trips.flatMap(t => t.interests)));

  // Get all companions across all trips
  const allCompanions = profile.trips.flatMap(t => t.companions);
  const uniqueCompanions = Array.from(new Map(allCompanions.map(c => [c.name, c])).values());

  // Get recent visited places
  const recentVisited = profile.trips
    .flatMap(trip => 
      (trip.savedPlaces || [])
        .filter(p => p.isVisited && p.visitedDate)
        .map(p => ({ ...p, tripName: trip.name, tripLocation: trip.country }))
    )
    .sort((a, b) => new Date(b.visitedDate!).getTime() - new Date(a.visitedDate!).getTime())
    .slice(0, 5);

  // Calculate fun facts
  const mostVisitedCity = profile.trips.reduce((acc, trip) => {
    const count = trip.savedPlaces?.filter(p => p.isVisited)?.length || 0;
    if (count > acc.count) {
      return { city: trip.country, count };
    }
    return acc;
  }, { city: '', count: 0 });

  const topInterest = allInterests.length > 0 ? allInterests[0] : 'Exploring';
  
  // Calculate completion rate
  const completionRate = totalSavedPlaces > 0 
    ? Math.round((totalVisited / totalSavedPlaces) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setLocation('/dashboard')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">Profile</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="border-none shadow-lg">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`} />
                  <AvatarFallback className="text-3xl">{user?.username?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-bold mb-2">{profile.name || user?.username}</h2>
                  <p className="text-muted-foreground mb-4">{user?.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    {allInterests.slice(0, 5).map(interest => (
                      <Badge key={interest} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Statistics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <Card className="border-none shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalTrips}</div>
              <div className="text-sm text-muted-foreground">Trips</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-red-600" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalFavorites}</div>
              <div className="text-sm text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalVisited}</div>
              <div className="text-sm text-muted-foreground">Visited</div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold mb-1">{totalSavedPlaces}</div>
              <div className="text-sm text-muted-foreground">Saved</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total destinations</span>
                </div>
                <span className="text-sm font-bold">{totalTrips}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Places saved</span>
                </div>
                <span className="text-sm font-bold">{totalSavedPlaces}</span>
              </div>

              {mostVisitedCity.count > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Most visited</span>
                  </div>
                  <span className="text-sm font-bold">{mostVisitedCity.city}</span>
                </div>
              )}

              {totalSavedPlaces > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Completion rate</span>
                  </div>
                  <span className="text-sm font-bold">{completionRate}%</span>
                </div>
              )}

              {uniqueCompanions.length > 0 && (
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Travel companions</span>
                  </div>
                  <span className="text-sm font-bold">{uniqueCompanions.length}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        {recentVisited.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-primary" />
                  Recently Visited
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentVisited.map((place, idx) => (
                  <div
                    key={`${place.id}-${idx}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm leading-tight">
                        {place.businessName || 'Unnamed Place'}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {place.tripLocation}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(place.visitedDate!).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Travel Companions */}
        {uniqueCompanions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Companions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {uniqueCompanions.map((companion, idx) => (
                    <div
                      key={`${companion.name}-${idx}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <Avatar className="h-9 w-9 bg-primary/10">
                        <AvatarFallback className="text-primary text-sm">
                          {companion.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{companion.name}</p>
                        {companion.interests.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">
                            {companion.interests.slice(0, 2).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
}

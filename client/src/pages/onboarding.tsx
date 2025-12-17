import { useState } from 'react';
import { useUser } from '@/lib/store';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { ArrowRight, Plus, X, MapPin, Heart, Users, Briefcase, Sparkles, AlertCircle, Baby } from 'lucide-react';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { cn } from '@/lib/utils';

const AVAILABLE_INTERESTS = [
  'Fine Dining', 'Street Food', 'Hiking', 'Museums', 
  'Nightlife', 'Coffee', 'Shopping', 
  'Live Music', 'History', 'Architecture', 'Nature',
  'Family Friendly', 'For Kids', 'Parks & Playgrounds'
];

export default function Onboarding() {
  const { profile, updateProfile, toggleInterest, addCompanion, removeCompanion, completeOnboarding, sessionId, logout } = useUser();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Companion Form State
  const [newCompanionName, setNewCompanionName] = useState('');
  const [newCompanionInterests, setNewCompanionInterests] = useState<string[]>([]);
  const [newCompanionAge, setNewCompanionAge] = useState<number | undefined>();

  const handleLocationChange = (location: string) => {
    updateProfile({ country: location });
    setLocationError('');
  };

  const handleSaveCompanion = () => {
    if (newCompanionName.trim()) {
      addCompanion({
        name: newCompanionName.trim(),
        interests: newCompanionInterests,
        age: newCompanionAge,
      });
      setNewCompanionName('');
      setNewCompanionInterests([]);
      setNewCompanionAge(undefined);
    }
  };

  const toggleCompanionInterest = (interest: string) => {
    if (newCompanionInterests.includes(interest)) {
      setNewCompanionInterests(prev => prev.filter(i => i !== interest));
    } else {
      setNewCompanionInterests(prev => [...prev, interest]);
    }
  };

  const handleNext = async () => {
    if (step === 1) {
      // Validate location
      if (!profile.country || profile.country.trim().length < 3) {
        setLocationError('Please select a valid location');
        return;
      }
      setStep(step + 1);
    } else if (step < 4) {
      setStep(step + 1);
    } else {
      // Final step submitted
      setIsProcessing(true);
      try {
        console.log('Session ID in onboarding:', sessionId);
        if (!sessionId) {
          console.error('No session ID available');
          setIsProcessing(false);
          return;
        }

        // Save trip to backend
        console.log('Saving trip with data:', {
          name: profile.currentTripName,
          location: profile.country,
          interests: profile.interests,
          companions: profile.companions,
        });

        const response = await fetch('/api/trips', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-session-id': sessionId,
          },
          body: JSON.stringify({
            name: profile.currentTripName,
            location: profile.country,
            interests: profile.interests,
            companions: profile.companions,
          }),
        });

        console.log('Trip save response status:', response.status);

        if (response.ok) {
          const savedTrip = await response.json();
          console.log('Trip saved successfully:', savedTrip);
          await completeOnboarding();
          setLocation('/dashboard');
        } else if (response.status === 401) {
          console.error('Session expired, logging out');
          logout();
          setLocation('/auth');
          setIsProcessing(false);
        } else {
          const errorData = await response.json();
          console.error('Failed to save trip:', errorData);
          alert(`Failed to save trip: ${errorData.error || 'Unknown error'}`);
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error saving trip:', error);
        setIsProcessing(false);
      }
    }
  };

  const variants = {
    enter: { opacity: 0, x: 20, filter: 'blur(10px)' },
    center: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -20, filter: 'blur(10px)' }
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 flex flex-col items-center text-center max-w-md"
        >
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
            <div className="absolute inset-2 bg-primary/30 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-primary animate-spin" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Creating your trip...</h2>
          <p className="text-muted-foreground animate-pulse">
            Setting up {profile.currentTripName} in {profile.country}...
          </p>
          
          <div className="mt-8 flex gap-2 flex-wrap justify-center opacity-50">
            {profile.interests.slice(0, 5).map(i => (
              <span key={i} className="text-xs border rounded-full px-2 py-1">{i}</span>
            ))}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 overflow-hidden relative">
      {/* Abstract Background Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <div className="w-full max-w-xl relative z-10">
        <div className="mb-8 flex justify-center space-x-2">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={cn(
                "h-1.5 rounded-full transition-all duration-500 ease-out",
                s === step ? "w-8 bg-primary" : s < step ? "w-8 bg-primary/30" : "w-2 bg-muted"
              )} 
            />
          ))}
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={step}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            <Card className="p-8 shadow-xl border-none bg-white/80 backdrop-blur-xl">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Let's get started</h1>
                    <p className="text-muted-foreground">Tell us about yourself and where you're headed.</p>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-base">What's your name?</Label>
                      <Input 
                        id="name" 
                        placeholder="Jane Doe" 
                        value={profile.name}
                        onChange={(e) => updateProfile({ name: e.target.value })}
                        className="h-12 text-lg bg-background/50 border-border/50 focus:border-primary/50"
                        data-testid="input-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-base">Your age</Label>
                      <Input 
                        id="age" 
                        type="number"
                        placeholder="25" 
                        value={profile.age || ''}
                        onChange={(e) => updateProfile({ age: e.target.value ? parseInt(e.target.value) : undefined })}
                        className="h-12 text-lg bg-background/50 border-border/50 focus:border-primary/50"
                        min="0"
                        max="120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-base">Where are you exploring?</Label>
                      <LocationAutocomplete
                        value={profile.country}
                        onChange={handleLocationChange}
                        placeholder="Search for a city or country..."
                        className="h-12 text-lg bg-background/50 border-border/50 focus:border-primary/50"
                      />
                      {locationError && (
                        <div className="flex items-center gap-2 text-sm text-red-600 mt-2">
                          <AlertCircle className="w-4 h-4" />
                          {locationError}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">What do you love?</h1>
                    <p className="text-muted-foreground">Pick a few things so we can tailor your recommendations.</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                    {AVAILABLE_INTERESTS.map((interest) => {
                      const isSelected = profile.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={cn(
                            "px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center justify-center gap-2",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                              : "bg-background hover:bg-muted border-border hover:border-primary/30 text-muted-foreground hover:text-foreground"
                          )}
                          data-testid={`btn-interest-${interest}`}
                        >
                          {interest}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                      <Users className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Who's coming with?</h1>
                    <p className="text-muted-foreground">Add travel buddies and let us know if you're traveling with kids.</p>
                  </div>

                  <div className="space-y-6">
                    {/* Traveling with Kids Section */}
                    <div className="bg-linear-to-br from-amber-50 to-amber-50/50 border border-amber-200/50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Baby className="w-5 h-5 text-amber-600" />
                        <Label className="text-base font-semibold text-amber-900">Traveling with kids?</Label>
                      </div>
                      
                      <button
                        onClick={() => updateProfile({ travelingWithKids: !profile.travelingWithKids })}
                        className={`w-full h-11 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                          profile.travelingWithKids
                            ? 'bg-amber-600 text-white border-amber-600 shadow-lg shadow-amber-600/25'
                            : 'bg-white border-border/50 text-muted-foreground hover:border-amber-300 hover:text-foreground'
                        }`}
                      >
                        {profile.travelingWithKids ? '👨‍👩‍👧‍👦 Yes, with kids' : '🧑 No, just adults'}
                      </button>

                      {profile.travelingWithKids && (
                        <div className="space-y-2 pt-2 border-t border-amber-200/50">
                          <Label className="text-sm font-semibold">Kids' ages</Label>
                          <div className="flex flex-wrap gap-2">
                            {[3, 5, 8, 12, 16].map(age => (
                              <button
                                key={age}
                                onClick={() => {
                                  const current = profile.kidsAges || [];
                                  updateProfile({
                                    kidsAges: current.includes(age)
                                      ? current.filter(a => a !== age)
                                      : [...current, age]
                                  });
                                }}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border-2 ${
                                  (profile.kidsAges || []).includes(age)
                                    ? 'bg-amber-600 text-white border-amber-600'
                                    : 'bg-white border-border/50 text-muted-foreground hover:border-amber-300'
                                }`}
                              >
                                {age} yrs
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Add Travel Buddy Section */}
                    <div className="bg-linear-to-br from-blue-50 to-blue-50/50 border border-blue-200/50 rounded-2xl p-5 space-y-4">
                      <Label className="text-base font-semibold">Add Travel Buddies</Label>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="buddy-name" className="text-sm font-semibold">Name</Label>
                          <Input
                            id="buddy-name"
                            placeholder="e.g. Alex"
                            value={newCompanionName}
                            onChange={(e) => setNewCompanionName(e.target.value)}
                            className="h-11 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="buddy-age" className="text-sm font-semibold">Age</Label>
                          <Input
                            id="buddy-age"
                            type="number"
                            placeholder="Age"
                            value={newCompanionAge || ''}
                            onChange={(e) => setNewCompanionAge(e.target.value ? parseInt(e.target.value) : undefined)}
                            className="h-11 bg-white"
                            min="0"
                            max="120"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-sm font-semibold">Their interests (Optional)</Label>
                        <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-2">
                          {AVAILABLE_INTERESTS.map(interest => (
                            <button
                              key={interest}
                              onClick={() => toggleCompanionInterest(interest)}
                              className={cn(
                                "px-3 py-2.5 rounded-lg text-xs font-medium transition-all border-2 flex items-center justify-center text-center",
                                newCompanionInterests.includes(interest)
                                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                  : "bg-white text-muted-foreground border-border/50 hover:border-primary/30 hover:text-foreground"
                              )}
                            >
                              {interest}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Button 
                        onClick={handleSaveCompanion} 
                        disabled={!newCompanionName.trim()} 
                        className="w-full h-11 text-base font-semibold"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add {profile.companions.length > 0 ? 'Another' : 'First'} Buddy
                      </Button>
                    </div>

                    {/* Companions List */}
                    <div className="space-y-2 min-h-[120px]">
                      {profile.companions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 py-8 border-2 border-dashed rounded-xl border-muted/50">
                          <Users className="w-8 h-8 mb-2 opacity-30" />
                          <p className="font-medium">No buddies added yet</p>
                          <span className="text-xs mt-1">(Add them above)</span>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {profile.companions.map((friend, i) => (
                            <motion.div 
                              key={friend.name + i}
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0 }}
                              className="bg-linear-to-r from-blue-50 to-blue-50/50 border border-blue-200/50 p-4 rounded-xl flex items-start justify-between group hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 mt-0.5">
                                  {friend.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm">{friend.name}</p>
                                    {friend.age && <span className="text-xs text-muted-foreground">({friend.age})</span>}
                                  </div>
                                  {friend.interests.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {friend.interests.map(int => (
                                        <span key={int} className="text-[10px] bg-white px-2 py-1 rounded-md border border-blue-200/50 text-muted-foreground">
                                          {int}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {friend.interests.length === 0 && (
                                    <p className="text-xs text-muted-foreground italic mt-1">Up for anything</p>
                                  )}
                                </div>
                              </div>
                              <button 
                                onClick={() => removeCompanion(i)}
                                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-500">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Name your trip</h1>
                    <p className="text-muted-foreground">Give this adventure a memorable name.</p>
                  </div>
                  
                  <div className="space-y-4 mt-8">
                    <div className="space-y-2">
                      <Label htmlFor="tripName" className="text-base">Trip Name</Label>
                      <Input 
                        id="tripName" 
                        placeholder="e.g. Summer in Tokyo 2025" 
                        value={profile.currentTripName}
                        onChange={(e) => updateProfile({ currentTripName: e.target.value })}
                        className="h-14 text-xl bg-background/50 border-border/50 focus:border-primary/50 text-center font-bold placeholder:font-normal"
                        autoFocus
                        data-testid="input-tripname"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-8 mt-4 flex justify-between items-center">
                {step > 1 ? (
                  <Button variant="ghost" onClick={() => setStep(step - 1)} className="text-muted-foreground hover:text-foreground">
                    Back
                  </Button>
                ) : <div />}
                
                <Button 
                  onClick={handleNext} 
                  size="lg" 
                  className="rounded-xl px-8 shadow-lg shadow-primary/20"
                  disabled={
                    (step === 1 && (!profile.name || !profile.country)) ||
                    (step === 4 && !profile.currentTripName)
                  }
                  data-testid="btn-next"
                >
                  {step === 4 ? 'Generate Plan' : 'Continue'}
                  {step < 4 && <ArrowRight className="ml-2 w-4 h-4" />}
                  {step === 4 && <Sparkles className="ml-2 w-4 h-4" />}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Decorative Bottom Box */}
              <div className="fixed -bottom-8 left-0 right-0 h-[5%] pointer-events-none bg-linear-to-t from-red-500 to-red-400 skew-1 " />

    </div>
  );
}

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/store';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ArrowLeft, MapPin, Heart, Users, Plus, X, AlertTriangle } from 'lucide-react';
import { LocationAutocomplete } from '@/components/location-autocomplete';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const AVAILABLE_INTERESTS = [
  'Fine Dining', 'Street Food', 'Hiking', 'Museums', 
  'Nightlife', 'Coffee', 'Shopping', 
  'Live Music', 'History', 'Architecture', 'Nature',
  'Family Friendly', 'For Kids', 'Parks & Playgrounds'
];

export default function EditPreferences() {
  const { profile, updateProfile, addCompanion, removeCompanion, updateCompanion } = useUser();
  const [, setLocation] = useLocation();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [editingCompanionIdx, setEditingCompanionIdx] = useState<number | null>(null);
  const [newCompanionName, setNewCompanionName] = useState('');
  const [newCompanionAge, setNewCompanionAge] = useState<number | undefined>();
  const [newCompanionInterests, setNewCompanionInterests] = useState<string[]>([]);
  const [newCompanionFamilyFriendly, setNewCompanionFamilyFriendly] = useState(false);
  const [newCompanionKidsAge, setNewCompanionKidsAge] = useState<number[]>([]);
  const [showLocationWarning, setShowLocationWarning] = useState(false);
  const [pendingLocation, setPendingLocation] = useState('');

  useEffect(() => {
    setLocalProfile({
      ...profile,
      interests: Array.isArray(profile.interests) ? profile.interests : [],
      companions: Array.isArray(profile.companions) ? profile.companions : [],
      kidsAge: Array.isArray(profile.kidsAge) ? profile.kidsAge : [],
    });
  }, [profile]);

  const handleLocationChange = (location: string) => {
    // Check if location is actually changing
    if (location !== profile.country) {
      setPendingLocation(location);
      setShowLocationWarning(true);
    } else {
      setLocalProfile(prev => ({ ...prev, country: location }));
    }
  };

  const confirmLocationChange = () => {
    setLocalProfile(prev => ({ ...prev, country: pendingLocation }));
    setShowLocationWarning(false);
  };

  const handleToggleInterest = (interest: string) => {
    setLocalProfile(prev => {
      const currentInterests = Array.isArray(prev.interests) ? prev.interests : [];
      return {
        ...prev,
        interests: currentInterests.includes(interest)
          ? currentInterests.filter(i => i !== interest)
          : [...currentInterests, interest],
      };
    });
  };

  const handleSave = () => {
    updateProfile({
      country: localProfile.country,
      interests: localProfile.interests,
      age: localProfile.age,
      familyFriendly: localProfile.familyFriendly,
      kidsAge: localProfile.kidsAge,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleKidsAge = (age: number) => {
    setLocalProfile(prev => ({
      ...prev,
      kidsAge: (prev.kidsAge || []).includes(age)
        ? (prev.kidsAge || []).filter(a => a !== age)
        : [...(prev.kidsAge || []), age],
    }));
  };

  const handleSaveCompanion = () => {
    if (!newCompanionName.trim()) return;
    
    if (editingCompanionIdx !== null) {
      updateCompanion(editingCompanionIdx, {
        name: newCompanionName,
        age: newCompanionAge,
        interests: newCompanionInterests,
        familyFriendly: newCompanionFamilyFriendly,
        kidsAge: newCompanionKidsAge,
      });
      setEditingCompanionIdx(null);
    } else {
      addCompanion({
        name: newCompanionName,
        age: newCompanionAge,
        interests: newCompanionInterests,
        familyFriendly: newCompanionFamilyFriendly,
        kidsAge: newCompanionKidsAge,
      });
    }
    
    setNewCompanionName('');
    setNewCompanionAge(undefined);
    setNewCompanionInterests([]);
    setNewCompanionFamilyFriendly(false);
    setNewCompanionKidsAge([]);
  };

  const handleEditCompanion = (idx: number) => {
    const companion = profile.companions[idx];
    setNewCompanionName(companion.name);
    setNewCompanionAge(companion.age);
    setNewCompanionInterests(companion.interests);
    setNewCompanionFamilyFriendly(companion.familyFriendly || false);
    setNewCompanionKidsAge(companion.kidsAge || []);
    setEditingCompanionIdx(idx);
  };

  const handleCancelEdit = () => {
    setEditingCompanionIdx(null);
    setNewCompanionName('');
    setNewCompanionAge(undefined);
    setNewCompanionInterests([]);
    setNewCompanionFamilyFriendly(false);
    setNewCompanionKidsAge([]);
  };

  const toggleCompanionInterest = (interest: string) => {
    setNewCompanionInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleCompanionKidsAge = (age: number) => {
    setNewCompanionKidsAge(prev =>
      prev.includes(age)
        ? prev.filter(a => a !== age)
        : [...prev, age]
    );
  };

  return (
    <>
      <AlertDialog open={showLocationWarning} onOpenChange={setShowLocationWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Change Trip Location?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Changing your city will fetch new Yelp recommendations and may affect your saved places.
              Your current itinerary and favorites will remain, but new search results will be based on <strong>{pendingLocation}</strong>.
              <br /><br />
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmLocationChange}>
              Yes, Change Location
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold">Edit Preferences</h1>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? '✓ Saved' : 'Save Changes'}
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="space-y-6">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Destination
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Where are you traveling?</label>
                  <LocationAutocomplete
                    value={localProfile.country}
                    onChange={handleLocationChange}
                    placeholder="Enter city and country"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    e.g., "Paris, France" or "New York, NY"
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-2">Your Age</label>
                    <Input
                      type="number"
                      placeholder="Age"
                      value={localProfile.age || ''}
                      onChange={(e) => setLocalProfile(prev => ({
                        ...prev,
                        age: e.target.value ? parseInt(e.target.value) : undefined
                      }))}
                      className="h-10"
                      min="0"
                      max="120"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-2">Family travel</label>
                    <button
                      onClick={() => setLocalProfile(prev => ({
                        ...prev,
                        familyFriendly: !prev.familyFriendly
                      }))}
                      className={`w-full h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
                        localProfile.familyFriendly
                          ? 'bg-primary text-white shadow-lg shadow-primary/25'
                          : 'bg-secondary border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {localProfile.familyFriendly ? '👨‍👩‍👧‍👦 With kids' : '🧑 Solo/Adults'}
                    </button>
                  </div>
                </div>

                {localProfile.familyFriendly && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Kids' Ages</label>
                    <div className="flex flex-wrap gap-2">
                      {[3, 5, 8, 12, 16].map(age => (
                        <Badge
                          key={age}
                          variant={(localProfile.kidsAge || []).includes(age) ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleKidsAge(age)}
                        >
                          {age} yrs
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Interests */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Your Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_INTERESTS.map(interest => (
                    <Badge
                      key={interest}
                      variant={(Array.isArray(localProfile.interests) ? localProfile.interests : []).includes(interest) ? 'default' : 'outline'}
                      className="cursor-pointer px-3 py-1.5"
                      onClick={() => handleToggleInterest(interest)}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Select your interests to get better recommendations
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Travel Companions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Travel Companions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add/Edit Companion Form */}
                <div className="bg-linear-to-br from-blue-50 to-blue-50/50 border border-blue-200/50 rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Name</Label>
                      <Input
                        placeholder="e.g. Alex"
                        value={newCompanionName}
                        onChange={(e) => setNewCompanionName(e.target.value)}
                        className="h-10 bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold">Age</Label>
                      <Input
                        type="number"
                        placeholder="Age"
                        value={newCompanionAge || ''}
                        onChange={(e) => setNewCompanionAge(e.target.value ? parseInt(e.target.value) : undefined)}
                        className="h-10 bg-white"
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-semibold">Traveling with kids?</Label>
                    <button
                      onClick={() => setNewCompanionFamilyFriendly(!newCompanionFamilyFriendly)}
                      className={`w-full h-10 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 border-2 ${
                        newCompanionFamilyFriendly
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white border-border/50 text-muted-foreground hover:border-primary/30'
                      }`}
                    >
                      {newCompanionFamilyFriendly ? '👨‍👩‍👧‍👦 Yes, with kids' : '🧑 No, just adults'}
                    </button>
                  </div>

                  {newCompanionFamilyFriendly && (
                    <div className="space-y-2 pt-2 border-t border-blue-200/50">
                      <Label className="text-sm font-semibold">Kids' ages</Label>
                      <div className="flex flex-wrap gap-2">
                        {[3, 5, 8, 12, 16].map(age => (
                          <button
                            key={age}
                            onClick={() => toggleCompanionKidsAge(age)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                              newCompanionKidsAge.includes(age)
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white border-border/50 text-muted-foreground hover:border-primary/30'
                            }`}
                          >
                            {age} yrs
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-2 border-t border-blue-200/50">
                    <Label className="text-sm font-semibold">What do they like? (Optional)</Label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_INTERESTS.map(interest => (
                        <Badge
                          key={interest}
                          variant={newCompanionInterests.includes(interest) ? 'default' : 'outline'}
                          className="cursor-pointer px-3 py-1.5"
                          onClick={() => toggleCompanionInterest(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSaveCompanion}
                      disabled={!newCompanionName.trim()}
                      className="flex-1"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {editingCompanionIdx !== null ? 'Update Companion' : 'Add Companion'}
                    </Button>
                    {editingCompanionIdx !== null && (
                      <Button
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>

                {/* Companions List */}
                {Array.isArray(profile.companions) && profile.companions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Your Travel Buddies ({profile.companions.length})</h4>
                    <div className="space-y-2">
                      {profile.companions.map((companion, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 border rounded-lg transition-all",
                            editingCompanionIdx === idx
                              ? 'bg-blue-50 border-blue-200/50'
                              : 'hover:bg-secondary/50 border-border'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm">{companion.name}</p>
                                {companion.age && <span className="text-xs text-muted-foreground">({companion.age})</span>}
                              </div>
                              {companion.familyFriendly && companion.kidsAge && companion.kidsAge.length > 0 && (
                                <p className="text-xs text-primary font-medium mt-1">👶 Kids: {companion.kidsAge.join(', ')} yrs</p>
                              )}
                              {companion.interests.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {companion.interests.map(interest => (
                                    <Badge key={interest} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditCompanion(idx)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => removeCompanion(idx)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <div className="flex gap-3">
            <Button
              onClick={handleSave}
              className="flex-1"
              size="lg"
            >
              {saved ? '✓ Changes Saved' : 'Save All Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setLocation('/dashboard')}
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
}

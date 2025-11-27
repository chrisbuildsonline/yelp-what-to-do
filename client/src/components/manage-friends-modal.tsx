import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, X, Edit2, Loader2, AlertTriangle } from 'lucide-react';
import { useUser, Companion } from '@/lib/store';
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
import { useToast } from '@/hooks/use-toast';

const INTERESTS = [
  'Fine Dining', 'Street Food', 'Hiking', 'Museums', 'Nightlife',
  'Coffee', 'Shopping', 'Live Music', 'History',
  'Architecture', 'Nature', 'Family Friendly', 'For Kids', 'Parks & Playgrounds',
];

interface ManageFriendsModalProps {
  onCompanionAdded?: () => void;
}

export function ManageFriendsModal({ onCompanionAdded }: ManageFriendsModalProps) {
  const { profile, addCompanion, removeCompanion, updateCompanion, sessionId } = useUser();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Companion>({ name: '', interests: [], age: undefined });
  const [isLoading, setIsLoading] = useState(false);
  const [showRemoveWarning, setShowRemoveWarning] = useState(false);
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null);

  const handleAddFriend = async () => {
    if (formData.name.trim()) {
      if (editingIndex !== null) {
        updateCompanion(editingIndex, formData);
        setEditingIndex(null);
        toast({
          title: 'Companion updated',
          description: `${formData.name}'s profile has been updated.`,
        });
      } else {
        // Add companion first
        addCompanion(formData);
        
        // Fetch additional recommendations based on new companion's interests
        if (formData.interests.length > 0 && profile.country) {
          setIsLoading(true);
          try {
            await fetchAdditionalRecommendations(formData);
            toast({
              title: 'Companion added',
              description: `Added ${formData.name} and found new places based on their interests!`,
            });
            onCompanionAdded?.();
          } catch (error) {
            toast({
              title: 'Companion added',
              description: `Added ${formData.name}. Refresh the dashboard to see updated recommendations.`,
            });
          } finally {
            setIsLoading(false);
          }
        } else {
          toast({
            title: 'Companion added',
            description: `${formData.name} has been added to your trip.`,
          });
        }
      }
      setFormData({ name: '', interests: [], age: undefined });
    }
  };

  const fetchAdditionalRecommendations = async (newCompanion: Companion) => {
    if (!profile.country || !sessionId) return;

    // Build search params with the new companion's interests
    const allInterests = [...profile.interests, ...newCompanion.interests];
    const uniqueInterests = Array.from(new Set(allInterests));
    
    const searchParams = new URLSearchParams({
      location: profile.country,
      term: newCompanion.interests.slice(0, 2).join(' ') || 'attractions',
      interests: uniqueInterests.join(','),
      limit: '20',
      companionAges: newCompanion.age?.toString() || '',
    });

    const response = await fetch(`/api/yelp/search?${searchParams.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch');
    
    // The dashboard will pick up the new data on next refresh
    return response.json();
  };

  const handleEditFriend = (index: number) => {
    setFormData(profile.companions[index]);
    setEditingIndex(index);
  };

  const handleRemoveFriend = (index: number) => {
    const companion = profile.companions[index];
    // Warn if companion has unique interests that might affect recommendations
    const companionUniqueInterests = companion.interests.filter(
      interest => !profile.interests.includes(interest) && 
        !profile.companions.some((c, i) => i !== index && c.interests.includes(interest))
    );
    
    if (companionUniqueInterests.length > 0) {
      setPendingRemoveIndex(index);
      setShowRemoveWarning(true);
    } else {
      confirmRemoveFriend(index);
    }
  };

  const confirmRemoveFriend = (index: number) => {
    const companion = profile.companions[index];
    removeCompanion(index);
    if (editingIndex === index) {
      setEditingIndex(null);
      setFormData({ name: '', interests: [], age: undefined });
    }
    setShowRemoveWarning(false);
    setPendingRemoveIndex(null);
    toast({
      title: 'Companion removed',
      description: `${companion.name} has been removed from your trip.`,
    });
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setEditingIndex(null);
    setFormData({ name: '', interests: [], age: undefined });
  };



  return (
    <>
      <AlertDialog open={showRemoveWarning} onOpenChange={setShowRemoveWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Remove Companion?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingRemoveIndex !== null && profile.companions[pendingRemoveIndex] && (
                <>
                  <strong>{profile.companions[pendingRemoveIndex].name}</strong> has unique interests that contributed to your recommendations.
                  Removing them won't delete existing places, but future recommendations may differ.
                  <br /><br />
                  Are you sure you want to remove them?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingRemoveIndex !== null && confirmRemoveFriend(pendingRemoveIndex)}>
              Yes, Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Edit2 className="w-4 h-4" /> Manage Friends
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Travel Buddies
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Add/Edit Friend Form */}
          <div className="space-y-4 p-4 bg-secondary/30 rounded-lg">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Friend's Name</label>
                <Input
                  placeholder="Enter name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Age</label>
                <Input
                  type="number"
                  placeholder="Age"
                  value={formData.age || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="mt-1"
                  min="0"
                  max="120"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Their Interests</label>
              <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                  <Badge
                    key={interest}
                    variant={formData.interests.includes(interest) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleInterest(interest)}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>



            <div className="flex gap-2">
              <Button
                onClick={handleAddFriend}
                disabled={!formData.name.trim() || isLoading}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finding places...
                  </>
                ) : editingIndex !== null ? 'Update Friend' : 'Add Friend'}
              </Button>
              {editingIndex !== null && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingIndex(null);
                    setFormData({ name: '', interests: [], age: undefined });
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Friends List */}
          <div>
            <h3 className="font-semibold mb-3">Your Travel Buddies ({profile.companions.length})</h3>
            <ScrollArea className="h-[300px] pr-4">
              {profile.companions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No friends added yet</p>
                  <p className="text-sm">Add friends to personalize recommendations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {profile.companions.map((friend, idx) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium">{friend.name} {friend.age ? `(${friend.age})` : ''}</p>
                          <p className="text-xs text-muted-foreground">
                            {friend.interests.length > 0
                              ? friend.interests.join(', ')
                              : 'No interests specified'}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditFriend(idx)}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveFriend(idx)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {friend.interests.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {friend.interests.map(interest => (
                            <Badge key={interest} variant="secondary" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          <Button onClick={handleClose} className="w-full">
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

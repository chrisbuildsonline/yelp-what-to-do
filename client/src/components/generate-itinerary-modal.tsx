import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Sparkles, Loader } from 'lucide-react';

interface GenerateItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (numDays: number) => void;
  isGenerating: boolean;
}

export function GenerateItineraryModal({ 
  open, 
  onOpenChange, 
  onGenerate,
  isGenerating 
}: GenerateItineraryModalProps) {
  const [numDays, setNumDays] = useState(3);

  const handleGenerate = () => {
    onGenerate(numDays);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Generate Your Itinerary
          </DialogTitle>
          <DialogDescription>
            Create a personalized day-by-day plan based on top-rated Yelp places in your destination.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="numDays">How many days is your trip?</Label>
            <Input
              id="numDays"
              type="number"
              min="1"
              max="14"
              value={numDays}
              onChange={(e) => setNumDays(parseInt(e.target.value) || 3)}
              className="text-center text-lg font-semibold"
            />
            <p className="text-xs text-muted-foreground">
              We'll create a balanced itinerary with breakfast, activities, and dining recommendations.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || numDays < 1}
              className="flex-1 gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Sparkles, Loader, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GenerateItineraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (numDays: number) => void;
  isGenerating: boolean;
  currentDays?: number;
  isRegenerate?: boolean;
}

export function GenerateItineraryModal({ 
  open, 
  onOpenChange, 
  onGenerate,
  isGenerating,
  currentDays = 0,
  isRegenerate = false
}: GenerateItineraryModalProps) {
  const [numDays, setNumDays] = useState(currentDays || 3);

  // Update numDays when currentDays changes
  useEffect(() => {
    if (currentDays > 0) {
      setNumDays(currentDays);
    }
  }, [currentDays]);

  const handleGenerate = () => {
    console.log('Generating itinerary with', numDays, 'days');
    onGenerate(numDays);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isRegenerate ? 'Regenerate Itinerary' : 'Generate Your Itinerary'}
          </DialogTitle>
          <DialogDescription>
            {isRegenerate 
              ? 'Modify the number of days and regenerate your itinerary.'
              : 'Create a personalized day-by-day plan based on top-rated Yelp places in your destination.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isRegenerate && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This will remove your current plan and create a new one. Any custom activities or changes you've made will be lost.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <Label htmlFor="numDays" className="text-lg font-semibold">How many days is your trip?</Label>
            <div className="flex items-center justify-center">
              <Input
                id="numDays"
                type="number"
                min="1"
                max="30"
                value={numDays}
                onChange={(e) => setNumDays(parseInt(e.target.value) || 3)}
                className="text-center font-bold shadow-none focus-visible:ring-2 w-32 h-24 !border-none !text-[64px]"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
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
              variant={isRegenerate ? 'destructive' : 'default'}
            >
              {isGenerating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {isRegenerate ? 'Yes, Regenerate' : 'Generate'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

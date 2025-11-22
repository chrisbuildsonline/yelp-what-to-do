import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserPreferences, CompanionPreferences, INTEREST_OPTIONS, FOOD_PREFERENCE_OPTIONS, DIETARY_OPTIONS } from "@/types/preferences";
import { Users, Plus, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface OnboardingFlowProps {
  onComplete: (preferences: UserPreferences) => void;
  existingPreferences?: UserPreferences;
}

export const OnboardingFlow = ({ onComplete, existingPreferences }: OnboardingFlowProps) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>(
    existingPreferences || {
      name: "",
      interests: [],
      foodPreferences: [],
      dietaryRestrictions: [],
      partySize: 1,
      companions: []
    }
  );

  const toggleSelection = (category: keyof Pick<UserPreferences, "interests" | "foodPreferences" | "dietaryRestrictions">, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(item => item !== value)
        : [...prev[category], value]
    }));
  };

  const addCompanion = () => {
    if (preferences.companions.length >= 3) {
      toast.error("Maximum 4 people total (including you)");
      return;
    }
    setPreferences(prev => ({
      ...prev,
      partySize: prev.partySize + 1,
      companions: [...prev.companions, {
        name: "",
        interests: [],
        foodPreferences: [],
        dietaryRestrictions: []
      }]
    }));
  };

  const removeCompanion = (index: number) => {
    setPreferences(prev => ({
      ...prev,
      partySize: prev.partySize - 1,
      companions: prev.companions.filter((_, i) => i !== index)
    }));
  };

  const updateCompanion = (index: number, field: keyof CompanionPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      companions: prev.companions.map((comp, i) =>
        i === index ? { ...comp, [field]: value } : comp
      )
    }));
  };

  const toggleCompanionSelection = (companionIndex: number, category: keyof Pick<CompanionPreferences, "interests" | "foodPreferences" | "dietaryRestrictions">, value: string) => {
    const companion = preferences.companions[companionIndex];
    const updated = companion[category].includes(value)
      ? companion[category].filter(item => item !== value)
      : [...companion[category], value];
    updateCompanion(companionIndex, category, updated);
  };

  const handleComplete = () => {
    if (!preferences.name) {
      toast.error("Please enter your name");
      return;
    }
    if (preferences.interests.length === 0) {
      toast.error("Please select at least one interest");
      return;
    }
    if (preferences.foodPreferences.length === 0) {
      toast.error("Please select at least one food preference");
      return;
    }
    onComplete(preferences);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-4xl w-full p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary mb-4">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-4xl font-bold">Create Your Perfect Experience</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Tell us about your preferences and we'll craft a personalized local adventure
          </p>
          <div className="flex justify-center gap-2 pt-4">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step ? "w-12 bg-primary" : "w-2 bg-muted"
                }`}
              />
            ))}
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-lg">What's your name?</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={preferences.name}
                onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                className="text-lg h-12"
              />
            </div>

            <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <div className="font-medium">Party size: {preferences.partySize} {preferences.partySize === 1 ? "person" : "people"}</div>
                <div className="text-sm text-muted-foreground">Add up to 3 companions</div>
              </div>
              {preferences.companions.length < 3 && (
                <Button onClick={addCompanion} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Companion
                </Button>
              )}
            </div>

            {preferences.companions.map((companion, index) => (
              <Card key={index} className="p-4 space-y-3 border-2 border-primary/20">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Companion {index + 1}</Label>
                  <Button
                    onClick={() => removeCompanion(index)}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  placeholder="Companion's name"
                  value={companion.name}
                  onChange={(e) => updateCompanion(index, "name", e.target.value)}
                />
              </Card>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-3">
              <Label className="text-lg">What are your interests?</Label>
              <p className="text-sm text-muted-foreground">Select all that apply</p>
              <div className="flex flex-wrap gap-2">
                {INTEREST_OPTIONS.map((interest) => (
                  <Badge
                    key={interest}
                    onClick={() => toggleSelection("interests", interest)}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                      preferences.interests.includes(interest)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>

            {preferences.companions.map((companion, index) => (
              <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <Label className="text-base font-semibold">{companion.name || `Companion ${index + 1}`}'s interests</Label>
                <div className="flex flex-wrap gap-2">
                  {INTEREST_OPTIONS.map((interest) => (
                    <Badge
                      key={interest}
                      onClick={() => toggleCompanionSelection(index, "interests", interest)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                        companion.interests.includes(interest)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-3">
              <Label className="text-lg">What cuisines do you enjoy?</Label>
              <p className="text-sm text-muted-foreground">Select your favorites</p>
              <div className="flex flex-wrap gap-2">
                {FOOD_PREFERENCE_OPTIONS.map((food) => (
                  <Badge
                    key={food}
                    onClick={() => toggleSelection("foodPreferences", food)}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                      preferences.foodPreferences.includes(food)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {food}
                  </Badge>
                ))}
              </div>
            </div>

            {preferences.companions.map((companion, index) => (
              <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <Label className="text-base font-semibold">{companion.name || `Companion ${index + 1}`}'s food preferences</Label>
                <div className="flex flex-wrap gap-2">
                  {FOOD_PREFERENCE_OPTIONS.map((food) => (
                    <Badge
                      key={food}
                      onClick={() => toggleCompanionSelection(index, "foodPreferences", food)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                        companion.foodPreferences.includes(food)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
            <div className="space-y-3">
              <Label className="text-lg">Any dietary restrictions?</Label>
              <p className="text-sm text-muted-foreground">We'll make sure to accommodate</p>
              <div className="flex flex-wrap gap-2">
                {DIETARY_OPTIONS.map((diet) => (
                  <Badge
                    key={diet}
                    onClick={() => toggleSelection("dietaryRestrictions", diet)}
                    className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                      preferences.dietaryRestrictions.includes(diet)
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {diet}
                  </Badge>
                ))}
              </div>
            </div>

            {preferences.companions.map((companion, index) => (
              <div key={index} className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <Label className="text-base font-semibold">{companion.name || `Companion ${index + 1}`}'s dietary restrictions</Label>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((diet) => (
                    <Badge
                      key={diet}
                      onClick={() => toggleCompanionSelection(index, "dietaryRestrictions", diet)}
                      className={`cursor-pointer px-4 py-2 text-sm transition-all duration-200 ${
                        companion.dietaryRestrictions.includes(diet)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {diet}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              size="lg"
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => {
              if (step < 4) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {step === 4 ? (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Create My Experience
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
};

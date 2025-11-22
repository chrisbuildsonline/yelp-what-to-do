import { useState, useEffect } from "react";
import { Hero } from "@/components/Hero";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { FilterBar } from "@/components/FilterBar";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessDetail } from "@/components/BusinessDetail";
import { ReservationModal } from "@/components/ReservationModal";
import { Business } from "@/data/mockData";
import { UserPreferences } from "@/types/preferences";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PREFERENCES_KEY = "locallens_preferences";

const Index = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recommendations, setRecommendations] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setPreferences(parsed);
      generateRecommendations(parsed);
    } else {
      setShowOnboarding(true);
    }
  }, []);

  const generateRecommendations = async (prefs: UserPreferences) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: { preferences: prefs }
      });

      if (error) throw error;

      if (data?.recommendations) {
        setRecommendations(data.recommendations);
        toast.success("Your personalized experience is ready!", {
          description: `We found ${data.recommendations.length} perfect matches for you`
        });
      }
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations", {
        description: "Please try again or adjust your preferences"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (prefs: UserPreferences) => {
    setPreferences(prefs);
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setShowOnboarding(false);
    generateRecommendations(prefs);
  };

  const handleEditPreferences = () => {
    setShowOnboarding(true);
  };

  const handleBusinessClick = (business: Business) => {
    setSelectedBusiness(business);
    setIsDetailOpen(true);
  };

  const handleReserve = () => {
    setIsDetailOpen(false);
    setIsReservationOpen(true);
  };

  const handleSearch = (query: string) => {
    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  };

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} existingPreferences={preferences || undefined} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero onSearch={handleSearch} />

      <main id="results" className="max-w-7xl mx-auto px-4 py-12 space-y-8">
        {preferences && (
          <div className="flex items-center justify-between p-6 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">
                  Welcome back, {preferences.name}!
                </h2>
              </div>
              <p className="text-muted-foreground">
                {preferences.partySize > 1 
                  ? `Experience for ${preferences.partySize} people`
                  : "Your personalized experience"
                }
                {" • "}
                {preferences.interests.slice(0, 3).join(", ")}
                {preferences.interests.length > 3 && ` +${preferences.interests.length - 3} more`}
              </p>
            </div>
            <Button onClick={handleEditPreferences} variant="outline" className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Preferences
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">Crafting your perfect experience...</h3>
              <p className="text-muted-foreground">AI is analyzing your preferences to find the best matches</p>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">
                    Your Personalized Recommendations
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {recommendations.length} hand-picked experiences just for you
                  </p>
                </div>
                <Button
                  onClick={() => preferences && generateRecommendations(preferences)}
                  variant="outline"
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Regenerate
                </Button>
              </div>

              <FilterBar onFilterChange={() => {}} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((business, index) => (
                <div
                  key={business.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                >
                  <div className="relative">
                    <BusinessCard
                      business={business}
                      onClick={() => handleBusinessClick(business)}
                    />
                    {(business as any).whyRecommended && (
                      <div className="mt-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
                        <p className="text-sm text-foreground">
                          <Sparkles className="h-3.5 w-3.5 inline mr-1.5 text-accent" />
                          {(business as any).whyRecommended}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {recommendations.length === 0 && !isLoading && (
              <div className="text-center py-20 space-y-4">
                <Sparkles className="h-16 w-16 mx-auto text-muted-foreground" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold">No recommendations yet</h3>
                  <p className="text-muted-foreground">
                    Complete your preferences to get personalized recommendations
                  </p>
                </div>
                <Button onClick={handleEditPreferences} size="lg" className="gap-2">
                  <Settings className="h-5 w-5" />
                  Set Up Preferences
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <BusinessDetail
        business={selectedBusiness}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onReserve={handleReserve}
      />

      <ReservationModal
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        businessName={selectedBusiness?.name || ""}
      />
    </div>
  );
};

export default Index;

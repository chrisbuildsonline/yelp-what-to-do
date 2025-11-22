import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { BusinessCard } from "@/components/BusinessCard";
import { BusinessDetail } from "@/components/BusinessDetail";
import { ReservationModal } from "@/components/ReservationModal";
import { Business } from "@/data/mockData";
import { UserPreferences } from "@/types/preferences";
import { Button } from "@/components/ui/button";
import { Sparkles, Settings, Loader2, LogOut, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PREFERENCES_KEY = "locallens_preferences";

const Dashboard = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [recommendations, setRecommendations] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Get current user
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login", { replace: true });
        return;
      }
      setUserEmail(user.email || "");
      setUserName((user.user_metadata?.name) || user.email?.split('@')[0] || "User");

      // Load preferences
      const stored = localStorage.getItem(PREFERENCES_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
        generateRecommendations(parsed);
      } else {
        setShowOnboarding(true);
      }
      setIsInitializing(false);
    };

    checkAuth();
  }, [navigate]);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} existingPreferences={preferences || undefined} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border sticky top-0 z-50 bg-card">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold">
              <span className="text-primary">Yelp!</span>
              <span className="text-foreground"> Where To?</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">{userName}</div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        {preferences && (
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-foreground">
                Your Personalized Recommendations
              </h2>
              <p className="text-muted-foreground mt-2">
                {preferences.interests.slice(0, 3).join(", ")}
                {preferences.interests.length > 3 && ` +${preferences.interests.length - 3} more`}
                {preferences.partySize > 1 && ` • For ${preferences.partySize} people`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => preferences && generateRecommendations(preferences)}
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={handleEditPreferences}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && recommendations.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">Finding great recommendations...</h3>
              <p className="text-sm text-muted-foreground">This should only take a moment</p>
            </div>
          </div>
        )}

        {/* Recommendations Grid */}
        {!isLoading && recommendations.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((business, index) => (
              <div
                key={business.id}
                style={{ animationDelay: `${index * 100}ms` }}
                className="animate-in fade-in slide-in-from-bottom-4 duration-500"
              >
                <BusinessCard
                  business={business}
                  onClick={() => handleBusinessClick(business)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && !isLoading && (
          <div className="text-center py-20 space-y-4">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">No recommendations yet</h3>
              <p className="text-muted-foreground">
                Edit your preferences to get personalized recommendations
              </p>
            </div>
            <Button onClick={handleEditPreferences} className="gap-2">
              <Settings className="h-4 w-4" />
              Edit Preferences
            </Button>
          </div>
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

export default Dashboard;

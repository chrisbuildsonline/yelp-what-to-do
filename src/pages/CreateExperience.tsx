import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { UserPreferences } from "@/types/preferences";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const CreateExperience = () => {
  const navigate = useNavigate();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        // User not authenticated, redirect to login
        navigate("/login");
        return;
      }
      setIsAuthChecked(true);
    };

    checkAuth();
  }, [navigate]);

  const handleOnboardingComplete = (preferences: UserPreferences) => {
    // Save preferences to localStorage
    localStorage.setItem("locallens_preferences", JSON.stringify(preferences));

    // Redirect to dashboard/experiences page
    setTimeout(() => {
      navigate("/dashboard", { replace: true });
    }, 500);
  };

  if (!isAuthChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingFlow onComplete={handleOnboardingComplete} />
    </div>
  );
};

export default CreateExperience;

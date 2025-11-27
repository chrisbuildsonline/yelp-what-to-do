import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import EditPreferences from "@/pages/edit-preferences";
import Auth from "@/pages/auth";
import { UserProvider, useUser } from "@/lib/store";

function Router() {
  const { isAuthenticated, profile, isLoadingSession } = useUser();

  // Show nothing while loading session
  if (isLoadingSession) {
    return null;
  }

  return (
    <Switch>
      <Route path="/landing" component={Landing} />
      <Route path="/auth">
        <Redirect to="/landing" />
      </Route>
      <Route path="/onboarding">
        {isAuthenticated ? <Onboarding /> : <Redirect to="/landing" />}
      </Route>
      <Route path="/edit-preferences">
        {isAuthenticated && profile.isOnboarded ? (
          <EditPreferences />
        ) : isAuthenticated ? (
          <Redirect to="/onboarding" />
        ) : (
          <Redirect to="/landing" />
        )}
      </Route>
      <Route path="/dashboard">
        {isAuthenticated && profile.isOnboarded ? (
          <Dashboard />
        ) : isAuthenticated ? (
          <Redirect to="/onboarding" />
        ) : (
          <Redirect to="/landing" />
        )}
      </Route>
      <Route path="/">
        {isAuthenticated ? (
          profile.isOnboarded ? (
            <Redirect to="/dashboard" />
          ) : (
            <Redirect to="/onboarding" />
          )
        ) : (
          <Redirect to="/landing" />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <div className="relative">
            <Router />

          </div>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;

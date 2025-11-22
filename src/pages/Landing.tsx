import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MapPin, Users, Star, Zap, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Fixed Floating Navigation */}
      <nav className="fixed top-6 left-6 right-6 z-50 max-w-7xl mx-auto px-6">
        <div className="backdrop-blur supports-[backdrop-filter]:bg-white/90 border border-border/20 rounded-2xl px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              <span className="text-primary">Yelp!</span>
              <span className="text-foreground"> Where To?</span>
            </h1>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate("/login")} className="text-foreground">
              Sign In
            </Button>
            <Button onClick={() => navigate("/signup")} className="gap-2">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source
              src="/3018669-hd_1920_1080_24fps.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/40 to-background"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-tight">
              Discover Your
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-primary">
                Perfect Local Moment
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Stop endlessly browsing. Get personalized recommendations for restaurants, activities, and experiences tailored just for you.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <Button
              size="lg"
              className="gap-2 text-lg h-12 px-8 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => navigate("/signup")}
            >
              Start Exploring <ArrowRight className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg h-12 px-8"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Social Proof */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span>1000+ Happy Explorers</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <span>AI-Powered Picks</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-border"></div>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span>Fully Personalized</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to discover your next favorite place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                number: "01",
                title: "Tell Us About You",
                description: "Share your interests, budget, and group size in a quick onboarding"
              },
              {
                icon: <Sparkles className="h-8 w-8" />,
                number: "02",
                title: "AI Learns Your Style",
                description: "Our algorithm analyzes your preferences to find perfect matches"
              },
              {
                icon: <MapPin className="h-8 w-8" />,
                number: "03",
                title: "Discover & Explore",
                description: "Browse personalized recommendations and make your next reservation"
              }
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent rounded-3xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative p-8 rounded-3xl border border-border/40 bg-card hover:border-primary/40 transition-all space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {step.icon}
                    </div>
                    <span className="text-4xl font-bold text-primary/20">{step.number}</span>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose LocalLens?</h2>
                <p className="text-lg text-muted-foreground">
                  Experience a smarter way to discover your city's best-kept secrets
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: <Sparkles className="h-6 w-6" />, title: "AI-Powered", desc: "Smart algorithm learns from your taste" },
                  { icon: <Zap className="h-6 w-6" />, title: "Lightning Fast", desc: "Get personalized picks in seconds" },
                  { icon: <Heart className="h-6 w-6" />, title: "100% Personalized", desc: "Recommendations unique to you" },
                  { icon: <MapPin className="h-6 w-6" />, title: "Local Insights", desc: "Discover hidden gems in your area" }
                ].map((benefit, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-xl border border-border/40 bg-card/50 hover:border-primary/40 transition-all">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      {benefit.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{benefit.title}</h4>
                      <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="inline-block p-4 rounded-2xl bg-primary/10">
                    <MapPin className="h-12 w-12 text-primary" />
                  </div>
                  <p className="text-lg font-semibold">Ready to explore?</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 p-12 md:p-16 text-center space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-bold">Ready to find your next favorite place?</h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join thousands of explorers discovering personalized local experiences every day. It only takes 2 minutes to get started.
              </p>
            </div>
            <Button
              size="lg"
              className="gap-2 text-lg h-12 px-8 shadow-lg hover:shadow-xl transition-shadow"
              onClick={() => navigate("/signup")}
            >
              Start Exploring Now <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-muted-foreground space-y-4">
          <p>© 2024 LocalLens. Discover local experiences, powered by AI.</p>
          <p className="text-xs">Video background by Pexels</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

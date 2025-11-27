import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Compass, ArrowRight, Star, Heart, Coffee } from "lucide-react";
import modernBrunchImage from '@assets/generated_images/modern_brunch_cafe_interior.png';
import friendsDiningImage from '@assets/generated_images/friends_dining_at_night.png';
import scenicHikingImage from '@assets/generated_images/scenic_hiking_trail.png';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthModal } from "@/components/auth-modal";

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      {/* Navigation */}
      <header className="py-6 px-6 md:px-12 flex items-center justify-between max-w-7xl mx-auto w-full z-10 relative">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Compass size={24} strokeWidth={3} />
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-foreground">
            Yelp! What to do?
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-4 py-2 font-medium hover:bg-accent/50 rounded-lg transition-colors"
          >
            Log in
          </button>
          <Button
            onClick={() => setAuthModalOpen(true)}
            className="rounded-full font-bold px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
          >
            Sign up
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              variants={container}
              initial="hidden"
              animate="show"
              className="space-y-8 z-10"
            >
   
              
              <motion.h1 variants={item} className="text-5xl md:text-7xl font-heading font-bold leading-[1.1] tracking-tight text-foreground">
                Discover your next <br />
                <span className="text-primary relative inline-block">
                  adventure
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                  </svg>
                </span>
                {" "}today.
              </motion.h1>
              
              <motion.p variants={item} className="text-xl text-muted-foreground max-w-lg leading-relaxed">
                Stop scrolling and start exploring. We combine Yelp's trusted data with AI to build the perfect itinerary for you.
              </motion.p>
              
              <motion.div variants={item} className="flex flex-wrap gap-4">
                <Button
                  onClick={() => setAuthModalOpen(true)}
                  size="lg"
                  className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:translate-y-[-2px] transition-all"
                >
                  Start Planning
                  <ArrowRight className="ml-2" size={20} />
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg bg-white/50 backdrop-blur-sm border-2 hover:bg-white">
                  How it works
                </Button>
              </motion.div>

              <motion.div variants={item} className="pt-8 flex items-center gap-8 text-sm font-medium text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                      </div>
                    ))}
                  </div>
                  <span>Join 10,000+ travelers</span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-1">
                  <Star className="fill-yellow-400 text-yellow-400" size={16} />
                  <span className="text-foreground">4.9/5</span>
                  <span>rating</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full transform translate-y-12 scale-75" />
              <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white rotate-2 hover:rotate-0 transition-transform duration-500">
                 <img 
                  src={modernBrunchImage} 
                  alt="Travel Collage" 
                  className="w-full h-auto object-cover"
                />
              </div>
              
              {/* Floating Cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-border max-w-[200px]"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <Coffee size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Best Coffee</p>
                    <p className="text-xs text-muted-foreground">0.2 mi away</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <Star key={i} size={12} className="fill-orange-400 text-orange-400" />)}
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute top-12 -right-8 bg-white p-4 rounded-2xl shadow-xl border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 p-2 rounded-full text-red-500">
                    <Heart className="fill-current" size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Saved to "Tokyo Trip"</p>
                    <p className="text-xs text-muted-foreground">Just now</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-white/50 border-t border-border/50">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Travel like a local, not a tourist</h2>
              <p className="text-muted-foreground text-lg">Experience the best spots, hand-picked for your unique taste. No clutter, just great memories.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={modernBrunchImage} 
                    alt="Cozy cafe interior" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
              
                    <h3 className="text-xl font-bold mb-2">Personalized Picks</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Share your vibe, and we'll curate a list of hidden gems and local favorites that match your style perfectly.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={friendsDiningImage} 
                    alt="Friends eating street food" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4">
                      <MapPin size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Trusted Local Insights</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Explore with confidence using up-to-the-minute ratings, photos, and honest reviews from the community.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="group overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={scenicHikingImage} 
                    alt="Travel planning flatlay" 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white mb-4">
                      <Compass size={24} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Effortless Planning</h3>
                    <p className="text-white/90 text-sm leading-relaxed">
                      Save your must-visits and let us weave them into a seamless itinerary for your perfect day out.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-5xl mx-auto bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
               <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
               <div className="absolute bottom-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            </div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to find your new favorite spot?</h2>
              <p className="text-primary-foreground/80 text-xl max-w-2xl mx-auto">
                Join thousands of foodies and travelers finding the best spots with Yelp! What to do?
              </p>
              <Button
                onClick={() => setAuthModalOpen(true)}
                size="lg"
                variant="secondary"
                className="h-16 px-10 rounded-full text-xl font-bold shadow-2xl hover:scale-105 transition-transform text-primary bg-white hover:bg-white/90"
              >
                Get Started for Free
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border/40">
        <p>© 2025 Yelp! What to do? - AI Powered Travel</p>
      </footer>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

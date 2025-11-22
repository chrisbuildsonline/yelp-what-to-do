import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero = ({ onSearch }: HeroProps) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get("search") as string;
    onSearch(query);
  };

  return (
    <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary px-4 py-20">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      
      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
          Your Perfect Day,
          <span className="block bg-gradient-to-r from-accent to-yellow-300 bg-clip-text text-transparent">
            Personalized by AI
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto font-light">
          Tell us your interests, food preferences, and party size. We'll craft an unforgettable experience tailored for you.
        </p>

        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-8">
          <div className="relative group">
            <Input
              type="text"
              name="search"
              placeholder="Search for restaurants, cafes, cuisines..."
              className="h-16 pl-14 pr-32 text-lg bg-card/95 backdrop-blur border-0 shadow-2xl rounded-2xl focus-visible:ring-accent transition-all duration-300"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Button
              type="submit"
              size="lg"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Search
            </Button>
          </div>
        </form>

        <div className="flex flex-wrap justify-center gap-3 pt-4">
          {["Italian", "Coffee Shops", "Sushi", "Vegetarian", "Bakeries"].map((tag) => (
            <button
              key={tag}
              onClick={() => onSearch(tag)}
              className="px-6 py-2 rounded-full bg-card/80 backdrop-blur text-card-foreground hover:bg-card transition-all duration-300 border border-primary-foreground/10 hover:border-accent/50 hover:scale-105"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

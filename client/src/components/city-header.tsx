import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Loader } from 'lucide-react';

interface CityHeaderProps {
  city: string;
  country: string;
  interests: string[];
}

// Curated city images from Unsplash (direct URLs, no API needed)
const CITY_IMAGES: Record<string, string> = {
  'stockholm': 'https://images.unsplash.com/photo-1508189860359-777d945909ef?w=1600&h=900&fit=crop',
  'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1600&h=900&fit=crop',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&h=900&fit=crop',
  'london': 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1600&h=900&fit=crop',
  'tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1600&h=900&fit=crop',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&h=900&fit=crop',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1600&h=900&fit=crop',
  'barcelona': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1600&h=900&fit=crop',
  'rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1600&h=900&fit=crop',
  'amsterdam': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=1600&h=900&fit=crop',
  'berlin': 'https://images.unsplash.com/photo-1560969184-10fe8719e047?w=1600&h=900&fit=crop',
  'sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=1600&h=900&fit=crop',
  'los angeles': 'https://images.unsplash.com/photo-1534190239940-9ba8944ea261?w=1600&h=900&fit=crop',
  'san francisco': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&h=900&fit=crop',
  'chicago': 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1600&h=900&fit=crop',
  'miami': 'https://images.unsplash.com/photo-1506966953602-c20cc11f75e3?w=1600&h=900&fit=crop',
  'hong kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=1600&h=900&fit=crop',
  'bangkok': 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1600&h=900&fit=crop',
  'istanbul': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1600&h=900&fit=crop',
  'madrid': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=1600&h=900&fit=crop',
};

// Fallback image - nice city skyline
const FALLBACK_URL = 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1600&h=900&fit=crop';

export function CityHeader({ city, interests }: CityHeaderProps) {
  const [isLoading, setIsLoading] = useState(true);

  const cityName = city.split(',')[0].trim();
  const cityKey = cityName.toLowerCase();

  // Get city-specific image or fallback
  const imageUrl = useMemo(() => {
    return CITY_IMAGES[cityKey] || FALLBACK_URL;
  }, [cityKey]);

  const displayName = cityName;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden aspect-[21/9] mb-8 group"
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center z-10">
          <Loader className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      <img
        src={imageUrl}
        alt={`${displayName} cityscape`}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        onLoad={() => setIsLoading(false)}
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8 text-white">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">{displayName}</h2>
          </div>

          <p className="text-white/90 text-sm md:text-base max-w-2xl">
            Discover amazing places in {displayName} based on your interests in{' '}
            <span className="font-semibold text-primary">{interests.join(', ')}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, MapPin, Phone, Globe, Clock, DollarSign, ExternalLink, Image, ChevronLeft, ChevronRight, X, MessageSquare, ThumbsUp, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BusinessHours {
  open: Array<{
    day: number;
    start: string;
    end: string;
    is_overnight: boolean;
  }>;
  is_open_now?: boolean;
}

interface Review {
  id: string;
  rating: number;
  text: string;
  time_created: string;
  user: {
    name: string;
    image_url?: string;
  };
}

interface BusinessDetails {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  image_url: string;
  photos?: string[];
  categories: Array<{ alias: string; title: string }>;
  distance?: number;
  price?: string;
  coordinates?: { latitude: number; longitude: number };
  phone?: string;
  display_phone?: string;
  url?: string;
  location?: {
    address1: string;
    address2?: string;
    address3?: string;
    city: string;
    state: string;
    zip_code: string;
    display_address?: string[];
  };
  hours?: BusinessHours[];
  is_claimed?: boolean;
  is_closed?: boolean;
  transactions?: string[];
  messaging?: { url: string };
  attributes?: Record<string, any>;
}

interface PlaceDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  place: {
    id: string;
    name: string;
    rating: number;
    review_count: number;
    image_url: string;
    categories: Array<{ title: string }>;
    distance: number;
    price?: string;
    coordinates?: { latitude: number; longitude: number };
    phone?: string;
    url?: string;
    location?: { address1: string; city: string; state: string; zip_code: string };
    hours?: Array<{ day: number; start: string; end: string; is_overnight: boolean }>;
  };
}

export function PlaceDetailModal({ open, onOpenChange, place }: PlaceDetailModalProps) {
  const [details, setDetails] = useState<BusinessDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    if (open && place.id) {
      fetchBusinessDetails();
    }
  }, [open, place.id]);

  const fetchBusinessDetails = async () => {
    if (!place.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/yelp/business/${place.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetails(data);
      }
    } catch (error) {
      console.error('Failed to fetch business details:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (time: string) => {
    if (!time || time.length !== 4) return time;
    const hours = parseInt(time.substring(0, 2));
    const minutes = time.substring(2);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
    return `${displayHours}:${minutes} ${period}`;
  };

  const getCurrentDayHours = () => {
    if (!details?.hours?.[0]?.open) return null;
    const today = new Date().getDay();
    // Yelp uses 0 = Monday, JS uses 0 = Sunday
    const yelpDay = today === 0 ? 6 : today - 1;
    return details.hours[0].open.filter(h => h.day === yelpDay);
  };

  const photos = details?.photos || (place.image_url ? [place.image_url] : []);
  const isOpenNow = details?.hours?.[0]?.is_open_now;
  const todayHours = getCurrentDayHours();

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : star - 0.5 <= rating
                ? 'fill-yellow-400/50 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden p-0">
          <div className="overflow-y-auto max-h-[90vh]">
            {/* Photo Gallery Header */}
            <div className="relative">
              {photos.length > 0 && (
                <div className="relative aspect-video bg-gray-100">
                  <img
                    src={photos[selectedPhotoIndex]}
                    alt={place.name}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Photo navigation */}
                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedPhotoIndex(i => i > 0 ? i - 1 : photos.length - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setSelectedPhotoIndex(i => i < photos.length - 1 ? i + 1 : 0)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Photo counter & view all */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                    <button
                      onClick={() => setShowGallery(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      See all {photos.length} photos
                    </button>
                  </div>
                  
                  {/* Photo dots indicator */}
                  {photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {photos.slice(0, 5).map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedPhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === selectedPhotoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                      {photos.length > 5 && (
                        <span className="text-white/70 text-xs ml-1">+{photos.length - 5}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <ScrollArea className="w-full bg-gray-50">
                  <div className="flex gap-1 p-2">
                    {photos.map((photo, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedPhotoIndex(idx)}
                        className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                          idx === selectedPhotoIndex ? 'border-primary' : 'border-transparent'
                        }`}
                      >
                        <img src={photo} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{place.name}</h2>
                    {details?.is_claimed && (
                      <span className="text-xs text-blue-600 font-medium">✓ Claimed</span>
                    )}
                  </div>
                  {place.url && (
                    <a
                      href={place.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0"
                    >
                      <Button variant="outline" size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Yelp
                      </Button>
                    </a>
                  )}
                </div>
                
                {/* Rating & Reviews */}
                <div className="flex items-center gap-3 mt-2">
                  {renderStars(place.rating)}
                  <span className="font-bold text-lg">{place.rating}</span>
                  <span className="text-muted-foreground">({place.review_count.toLocaleString()} reviews)</span>
                </div>
                
                {/* Price & Categories */}
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  {place.price && (
                    <Badge variant="secondary" className="font-semibold">
                      {place.price}
                    </Badge>
                  )}
                  {place.categories.map((cat) => (
                    <Badge key={cat.title} variant="outline">
                      {cat.title}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Open/Closed Status */}
              {details?.hours && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className={`font-semibold ${isOpenNow ? 'text-green-600' : 'text-red-600'}`}>
                      {isOpenNow ? 'Open Now' : 'Closed'}
                    </span>
                    {todayHours && todayHours.length > 0 && (
                      <span className="text-muted-foreground ml-2">
                        {todayHours.map((h, i) => (
                          <span key={i}>
                            {i > 0 && ', '}
                            {formatTime(h.start)} - {formatTime(h.end)}
                          </span>
                        ))}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Distance */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm text-muted-foreground">Distance</div>
                    <div className="font-medium">{(place.distance / 1609).toFixed(1)} miles</div>
                  </div>
                </div>
                
                {/* Phone */}
                {(details?.display_phone || place.phone) && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <a href={`tel:${place.phone}`} className="font-medium text-primary hover:underline">
                        {details?.display_phone || place.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions/Services */}
              {details?.transactions && details.transactions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {details.transactions.map((t) => (
                      <Badge key={t} variant="secondary" className="capitalize">
                        {t.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Address */}
              {(details?.location || place.location) && (
                <div>
                  <h4 className="font-semibold mb-2">Location</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {details?.location?.display_address ? (
                      <p className="text-sm">{details.location.display_address.join(', ')}</p>
                    ) : place.location && (
                      <div className="text-sm space-y-0.5">
                        <p>{place.location.address1}</p>
                        <p>{place.location.city}, {place.location.state} {place.location.zip_code}</p>
                      </div>
                    )}
                    {details?.coordinates && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${details.coordinates.latitude},${details.coordinates.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
                      >
                        <MapPin className="w-3 h-3" />
                        Get Directions
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Hours */}
              {details?.hours?.[0]?.open && (
                <div>
                  <h4 className="font-semibold mb-2">Hours</h4>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="grid gap-1 text-sm">
                      {dayNames.map((day, idx) => {
                        const dayHours = details.hours![0].open.filter(h => h.day === idx);
                        const isToday = (new Date().getDay() === 0 ? 6 : new Date().getDay() - 1) === idx;
                        
                        return (
                          <div 
                            key={day} 
                            className={`flex justify-between py-1 ${isToday ? 'font-semibold text-primary' : ''}`}
                          >
                            <span>{day}</span>
                            <span>
                              {dayHours.length === 0 ? (
                                <span className="text-muted-foreground">Closed</span>
                              ) : (
                                dayHours.map((h, i) => (
                                  <span key={i}>
                                    {i > 0 && ', '}
                                    {formatTime(h.start)} - {formatTime(h.end)}
                                  </span>
                                ))
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Website Link */}
              {place.url && (
                <div className="pt-2">
                  <a
                    href={place.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="w-4 h-4" />
                    View on Yelp
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Full Screen Gallery */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <h3 className="font-semibold">{place.name} - Photos</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center relative">
              <img
                src={photos[selectedPhotoIndex]}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
              
              {photos.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedPhotoIndex(i => i > 0 ? i - 1 : photos.length - 1)}
                    className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setSelectedPhotoIndex(i => i < photos.length - 1 ? i + 1 : 0)}
                    className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>
            
            <div className="p-4 text-center text-white/70">
              {selectedPhotoIndex + 1} / {photos.length}
            </div>
            
            {/* Thumbnail strip */}
            <ScrollArea className="w-full bg-black/50 pb-4">
              <div className="flex gap-2 p-4 justify-center">
                {photos.map((photo, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className={`shrink-0 w-20 h-20 rounded overflow-hidden border-2 transition-all ${
                      idx === selectedPhotoIndex ? 'border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MapPin, Star, Phone, Globe, X, AlertCircle } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  image_url?: string;
  coordinates?: { latitude: number; longitude: number };
  phone?: string;
  url?: string;
  categories?: Array<{ title: string }>;
  distance?: number;
}

interface MapViewProps {
  places: Place[];
  location: string;
}

export function MapView({ places, location }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [open, setOpen] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const markers = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      // Initialize map with a reliable style
      const style = {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          }
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm'
          }
        ]
      };

      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: style as any,
        center: [-74.5, 40],
        zoom: 2,
      });

      // Add navigation controls
      map.current.addControl(new maplibregl.NavigationControl());

      // Handle map errors
      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setMapError('Map failed to load');
      });

      map.current.on('load', () => {
        setMapError(null);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      setMapError('Failed to initialize map');
    }

    return () => {
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || places.length === 0) return;

    // Wait for map to be loaded before adding markers
    const addMarkersAndFitBounds = () => {
      try {
        // Clear existing markers
        markers.current.forEach(marker => marker.remove());
        markers.current = [];

        // Calculate bounds from places
        let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
        let hasCoordinates = false;
        let markerCount = 0;
        let placesWithoutCoords = 0;

        places.forEach((place) => {
          if (place.coordinates?.latitude && place.coordinates?.longitude) {
            hasCoordinates = true;
            minLat = Math.min(minLat, place.coordinates.latitude);
            maxLat = Math.max(maxLat, place.coordinates.latitude);
            minLng = Math.min(minLng, place.coordinates.longitude);
            maxLng = Math.max(maxLng, place.coordinates.longitude);

            // Create marker element
            const el = document.createElement('div');
            el.className = 'w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-110 transition-transform shadow-lg border-2 border-white';
            el.textContent = String(markerCount + 1);
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            try {
              const marker = new maplibregl.Marker({ element: el })
                .setLngLat([place.coordinates.longitude, place.coordinates.latitude])
                .addTo(map.current!);

              el.addEventListener('click', () => setSelectedPlace(place));
              markers.current.push(marker);
              markerCount++;
            } catch (markerError) {
              console.error('Error creating marker:', markerError);
            }
          } else {
            placesWithoutCoords++;
          }
        });

        console.log(`Map: ${markerCount} markers added, ${placesWithoutCoords} places without coordinates`);

        // Fit bounds if we have coordinates
        if (hasCoordinates && markerCount > 0 && map.current) {
          try {
            const bounds = new maplibregl.LngLatBounds(
              [minLng, minLat],
              [maxLng, maxLat]
            );
            map.current.fitBounds(bounds, { padding: 50, duration: 1000 });
          } catch (boundsError) {
            console.error('Error fitting bounds:', boundsError);
          }
        }
      } catch (error) {
        console.error('Error adding markers:', error);
      }
    };

    // Add a small delay to ensure map is ready
    const timer = setTimeout(() => {
      if (map.current) {
        addMarkersAndFitBounds();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [places]);

  useEffect(() => {
    if (!open || !map.current) return;
    
    // Trigger map resize when dialog opens
    setTimeout(() => {
      map.current?.resize();
    }, 100);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">Open Map</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {location} - {places.length} Places
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[calc(90vh-120px)] overflow-hidden">
          {/* Map */}
          <div className="flex-1 relative bg-gray-100">
            {mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                <div className="text-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
                  <p className="text-sm font-medium text-gray-900">{mapError}</p>
                  <p className="text-xs text-gray-500">Check browser console for details</p>
                </div>
              </div>
            )}
            <div ref={mapContainer} className="w-full h-full" />
          </div>

          {/* Places List */}
          <div className="w-80 border-l">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {places.map(place => (
                  <Card
                    key={place.id}
                    className={`p-3 cursor-pointer transition-all ${
                      selectedPlace?.id === place.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPlace(place)}
                  >
                    <div className="flex gap-3">
                      {place.image_url && (
                        <img
                          src={place.image_url}
                          alt={place.name}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2">{place.name}</h4>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">{place.rating}</span>
                          <span className="text-xs text-muted-foreground">
                            ({place.review_count})
                          </span>
                        </div>
                        {place.distance && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {(place.distance / 1609).toFixed(1)} mi away
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Place Details Popover */}
        {selectedPlace && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-xl p-4 max-w-sm z-10 border">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
              <button onClick={() => setSelectedPlace(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedPlace.image_url && (
              <img
                src={selectedPlace.image_url}
                alt={selectedPlace.name}
                className="w-full h-32 rounded object-cover mb-3"
              />
            )}

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{selectedPlace.rating}/5</span>
                <span className="text-muted-foreground">({selectedPlace.review_count} reviews)</span>
              </div>

              {selectedPlace.categories && (
                <p className="text-muted-foreground">
                  {selectedPlace.categories.map(c => c.title).join(', ')}
                </p>
              )}

              {selectedPlace.distance && (
                <p className="text-muted-foreground">
                  {(selectedPlace.distance / 1609).toFixed(1)} miles away
                </p>
              )}

              <div className="flex gap-2 pt-2">
                {selectedPlace.phone && (
                  <a
                    href={`tel:${selectedPlace.phone}`}
                    className="flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
                {selectedPlace.url && (
                  <a
                    href={selectedPlace.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline text-xs"
                  >
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

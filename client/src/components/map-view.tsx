import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { MapPin, Star, Phone, Globe, Expand } from 'lucide-react';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

// Component to fit bounds when places change
function FitBounds({ places }: { places: Place[] }) {
  const map = useMap();

  useEffect(() => {
    const validPlaces = places.filter(p => p.coordinates?.latitude && p.coordinates?.longitude);
    if (validPlaces.length > 0) {
      const bounds = L.latLngBounds(
        validPlaces.map(p => [p.coordinates!.latitude, p.coordinates!.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [places, map]);

  return null;
}

// Custom marker with image
function createImageMarker(imageUrl: string, num: number) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      position: relative;
      width: 48px;
      height: 48px;
    ">
      <div style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        overflow: hidden;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background: #f0f0f0;
      ">
        <img src="${imageUrl}" style="
          width: 100%;
          height: 100%;
          object-fit: cover;
        " />
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        right: -4px;
        background: #2563eb;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 10px;
        border: 2px solid white;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
      ">${num}</div>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

// Inline map component for the dashboard card
function InlineMap({ places, onMarkerClick }: { places: Place[]; onMarkerClick?: (place: Place) => void }) {
  const validPlaces = places.filter(p => p.coordinates?.latitude && p.coordinates?.longitude);
  
  const defaultCenter: [number, number] = validPlaces.length > 0
    ? [validPlaces[0].coordinates!.latitude, validPlaces[0].coordinates!.longitude]
    : [40.7128, -74.006];

  if (validPlaces.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-100 text-muted-foreground">
        <MapPin className="w-6 h-6 mr-2" />
        No locations to display
      </div>
    );
  }

  return (
    <MapContainer
      center={defaultCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={false}
      zoomControl={false}
      dragging={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds places={validPlaces} />
      {validPlaces.map((place, index) => (
        <Marker
          key={place.id}
          position={[place.coordinates!.latitude, place.coordinates!.longitude]}
          icon={createImageMarker(place.image_url || '', index + 1)}
          eventHandlers={{
            click: () => onMarkerClick?.(place),
          }}
        >
          <Popup>
            <div className="p-1">
              <strong className="text-sm">{place.name}</strong>
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">{place.rating} ({place.review_count})</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

export function MapView({ places, location }: MapViewProps) {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [open, setOpen] = useState(false);

  const validPlaces = places.filter(p => p.coordinates?.latitude && p.coordinates?.longitude);
  
  const defaultCenter: [number, number] = validPlaces.length > 0
    ? [validPlaces[0].coordinates!.latitude, validPlaces[0].coordinates!.longitude]
    : [40.7128, -74.006];

  return (
    <>
      {/* Inline Preview Map */}
      <div className="relative">
        <div className="h-64 rounded-lg overflow-hidden border">
          <InlineMap places={places} onMarkerClick={setSelectedPlace} />
        </div>
        <Button 
          onClick={() => setOpen(true)}
          size="sm"
          className="absolute bottom-3 right-3 gap-2 shadow-lg z-[500] pointer-events-auto"
        >
          <Expand className="w-4 h-4" />
          Expand Map
        </Button>
      </div>

      {/* Full Map Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              {location} - {validPlaces.length} Places
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-4 h-[calc(90vh-120px)] overflow-hidden p-4">
            {/* Map */}
            <div className="flex-1 relative rounded-lg overflow-hidden">
              {open && (
                <MapContainer
                  center={defaultCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <FitBounds places={validPlaces} />
                  {validPlaces.map((place, index) => (
                    <Marker
                      key={place.id}
                      position={[place.coordinates!.latitude, place.coordinates!.longitude]}
                      icon={createImageMarker(place.image_url || '', index + 1)}
                      eventHandlers={{
                        click: () => setSelectedPlace(place),
                      }}
                    >
                      <Popup>
                        <div className="p-1">
                          <strong>{place.name}</strong>
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs">{place.rating} ({place.review_count})</span>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>

            {/* Places List */}
            <div className="w-80 border-l">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {validPlaces.map((place, index) => (
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
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {index + 1}
                        </div>
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

          {/* Selected Place Details */}
          {selectedPlace && (
            <div className="absolute bottom-8 left-8 bg-white rounded-lg shadow-xl p-4 max-w-sm z-1000 border">
              <h3 className="font-bold text-lg mb-2">{selectedPlace.name}</h3>
              
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

                <div className="flex gap-3 pt-2">
                  {selectedPlace.phone && (
                    <a href={`tel:${selectedPlace.phone}`} className="flex items-center gap-1 text-primary hover:underline text-xs">
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  )}
                  {selectedPlace.url && (
                    <a href={selectedPlace.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline text-xs">
                      <Globe className="w-3 h-3" /> Yelp
                    </a>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedPlace(null)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

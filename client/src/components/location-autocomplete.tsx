import { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface LocationResult {
  name: string;
  displayName: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: string) => void;
  placeholder?: string;
  className?: string;
}

export function LocationAutocomplete({
  value,
  onChange,
  placeholder = 'Search for a city (e.g., Tokyo, Paris, New York)...',
  className,
}: LocationAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Search using OpenStreetMap Nominatim API (free, no API key needed)
  // Filter for cities only (Yelp requires city-level location)
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Search for cities, towns, and villages only
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=15&addressdetails=1&featuretype=city`,
        {
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Filter and format results to only include cities/towns
        const formatted: LocationResult[] = data
          .filter((item: any) => {
            const type = item.type;
            const addressType = item.addresstype;
            // Only include cities, towns, municipalities
            return ['city', 'town', 'municipality', 'village', 'administrative'].includes(type) ||
                   ['city', 'town', 'municipality', 'village'].includes(addressType);
          })
          .map((item: any) => {
            const address = item.address || {};
            const city = address.city || address.town || address.municipality || address.village || item.name;
            const country = address.country || '';
            const state = address.state || '';
            
            // Create a clean display format: "City, Country" or "City, State, Country"
            let displayName = city;
            if (state && state !== city) {
              displayName += `, ${state}`;
            }
            if (country) {
              displayName += `, ${country}`;
            }

            return {
              name: item.name,
              displayName,
              city,
              country,
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            };
          })
          // Remove duplicates based on displayName
          .filter((item: LocationResult, index: number, self: LocationResult[]) => 
            index === self.findIndex(t => t.displayName === item.displayName)
          )
          .slice(0, 8);

        setResults(formatted);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (newValue.length >= 2) {
      timeoutRef.current = setTimeout(() => {
        searchLocations(newValue);
      }, 300);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleSelectLocation = (location: LocationResult) => {
    setInputValue(location.displayName);
    onChange(location.displayName);
    setIsOpen(false);
    setResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className={cn('pl-9 h-12', className)}
        />
        {isLoading && (
          <Loader className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary animate-spin" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((result, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectLocation(result)}
              className="w-full text-left px-4 py-3 hover:bg-secondary transition-colors border-b last:border-b-0 flex items-start gap-3"
            >
              <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm">{result.city}</p>
                <p className="text-xs text-muted-foreground">{result.country}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !isLoading && inputValue.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 p-4 text-center text-sm text-muted-foreground">
          No cities found. Try searching for a specific city name.
        </div>
      )}
    </div>
  );
}

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Navigation, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
  }
}

interface LocationSearchProps {
  onLocationSelect: (location: any) => void;
  onDirectionsRequest: (destination: any) => void;
}

const LocationSearch = ({ onLocationSelect, onDirectionsRequest }: LocationSearchProps) => {
  const { toast } = useToast();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (window.google && searchInputRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'IN' } // Restrict to India for Soil Saathi
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry) {
          onLocationSelect(place);
          searchNearbyAgriStores(place.geometry.location);
        }
      });
    }
  }, [onLocationSelect]);

  const searchNearbyAgriStores = async (location: any) => {
    if (!window.google) return;

    setIsLoading(true);
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    const request = {
      location: location,
      radius: 15000, // 15km radius
      keyword: 'agricultural supplies fertilizer seeds farm equipment pesticide organic manure',
      type: 'store'
    };

    service.nearbySearch(request, (results: any, status: any) => {
      setIsLoading(false);
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyStores(results.slice(0, 6));
        toast({
          title: "Agricultural Stores Found",
          description: `Found ${results.length} agricultural supply stores nearby`,
        });
      }
    });
  };

  const getStoreDetails = (store: any) => {
    if (!window.google) return;

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    service.getDetails({
      placeId: store.place_id,
      fields: ['name', 'rating', 'formatted_phone_number', 'opening_hours', 'website']
    }, (place: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        console.log('Store details:', place);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Location Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Your Field Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              ref={searchInputRef}
              placeholder="Enter field address, village name, or landmark"
              className="flex-1"
            />
            <Button variant="outline" size="icon">
              <MapPin className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Type your field location for better satellite imagery and local recommendations
          </p>
        </CardContent>
      </Card>

      {/* Nearby Agricultural Stores */}
      {nearbyStores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Nearby Agricultural Supplies
              {isLoading && <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {nearbyStores.map((store, index) => (
                <div key={store.place_id} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{store.name}</h4>
                      <p className="text-sm text-muted-foreground">{store.vicinity}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {store.rating && (
                          <Badge variant="outline" className="text-xs">
                            ⭐ {store.rating.toFixed(1)}
                          </Badge>
                        )}
                        {store.price_level && (
                          <Badge variant="outline" className="text-xs">
                            {'₹'.repeat(store.price_level)}
                          </Badge>
                        )}
                        {store.opening_hours?.open_now !== undefined && (
                          <Badge 
                            variant={store.opening_hours.open_now ? "default" : "secondary"} 
                            className="text-xs"
                          >
                            {store.opening_hours.open_now ? 'Open Now' : 'Closed'}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDirectionsRequest(store)}
                      >
                        <Navigation className="h-4 w-4 mr-1" />
                        Directions
                      </Button>
                    </div>
                  </div>
                  
                  {/* Store Types/Categories */}
                  {store.types && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {store.types
                        .filter((type: string) => !type.includes('establishment') && !type.includes('point_of_interest'))
                        .slice(0, 3)
                        .map((type: string) => (
                          <Badge key={type} variant="outline" className="text-xs capitalize">
                            {type.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {nearbyStores.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3 text-center">
                💡 Tip: Click "Directions" to get navigation to any agricultural store
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LocationSearch;
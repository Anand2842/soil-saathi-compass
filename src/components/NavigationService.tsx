import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navigation, Route, Car, Clock, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
  }
}

interface NavigationServiceProps {
  origin?: { lat: number; lng: number };
  destination?: { lat: number; lng: number };
  onRouteCalculated?: (route: any) => void;
}

const NavigationService = ({ origin, destination, onRouteCalculated }: NavigationServiceProps) => {
  const { toast } = useToast();
  const [directionsService, setDirectionsService] = useState<any>(null);
  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [travelMode, setTravelMode] = useState('DRIVING');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (window.google) {
      setDirectionsService(new window.google.maps.DirectionsService());
    }
  }, []);

  const calculateRoute = async () => {
    if (!directionsService || !origin || !destination) {
      toast({
        title: "Missing Information",
        description: "Please select both origin and destination points",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);

    const request = {
      origin: new window.google.maps.LatLng(origin.lat, origin.lng),
      destination: new window.google.maps.LatLng(destination.lat, destination.lng),
      travelMode: window.google.maps.TravelMode[travelMode],
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    directionsService.route(request, (result: any, status: any) => {
      setIsCalculating(false);
      
      if (status === 'OK') {
        const route = result.routes[0];
        const leg = route.legs[0];
        
        setRouteInfo({
          distance: leg.distance.text,
          duration: leg.duration.text,
          steps: leg.steps.length,
          startAddress: leg.start_address,
          endAddress: leg.end_address
        });

        onRouteCalculated?.(result);

        toast({
          title: "Route Calculated",
          description: `${leg.distance.text}, ${leg.duration.text}`,
        });
      } else {
        toast({
          title: "Route Calculation Failed",
          description: "Could not calculate route between selected points",
          variant: "destructive",
        });
      }
    });
  };

  const getTravelModeIcon = (mode: string) => {
    switch (mode) {
      case 'DRIVING': return <Car className="h-4 w-4" />;
      case 'WALKING': return <MapPin className="h-4 w-4" />;
      case 'BICYCLING': return <Route className="h-4 w-4" />;
      default: return <Navigation className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="h-5 w-5" />
          Navigation & Directions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Travel Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Travel Mode</label>
          <Select value={travelMode} onValueChange={setTravelMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRIVING">
                <div className="flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Driving
                </div>
              </SelectItem>
              <SelectItem value="WALKING">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Walking
                </div>
              </SelectItem>
              <SelectItem value="BICYCLING">
                <div className="flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Bicycling
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Route Calculation Button */}
        <Button 
          onClick={calculateRoute}
          disabled={!origin || !destination || isCalculating}
          className="w-full"
        >
          {isCalculating ? (
            <>
              <div className="animate-spin w-4 h-4 border-2 border-background border-t-transparent rounded-full mr-2" />
              Calculating Route...
            </>
          ) : (
            <>
              {getTravelModeIcon(travelMode)}
              <span className="ml-2">Get Directions</span>
            </>
          )}
        </Button>

        {/* Route Information */}
        {routeInfo && (
          <div className="space-y-3 pt-3 border-t">
            <h4 className="font-medium flex items-center gap-2">
              <Route className="h-4 w-4" />
              Route Information
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Distance:</span>
                <Badge variant="outline">{routeInfo.distance}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <span className="text-sm">Duration:</span>
                <Badge variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  {routeInfo.duration}
                </Badge>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-start gap-2">
                <span className="font-medium">From:</span>
                <span>{routeInfo.startAddress}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-medium">To:</span>
                <span>{routeInfo.endAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Route className="h-3 w-3" />
              <span>{routeInfo.steps} navigation steps</span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {!origin && !destination && (
          <div className="text-center py-4 text-muted-foreground">
            <Navigation className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select origin and destination points on the map</p>
          </div>
        )}

        {origin && !destination && (
          <div className="text-center py-2 text-muted-foreground">
            <p className="text-sm">Now select your destination</p>
          </div>
        )}

        {!origin && destination && (
          <div className="text-center py-2 text-muted-foreground">
            <p className="text-sm">Select your starting point</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NavigationService;
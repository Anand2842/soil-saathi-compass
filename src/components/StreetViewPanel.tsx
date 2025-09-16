import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Camera, RotateCw, MapPin } from "lucide-react";

declare global {
  interface Window {
    google: any;
  }
}

interface StreetViewPanelProps {
  location?: { lat: number; lng: number };
  onLocationChange?: (location: { lat: number; lng: number }) => void;
}

const StreetViewPanel = ({ location, onLocationChange }: StreetViewPanelProps) => {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const [streetView, setStreetView] = useState<any>(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [heading, setHeading] = useState(0);
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (streetViewRef.current && window.google && location) {
      initializeStreetView();
    }
  }, [location]);

  const initializeStreetView = () => {
    if (!streetViewRef.current || !window.google || !location) return;

    const streetViewService = new window.google.maps.StreetViewService();
    
    // Check if Street View is available at this location
    streetViewService.getPanorama({
      location: location,
      radius: 1000, // Search within 1km
      source: window.google.maps.StreetViewSource.OUTDOOR
    }, (data: any, status: any) => {
      if (status === window.google.maps.StreetViewStatus.OK) {
        setIsAvailable(true);
        
        const panorama = new window.google.maps.StreetViewPanorama(
          streetViewRef.current!,
          {
            position: data.location.latLng,
            pov: { heading: heading, pitch: pitch },
            zoom: 1,
            addressControl: false,
            enableCloseButton: false,
            fullscreenControl: false,
            motionTracking: false,
            motionTrackingControl: false,
            showRoadLabels: true
          }
        );

        setStreetView(panorama);

        // Listen for POV changes
        panorama.addListener('pov_changed', () => {
          const pov = panorama.getPov();
          setHeading(Math.round(pov.heading));
          setPitch(Math.round(pov.pitch));
        });

        // Listen for position changes
        panorama.addListener('position_changed', () => {
          const position = panorama.getPosition();
          if (position && onLocationChange) {
            onLocationChange({
              lat: position.lat(),
              lng: position.lng()
            });
          }
        });

      } else {
        setIsAvailable(false);
      }
    });
  };

  const rotateView = (direction: 'left' | 'right') => {
    if (!streetView) return;
    
    const currentPov = streetView.getPov();
    const newHeading = direction === 'left' 
      ? currentPov.heading - 45 
      : currentPov.heading + 45;
    
    streetView.setPov({
      heading: newHeading,
      pitch: currentPov.pitch
    });
  };

  const resetView = () => {
    if (!streetView) return;
    
    streetView.setPov({
      heading: 0,
      pitch: 0
    });
  };

  const captureView = () => {
    // In a real implementation, this would capture the current Street View
    console.log('Capturing Street View at:', { location, heading, pitch });
  };

  if (!location) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Eye className="h-12 w-12 mx-auto mb-2" />
            <p>Select a location on the map to view Street View</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Ground Level View
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isAvailable ? "default" : "secondary"}>
              {isAvailable ? 'Available' : 'Not Available'}
            </Badge>
            {isAvailable && (
              <Badge variant="outline">
                {heading}° / {pitch}°
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isAvailable ? (
          <div className="relative">
            <div ref={streetViewRef} className="w-full h-64" />
            
            {/* Street View Controls */}
            <div className="absolute bottom-2 left-2 flex gap-1">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => rotateView('left')}
              >
                ↺
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={resetView}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => rotateView('right')}
              >
                ↻
              </Button>
            </div>

            <div className="absolute bottom-2 right-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={captureView}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Location Indicator */}
            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
              <MapPin className="h-3 w-3 inline mr-1" />
              {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground">
            <Eye className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="font-medium mb-2">Street View Not Available</h3>
            <p className="text-sm">
              Street View imagery is not available at this location. 
              This is common in rural areas.
            </p>
            <p className="text-xs mt-2 text-muted-foreground">
              Try selecting a location closer to roads or populated areas.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StreetViewPanel;
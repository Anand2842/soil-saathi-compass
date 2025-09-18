import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Satellite, MapPin, Navigation, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface SatelliteMapProps {
  center?: [number, number];
  zoom?: number;
  style?: string;
  onFieldSelect?: (boundary: any) => void;
  enableFieldMapping?: boolean;
  className?: string;
}

const SatelliteMap: React.FC<SatelliteMapProps> = ({
  center = [77.2090, 28.6139], // Default to Delhi, India
  zoom = 15,
  style = 'mapbox://styles/mapbox/satellite-v9',
  onFieldSelect,
  enableFieldMapping = false,
  className = ""
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fieldPoints, setFieldPoints] = useState<Array<[number, number]>>([]);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Try to get Mapbox token from edge function
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Try to fetch token from edge function
        const response = await fetch('/api/mapbox-token');
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            setMapboxToken(data.token);
            return;
          }
        }
      } catch (error) {
        console.log('Could not fetch token from server');
      }
      
      // Check localStorage as fallback
      const storedToken = localStorage.getItem('mapbox-token');
      if (storedToken) {
        setMapboxToken(storedToken);
      } else {
        setShowTokenInput(true);
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Initialize map when token is available
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current) return;

    try {
      mapboxgl.accessToken = mapboxToken;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: style,
        center: center,
        zoom: zoom,
        pitch: 0,
        bearing: 0
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );

      // Add scale control
      map.current.addControl(new mapboxgl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      // Add click handler for field mapping
      if (enableFieldMapping) {
        map.current.on('click', handleMapClick);
      }

      map.current.on('load', () => {
        setIsLoading(false);
        toast.success('Satellite map loaded successfully!');
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        toast.error('Failed to load satellite map. Please check your token.');
        setShowTokenInput(true);
      });

    } catch (error) {
      console.error('Failed to initialize map:', error);
      toast.error('Invalid Mapbox token. Please enter a valid token.');
      setShowTokenInput(true);
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [mapboxToken, center, zoom, style, enableFieldMapping]);

  const handleMapClick = (e: mapboxgl.MapMouseEvent) => {
    if (!enableFieldMapping) return;

    const coordinates: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    const newPoints = [...fieldPoints, coordinates];
    setFieldPoints(newPoints);

    // Add marker
    const marker = new mapboxgl.Marker({
      color: '#10b981',
      draggable: true
    })
      .setLngLat(coordinates)
      .addTo(map.current!);

    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const index = markersRef.current.indexOf(marker);
      const updatedPoints = [...fieldPoints];
      updatedPoints[index] = [lngLat.lng, lngLat.lat];
      setFieldPoints(updatedPoints);
      updatePolygon(updatedPoints);
    });

    markersRef.current.push(marker);

    // Update polygon if we have at least 3 points
    if (newPoints.length >= 3) {
      updatePolygon(newPoints);
    }
  };

  const updatePolygon = (points: Array<[number, number]>) => {
    if (!map.current || points.length < 3) return;

    const geojson = {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[...points, points[0]]] // Close the polygon
      },
      properties: {}
    };

    // Remove existing polygon layer
    if (map.current.getLayer('field-polygon')) {
      map.current.removeLayer('field-polygon');
    }
    if (map.current.getSource('field-polygon')) {
      map.current.removeSource('field-polygon');
    }

    // Add new polygon
    map.current.addSource('field-polygon', {
      type: 'geojson',
      data: geojson
    });

    map.current.addLayer({
      id: 'field-polygon',
      type: 'fill',
      source: 'field-polygon',
      paint: {
        'fill-color': '#10b981',
        'fill-opacity': 0.3
      }
    });

    map.current.addLayer({
      id: 'field-polygon-outline',
      type: 'line',
      source: 'field-polygon',
      paint: {
        'line-color': '#10b981',
        'line-width': 2
      }
    });

    // Calculate and display area
    const area = turf.area(geojson) / 10000; // Convert to hectares
    toast.success(`Field area: ${area.toFixed(2)} hectares`);

    if (onFieldSelect) {
      onFieldSelect({
        boundary: geojson,
        area: area,
        points: points
      });
    }
  };

  const clearField = () => {
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    setFieldPoints([]);

    // Remove polygon layers
    if (map.current) {
      if (map.current.getLayer('field-polygon')) {
        map.current.removeLayer('field-polygon');
      }
      if (map.current.getLayer('field-polygon-outline')) {
        map.current.removeLayer('field-polygon-outline');
      }
      if (map.current.getSource('field-polygon')) {
        map.current.removeSource('field-polygon');
      }
    }
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken) {
      toast.error('Please enter a valid Mapbox token');
      return;
    }
    
    // Store token in localStorage
    localStorage.setItem('mapbox-token', mapboxToken);
    setShowTokenInput(false);
    setIsLoading(true);
  };

  if (showTokenInput) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Satellite className="h-5 w-5 text-primary" />
            Configure Satellite Map
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/10 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
              <div className="text-sm">
                <p className="font-medium">Mapbox Token Required</p>
                <p className="text-muted-foreground mt-1">
                  To display satellite imagery, please enter your Mapbox public token.
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="password"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your token from{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Mapbox Dashboard
              </a>
            </p>
          </div>
          
          <Button onClick={handleTokenSubmit} className="w-full">
            Load Satellite Map
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {enableFieldMapping && (
        <div className="absolute top-4 left-4 z-10 bg-background/90 backdrop-blur-sm p-3 rounded-lg border shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Field Mapping</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Points: {fieldPoints.length}</div>
            {fieldPoints.length >= 3 && (
              <Badge className="bg-success/10 text-success text-xs">
                Polygon Complete
              </Badge>
            )}
          </div>
          {fieldPoints.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={clearField}
              className="w-full mt-2"
            >
              Clear Field
            </Button>
          )}
        </div>
      )}
      
      <div 
        ref={mapContainer} 
        className="w-full h-full min-h-[400px] rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Satellite className="h-8 w-8 animate-pulse text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading satellite imagery...</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Simple area calculation (replace with turf.js for production)
const turf = {
  area: (geojson: any) => {
    // Simplified area calculation - in production, use @turf/area
    const coords = geojson.geometry.coordinates[0];
    let area = 0;
    
    for (let i = 0; i < coords.length - 1; i++) {
      area += coords[i][0] * coords[i + 1][1];
      area -= coords[i + 1][0] * coords[i][1];
    }
    
    return Math.abs(area / 2) * 111320 * 111320; // Rough conversion to square meters
  }
};

export default SatelliteMap;
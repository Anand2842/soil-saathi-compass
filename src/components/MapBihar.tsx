import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Settings } from 'lucide-react';

const MapBihar = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState(import.meta.env.VITE_MAPBOX_TOKEN || '');
  const [showBoundary, setShowBoundary] = useState(true);
  const [showNDVIOverlay, setShowNDVIOverlay] = useState(false);
  const [mapStyle, setMapStyle] = useState('satellite-v9');
  const [needsToken, setNeedsToken] = useState(!import.meta.env.VITE_MAPBOX_TOKEN);

  // Demo field polygon coordinates (near Pusa, Samastipur, Bihar)
  const demoFieldCoordinates = [
    [85.6699, 25.9856],
    [85.6720, 25.9856],
    [85.6720, 25.9840],
    [85.6699, 25.9840],
    [85.6699, 25.9856]
  ];

  const initializeMap = (token: string) => {
    if (!mapContainer.current || !token) return;

    mapboxgl.accessToken = token;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [85.6709, 25.9848], // Center of demo field
      zoom: 16,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Add scale control
    map.current.addControl(new mapboxgl.ScaleControl({
      maxWidth: 80,
      unit: 'metric'
    }));

    map.current.on('load', () => {
      addFieldBoundary();
      addNDVIHeatmap();
      
      // Add field center marker
      new mapboxgl.Marker({
        color: '#10b981'
      })
      .setLngLat([85.6709, 25.9848])
      .setPopup(new mapboxgl.Popup().setHTML(`
        <div class="p-2">
          <h3 class="font-semibold">Demo Field - Pusa</h3>
          <p class="text-sm text-muted-foreground">Health: 78% (Good)</p>
          <p class="text-sm text-muted-foreground">Area: 2.1 acres</p>
          <p class="text-sm text-muted-foreground">Crop: Paddy (Mid-season)</p>
        </div>
      `))
      .addTo(map.current!);
    });
  };

  const addFieldBoundary = () => {
    if (!map.current) return;

    map.current.addSource('field-boundary', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {
          health: 78,
          area: 2.1,
          crop: 'Paddy'
        },
        geometry: {
          type: 'Polygon',
          coordinates: [demoFieldCoordinates]
        }
      }
    });

    map.current.addLayer({
      id: 'field-boundary-fill',
      type: 'fill',
      source: 'field-boundary',
      paint: {
        'fill-color': '#f59e0b',
        'fill-opacity': showBoundary ? 0.3 : 0
      }
    });

    map.current.addLayer({
      id: 'field-boundary-line',
      type: 'line',
      source: 'field-boundary',
      paint: {
        'line-color': '#f59e0b',
        'line-width': 2,
        'line-opacity': showBoundary ? 1 : 0
      }
    });
  };

  const addNDVIHeatmap = () => {
    if (!map.current) return;

    // Simulate NDVI data points across the field
    const ndviPoints = [];
    for (let i = 0; i < 20; i++) {
      const lng = 85.6699 + Math.random() * 0.0021;
      const lat = 25.9840 + Math.random() * 0.0016;
      const ndviValue = 0.3 + Math.random() * 0.5; // NDVI values between 0.3-0.8
      
      ndviPoints.push({
        type: 'Feature',
        properties: { ndvi: ndviValue },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      });
    }

    map.current.addSource('ndvi-heatmap', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: ndviPoints
      }
    });

    map.current.addLayer({
      id: 'ndvi-heatmap-layer',
      type: 'heatmap',
      source: 'ndvi-heatmap',
      paint: {
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'ndvi'],
          0, 0,
          1, 1
        ],
        'heatmap-intensity': showNDVIOverlay ? 1 : 0,
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0, 'rgba(255,0,0,0)',
          0.2, 'rgb(255,0,0)',
          0.4, 'rgb(255,165,0)',
          0.6, 'rgb(255,255,0)',
          0.8, 'rgb(144,238,144)',
          1, 'rgb(0,128,0)'
        ],
        'heatmap-radius': {
          stops: [
            [11, 15],
            [15, 20]
          ]
        }
      }
    });
  };

  const updateMapStyle = (style: string) => {
    if (map.current) {
      map.current.setStyle(`mapbox://styles/mapbox/${style}`);
      map.current.once('styledata', () => {
        addFieldBoundary();
        addNDVIHeatmap();
      });
    }
  };

  useEffect(() => {
    if (mapboxToken && mapboxToken.trim()) {
      setNeedsToken(false);
      initializeMap(mapboxToken);
    }

    return () => {
      map.current?.remove();
    };
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current) {
      map.current.setPaintProperty('field-boundary-fill', 'fill-opacity', showBoundary ? 0.3 : 0);
      map.current.setPaintProperty('field-boundary-line', 'line-opacity', showBoundary ? 1 : 0);
    }
  }, [showBoundary]);

  useEffect(() => {
    if (map.current) {
      map.current.setPaintProperty('ndvi-heatmap-layer', 'heatmap-intensity', showNDVIOverlay ? 1 : 0);
    }
  }, [showNDVIOverlay]);

  useEffect(() => {
    if (mapStyle && map.current) {
      updateMapStyle(mapStyle);
    }
  }, [mapStyle]);

  if (needsToken) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <MapPin className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Bihar Field Map Setup</h3>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1Ijoi... (your Mapbox public token)"
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Get your free public token from{' '}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                mapbox.com
              </a>
              {' '}→ Account → Access Tokens
            </p>
          </div>
          <Button 
            onClick={() => mapboxToken && setNeedsToken(false)}
            disabled={!mapboxToken.trim()}
          >
            Load Map
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Bihar Field Map - Pusa, Samastipur</h3>
          </div>
          <Settings className="h-4 w-4 text-muted-foreground" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="map-style">Map Style</Label>
            <Select value={mapStyle} onValueChange={setMapStyle}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="satellite-v9">Satellite</SelectItem>
                <SelectItem value="outdoors-v12">Outdoors</SelectItem>
                <SelectItem value="light-v11">Light</SelectItem>
                <SelectItem value="dark-v11">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="field-boundary"
              checked={showBoundary}
              onCheckedChange={setShowBoundary}
            />
            <Label htmlFor="field-boundary">Field Boundary</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="ndvi-overlay"
              checked={showNDVIOverlay}
              onCheckedChange={setShowNDVIOverlay}
            />
            <Label htmlFor="ndvi-overlay">NDVI Heatmap</Label>
          </div>
        </div>
      </Card>

      {/* Map Container */}
      <Card className="p-0 overflow-hidden">
        <div ref={mapContainer} className="h-[500px] w-full" />
      </Card>

      {/* Map Legend */}
      <Card className="p-4">
        <h4 className="font-semibold mb-2">Map Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span>Field Boundary (78% Health)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span>High NDVI (0.7-0.8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded"></div>
            <span>Medium NDVI (0.5-0.7)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>Low NDVI (0.3-0.5)</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MapBihar;
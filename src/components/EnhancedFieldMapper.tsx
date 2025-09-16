import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MapPin, 
  Navigation, 
  Target, 
  Save, 
  RotateCcw,
  Satellite,
  CheckCircle,
  AlertTriangle,
  Search,
  Navigation2,
  Eye,
  Map,
  Crosshair,
  Route,
  Store,
  Camera,
  Layers,
  Settings
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
  }
}

interface GPSPoint {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

interface FieldData {
  boundary: GPSPoint[];
  area: number;
  mappingMode: 'walk' | 'pin';
  createdAt: Date;
  accuracy: number;
  address?: string;
  placeId?: string;
  name?: string;
}

const EnhancedFieldMapper = ({ onComplete }: { onComplete: (fieldData: FieldData) => void }) => {
  const { toast } = useToast();
  
  // State management
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [fieldArea, setFieldArea] = useState(0);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldName, setFieldName] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [showStreetView, setShowStreetView] = useState(false);
  const [mapType, setMapType] = useState('satellite');
  const [nearbyStores, setNearbyStores] = useState<any[]>([]);
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const streetViewRef = useRef<HTMLDivElement>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const streetViewInstanceRef = useRef<any>(null);
  const polygonRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const drawingManagerRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const directionsServiceRef = useRef<any>(null);
  const directionsRendererRef = useRef<any>(null);

  // Load Google Maps with all required libraries
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Google Maps API key not found in environment variables",
        variant: "destructive",
      });
      return;
    }

    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places,drawing&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        setIsMapLoaded(true);
      };
      
      document.head.appendChild(script);
    } else {
      setIsMapLoaded(true);
    }
  }, [toast]);

  // Initialize map when loaded
  useEffect(() => {
    if (isMapLoaded && mapRef.current) {
      initializeMap();
    }
  }, [isMapLoaded]);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google) return;

    // Initialize main map
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
      zoom: 18,
      mapTypeId: window.google.maps.MapTypeId.SATELLITE,
      gestureHandling: 'cooperative',
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: true,
      streetViewControl: true,
      rotateControl: true,
      fullscreenControl: true
    });

    mapInstanceRef.current = map;

    // Initialize services
    placesServiceRef.current = new window.google.maps.places.PlacesService(map);
    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer();
    directionsRendererRef.current.setMap(map);

    // Initialize drawing manager
    drawingManagerRef.current = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          window.google.maps.drawing.OverlayType.POLYGON,
          window.google.maps.drawing.OverlayType.RECTANGLE,
        ]
      },
      polygonOptions: {
        fillColor: '#10b981',
        fillOpacity: 0.3,
        strokeWeight: 2,
        strokeColor: '#10b981',
        clickable: false,
        editable: true,
        zIndex: 1
      }
    });

    drawingManagerRef.current.setMap(map);

    // Handle polygon completion
    drawingManagerRef.current.addListener('polygoncomplete', (polygon: any) => {
      if (polygonRef.current) {
        polygonRef.current.setMap(null);
      }
      polygonRef.current = polygon;
      
      const path = polygon.getPath();
      const points: GPSPoint[] = [];
      
      for (let i = 0; i < path.getLength(); i++) {
        const point = path.getAt(i);
        points.push({
          lat: point.lat(),
          lng: point.lng(),
          accuracy: 1, // High accuracy for drawn polygons
          timestamp: new Date()
        });
      }
      
      setGpsPoints(points);
      calculateArea(polygon);
      drawingManagerRef.current.setDrawingMode(null);
      
      toast({
        title: "Field Boundary Created",
        description: "Field boundary has been drawn successfully",
      });
    });

    // Initialize search box
    if (searchBoxRef.current) {
      const searchBox = new window.google.maps.places.SearchBox(searchBoxRef.current);
      map.controls[window.google.maps.ControlPosition.TOP_LEFT].push(searchBoxRef.current);

      // Bias search results towards map's viewport
      map.addListener('bounds_changed', () => {
        searchBox.setBounds(map.getBounds()!);
      });

      searchBox.addListener('places_changed', () => {
        const places = searchBox.getPlaces();
        if (places?.length === 0) return;

        const place = places[0];
        if (!place.geometry || !place.geometry.location) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        // Create marker for the place
        const marker = new window.google.maps.Marker({
          position: place.geometry.location,
          map: map,
          title: place.name
        });

        markersRef.current.push(marker);

        // Set field name and address
        setFieldName(place.name || '');
        setSelectedAddress(place.formatted_address || '');

        // Adjust map viewport
        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter(place.geometry.location);
          map.setZoom(17);
        }

        // Search for nearby agricultural stores
        searchNearbyStores(place.geometry.location);
      });
    }

    // Initialize Street View
    if (streetViewRef.current) {
      streetViewInstanceRef.current = new window.google.maps.StreetViewPanorama(
        streetViewRef.current,
        {
          position: { lat: 28.6139, lng: 77.2090 },
          pov: { heading: 165, pitch: 0 },
          zoom: 1
        }
      );

      map.setStreetView(streetViewInstanceRef.current);
    }

    // Add click listener for pin mode
    map.addListener('click', (event: any) => {
      if (mappingMode === 'pin') {
        addPointMarker(event.latLng);
      }
    });

    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          map.setCenter(userLocation);
          
          // Add current location marker
          new window.google.maps.Marker({
            position: userLocation,
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 6,
              fillColor: '#4285F4',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            title: 'Your Location'
          });

          toast({
            title: "Location Found",
            description: "Map centered on your current location",
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
          toast({
            title: "Location Access",
            description: "Could not access your location. Please search for your field manually.",
            variant: "destructive",
          });
        }
      );
    }
  }, [mappingMode, toast]);

  const addPointMarker = (position: any) => {
    const newPoint: GPSPoint = {
      lat: position.lat(),
      lng: position.lng(),
      accuracy: 1,
      timestamp: new Date()
    };
    
    const marker = new window.google.maps.Marker({
      position: position,
      map: mapInstanceRef.current,
      draggable: true,
      label: (gpsPoints.length + 1).toString()
    });

    marker.addListener('dragend', (event: any) => {
      const updatedPoints = [...gpsPoints];
      const index = markersRef.current.indexOf(marker);
      if (index !== -1) {
        updatedPoints[index] = {
          ...updatedPoints[index],
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        setGpsPoints(updatedPoints);
        updatePolygon(updatedPoints);
      }
    });

    markersRef.current.push(marker);
    const updatedPoints = [...gpsPoints, newPoint];
    setGpsPoints(updatedPoints);
    updatePolygon(updatedPoints);

    toast({
      title: "Point Added",
      description: `Added point ${updatedPoints.length}. ${updatedPoints.length >= 3 ? 'You can now save the field.' : `Add ${3 - updatedPoints.length} more points.`}`,
    });
  };

  const updatePolygon = (points: GPSPoint[]) => {
    if (!mapInstanceRef.current || points.length < 3) return;

    if (polygonRef.current) {
      polygonRef.current.setMap(null);
    }

    const path = points.map(p => ({ lat: p.lat, lng: p.lng }));
    
    polygonRef.current = new window.google.maps.Polygon({
      paths: path,
      strokeColor: '#10b981',
      strokeOpacity: 1,
      strokeWeight: 2,
      fillColor: '#10b981',
      fillOpacity: 0.3,
      map: mapInstanceRef.current,
      editable: true
    });

    calculateArea(polygonRef.current);
  };

  const calculateArea = (polygon: any) => {
    if (!polygon) return;
    
    const area = window.google.maps.geometry.spherical.computeArea(polygon.getPath());
    setFieldArea(area / 10000); // Convert to hectares
  };

  const searchNearbyStores = (location: any) => {
    if (!placesServiceRef.current) return;

    const request = {
      location: location,
      radius: 10000, // 10km radius
      keyword: 'agricultural supplies farm equipment fertilizer seeds'
    };

    placesServiceRef.current.nearbySearch(request, (results: any, status: any) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        setNearbyStores(results.slice(0, 5)); // Limit to 5 results
        
        // Add markers for stores
        results.slice(0, 5).forEach((place: any, index: number) => {
          const marker = new window.google.maps.Marker({
            position: place.geometry.location,
            map: mapInstanceRef.current,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            },
            title: place.name
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div>
                <h4>${place.name}</h4>
                <p>Rating: ${place.rating || 'N/A'}/5</p>
                <p>${place.vicinity}</p>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(mapInstanceRef.current, marker);
          });
        });
      }
    });
  };

  const getDirections = (destination: any) => {
    if (!directionsServiceRef.current || !currentLocation) return;

    const request = {
      origin: new window.google.maps.LatLng(currentLocation.lat, currentLocation.lng),
      destination: destination.geometry.location,
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    directionsServiceRef.current.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRendererRef.current.setDirections(result);
        toast({
          title: "Directions Loaded",
          description: `Route to ${destination.name} displayed on map`,
        });
      }
    });
  };

  // GPS tracking simulation (enhanced)
  useEffect(() => {
    if (isRecording && mappingMode === 'walk') {
      const watchId = navigator.geolocation?.watchPosition(
        (position) => {
          const newPoint: GPSPoint = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          };
          
          setCurrentLocation(newPoint);
          
          // Add point if moved enough distance
          if (gpsPoints.length === 0 || 
              getDistance(newPoint, gpsPoints[gpsPoints.length - 1]) > 5) {
            setGpsPoints(prev => [...prev, newPoint]);
            
            // Add marker
            const marker = new window.google.maps.Marker({
              position: { lat: newPoint.lat, lng: newPoint.lng },
              map: mapInstanceRef.current,
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 4,
                fillColor: '#10b981',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 1
              }
            });

            markersRef.current.push(marker);
          }
        },
        (error) => {
          console.error('GPS tracking error:', error);
          // Fallback to simulation
          simulateGPSTracking();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000
        }
      );

      return () => {
        if (watchId && navigator.geolocation) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    }
  }, [isRecording, mappingMode, gpsPoints]);

  const simulateGPSTracking = () => {
    const interval = setInterval(() => {
      const baseLocation = gpsPoints.length > 0 
        ? gpsPoints[gpsPoints.length - 1] 
        : { lat: 28.6139, lng: 77.2090 };
      
      const newPoint: GPSPoint = {
        lat: baseLocation.lat + (Math.random() - 0.5) * 0.0001,
        lng: baseLocation.lng + (Math.random() - 0.5) * 0.0001,
        accuracy: Math.random() * 5 + 3,
        timestamp: new Date()
      };
      
      setCurrentLocation(newPoint);
      if (gpsPoints.length === 0 || 
          getDistance(newPoint, gpsPoints[gpsPoints.length - 1]) > 5) {
        setGpsPoints(prev => [...prev, newPoint]);
      }
    }, 2000);

    return () => clearInterval(interval);
  };

  const getDistance = (p1: GPSPoint, p2: GPSPoint) => {
    const R = 6371e3;
    const φ1 = p1.lat * Math.PI/180;
    const φ2 = p2.lat * Math.PI/180;
    const Δφ = (p2.lat-p1.lat) * Math.PI/180;
    const Δλ = (p2.lng-p1.lng) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  };

  const startRecording = () => {
    setIsRecording(true);
    setGpsPoints([]);
    clearMapElements();
    toast({
      title: "GPS Recording Started",
      description: "Walk around your field boundary",
    });
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (gpsPoints.length >= 3) {
      updatePolygon(gpsPoints);
    }
    toast({
      title: "GPS Recording Stopped",
      description: `Recorded ${gpsPoints.length} GPS points`,
    });
  };

  const clearMapElements = () => {
    setGpsPoints([]);
    setFieldArea(0);
    setIsRecording(false);
    
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    if (polygonRef.current) {
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections({ routes: [] });
    }
  };

  const updateMapType = (type: string) => {
    if (!mapInstanceRef.current) return;
    
    const mapTypeMap: { [key: string]: any } = {
      satellite: window.google.maps.MapTypeId.SATELLITE,
      roadmap: window.google.maps.MapTypeId.ROADMAP,
      hybrid: window.google.maps.MapTypeId.HYBRID,
      terrain: window.google.maps.MapTypeId.TERRAIN
    };
    
    mapInstanceRef.current.setMapTypeId(mapTypeMap[type] || mapTypeMap.satellite);
  };

  const saveField = () => {
    if (gpsPoints.length < 3) {
      toast({
        title: "Insufficient Points",
        description: "Please add at least 3 points to create a field boundary",
        variant: "destructive",
      });
      return;
    }

    const fieldData: FieldData = {
      boundary: gpsPoints,
      area: fieldArea,
      mappingMode: mappingMode!,
      createdAt: new Date(),
      accuracy: gpsPoints.reduce((sum, p) => sum + p.accuracy, 0) / gpsPoints.length,
      address: selectedAddress,
      name: fieldName
    };

    onComplete(fieldData);
    toast({
      title: "Field Saved Successfully",
      description: `Field "${fieldName}" with ${fieldArea.toFixed(2)} hectares saved`,
    });
  };

  useEffect(() => {
    if (isMapLoaded) {
      updateMapType(mapType);
    }
  }, [mapType, isMapLoaded]);

  if (!isMapLoaded) {
    return (
      <div className="min-h-screen bg-background p-4">
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5" />
              <h3 className="text-lg font-semibold">Loading Enhanced Field Mapper...</h3>
            </div>
            <div className="bg-muted rounded-lg h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Satellite className="h-12 w-12 text-muted-foreground mx-auto mb-2 animate-pulse" />
                <p className="text-muted-foreground">Initializing Google Maps with all features...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Enhanced Field Mapper - Google Maps Pro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Professional field mapping with satellite imagery, GPS tracking, location search, and navigation
            </p>
          </CardContent>
        </Card>

        <Tabs value={mappingMode || "select"} onValueChange={(value) => setMappingMode(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="select">Select Method</TabsTrigger>
            <TabsTrigger value="pin">Pin on Map</TabsTrigger>
            <TabsTrigger value="walk">GPS Walk</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setMappingMode('pin')}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <Target className="h-12 w-12 text-primary mx-auto mb-2" />
                    <h3 className="font-semibold">Interactive Satellite Mapping</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Draw boundaries on high-resolution satellite imagery with drawing tools
                    </p>
                    <Badge className="mt-2 bg-accent/10 text-accent">
                      Most Popular
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => setMappingMode('walk')}
              >
                <CardContent className="p-6">
                  <div className="text-center">
                    <Navigation className="h-12 w-12 text-success mx-auto mb-2" />
                    <h3 className="font-semibold">GPS Boundary Walking</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Walk around your field with high-accuracy GPS tracking
                    </p>
                    <Badge className="mt-2 bg-success/10 text-success">
                      Most Accurate
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pin" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              {/* Map Controls Panel */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Map Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Field Information */}
                  <div className="space-y-2">
                    <Label htmlFor="field-name">Field Name</Label>
                    <Input
                      id="field-name"
                      placeholder="Enter field name"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                    />
                  </div>

                  {/* Location Search */}
                  <div className="space-y-2">
                    <Label>Search Location</Label>
                    <Input
                      ref={searchBoxRef}
                      placeholder="Search for your field location"
                      className="w-full"
                    />
                  </div>

                  {/* Map Type */}
                  <div className="space-y-2">
                    <Label>Map Type</Label>
                    <Select value={mapType} onValueChange={setMapType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                        <SelectItem value="roadmap">Roadmap</SelectItem>
                        <SelectItem value="terrain">Terrain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Street View Toggle */}
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="street-view"
                      checked={showStreetView}
                      onCheckedChange={setShowStreetView}
                    />
                    <Label htmlFor="street-view">Street View</Label>
                  </div>

                  {/* Field Stats */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Points:</span>
                      <Badge>{gpsPoints.length}</Badge>
                    </div>
                    {fieldArea > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Area:</span>
                        <Badge className="bg-success/10 text-success">
                          {fieldArea.toFixed(2)} ha
                        </Badge>
                      </div>
                    )}
                    {selectedAddress && (
                      <div className="text-xs text-muted-foreground">
                        📍 {selectedAddress}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-4">
                    <Button onClick={clearMapElements} variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                    {gpsPoints.length >= 3 && (
                      <Button onClick={saveField} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Field ({fieldArea.toFixed(2)} ha)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map Container */}
              <Card className="lg:col-span-3">
                <CardContent className="p-0">
                  <div className={showStreetView ? "grid grid-rows-2 h-[600px]" : "h-[600px]"}>
                    <div ref={mapRef} className="w-full h-full" />
                    {showStreetView && (
                      <div ref={streetViewRef} className="w-full h-full border-t" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Nearby Stores */}
            {nearbyStores.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    Nearby Agricultural Supplies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {nearbyStores.map((store, index) => (
                      <Card key={index} className="p-4">
                        <h4 className="font-semibold">{store.name}</h4>
                        <p className="text-sm text-muted-foreground">{store.vicinity}</p>
                        <div className="flex items-center justify-between mt-2">
                          <Badge variant="outline">
                            ⭐ {store.rating || 'N/A'}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => getDirections(store)}
                          >
                            <Route className="h-4 w-4 mr-1" />
                            Directions
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="walk" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* GPS Control Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Navigation className="h-5 w-5" />
                      GPS Tracking
                    </span>
                    <Badge variant={isRecording ? "default" : "outline"}>
                      {isRecording ? 'Recording' : 'Stopped'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Field Name */}
                  <div className="space-y-2">
                    <Label htmlFor="field-name-walk">Field Name</Label>
                    <Input
                      id="field-name-walk"
                      placeholder="Enter field name"
                      value={fieldName}
                      onChange={(e) => setFieldName(e.target.value)}
                    />
                  </div>

                  {/* Current Location */}
                  {currentLocation && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span>Current Location:</span>
                        <Badge variant="outline">
                          ±{currentLocation.accuracy.toFixed(1)}m
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm">GPS Points:</span>
                    <Badge>{gpsPoints.length}</Badge>
                  </div>

                  {fieldArea > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Area:</span>
                      <Badge className="bg-success/10 text-success">
                        {fieldArea.toFixed(2)} hectares
                      </Badge>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-accent/10 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium">GPS Walking Instructions:</p>
                        <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                          <li>• Walk slowly around field perimeter</li>
                          <li>• Keep device steady and upright</li>
                          <li>• Stay close to the field edge</li>
                          <li>• Complete full perimeter for accuracy</li>
                          <li>• GPS works best in open areas</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-2">
                    {!isRecording ? (
                      <Button onClick={startRecording} className="w-full">
                        <Navigation className="h-4 w-4 mr-2" />
                        Start GPS Recording
                      </Button>
                    ) : (
                      <Button onClick={stopRecording} variant="destructive" className="w-full">
                        <Target className="h-4 w-4 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                    
                    <Button onClick={clearMapElements} variant="outline" className="w-full">
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Clear Points
                    </Button>

                    {gpsPoints.length >= 3 && (
                      <Button onClick={saveField} className="w-full">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Save Field ({fieldArea.toFixed(2)} ha)
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Map Display */}
              <Card className="lg:col-span-2">
                <CardContent className="p-0">
                  <div ref={mapRef} className="w-full h-[500px]" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Back to Method Selection */}
        {mappingMode && (
          <Button 
            onClick={() => setMappingMode(null)} 
            variant="outline" 
            className="w-full"
          >
            Choose Different Method
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedFieldMapper;
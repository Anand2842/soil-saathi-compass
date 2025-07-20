
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Target, 
  Save, 
  RotateCcw,
  Satellite,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface GPSPoint {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: Date;
}

const FieldMapper = ({ onComplete }: { onComplete: (fieldData: any) => void }) => {
  const [mappingMode, setMappingMode] = useState<'walk' | 'pin' | null>(null);
  const [gpsPoints, setGpsPoints] = useState<GPSPoint[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<GPSPoint | null>(null);
  const [fieldArea, setFieldArea] = useState(0);

  // Simulate GPS tracking
  useEffect(() => {
    if (isRecording && mappingMode === 'walk') {
      const interval = setInterval(() => {
        // Simulate GPS coordinates (in a real app, this would use navigator.geolocation)
        const baseLocation = gpsPoints.length > 0 
          ? gpsPoints[gpsPoints.length - 1] 
          : { lat: 28.6139, lng: 77.2090 };
        
        const newPoint: GPSPoint = {
          lat: baseLocation.lat + (Math.random() - 0.5) * 0.001,
          lng: baseLocation.lng + (Math.random() - 0.5) * 0.001,
          accuracy: Math.random() * 10 + 3, // 3-13 meters
          timestamp: new Date()
        };
        
        setCurrentLocation(newPoint);
        if (gpsPoints.length === 0 || 
            getDistance(newPoint, gpsPoints[gpsPoints.length - 1]) > 10) {
          setGpsPoints(prev => [...prev, newPoint]);
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isRecording, mappingMode, gpsPoints]);

  // Calculate distance between two GPS points
  const getDistance = (p1: GPSPoint, p2: GPSPoint) => {
    const R = 6371e3; // Earth's radius in meters
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

  // Calculate approximate field area
  useEffect(() => {
    if (gpsPoints.length >= 3) {
      // Simplified area calculation (in a real app, use proper polygon area calculation)
      const area = gpsPoints.length * 0.1; // Rough estimate in hectares
      setFieldArea(area);
    }
  }, [gpsPoints]);

  const startRecording = () => {
    setIsRecording(true);
    setGpsPoints([]);
  };

  const stopRecording = () => {
    setIsRecording(false);
  };

  const clearPoints = () => {
    setGpsPoints([]);
    setFieldArea(0);
    setIsRecording(false);
  };

  const saveField = () => {
    const fieldData = {
      boundary: gpsPoints,
      area: fieldArea,
      mappingMode,
      createdAt: new Date(),
      accuracy: gpsPoints.reduce((sum, p) => sum + p.accuracy, 0) / gpsPoints.length
    };
    onComplete(fieldData);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Map Your Field
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose how you want to create your field boundary
            </p>
          </CardContent>
        </Card>

        {/* Mapping Mode Selection */}
        {!mappingMode && (
          <div className="grid grid-cols-1 gap-4">
            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('walk')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <Navigation className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="font-semibold">Walk the Boundary</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Walk around your field perimeter with GPS tracking
                  </p>
                  <Badge className="mt-2 bg-success/10 text-success">
                    Most Accurate
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => setMappingMode('pin')}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <Target className="h-12 w-12 text-accent mx-auto mb-2" />
                  <h3 className="font-semibold">Pin on Map</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mark field corners by tapping on satellite map
                  </p>
                  <Badge className="mt-2 bg-accent/10 text-accent">
                    Quick & Easy
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Walk Mode Interface */}
        {mappingMode === 'walk' && (
          <div className="space-y-4">
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

                {/* Points Collected */}
                <div className="flex items-center justify-between">
                  <span className="text-sm">Points Collected:</span>
                  <Badge>{gpsPoints.length}</Badge>
                </div>

                {/* Estimated Area */}
                {fieldArea > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Estimated Area:</span>
                    <Badge className="bg-success/10 text-success">
                      {fieldArea.toFixed(2)} hectares
                    </Badge>
                  </div>
                )}

                {/* Recording Instructions */}
                <div className="bg-accent/10 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-accent mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">Instructions:</p>
                      <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                        <li>• Walk slowly around field boundary</li>
                        <li>• Keep phone steady and upright</li>
                        <li>• Stay close to the actual field edge</li>
                        <li>• Complete the full perimeter</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls */}
            <div className="grid grid-cols-2 gap-3">
              {!isRecording ? (
                <Button onClick={startRecording} className="flex items-center gap-2">
                  <Navigation className="h-4 w-4" />
                  Start Recording
                </Button>
              ) : (
                <Button onClick={stopRecording} variant="destructive" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Stop Recording
                </Button>
              )}
              
              <Button onClick={clearPoints} variant="outline" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Pin Mode Interface */}
        {mappingMode === 'pin' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Satellite className="h-5 w-5" />
                  Satellite Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-accent/20"></div>
                  <div className="text-center z-10">
                    <Target className="h-12 w-12 text-primary mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Tap to mark field corners</p>
                    <p className="text-xs text-muted-foreground">
                      Satellite imagery loading...
                    </p>
                  </div>
                  
                  {/* Mock field markers */}
                  <div className="absolute top-8 left-8 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                  <div className="absolute top-12 right-12 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                  <div className="absolute bottom-8 left-16 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                  <div className="absolute bottom-12 right-8 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                </div>
                
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span>Corners marked: 4</span>
                  <Badge className="bg-success/10 text-success">
                    1.8 hectares
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Save Button */}
        {mappingMode && (gpsPoints.length >= 3 || mappingMode === 'pin') && (
          <Button onClick={saveField} className="w-full flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Save Field Boundary
          </Button>
        )}

        {/* Back Button */}
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

export default FieldMapper;

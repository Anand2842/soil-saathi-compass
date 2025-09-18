
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2,
  Sprout
} from "lucide-react";
import SatelliteMap from "./SatelliteMap";
import { fieldService } from "@/lib/fieldService";
import { toast } from "sonner";

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
  const [isLoading, setIsLoading] = useState(false);
  const [showFieldForm, setShowFieldForm] = useState(false);
  
  // Field form data
  const [fieldData, setFieldData] = useState({
    name: '',
    crop_type: '' as any,
    crop_variety: '',
    planting_date: '',
    expected_harvest_date: ''
  });

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

  const saveField = async () => {
    if (!fieldData.name || !fieldData.crop_type) {
      toast.error('Please fill in all required field details');
      return;
    }

    setIsLoading(true);
    try {
      // Create GeoJSON boundary from GPS points or mock data
      const boundary = {
        type: "Polygon",
        coordinates: [mappingMode === 'walk' ? 
          [...gpsPoints.map(p => [p.lng, p.lat]), [gpsPoints[0].lng, gpsPoints[0].lat]] :
          [
            [77.2090, 28.6139],
            [77.2100, 28.6139], 
            [77.2100, 28.6149],
            [77.2090, 28.6149],
            [77.2090, 28.6139]
          ]
        ]
      };

      // Create field in database
      const { data: newField, error } = await fieldService.createField({
        name: fieldData.name,
        crop_type: fieldData.crop_type,
        crop_variety: fieldData.crop_variety,
        area_hectares: fieldArea || 2.5,
        boundary: boundary,
        planting_date: fieldData.planting_date,
        expected_harvest_date: fieldData.expected_harvest_date
      });

      if (error) throw error;

      toast.success('Field created successfully!');

      // Trigger initial satellite analysis
      try {
        await fieldService.triggerAnalysis(
          newField.id, 
          boundary, 
          fieldData.crop_type, 
          fieldData.planting_date
        );
        toast.success('Satellite analysis initiated!');
      } catch (analysisError) {
        console.error('Analysis trigger failed:', analysisError);
        toast.warning('Field created, but analysis failed to start');
      }

      onComplete(newField);
    } catch (error: any) {
      console.error('Field creation error:', error);
      toast.error(error.message || 'Failed to create field');
    } finally {
      setIsLoading(false);
    }
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
                  Satellite Field Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <SatelliteMap 
                    center={[77.2090, 28.6139]} // Default Delhi coordinates
                    zoom={18}
                    style="mapbox://styles/mapbox/satellite-v9"
                    enableFieldMapping={true}
                    onFieldSelect={(fieldData) => {
                      setFieldArea(fieldData.area);
                      console.log('Field selected:', fieldData);
                    }}
                    className="w-full h-full"
                  />
                </div>
                
                <div className="flex justify-between items-center mt-3 text-sm">
                  <span>Interactive satellite mapping</span>
                  {fieldArea > 0 && (
                    <Badge className="bg-success/10 text-success">
                      {fieldArea.toFixed(2)} hectares
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Click on the satellite map to mark field corners. Drag markers to adjust position.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Field Details Form */}
        {(mappingMode && (gpsPoints.length >= 3 || mappingMode === 'pin')) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-primary" />
                Field Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Field Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., North Field, Plot 1"
                  value={fieldData.name}
                  onChange={(e) => setFieldData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop_type">Crop Type *</Label>
                <Select onValueChange={(value) => setFieldData(prev => ({ ...prev, crop_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat (गेहूं)</SelectItem>
                    <SelectItem value="rice">Rice (चावल)</SelectItem>
                    <SelectItem value="maize">Maize (मकई)</SelectItem>
                    <SelectItem value="sugarcane">Sugarcane (गन्ना)</SelectItem>
                    <SelectItem value="soybean">Soybean (सोयाबीन)</SelectItem>
                    <SelectItem value="cotton">Cotton (कपास)</SelectItem>
                    <SelectItem value="potato">Potato (आलू)</SelectItem>
                    <SelectItem value="tomato">Tomato (टमाटर)</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop_variety">Crop Variety (Optional)</Label>
                <Input
                  id="crop_variety"
                  placeholder="e.g., HD-2967, Basmati"
                  value={fieldData.crop_variety}
                  onChange={(e) => setFieldData(prev => ({ ...prev, crop_variety: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="planting_date">Planting Date</Label>
                  <Input
                    id="planting_date"
                    type="date"
                    value={fieldData.planting_date}
                    onChange={(e) => setFieldData(prev => ({ ...prev, planting_date: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expected_harvest_date">Expected Harvest</Label>
                  <Input
                    id="expected_harvest_date"
                    type="date"
                    value={fieldData.expected_harvest_date}
                    onChange={(e) => setFieldData(prev => ({ ...prev, expected_harvest_date: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Save Button */}
        {mappingMode && (gpsPoints.length >= 3 || mappingMode === 'pin') && (
          <Button 
            onClick={saveField} 
            className="w-full flex items-center gap-2"
            disabled={isLoading || !fieldData.name || !fieldData.crop_type}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isLoading ? 'Creating Field...' : 'Create Field & Start Analysis'}
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

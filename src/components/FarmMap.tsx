import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Cloud, CloudRain, Sun, Zap, CheckCircle, XCircle, AlertCircle, Satellite, ExternalLink, MapPin, RefreshCw, Download, Calendar } from "lucide-react";
import GoogleMap from "./GoogleMap";
import EnhancedFieldMapper from "./EnhancedFieldMapper";
import LocationSearch from "./LocationSearch";
import StreetViewPanel from "./StreetViewPanel";

const FarmMap = () => {
  const satelliteData = [
    { 
      source: "Sentinel-2", 
      date: "2024-01-15", 
      cloudCover: 5, 
      resolution: "10m", 
      status: "excellent",
      quality: 95
    },
    { 
      source: "PlanetScope", 
      date: "2024-01-14", 
      cloudCover: 15, 
      resolution: "3m", 
      status: "good",
      quality: 85
    },
    { 
      source: "Sentinel-1", 
      date: "2024-01-13", 
      cloudCover: 0, 
      resolution: "10m", 
      status: "radar",
      quality: 90
    },
    { 
      source: "NISAR (Upcoming)", 
      date: "2024-12-01", 
      cloudCover: 0, 
      resolution: "3m", 
      status: "upcoming",
      quality: 98,
      note: "NASA-ISRO mission launching Dec 2024"
    }
  ];

  const fieldZones = [
    { id: 1, name: "North Field", health: 92, area: 0.8, color: "success" },
    { id: 2, name: "Central Field", health: 75, area: 1.2, color: "warning" },
    { id: 3, name: "South Field", health: 88, area: 0.5, color: "success" }
  ];

  const getCloudIcon = (coverage: number) => {
    if (coverage < 10) return <Sun className="h-4 w-4 text-warning" />;
    if (coverage < 30) return <Cloud className="h-4 w-4 text-muted-foreground" />;
    return <CloudRain className="h-4 w-4 text-muted-foreground" />;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      excellent: "bg-success/20 text-success",
      good: "bg-accent/20 text-accent", 
      radar: "bg-primary/20 text-primary",
      upcoming: "bg-purple-100 text-purple-700"
    };
    return styles[status] || "bg-muted/20 text-muted-foreground";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Satellite Farm Analysis
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" variant="outline">
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="map">Bihar Field Map</TabsTrigger>
            <TabsTrigger value="mapper">Field Mapper Pro</TabsTrigger>
            <TabsTrigger value="conceptual">Conceptual Map</TabsTrigger>
            <TabsTrigger value="satellite">Satellite Data</TabsTrigger>
            <TabsTrigger value="zones">Health Zones</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <GoogleMap />
          </TabsContent>

          <TabsContent value="mapper" className="space-y-4">
            <EnhancedFieldMapper onComplete={(fieldData) => {
              console.log('Field mapping completed:', fieldData);
              // Handle field data saving here
            }} />
          </TabsContent>

          <TabsContent value="conceptual" className="space-y-4">
            {/* Enhanced Map Visualization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Data from: Jan 15, 2024</span>
                </div>
                <Select defaultValue="ndvi">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ndvi">NDVI</SelectItem>
                    <SelectItem value="ndre">NDRE</SelectItem>
                    <SelectItem value="ndmi">NDMI</SelectItem>
                    <SelectItem value="msavi2">MSAVI2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-muted rounded-lg h-72 flex items-center justify-center relative overflow-hidden">
                {/* Color-coded field visualization */}
                <div className="absolute inset-0 bg-gradient-to-br from-success/30 via-warning/20 to-success/25"></div>
                
                {/* Field boundaries with health indicators */}
                <div className="absolute top-6 left-6 w-24 h-20 border-2 border-success rounded opacity-80 bg-success/20">
                  <div className="absolute -top-6 left-0 text-xs bg-success text-white px-2 py-1 rounded">92%</div>
                </div>
                <div className="absolute top-8 right-8 w-20 h-24 border-2 border-warning rounded opacity-80 bg-warning/20">
                  <div className="absolute -top-6 right-0 text-xs bg-warning text-white px-2 py-1 rounded">75%</div>
                </div>
                <div className="absolute bottom-6 left-12 w-28 h-16 border-2 border-success rounded opacity-80 bg-success/20">
                  <div className="absolute -bottom-6 left-0 text-xs bg-success text-white px-2 py-1 rounded">88%</div>
                </div>

                <div className="text-center z-10">
                  <Satellite className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Health-Coded Field Map</p>
                  <p className="text-xs text-muted-foreground">GPS: 25.5941°N, 85.1376°E (Patna, Bihar)</p>
                </div>
              </div>

              {/* Map Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-success rounded"></div>
                  <span>Healthy (&gt;85%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-warning rounded"></div>
                  <span>Monitor (70-85%)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-destructive rounded"></div>
                  <span>Critical (&lt;70%)</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="satellite" className="space-y-4">
            {/* NISAR Upcoming Section */}
            <Card className="border-2 border-dashed border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Satellite className="h-6 w-6 text-primary" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        NISAR (Upcoming)
                        <Badge variant="secondary" className="bg-primary/10 text-primary">Coming Soon</Badge>
                      </CardTitle>
                      <CardDescription>NASA-ISRO L/S-band SAR Satellite Mission</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-sm mb-2">What is NISAR?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• NASA-ISRO collaborative mission</li>
                        <li>• L-band & S-band SAR (all-weather imaging)</li>
                        <li>• 12-day repeat cycle, day-night coverage</li>
                        <li>• Penetrates clouds, works during monsoon</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Why Farmers Care?</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Reliable observations during cloudy weather</li>
                        <li>• Better soil moisture & biomass signals</li>
                        <li>• Earlier stress detection (7-10 days advance)</li>
                        <li>• More accurate zone mapping</li>
                      </ul>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">How it improves Soil Saathi:</h4>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Higher alert reliability</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Reduced false positives</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>More stable AI confidence</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <Badge variant="outline" className="text-xs">Expected Launch: 2024-2025</Badge>
                    <a 
                      href="https://nisar.jpl.nasa.gov/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Learn more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Existing Satellite Data */}
            <div className="space-y-3">
              {satelliteData.map((data, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Satellite className="h-4 w-4" />
                      <span className="font-medium">{data.source}</span>
                      <Badge className={getStatusBadge(data.status)} variant="secondary">
                        {data.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                      {getCloudIcon(data.cloudCover)}
                      <span className="text-sm">{data.cloudCover}%</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Date:</span>
                      <p className="font-medium">{data.date}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Resolution:</span>
                      <p className="font-medium">{data.resolution}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Quality:</span>
                      <p className="font-medium">{data.quality}%</p>
                    </div>
                  </div>
                  
                   {data.note && (
                     <div className="text-xs text-purple-600 bg-purple-50 p-2 rounded mt-2">
                       📡 {data.note}
                     </div>
                   )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            <div className="space-y-3">
              {fieldZones.map((zone) => (
                <div key={zone.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{zone.name}</span>
                    <Badge className={`bg-${zone.color}/20 text-${zone.color}`} variant="secondary">
                      {zone.health}% Health
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Area:</span>
                      <p className="font-medium">{zone.area} hectares</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <p className="font-medium">{zone.health > 85 ? 'Excellent' : zone.health > 70 ? 'Good' : 'Needs Attention'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Farm Summary Stats */}
        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-success/10 p-3 rounded-lg">
            <p className="text-sm font-medium text-success">Average Health</p>
            <p className="text-xl font-bold">85%</p>
          </div>
          <div className="bg-accent/10 p-3 rounded-lg">
            <p className="text-sm font-medium text-accent">Total Area</p>
            <p className="text-xl font-bold">2.5 ha</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmMap;
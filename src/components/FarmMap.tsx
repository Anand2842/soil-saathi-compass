import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Satellite, TrendingUp, Cloud, CloudRain, Sun, Calendar, Download, RefreshCw } from "lucide-react";

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
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="map">Field Map</TabsTrigger>
            <TabsTrigger value="satellite">Satellite Data</TabsTrigger>
            <TabsTrigger value="zones">Health Zones</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Satellite, TrendingUp } from "lucide-react";

const FarmMap = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Farm Boundary Map
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Map Placeholder */}
          <div className="bg-muted rounded-lg h-64 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-success/20 to-accent/20"></div>
            <div className="text-center z-10">
              <Satellite className="h-12 w-12 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Interactive Farm Map</p>
              <p className="text-xs text-muted-foreground">GPS Coordinates: 28.6139°N, 77.2090°E</p>
            </div>
            
            {/* Mock field boundaries */}
            <div className="absolute top-8 left-8 w-20 h-16 border-2 border-primary rounded opacity-60"></div>
            <div className="absolute top-12 right-12 w-16 h-20 border-2 border-accent rounded opacity-60"></div>
            <div className="absolute bottom-8 left-16 w-24 h-12 border-2 border-success rounded opacity-60"></div>
          </div>

          {/* Farm Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-success/10 p-3 rounded-lg">
              <p className="text-sm font-medium text-success">Total Area</p>
              <p className="text-xl font-bold">2.5 hectares</p>
            </div>
            <div className="bg-accent/10 p-3 rounded-lg">
              <p className="text-sm font-medium text-accent">Crop Type</p>
              <p className="text-xl font-bold">Wheat</p>
            </div>
          </div>

          <Button className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            View Satellite Analysis
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmMap;
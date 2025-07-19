import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";

const VegetationIndices = () => {
  const indices = [
    { 
      name: "NDVI", 
      value: 0.75, 
      change: "+5%", 
      trend: "up", 
      description: "Normalized Difference Vegetation Index",
      status: "Healthy"
    },
    { 
      name: "MSAVI2", 
      value: 0.68, 
      change: "+2%", 
      trend: "up", 
      description: "Modified Soil Adjusted Vegetation Index",
      status: "Good"
    },
    { 
      name: "NDRE", 
      value: 0.45, 
      change: "-3%", 
      trend: "down", 
      description: "Normalized Difference Red Edge",
      status: "Monitor"
    },
    { 
      name: "NDMI", 
      value: 0.52, 
      change: "0%", 
      trend: "stable", 
      description: "Normalized Difference Moisture Index",
      status: "Stable"
    }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Healthy":
        return "bg-success/10 text-success";
      case "Good":
        return "bg-accent/10 text-accent";
      case "Monitor":
        return "bg-warning/10 text-warning";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Vegetation Indices
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {indices.map((index) => (
            <div key={index.name} className="p-4 border rounded-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{index.name}</h4>
                    <Badge className={getStatusColor(index.status)} variant="secondary">
                      {index.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{index.description}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <span className="text-2xl font-bold">{index.value}</span>
                    {getTrendIcon(index.trend)}
                  </div>
                  <span className="text-sm text-muted-foreground">{index.change}</span>
                </div>
              </div>
              
              {/* Visual indicator bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary rounded-full h-2 transition-all duration-300"
                  style={{ width: `${index.value * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              📅 Last updated: Today at 10:30 AM
            </p>
            <p className="text-sm text-muted-foreground">
              🛰️ Data source: Sentinel-2 satellite imagery
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VegetationIndices;
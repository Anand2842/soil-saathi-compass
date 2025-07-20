import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Lightbulb, Target, Crop } from "lucide-react";

const VegetationIndices = () => {
  // Enhanced indices with growth stage context and recommendations
  const indices = [
    { 
      name: "NDVI", 
      value: 0.75, 
      change: "+5%", 
      trend: "up", 
      description: "Normalized Difference Vegetation Index",
      status: "Healthy",
      optimal: { min: 0.7, max: 0.9 },
      growthStage: "Flowering",
      recommendation: "Maintain current irrigation schedule",
      priority: "high"
    },
    { 
      name: "MSAVI2", 
      value: 0.68, 
      change: "+2%", 
      trend: "up", 
      description: "Modified Soil Adjusted Vegetation Index",
      status: "Good",
      optimal: { min: 0.6, max: 0.8 },
      growthStage: "Vegetative",
      recommendation: "Good early growth, continue nutrients",
      priority: "medium"
    },
    { 
      name: "NDRE", 
      value: 0.45, 
      change: "-3%", 
      trend: "down", 
      description: "Normalized Difference Red Edge",
      status: "Monitor",
      optimal: { min: 0.5, max: 0.7 },
      growthStage: "Pre-harvest",
      recommendation: "Apply foliar nitrogen spray",
      priority: "high"
    },
    { 
      name: "NDMI", 
      value: 0.52, 
      change: "0%", 
      trend: "stable", 
      description: "Normalized Difference Moisture Index",
      status: "Stable",
      optimal: { min: 0.4, max: 0.8 },
      growthStage: "All stages",
      recommendation: "Water stress moderate, monitor closely",
      priority: "medium"
    },
    {
      name: "SOC_VIS",
      value: 0.35,
      change: "+8%",
      trend: "up",
      description: "Soil Organic Carbon Visible",
      status: "Improving",
      optimal: { min: 0.3, max: 0.6 },
      growthStage: "Bare soil",
      recommendation: "Good soil health improvement",
      priority: "low"
    },
    {
      name: "RVI",
      value: 0.62,
      change: "+1%",
      trend: "up",
      description: "Radar Vegetation Index",
      status: "Good",
      optimal: { min: 0.5, max: 0.8 },
      growthStage: "All weather",
      recommendation: "Stable biomass development",
      priority: "medium"
    }
  ];

  const cropStages = [
    { stage: "Sowing", duration: "0-2 weeks", indices: ["MSAVI2", "SOC_VIS"], status: "complete" },
    { stage: "Vegetative", duration: "2-8 weeks", indices: ["NDVI", "MSAVI2"], status: "current" },
    { stage: "Flowering", duration: "8-12 weeks", indices: ["NDVI", "NDRE"], status: "upcoming" },
    { stage: "Maturity", duration: "12-16 weeks", indices: ["NDRE", "NDMI"], status: "future" }
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-destructive";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const getStageStatus = (status: string) => {
    switch (status) {
      case "complete": return "bg-success/20 text-success";
      case "current": return "bg-primary/20 text-primary";
      case "upcoming": return "bg-accent/20 text-accent";
      default: return "bg-muted/20 text-muted-foreground";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Comprehensive Index Analysis
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Indices</SelectItem>
              <SelectItem value="vegetation">Vegetation</SelectItem>
              <SelectItem value="moisture">Moisture</SelectItem>
              <SelectItem value="soil">Soil</SelectItem>
            </SelectContent>
          </Select>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">Current Analysis</TabsTrigger>
            <TabsTrigger value="trends">Growth Stages</TabsTrigger>
            <TabsTrigger value="recommendations">Smart Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {indices.map((index) => (
              <div key={index.name} className="p-4 border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{index.name}</h4>
                      <Badge className={getStatusColor(index.status)} variant="secondary">
                        {index.status}
                      </Badge>
                      {index.priority === "high" && (
                        <Badge variant="destructive" className="text-xs">
                          <Target className="h-3 w-3 mr-1" />
                          Action Needed
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{index.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Optimal: {index.optimal.min} - {index.optimal.max}</span>
                      <span className="text-muted-foreground">Stage: {index.growthStage}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-bold">{index.value}</span>
                      {getTrendIcon(index.trend)}
                    </div>
                    <span className="text-sm text-muted-foreground">{index.change}</span>
                  </div>
                </div>
                
                {/* Enhanced visual indicator */}
                <div className="space-y-2">
                  <div className="w-full bg-muted rounded-full h-3 relative">
                    {/* Optimal range indicator */}
                    <div 
                      className="absolute bg-success/30 rounded-full h-3"
                      style={{ 
                        left: `${index.optimal.min * 100}%`,
                        width: `${(index.optimal.max - index.optimal.min) * 100}%`
                      }}
                    ></div>
                    {/* Current value indicator */}
                    <div 
                      className="bg-primary rounded-full h-3 transition-all duration-300"
                      style={{ width: `${index.value * 100}%` }}
                    ></div>
                    {/* Current value marker */}
                    <div 
                      className="absolute w-1 h-5 bg-primary -top-1 rounded"
                      style={{ left: `${index.value * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0.0</span>
                    <span>Optimal Range</span>
                    <span>1.0</span>
                  </div>
                </div>

                {/* Recommendation */}
                <div className="bg-muted/50 p-2 rounded text-sm">
                  <div className="flex items-center gap-1 mb-1">
                    <Lightbulb className={`h-3 w-3 ${getPriorityColor(index.priority)}`} />
                    <span className="font-medium">Recommendation:</span>
                  </div>
                  <p className="text-muted-foreground">{index.recommendation}</p>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Crop className="h-4 w-4" />
                Crop Growth Timeline
              </h4>
              {cropStages.map((stage, index) => (
                <div key={stage.stage} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{stage.stage}</span>
                      <Badge className={getStageStatus(stage.status)} variant="secondary">
                        {stage.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stage.duration}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Key Indices:</p>
                    <p className="text-xs text-muted-foreground">{stage.indices.join(", ")}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <div className="space-y-3">
              {indices
                .filter(index => index.priority === "high")
                .map((index) => (
                  <div key={index.name} className="border-l-4 border-destructive bg-destructive/5 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-destructive" />
                      <span className="font-semibold">High Priority: {index.name}</span>
                    </div>
                    <p className="text-sm mb-2">{index.recommendation}</p>
                    <Button size="sm" className="w-full">
                      View Products for {index.name} Issue
                    </Button>
                  </div>
                ))}
              
              {indices
                .filter(index => index.priority === "medium")
                .map((index) => (
                  <div key={index.name} className="border-l-4 border-warning bg-warning/5 p-4 rounded-r-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-warning" />
                      <span className="font-semibold">Monitor: {index.name}</span>
                    </div>
                    <p className="text-sm">{index.recommendation}</p>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">Data Summary</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Last Update:</span>
              <p>Today at 10:30 AM</p>
            </div>
            <div>
              <span className="text-muted-foreground">Next Update:</span>
              <p>Tomorrow at 10:30 AM</p>
            </div>
            <div>
              <span className="text-muted-foreground">Data Source:</span>
              <p>Sentinel-2 + PlanetScope</p>
            </div>
            <div>
              <span className="text-muted-foreground">Cloud Cover:</span>
              <p>5% (Excellent)</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VegetationIndices;
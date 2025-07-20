import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, AlertTriangle, CheckCircle, Droplets, Volume2, FileText, ShoppingCart, MapPin, Clock, TrendingUp } from "lucide-react";

const HealthAssessment = () => {
  const healthMetrics = [
    { 
      name: "NDVI Health", 
      value: 85, 
      status: "good", 
      color: "success",
      description: "Crop greenness and vigor",
      trend: "+3% from last week",
      action: "Continue current fertilization"
    },
    { 
      name: "Soil Moisture", 
      value: 65, 
      status: "moderate", 
      color: "warning",
      description: "Water content in soil",
      trend: "-8% from last week", 
      action: "Increase irrigation frequency"
    },
    { 
      name: "Plant Health", 
      value: 92, 
      status: "excellent", 
      color: "success",
      description: "Overall plant condition",
      trend: "+5% improvement",
      action: "Maintain current care routine"
    },
    { 
      name: "Disease Risk", 
      value: 25, 
      status: "low", 
      color: "success",
      description: "Probability of disease",
      trend: "Stable",
      action: "Continue monitoring"
    }
  ];

  const detailedAnalysis = [
    {
      zone: "North Field",
      area: "0.8 hectares", 
      health: 92,
      issues: [],
      recommendations: ["Continue current irrigation", "Monitor for optimal harvest timing"],
      lastUpdated: "2 hours ago"
    },
    {
      zone: "Central Field", 
      area: "1.2 hectares",
      health: 75,
      issues: ["Low nitrogen detected", "Slight water stress"],
      recommendations: ["Apply 50kg/ha urea fertilizer", "Increase irrigation by 20%"],
      lastUpdated: "2 hours ago"
    },
    {
      zone: "South Field",
      area: "0.5 hectares", 
      health: 88,
      issues: ["Minor pest activity"],
      recommendations: ["Monitor pest levels", "Consider organic neem application"],
      lastUpdated: "2 hours ago"
    }
  ];

  const audioExplanations = [
    { id: 1, title: "Field Health Overview (Hindi)", duration: "2:30", language: "hi" },
    { id: 2, title: "Irrigation Recommendations (Hindi)", duration: "1:45", language: "hi" },
    { id: 3, title: "Fertilizer Application Guide (English)", duration: "3:15", language: "en" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "excellent":
      case "good":
        return <CheckCircle className="h-4 w-4" />;
      case "moderate":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const playAudio = (audioId: number) => {
    // Audio playback simulation
    console.log(`Playing audio ${audioId}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          AI-Powered Health Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="zones">Field Zones</TabsTrigger>
            <TabsTrigger value="audio">Audio Guide</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Overall Health Score */}
            <div className="text-center p-6 bg-gradient-to-r from-success/10 to-success/5 rounded-lg border border-success/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-6 w-6 text-success" />
                <h3 className="text-4xl font-bold text-success">87%</h3>
              </div>
              <p className="text-success font-medium mb-1">Overall Health Score</p>
              <p className="text-sm text-muted-foreground mb-3">+3% improvement from last week</p>
              <Badge variant="secondary" className="bg-success/20 text-success">
                <CheckCircle className="h-3 w-3 mr-1" />
                Good Condition
              </Badge>
            </div>

            {/* Enhanced Health Metrics */}
            <div className="space-y-4">
              {healthMetrics.map((metric) => (
                <div key={metric.name} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(metric.status)}
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{metric.description}</p>
                      <p className="text-xs text-accent">{metric.trend}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{metric.value}%</span>
                    </div>
                  </div>
                  <Progress value={metric.value} className="h-3" />
                  <div className="bg-muted/50 p-2 rounded text-sm">
                    <strong>Action:</strong> {metric.action}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-xs">Buy Fertilizer</span>
              </Button>
              <Button variant="outline" className="h-16 flex flex-col gap-1">
                <MapPin className="h-5 w-5" />
                <span className="text-xs">Field Navigation</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            {detailedAnalysis.map((zone, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {zone.zone}
                    </h4>
                    <p className="text-sm text-muted-foreground">{zone.area}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{zone.health}%</div>
                    <Badge 
                      className={zone.health > 85 ? "bg-success/20 text-success" : zone.health > 70 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"}
                      variant="secondary"
                    >
                      {zone.health > 85 ? "Excellent" : zone.health > 70 ? "Good" : "Needs Attention"}
                    </Badge>
                  </div>
                </div>

                {zone.issues.length > 0 && (
                  <div>
                    <h5 className="font-medium text-destructive mb-2">Issues Detected:</h5>
                    <ul className="space-y-1">
                      {zone.issues.map((issue, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h5 className="font-medium text-primary mb-2">Recommendations:</h5>
                  <ul className="space-y-1">
                    {zone.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-success" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Updated {zone.lastUpdated}
                  </div>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="audio" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Audio Explanations
              </h4>
              {audioExplanations.map((audio) => (
                <div key={audio.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{audio.title}</p>
                    <p className="text-sm text-muted-foreground">Duration: {audio.duration}</p>
                  </div>
                  <Button size="sm" onClick={() => playAudio(audio.id)}>
                    <Volume2 className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="bg-accent/10 p-4 rounded-lg">
              <h5 className="font-medium mb-2">🎯 Voice Navigation</h5>
              <p className="text-sm text-muted-foreground mb-3">
                Tap and hold the microphone button to ask questions about your farm
              </p>
              <Button className="w-full" size="lg">
                <Volume2 className="h-5 w-5 mr-2" />
                Start Voice Assistant
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Downloadable Reports
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Field Health Report</p>
                    <p className="text-sm text-muted-foreground">Comprehensive analysis with maps</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
                
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Satellite Data Summary</p>
                    <p className="text-sm text-muted-foreground">Raw index values and trends</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    CSV
                  </Button>
                </div>
                
                <div className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium">Action Plan</p>
                    <p className="text-sm text-muted-foreground">Step-by-step farming guidance</p>
                  </div>
                  <Button size="sm" variant="outline">
                    <FileText className="h-4 w-4 mr-1" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HealthAssessment;
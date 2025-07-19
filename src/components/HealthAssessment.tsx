import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, Droplets } from "lucide-react";

const HealthAssessment = () => {
  const healthMetrics = [
    { name: "NDVI", value: 85, status: "good", color: "success" },
    { name: "Soil Moisture", value: 65, status: "moderate", color: "warning" },
    { name: "Plant Health", value: 92, status: "excellent", color: "success" },
    { name: "Disease Risk", value: 25, status: "low", color: "success" }
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Crop Health Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Health Score */}
          <div className="text-center p-4 bg-success/10 rounded-lg">
            <h3 className="text-3xl font-bold text-success">87%</h3>
            <p className="text-success font-medium">Overall Health Score</p>
            <Badge variant="secondary" className="mt-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Good Condition
            </Badge>
          </div>

          {/* Health Metrics */}
          <div className="space-y-4">
            {healthMetrics.map((metric) => (
              <div key={metric.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(metric.status)}
                    <span className="font-medium">{metric.name}</span>
                  </div>
                  <span className="text-sm font-bold">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>

          {/* Recommendations */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Droplets className="h-4 w-4 text-primary" />
              Recommendations
            </h4>
            <div className="space-y-2">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">💧 Increase irrigation by 20% in north field</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">🌱 Apply nitrogen fertilizer in 3-5 days</p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">🔍 Monitor for pest activity in southeast corner</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthAssessment;
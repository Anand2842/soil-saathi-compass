import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Droplets, Leaf, Bug, BarChart3 } from 'lucide-react';
import { generateRealTimeMarketData, generateFieldMetrics, RealTimeMarketData, FieldMetrics } from '@/data/enhancedDemoData';

interface RealTimeMetricsProps {
  crops: string[];
  primaryCrop: string;
  growthStage: string;
}

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({ crops, primaryCrop, growthStage }) => {
  const [marketData, setMarketData] = useState<RealTimeMarketData[]>([]);
  const [fieldMetrics, setFieldMetrics] = useState<FieldMetrics | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Initial data load
    setMarketData(generateRealTimeMarketData(crops));
    setFieldMetrics(generateFieldMetrics(primaryCrop, growthStage));

    // Simulate real-time updates every 30 seconds
    const interval = setInterval(() => {
      setMarketData(generateRealTimeMarketData(crops));
      setFieldMetrics(generateFieldMetrics(primaryCrop, growthStage));
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [crops, primaryCrop, growthStage]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-destructive" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getRiskLevel = (risk: number) => {
    if (risk < 20) return { level: 'Low', color: 'bg-success' };
    if (risk < 50) return { level: 'Medium', color: 'bg-warning' };
    return { level: 'High', color: 'bg-destructive' };
  };

  return (
    <div className="space-y-6">
      {/* Live Market Prices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Live Market Prices</CardTitle>
          <Badge variant="outline" className="text-xs">
            Updated {lastUpdate.toLocaleTimeString()}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {marketData.map((data, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="font-medium capitalize">{data.cropName}</div>
                  <Badge variant={data.demandLevel === 'high' ? 'default' : 'secondary'}>
                    {data.demandLevel} demand
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <div className="font-semibold">₹{data.currentPrice.toLocaleString()}/quintal</div>
                    <div className={`text-sm flex items-center ${data.priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {getTrendIcon(data.trend)}
                      <span className="ml-1">₹{Math.abs(data.priceChange)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Field Health Metrics */}
      {fieldMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Real-Time Field Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span className="text-sm">Overall Health</span>
                  </div>
                  <span className={`font-semibold ${getHealthColor(fieldMetrics.healthScore)}`}>
                    {fieldMetrics.healthScore}%
                  </span>
                </div>
                <Progress value={fieldMetrics.healthScore} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Soil Moisture</span>
                  </div>
                  <span className="font-semibold">{fieldMetrics.moistureLevel}%</span>
                </div>
                <Progress value={fieldMetrics.moistureLevel} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Nutrient Index</span>
                  </div>
                  <span className="font-semibold">{fieldMetrics.nutrientIndex}%</span>
                </div>
                <Progress value={fieldMetrics.nutrientIndex} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bug className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">Pest Risk</span>
                  </div>
                  <Badge 
                    variant="secondary" 
                    className={`${getRiskLevel(fieldMetrics.pestRisk).color} text-white`}
                  >
                    {getRiskLevel(fieldMetrics.pestRisk).level}
                  </Badge>
                </div>
                <Progress value={fieldMetrics.pestRisk} className="h-2" />
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Yield Potential</span>
                <span className="text-lg font-bold text-primary">{fieldMetrics.yieldPotential}%</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Based on current field conditions and interventions
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            <span>Live Monitoring Alerts</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start space-x-3 p-3 border-l-4 border-success bg-success/5 rounded">
              <div className="text-success text-sm">✓</div>
              <div>
                <div className="text-sm font-medium">Irrigation Optimal</div>
                <div className="text-xs text-muted-foreground">
                  Soil moisture levels are perfect for current growth stage
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border-l-4 border-warning bg-warning/5 rounded">
              <div className="text-warning text-sm">⚠</div>
              <div>
                <div className="text-sm font-medium">Weather Watch</div>
                <div className="text-xs text-muted-foreground">
                  Rain expected in 48 hours - consider fertilizer timing
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
              <div className="text-blue-500 text-sm">ℹ</div>
              <div>
                <div className="text-sm font-medium">Satellite Update</div>
                <div className="text-xs text-muted-foreground">
                  New high-resolution imagery available for analysis
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMetrics;
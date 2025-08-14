import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, DollarSign, Target, Globe, Zap, Award, MapPin, Smartphone, BarChart3 } from "lucide-react";
import { successMetrics, investmentProjections } from "@/data/demoData";

const InvestorDashboard = () => {
  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  const formatNumber = (num: number) => {
    if (num >= 10000000) return `${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">Active Farmers</p>
                <p className="text-2xl font-bold">{formatNumber(successMetrics.farmersHelped.activeFarmers)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">+{successMetrics.userGrowth.monthlyGrowth}% MoM</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-primary-foreground/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-success to-success/80 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-success-foreground/80 text-sm">GMV (Monthly)</p>
                <p className="text-2xl font-bold">{formatCurrency(successMetrics.marketplaceGMV.monthlyGMV)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  <span className="text-xs">35% growth</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-success-foreground/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-accent to-accent/80 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-accent-foreground/80 text-sm">Avg Yield Increase</p>
                <p className="text-2xl font-bold">{successMetrics.yieldImprovements.averageIncrease}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <Award className="h-3 w-3" />
                  <span className="text-xs">Per farmer</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-accent-foreground/60" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-warning to-warning/80 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-warning-foreground/80 text-sm">Area Covered</p>
                <p className="text-2xl font-bold">{formatNumber(successMetrics.farmersHelped.totalAreaCovered)}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="text-xs">hectares</span>
                </div>
              </div>
              <Globe className="h-8 w-8 text-warning-foreground/60" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="growth" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="growth">Growth Metrics</TabsTrigger>
          <TabsTrigger value="impact">Impact & ROI</TabsTrigger>
          <TabsTrigger value="technology">Technology</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="growth" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  User Growth Trajectory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Current Users</span>
                    <span className="font-bold">{formatNumber(successMetrics.userGrowth.currentUsers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Monthly Growth</span>
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      +{successMetrics.userGrowth.monthlyGrowth}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Yearly Growth</span>
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      +{successMetrics.userGrowth.yearlyGrowth}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Target: {formatNumber(successMetrics.userGrowth.targetUsers)}</span>
                      <span>{Math.round((successMetrics.userGrowth.currentUsers / successMetrics.userGrowth.targetUsers) * 100)}%</span>
                    </div>
                    <Progress value={(successMetrics.userGrowth.currentUsers / successMetrics.userGrowth.targetUsers) * 100} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5 text-primary" />
                  Geographic Reach
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{successMetrics.farmersHelped.statesActive}</div>
                    <div className="text-sm text-muted-foreground">States Active</div>
                  </div>
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <div className="text-2xl font-bold text-success">{successMetrics.farmersHelped.districtsActive}</div>
                    <div className="text-sm text-muted-foreground">Districts</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Avg Farm Size</span>
                    <span className="font-medium">{successMetrics.farmersHelped.avgFarmSize} hectares</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Total Coverage</span>
                    <span className="font-medium">{formatNumber(successMetrics.farmersHelped.totalAreaCovered)} hectares</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-primary" />
                Marketplace Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-primary">{formatCurrency(successMetrics.marketplaceGMV.yearlyGMV)}</div>
                  <div className="text-sm text-muted-foreground">Annual GMV</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-success">{formatCurrency(successMetrics.marketplaceGMV.avgOrderValue)}</div>
                  <div className="text-sm text-muted-foreground">Avg Order Value</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-accent">{formatNumber(successMetrics.marketplaceGMV.totalOrders)}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-xl font-bold text-warning">{formatNumber(successMetrics.marketplaceGMV.vendorNetwork)}</div>
                  <div className="text-sm text-muted-foreground">Vendor Network</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-success" />
                  Farmer Impact Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="text-sm font-medium">Average Yield Increase</span>
                    <span className="text-xl font-bold text-success">+{successMetrics.yieldImprovements.averageIncrease}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm font-medium">Value Created</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(successMetrics.yieldImprovements.totalValueCreated)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                    <span className="text-sm font-medium">Cost Savings</span>
                    <span className="text-xl font-bold text-accent">{formatCurrency(successMetrics.yieldImprovements.costSavings)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Globe className="h-5 w-5 text-primary" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-600">{successMetrics.yieldImprovements.waterSaved}B</div>
                    <div className="text-sm text-blue-600">Liters Water Saved</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-600">-{successMetrics.yieldImprovements.fertilizerReduced}%</div>
                    <div className="text-sm text-green-600">Fertilizer Reduction</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="technology" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-primary" />
                  Platform Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-primary">{successMetrics.technology.accuracyRate}%</div>
                    <div className="text-sm text-muted-foreground">AI Accuracy</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-success">{successMetrics.technology.responseTime}s</div>
                    <div className="text-sm text-muted-foreground">Response Time</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-accent">{successMetrics.technology.uptime}%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-3 border rounded-lg">
                    <div className="text-xl font-bold text-warning">{successMetrics.technology.languagesSupported}</div>
                    <div className="text-sm text-muted-foreground">Languages</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Data Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satellite Images Processed</span>
                    <span className="font-bold">{formatNumber(successMetrics.technology.satelliteImages)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">AI Analyses Completed</span>
                    <span className="font-bold">{formatNumber(successMetrics.technology.aiAnalyses)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Mobile Compatibility</span>
                    <Badge variant="secondary" className="bg-success/20 text-success">
                      <Smartphone className="h-3 w-3 mr-1" />
                      100%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Revenue Projections
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm font-medium">Year 1 Target</span>
                    <span className="text-lg font-bold text-primary">{formatCurrency(investmentProjections.projectedValuation.year1)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg">
                    <span className="text-sm font-medium">Year 2 Target</span>
                    <span className="text-lg font-bold text-success">{formatCurrency(investmentProjections.projectedValuation.year2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-accent/10 rounded-lg">
                    <span className="text-sm font-medium">Year 3 Target</span>
                    <span className="text-lg font-bold text-accent">{formatCurrency(investmentProjections.projectedValuation.year3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Revenue Model
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subscriptions</span>
                      <span>{investmentProjections.revenueModel.subscriptions}%</span>
                    </div>
                    <Progress value={investmentProjections.revenueModel.subscriptions} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Marketplace Commission</span>
                      <span>{investmentProjections.revenueModel.marketplace}%</span>
                    </div>
                    <Progress value={investmentProjections.revenueModel.marketplace} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Premium Services</span>
                      <span>{investmentProjections.revenueModel.premiumServices}%</span>
                    </div>
                    <Progress value={investmentProjections.revenueModel.premiumServices} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Data Licensing</span>
                      <span>{investmentProjections.revenueModel.dataLicensing}%</span>
                    </div>
                    <Progress value={investmentProjections.revenueModel.dataLicensing} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-primary" />
                Funding Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-lg font-bold text-primary">{formatCurrency(investmentProjections.fundingRequirements.breakdown.technology)}</div>
                  <div className="text-sm text-muted-foreground">Technology</div>
                </div>
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-lg font-bold text-success">{formatCurrency(investmentProjections.fundingRequirements.breakdown.marketing)}</div>
                  <div className="text-sm text-muted-foreground">Marketing</div>
                </div>
                <div className="text-center p-4 bg-accent/10 rounded-lg">
                  <div className="text-lg font-bold text-accent">{formatCurrency(investmentProjections.fundingRequirements.breakdown.operations)}</div>
                  <div className="text-sm text-muted-foreground">Operations</div>
                </div>
                <div className="text-center p-4 bg-warning/10 rounded-lg">
                  <div className="text-lg font-bold text-warning">{formatCurrency(investmentProjections.fundingRequirements.breakdown.workingCapital)}</div>
                  <div className="text-sm text-muted-foreground">Working Capital</div>
                </div>
              </div>
              <div className="mt-4 text-center p-4 border-2 border-dashed border-primary rounded-lg">
                <div className="text-2xl font-bold text-primary">{formatCurrency(investmentProjections.fundingRequirements.total)}</div>
                <div className="text-sm text-muted-foreground">Total Funding Required</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestorDashboard;
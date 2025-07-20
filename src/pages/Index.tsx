
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sprout, 
  MapPin, 
  Activity, 
  ShoppingCart, 
  BarChart3, 
  Bell,
  Menu,
  Sun,
  Droplets,
  TrendingUp,
  Satellite,
  Plus
} from "lucide-react";
import FarmMap from "@/components/FarmMap";
import HealthAssessment from "@/components/HealthAssessment";
import VegetationIndices from "@/components/VegetationIndices";
import Marketplace from "@/components/Marketplace";
import OnboardingWizard from "@/components/OnboardingWizard";
import FieldMapper from "@/components/FieldMapper";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFieldMapper, setShowFieldMapper] = useState(false);
  const [userSetup, setUserSetup] = useState(false);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setShowFieldMapper(true);
  };

  const handleFieldMappingComplete = (fieldData: any) => {
    console.log("Field mapping completed:", fieldData);
    setShowFieldMapper(false);
    setUserSetup(true);
  };

  const startNewFieldMapping = () => {
    setShowFieldMapper(true);
  };

  // Show onboarding wizard if not set up
  if (showOnboarding) {
    return <OnboardingWizard onComplete={handleOnboardingComplete} />;
  }

  // Show field mapper
  if (showFieldMapper) {
    return <FieldMapper onComplete={handleFieldMappingComplete} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sprout className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-bold">Soil Saathi</h1>
              <p className="text-sm opacity-90">Smart Farming Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!userSetup && (
              <Button 
                size="sm" 
                variant="secondary"
                onClick={() => setShowOnboarding(true)}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                Setup
              </Button>
            )}
            <Bell className="h-5 w-5" />
            <Menu className="h-5 w-5" />
          </div>
        </div>
      </header>

      {/* Weather Banner */}
      <div className="bg-accent/10 border-b border-accent/20 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sun className="h-5 w-5 text-accent" />
            <div>
              <span className="font-medium">28°C</span>
              <span className="text-sm text-muted-foreground ml-2">Sunny, Clear Sky</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Droplets className="h-4 w-4 text-primary" />
              <span>65% Humidity</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span>Good for irrigation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Banner for New Users */}
      {!userSetup && (
        <div className="bg-primary/10 border-b border-primary/20 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-primary">Welcome to Soil Saathi!</h3>
              <p className="text-sm text-muted-foreground">Complete setup to start analyzing your fields</p>
            </div>
            <Button onClick={() => setShowOnboarding(true)} size="sm">
              Get Started
            </Button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex flex-col gap-1 h-16">
              <Activity className="h-4 w-4" />
              <span className="text-xs">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex flex-col gap-1 h-16">
              <MapPin className="h-4 w-4" />
              <span className="text-xs">Farm Map</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex flex-col gap-1 h-16">
              <Satellite className="h-4 w-4" />
              <span className="text-xs">Health</span>
            </TabsTrigger>
            <TabsTrigger value="indices" className="flex flex-col gap-1 h-16">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs">Indices</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex flex-col gap-1 h-16">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs">Market</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-success/10 p-2 rounded-lg">
                      <Sprout className="h-5 w-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Farm Health</p>
                      <p className="text-xl font-bold">{userSetup ? '87%' : '--'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-accent/10 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Area</p>
                      <p className="text-xl font-bold">{userSetup ? '2.5 ha' : '--'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Analysis or Setup Prompt */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  {userSetup ? 'Latest Analysis' : 'Getting Started'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {userSetup ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                      <div>
                        <p className="font-medium">Satellite Data Updated</p>
                        <p className="text-sm text-muted-foreground">NDVI: 0.75 (+5% improvement)</p>
                      </div>
                      <Badge className="bg-success/20 text-success">
                        Good
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg">
                      <div>
                        <p className="font-medium">Soil Moisture Alert</p>
                        <p className="text-sm text-muted-foreground">North field needs irrigation</p>
                      </div>
                      <Badge className="bg-warning/20 text-warning">
                        Action Needed
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Sprout className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">Welcome to Soil Saathi</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Complete the setup process to start monitoring your field health with satellite data
                    </p>
                    <Button onClick={() => setShowOnboarding(true)}>
                      Complete Setup
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => userSetup ? setActiveTab("health") : setShowOnboarding(true)}
                  >
                    <Satellite className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'New Analysis' : 'Setup First'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => setActiveTab("marketplace")}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    <span className="text-xs">Buy Supplies</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={userSetup ? () => setActiveTab("map") : startNewFieldMapping}
                  >
                    <MapPin className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'View Fields' : 'Map Field'}</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-16 flex flex-col gap-1"
                    onClick={() => userSetup ? setActiveTab("indices") : setShowOnboarding(true)}
                  >
                    <BarChart3 className="h-5 w-5" />
                    <span className="text-xs">{userSetup ? 'View Reports' : 'Get Started'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="map">
            <FarmMap />
          </TabsContent>

          <TabsContent value="health">
            <HealthAssessment />
          </TabsContent>

          <TabsContent value="indices">
            <VegetationIndices />
          </TabsContent>

          <TabsContent value="marketplace">
            <Marketplace />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;

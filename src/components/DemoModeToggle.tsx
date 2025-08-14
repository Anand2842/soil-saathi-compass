import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Users, TrendingUp, MapPin, DollarSign } from "lucide-react";
import { farmerProfiles, demoScenarios, type DemoScenario } from "@/data/demoData";

interface DemoModeToggleProps {
  onScenarioChange: (scenario: DemoScenario | null) => void;
  currentScenario: DemoScenario | null;
}

const DemoModeToggle = ({ onScenarioChange, currentScenario }: DemoModeToggleProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleScenarioSelect = (scenarioId: string) => {
    if (scenarioId === 'off') {
      onScenarioChange(null);
    } else {
      const scenario = demoScenarios.find(s => s.farmer.id === scenarioId);
      onScenarioChange(scenario || null);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={currentScenario ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          {currentScenario ? "Demo Mode" : "Start Demo"}
          {currentScenario && (
            <Badge variant="secondary" className="ml-1">
              {currentScenario.farmer.name.split('(')[0].trim()}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-primary" />
            Investor Demo Mode
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Select Demo Scenario:</h3>
            
            <Select onValueChange={handleScenarioSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a farmer story to showcase" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="off">Turn Off Demo Mode</SelectItem>
                {demoScenarios.map((scenario) => (
                  <SelectItem key={scenario.farmer.id} value={scenario.farmer.id}>
                    {scenario.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Demo Scenario Previews */}
          <div className="space-y-3">
            <h4 className="font-medium">Available Success Stories:</h4>
            {demoScenarios.map((scenario) => (
              <div
                key={scenario.farmer.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleScenarioSelect(scenario.farmer.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h5 className="font-semibold">{scenario.title}</h5>
                    <p className="text-sm text-muted-foreground">{scenario.description}</p>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success">
                    +{scenario.farmer.yieldImprovement}% yield
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.farmer.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{scenario.farmer.farmSize} hectares</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span>ROI: {scenario.roi}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>+₹{(scenario.farmer.revenueIncrease / 1000).toFixed(0)}k revenue</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-primary/10 p-4 rounded-lg">
            <h4 className="font-semibold text-primary mb-2">💡 Demo Mode Benefits</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Realistic farmer data from different states</li>
              <li>• Actual improvement metrics and ROI calculations</li>
              <li>• Regional crop and language customization</li>
              <li>• Success story narratives for investor presentations</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DemoModeToggle;
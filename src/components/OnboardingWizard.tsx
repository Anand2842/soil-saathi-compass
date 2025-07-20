
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Sprout, 
  Calendar, 
  ChevronRight, 
  ChevronLeft,
  Globe,
  User
} from "lucide-react";

interface OnboardingStep {
  step: number;
  title: string;
  completed: boolean;
}

const OnboardingWizard = ({ onComplete }: { onComplete: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [farmerName, setFarmerName] = useState("");

  const languages = [
    { code: "english", name: "English", native: "English" },
    { code: "hindi", name: "Hindi", native: "हिंदी" },
    { code: "punjabi", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
    { code: "tamil", name: "Tamil", native: "தமிழ்" },
    { code: "gujarati", name: "Gujarati", native: "ગુજરાતી" }
  ];

  const crops = [
    { id: "wheat", name: "Wheat", icon: "🌾", season: "Rabi" },
    { id: "rice", name: "Rice", icon: "🌾", season: "Kharif" },
    { id: "maize", name: "Maize", icon: "🌽", season: "Both" },
    { id: "cotton", name: "Cotton", icon: "🌿", season: "Kharif" },
    { id: "sugarcane", name: "Sugarcane", icon: "🎋", season: "Year-round" },
    { id: "soybean", name: "Soybean", icon: "🫘", season: "Kharif" }
  ];

  const steps: OnboardingStep[] = [
    { step: 1, title: "Language Selection", completed: !!selectedLanguage },
    { step: 2, title: "Farmer Information", completed: !!farmerName },
    { step: 3, title: "Crop Selection", completed: !!selectedCrop },
    { step: 4, title: "Field Mapping", completed: false }
  ];

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!selectedLanguage;
      case 2: return !!farmerName;
      case 3: return !!selectedCrop;
      case 4: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Setup Soil Saathi</h2>
            <Badge variant="outline">{currentStep}/4</Badge>
          </div>
          <div className="flex space-x-2">
            {steps.map((step) => (
              <div
                key={step.step}
                className={`flex-1 h-2 rounded ${
                  step.step <= currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {currentStep === 1 && <Globe className="h-5 w-5" />}
              {currentStep === 2 && <User className="h-5 w-5" />}
              {currentStep === 3 && <Sprout className="h-5 w-5" />}
              {currentStep === 4 && <MapPin className="h-5 w-5" />}
              {steps[currentStep - 1].title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Language Selection */}
            {currentStep === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Choose your preferred language
                </p>
                <div className="grid grid-cols-1 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setSelectedLanguage(lang.code)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedLanguage === lang.code
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-medium">{lang.name}</div>
                      <div className="text-sm text-muted-foreground">{lang.native}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Farmer Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tell us about yourself
                </p>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                </div>
                <div className="bg-accent/10 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    Your information is kept private and secure according to India's data protection laws.
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Crop Selection */}
            {currentStep === 3 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  What crop are you growing?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {crops.map((crop) => (
                    <button
                      key={crop.id}
                      onClick={() => setSelectedCrop(crop.id)}
                      className={`p-4 border rounded-lg text-center transition-colors ${
                        selectedCrop === crop.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="text-2xl mb-2">{crop.icon}</div>
                      <div className="font-medium text-sm">{crop.name}</div>
                      <div className="text-xs text-muted-foreground">{crop.season}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Field Mapping Preview */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Ready to map your field boundaries using GPS
                </p>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-2" />
                  <p className="font-medium">GPS Field Mapping</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Walk around your field or pin locations on the map
                  </p>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Automatic boundary detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>Works offline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-success rounded-full"></div>
                    <span>±5-10m accuracy</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            {currentStep === 4 ? 'Start Mapping' : 'Next'}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  EyeOff, 
  Type, 
  Contrast, 
  ZoomIn, 
  ZoomOut,
  Palette,
  Hand,
  Brain,
  RotateCcw,
  Check
} from "lucide-react";
import { toast } from "sonner";

interface AccessibilityFeaturesProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
}

interface AccessibilitySettings {
  fontSize: number;
  contrast: "normal" | "high" | "low";
  colorBlind: boolean;
  largeButtons: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  simplifiedUI: boolean;
  tactileFeedback: boolean;
}

const AccessibilityFeatures = ({ onSettingsChange }: AccessibilityFeaturesProps) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    contrast: "normal",
    colorBlind: false,
    largeButtons: true, // Default to true for rural users
    reducedMotion: false,
    screenReader: false,
    simplifiedUI: true, // Default to true for low literacy
    tactileFeedback: true
  });

  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    // Apply settings to document
    const root = document.documentElement;
    
    // Font size
    root.style.setProperty('--accessibility-font-size', `${settings.fontSize}px`);
    
    // Contrast
    if (settings.contrast === "high") {
      root.classList.add('high-contrast');
      root.classList.remove('low-contrast');
    } else if (settings.contrast === "low") {
      root.classList.add('low-contrast');
      root.classList.remove('high-contrast');
    } else {
      root.classList.remove('high-contrast', 'low-contrast');
    }
    
    // Color blind mode
    if (settings.colorBlind) {
      root.classList.add('color-blind-mode');
    } else {
      root.classList.remove('color-blind-mode');
    }
    
    // Large buttons
    if (settings.largeButtons) {
      root.classList.add('large-buttons');
    } else {
      root.classList.remove('large-buttons');
    }
    
    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
    
    // Simplified UI
    if (settings.simplifiedUI) {
      root.classList.add('simplified-ui');
    } else {
      root.classList.remove('simplified-ui');
    }

    // Notify parent component
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Show confirmation
    toast.success("Setting updated", {
      description: "Changes applied automatically"
    });

    // Tactile feedback simulation
    if (settings.tactileFeedback && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      contrast: "normal",
      colorBlind: false,
      largeButtons: true,
      reducedMotion: false,
      screenReader: false,
      simplifiedUI: true,
      tactileFeedback: true
    };
    
    setSettings(defaultSettings);
    toast.success("Settings reset to defaults");
  };

  const presets = {
    rural: {
      name: "Rural Farmer",
      nameHindi: "ग्रामीण किसान",
      icon: "🌾",
      settings: {
        fontSize: 18,
        contrast: "high",
        colorBlind: false,
        largeButtons: true,
        reducedMotion: true,
        screenReader: false,
        simplifiedUI: true,
        tactileFeedback: true
      }
    },
    elderly: {
      name: "Elderly User",
      nameHindi: "बुजुर्ग उपयोगकर्ता",
      icon: "👴",
      settings: {
        fontSize: 20,
        contrast: "high",
        colorBlind: false,
        largeButtons: true,
        reducedMotion: true,
        screenReader: true,
        simplifiedUI: true,
        tactileFeedback: true
      }
    },
    visual: {
      name: "Visual Impairment",
      nameHindi: "दृष्टि बाधित",
      icon: "👁️",
      settings: {
        fontSize: 22,
        contrast: "high",
        colorBlind: true,
        largeButtons: true,
        reducedMotion: false,
        screenReader: true,
        simplifiedUI: false,
        tactileFeedback: true
      }
    },
    motor: {
      name: "Motor Difficulties",
      nameHindi: "मोटर कठिनाइयाँ",
      icon: "✋",
      settings: {
        fontSize: 18,
        contrast: "normal",
        colorBlind: false,
        largeButtons: true,
        reducedMotion: true,
        screenReader: false,
        simplifiedUI: true,
        tactileFeedback: true
      }
    }
  };

  const applyPreset = (presetKey: keyof typeof presets) => {
    setSettings(presets[presetKey].settings as AccessibilitySettings);
    toast.success(`Applied ${presets[presetKey].name} preset`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          <span>Accessibility Settings</span>
          <Badge variant="outline" className="ml-auto">
            {Object.values(settings).filter(Boolean).length} Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quick" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quick">Quick Setup</TabsTrigger>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="interaction">Interaction</TabsTrigger>
          </TabsList>

          <TabsContent value="quick" className="space-y-4">
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Preset Configurations
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(presets).map(([key, preset]) => (
                  <Button
                    key={key}
                    variant="outline"
                    onClick={() => applyPreset(key as keyof typeof presets)}
                    className="h-auto p-3 flex flex-col gap-1 text-left"
                  >
                    <div className="flex items-center gap-2 w-full">
                      <span className="text-lg">{preset.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{preset.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{preset.nameHindi}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">Quick Toggles</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {previewMode ? "Exit Preview" : "Preview"}
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Hand className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Large Touch Targets</span>
                  </div>
                  <Switch
                    checked={settings.largeButtons}
                    onCheckedChange={(checked) => updateSetting('largeButtons', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Simplified Interface</span>
                  </div>
                  <Switch
                    checked={settings.simplifiedUI}
                    onCheckedChange={(checked) => updateSetting('simplifiedUI', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Contrast className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">High Contrast</span>
                  </div>
                  <Switch
                    checked={settings.contrast === "high"}
                    onCheckedChange={(checked) => updateSetting('contrast', checked ? 'high' : 'normal')}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visual" className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Type className="h-4 w-4 text-primary" />
                <span className="font-medium">Font Size</span>
                <Badge variant="outline">{settings.fontSize}px</Badge>
              </div>
              <div className="space-y-2">
                <Slider
                  value={[settings.fontSize]}
                  onValueChange={([value]) => updateSetting('fontSize', value)}
                  min={12}
                  max={28}
                  step={2}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Small (12px)</span>
                  <span>Large (28px)</span>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Contrast className="h-4 w-4 text-primary" />
                <span className="font-medium">Contrast Level</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'high', 'low'] as const).map((level) => (
                  <Button
                    key={level}
                    variant={settings.contrast === level ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('contrast', level)}
                    className="capitalize"
                  >
                    {settings.contrast === level && <Check className="h-3 w-3 mr-1" />}
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Color Blind Support</span>
                </div>
                <Switch
                  checked={settings.colorBlind}
                  onCheckedChange={(checked) => updateSetting('colorBlind', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Screen Reader Support</span>
                </div>
                <Switch
                  checked={settings.screenReader}
                  onCheckedChange={(checked) => updateSetting('screenReader', checked)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="interaction" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Large Touch Targets</span>
                </div>
                <Switch
                  checked={settings.largeButtons}
                  onCheckedChange={(checked) => updateSetting('largeButtons', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ZoomIn className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Reduced Motion</span>
                </div>
                <Switch
                  checked={settings.reducedMotion}
                  onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Hand className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Tactile Feedback</span>
                </div>
                <Switch
                  checked={settings.tactileFeedback}
                  onCheckedChange={(checked) => updateSetting('tactileFeedback', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Simplified Interface</span>
                </div>
                <Switch
                  checked={settings.simplifiedUI}
                  onCheckedChange={(checked) => updateSetting('simplifiedUI', checked)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Preview Mode</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Test your settings with a sample interface preview
              </p>
              
              {previewMode && (
                <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
                  <Button 
                    size={settings.largeButtons ? "lg" : "default"}
                    className="w-full"
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    Sample Button
                  </Button>
                  <p 
                    className="text-center"
                    style={{ fontSize: `${settings.fontSize}px` }}
                  >
                    Sample text with your font settings
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => setPreviewMode(!previewMode)}
                className="w-full mt-2"
              >
                {previewMode ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <div className="border-t pt-4 mt-6">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessibilityFeatures;
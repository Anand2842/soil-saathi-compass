import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Volume2, 
  VolumeX, 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  RotateCcw,
  Languages,
  Headphones,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { voiceService } from "@/services/voiceService";

interface AudioGuide {
  id: string;
  title: string;
  titleHindi: string;
  titlePunjabi?: string;
  category: "health" | "farming" | "marketplace" | "navigation";
  duration: string;
  description: string;
  descriptionHindi: string;
  descriptionPunjabi?: string;
  priority: "high" | "medium" | "low";
  audioUrl?: string;
}

interface VoiceAssistantProps {
  currentData?: any;
  context?: "dashboard" | "health" | "map" | "indices" | "marketplace" | "voice" | "accessibility";
}

const VoiceAssistant = ({ currentData, context = "dashboard" }: VoiceAssistantProps) => {
  const [isListening, setIsListening] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("hi"); // Hindi default
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const [voiceSpeed, setVoiceSpeed] = useState("normal");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const languages = [
    { code: "hi", name: "हिन्दी (Hindi)", flag: "🇮🇳" },
    { code: "pa", name: "ਪੰਜਾਬੀ (Punjabi)", flag: "🌾" },
    { code: "en", name: "English", flag: "🇬🇧" }
  ];

  const audioGuides: AudioGuide[] = [
    {
      id: "welcome",
      title: "Welcome to Soil Saathi",
      titleHindi: "सॉयल साथी में आपका स्वागत है",
      titlePunjabi: "ਸਾਇਲ ਸਾਥੀ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ",
      category: "navigation",
      duration: "2:30",
      description: "Learn how to use the app",
      descriptionHindi: "ऐप का उपयोग करना सीखें",
      descriptionPunjabi: "ਐਪ ਦੀ ਵਰਤੋਂ ਸਿੱਖੋ",
      priority: "high"
    },
    {
      id: "health_analysis",
      title: "Understanding Your Field Health",
      titleHindi: "अपने खेत के स्वास्थ्य को समझना",
      category: "health",
      duration: "3:15",
      description: "Learn about NDVI and health indicators",
      descriptionHindi: "NDVI और स्वास्थ्य संकेतकों के बारे में जानें",
      priority: "high"
    },
    {
      id: "irrigation_guide",
      title: "Smart Irrigation Tips",
      titleHindi: "स्मार्ट सिंचाई युक्तियाँ",
      category: "farming",
      duration: "4:20",
      description: "When and how to irrigate based on data",
      descriptionHindi: "डेटा के आधार पर कब और कैसे सिंचाई करें",
      priority: "medium"
    },
    {
      id: "marketplace_guide",
      title: "Finding the Right Products",
      titleHindi: "सही उत्पाद खोजना",
      category: "marketplace",
      duration: "2:45",
      description: "How to buy recommended products",
      descriptionHindi: "अनुशंसित उत्पाद कैसे खरीदें",
      priority: "medium"
    }
  ];

  const contextualRecommendations: Record<string, string[]> = {
    dashboard: ["welcome", "health_analysis"],
    health: ["health_analysis", "irrigation_guide"],
    map: ["field_mapping", "navigation_guide"],
    indices: ["index_explanation", "data_interpretation"],
    marketplace: ["marketplace_guide", "product_selection"],
    voice: ["welcome", "health_analysis"],
    accessibility: ["welcome", "navigation_guide"]
  };

  const playAudio = async (audioId: string) => {
    try {
      if (!audioEnabled) {
        const message = currentLanguage === "hi" ? "ऑडियो अक्षम है" : 
                       currentLanguage === "pa" ? "ਆਡੀਓ ਬੰਦ ਹੈ" : "Audio is disabled";
        toast.error(message);
        return;
      }

      if (currentlyPlaying === audioId) {
        // Stop current audio
        voiceService.stopAudio();
        setCurrentlyPlaying(null);
        return;
      }

      // Stop any currently playing audio
      voiceService.stopAudio();
      setCurrentlyPlaying(audioId);
      
      // Get the guide content
      const guide = audioGuides.find(g => g.id === audioId);
      if (guide) {
        let text = guide.title;
        let description = guide.description;
        
        if (currentLanguage === "hi") {
          text = guide.titleHindi;
          description = guide.descriptionHindi;
        } else if (currentLanguage === "pa") {
          text = guide.titlePunjabi || guide.title;
          description = guide.descriptionPunjabi || guide.description;
        }

        // Combine title and description for more comprehensive audio
        const fullText = `${text}. ${description}`;
        
        // Preprocess text for better pronunciation
        const processedText = voiceService.preprocessText(fullText, currentLanguage as 'en' | 'hi' | 'pa');

        // Use ElevenLabs for high-quality speech
        const speechRate = voiceSpeed === "slow" ? 0.8 : voiceSpeed === "fast" ? 1.2 : 1.0;
        
        const audioData = await voiceService.textToSpeech(processedText, {
          language: currentLanguage as 'en' | 'hi' | 'pa',
          speed: speechRate
        });

        await voiceService.playAudio(audioData.audioContent);
        
        const successMessage = currentLanguage === "hi" ? "ऑडियो चल रहा है" :
                              currentLanguage === "pa" ? "ਆਡੀਓ ਚੱਲ ਰਿਹਾ ਹੈ" : "Playing audio";
        toast.success(successMessage);
        
        setCurrentlyPlaying(null);
      }
    } catch (error) {
      console.error("Audio playback error:", error);
      const errorMessage = currentLanguage === "hi" ? "ऑडियो चलाने में त्रुटि" :
                          currentLanguage === "pa" ? "ਆਡੀਓ ਚਲਾਉਣ ਵਿੱਚ ਗਲਤੀ" : "Error playing audio";
      toast.error(errorMessage);
      setCurrentlyPlaying(null);
    }
  };

  const stopAudio = () => {
    voiceService.stopAudio();
    setCurrentlyPlaying(null);
  };

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error(currentLanguage === "hi" ? "वॉयस रिकग्निशन समर्थित नहीं है" : "Voice recognition not supported");
      return;
    }

    try {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = currentLanguage === "hi" ? "hi-IN" : 
                        currentLanguage === "pa" ? "pa-IN" : "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        const message = currentLanguage === "hi" ? "सुन रहा हूँ..." :
                       currentLanguage === "pa" ? "ਸੁਣ ਰਿਹਾ ਹਾਂ..." : "Listening...";
        toast.success(message);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice command:", transcript);
        
        // Process voice commands
        processVoiceCommand(transcript.toLowerCase());
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        toast.error(currentLanguage === "hi" ? "वॉयस रिकग्निशन त्रुटि" : "Voice recognition error");
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (error) {
      console.error("Voice recognition setup error:", error);
      toast.error(currentLanguage === "hi" ? "वॉयस रिकग्निशन शुरू नहीं हो सका" : "Could not start voice recognition");
    }
  };

  const processVoiceCommand = (command: string) => {
    // Simple voice command processing
    const commands = {
      hi: {
        "स्वास्थ्य दिखाओ": "health",
        "खेत दिखाओ": "map", 
        "बाजार दिखाओ": "marketplace",
        "सहायता": "help"
      },
      en: {
        "show health": "health",
        "show map": "map",
        "show marketplace": "marketplace", 
        "help": "help"
      }
    };

    const langCommands = currentLanguage === "hi" ? commands.hi : commands.en;
    
    for (const [phrase, action] of Object.entries(langCommands)) {
      if (command.includes(phrase)) {
        toast.success(currentLanguage === "hi" ? `कमांड समझ गया: ${phrase}` : `Command understood: ${phrase}`);
        // Here you would trigger the actual navigation or action
        break;
      }
    }
  };

  const filteredGuides = audioGuides.filter(guide => 
    contextualRecommendations[context]?.includes(guide.id) || 
    guide.category === context
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Headphones className="h-5 w-5 text-primary" />
          <span>{currentLanguage === "hi" ? "वॉयस सहायक" : "Voice Assistant"}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="guides" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="guides" className="text-xs">
              {currentLanguage === "hi" ? "गाइड" : "Guides"}
            </TabsTrigger>
            <TabsTrigger value="voice" className="text-xs">
              {currentLanguage === "hi" ? "वॉयस" : "Voice"}
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-xs">
              {currentLanguage === "hi" ? "सेटिंग्स" : "Settings"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="guides" className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">
                {currentLanguage === "hi" ? "सुझावित गाइड" : "Recommended Guides"}
              </h4>
              <Badge variant="outline">
                {filteredGuides.length} {currentLanguage === "hi" ? "उपलब्ध" : "available"}
              </Badge>
            </div>

            <div className="space-y-2">
              {filteredGuides.map((guide) => (
                <div key={guide.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">
                      {currentLanguage === "hi" ? guide.titleHindi : guide.title}
                    </h5>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={guide.priority === "high" ? "destructive" : "secondary"}
                        className="text-xs"
                      >
                        {guide.priority === "high" ? "उच्च" : guide.priority === "medium" ? "मध्यम" : "कम"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{guide.duration}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">
                    {currentLanguage === "hi" ? guide.descriptionHindi : guide.description}
                  </p>
                  <Button
                    size="sm"
                    variant={currentlyPlaying === guide.id ? "destructive" : "outline"}
                    onClick={() => currentlyPlaying === guide.id ? stopAudio() : playAudio(guide.id)}
                    className="w-full flex items-center gap-2"
                  >
                    {currentlyPlaying === guide.id ? (
                      <>
                        <Pause className="h-4 w-4" />
                        {currentLanguage === "hi" ? "रोकें" : "Stop"}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        {currentLanguage === "hi" ? "सुनें" : "Play"}
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="voice" className="space-y-4">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center">
                <div className={`p-8 rounded-full border-4 transition-colors ${
                  isListening ? 'border-primary bg-primary/10 animate-pulse' : 'border-muted bg-muted/50'
                }`}>
                  {isListening ? (
                    <Mic className="h-12 w-12 text-primary" />
                  ) : (
                    <MicOff className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">
                  {currentLanguage === "hi" ? "वॉयस कमांड" : "Voice Commands"}
                </h4>
                <p className="text-sm text-muted-foreground mb-4">
                  {isListening 
                    ? (currentLanguage === "hi" ? "सुन रहा हूँ... बोलिए" : "Listening... Please speak")
                    : (currentLanguage === "hi" ? "माइक बटन दबाकर बोलें" : "Press mic button to speak")
                  }
                </p>
              </div>

              <Button
                size="lg"
                onClick={isListening ? () => setIsListening(false) : startVoiceRecognition}
                className="w-full"
                disabled={!audioEnabled}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    {currentLanguage === "hi" ? "रोकें" : "Stop Listening"}
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    {currentLanguage === "hi" ? "सुनना शुरू करें" : "Start Listening"}
                  </>
                )}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>{currentLanguage === "hi" ? "कमांड उदाहरण:" : "Example commands:"}</p>
                <p>• "{currentLanguage === "hi" ? "स्वास्थ्य दिखाओ" : "Show health"}"</p>
                <p>• "{currentLanguage === "hi" ? "खेत दिखाओ" : "Show map"}"</p>
                <p>• "{currentLanguage === "hi" ? "सहायता" : "Help"}"</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Languages className="h-4 w-4 inline mr-2" />
                  {currentLanguage === "hi" ? "भाषा" : "Language"}
                </label>
                <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  <Settings className="h-4 w-4 inline mr-2" />
                  {currentLanguage === "hi" ? "गति" : "Speed"}
                </label>
                <Select value={voiceSpeed} onValueChange={setVoiceSpeed}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">
                      {currentLanguage === "hi" ? "धीमा" : "Slow"}
                    </SelectItem>
                    <SelectItem value="normal">
                      {currentLanguage === "hi" ? "सामान्य" : "Normal"}
                    </SelectItem>
                    <SelectItem value="fast">
                      {currentLanguage === "hi" ? "तेज़" : "Fast"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {currentLanguage === "hi" ? "ऑडियो सक्षम" : "Audio Enabled"}
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="flex items-center gap-2"
                >
                  {audioEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      {currentLanguage === "hi" ? "चालू" : "On"}
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      {currentLanguage === "hi" ? "बंद" : "Off"}
                    </>
                  )}
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setCurrentLanguage("hi");
                  setVoiceSpeed("normal");
                  setAudioEnabled(true);
                  toast.success(currentLanguage === "hi" ? "सेटिंग्स रीसेट हो गईं" : "Settings reset");
                }}
                className="w-full flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                {currentLanguage === "hi" ? "रीसेट करें" : "Reset Settings"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default VoiceAssistant;
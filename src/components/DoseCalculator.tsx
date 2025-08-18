import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, ShoppingCart, AlertTriangle, Leaf, Bug, Droplets } from "lucide-react";

const DoseCalculator = () => {
  const [fertilizerData, setFertilizerData] = useState({
    area: "",
    crop: "",
    stage: "",
    soilType: "",
    currentNitrogen: "",
    phosphorus: "",
    potassium: ""
  });

  const [pesticideData, setPesticideData] = useState({
    area: "",
    crop: "",
    pestType: "",
    severity: "",
    weather: "",
    product: ""
  });

  const [fertilizerResult, setFertilizerResult] = useState<any>(null);
  const [pesticideResult, setPesticideResult] = useState<any>(null);

  const crops = [
    { value: "paddy", label: "धान (Paddy)" },
    { value: "wheat", label: "गेहूं (Wheat)" },
    { value: "maize", label: "मक्का (Maize)" },
    { value: "sugarcane", label: "गन्ना (Sugarcane)" },
    { value: "potato", label: "आलू (Potato)" }
  ];

  const cropStages = [
    { value: "sowing", label: "बुआई (Sowing)" },
    { value: "vegetative", label: "पत्ती विकास (Vegetative)" },
    { value: "flowering", label: "फूल आना (Flowering)" },
    { value: "maturity", label: "पकना (Maturity)" }
  ];

  const fertilizerProducts = [
    { name: "यूरिया (Urea)", npk: "46-0-0", price: 300 },
    { name: "डीएपी (DAP)", npk: "18-46-0", price: 1350 },
    { name: "एनपीके (NPK)", npk: "10-26-26", price: 900 },
    { name: "पोटाश (MOP)", npk: "0-0-60", price: 850 }
  ];

  const pesticideProducts = [
    { name: "नीम तेल (Neem Oil)", type: "organic", price: 180 },
    { name: "इमिडाक्लोप्रिड (Imidacloprid)", type: "systemic", price: 450 },
    { name: "क्लोरपायरिफॉस (Chlorpyrifos)", type: "contact", price: 320 },
    { name: "मैंकोजेब (Mancozeb)", type: "fungicide", price: 280 }
  ];

  const calculateFertilizerDose = () => {
    if (!fertilizerData.area || !fertilizerData.crop || !fertilizerData.stage) return;
    
    const area = parseFloat(fertilizerData.area);
    
    // Sample calculation logic based on crop and stage
    let recommendations = [];
    let totalCost = 0;

    if (fertilizerData.crop === "paddy") {
      if (fertilizerData.stage === "sowing") {
        recommendations = [
          { product: "यूरिया (Urea)", dose: Math.round(area * 50), unit: "kg", cost: Math.round(area * 50 * 6) },
          { product: "डीएपी (DAP)", dose: Math.round(area * 25), unit: "kg", cost: Math.round(area * 25 * 27) }
        ];
      } else if (fertilizerData.stage === "vegetative") {
        recommendations = [
          { product: "यूरिया (Urea)", dose: Math.round(area * 35), unit: "kg", cost: Math.round(area * 35 * 6) },
          { product: "पोटाश (MOP)", dose: Math.round(area * 20), unit: "kg", cost: Math.round(area * 20 * 17) }
        ];
      }
    }

    totalCost = recommendations.reduce((sum, item) => sum + item.cost, 0);

    setFertilizerResult({
      recommendations,
      totalCost,
      timing: "सुबह 6-8 बजे या शाम 4-6 बजे",
      instructions: [
        "मिट्टी में नमी होनी चाहिए",
        "बारिश से पहले न डालें",
        "यूरिया को बांटकर 2-3 बार डालें"
      ]
    });
  };

  const calculatePesticideDose = () => {
    if (!pesticideData.area || !pesticideData.crop || !pesticideData.pestType) return;
    
    const area = parseFloat(pesticideData.area);
    
    // Sample calculation logic
    let recommendations = [];
    let totalCost = 0;

    if (pesticideData.pestType === "insect") {
      recommendations = [
        { product: "नीम तेल (Neem Oil)", dose: Math.round(area * 2), unit: "ml/tank", cost: Math.round(area * 2 * 0.18) },
        { product: "पानी", dose: Math.round(area * 200), unit: "लीटर", cost: 0 }
      ];
    } else if (pesticideData.pestType === "fungus") {
      recommendations = [
        { product: "मैंकोजेब (Mancozeb)", dose: Math.round(area * 25), unit: "gm/tank", cost: Math.round(area * 25 * 0.28) }
      ];
    }

    totalCost = recommendations.reduce((sum, item) => sum + item.cost, 0);

    setPesticideResult({
      recommendations,
      totalCost,
      timing: "सुबह जल्दी या शाम को",
      instructions: [
        "हवा न चलने पर छिड़काव करें",
        "सुरक्षा उपकरण पहनें",
        "बच्चों और जानवरों से दूर रखें"
      ]
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary" />
          खुराक कैलकुलेटर (Dose Calculator)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="fertilizer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="fertilizer" className="flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              उर्वरक (Fertilizer)
            </TabsTrigger>
            <TabsTrigger value="pesticide" className="flex items-center gap-2">
              <Bug className="h-4 w-4" />
              कीटनाशक (Pesticide)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fertilizer" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>खेत का क्षेत्रफल (Farm Area)</Label>
                  <Input
                    placeholder="हेक्टेयर में (in hectares)"
                    value={fertilizerData.area}
                    onChange={(e) => setFertilizerData({...fertilizerData, area: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>फसल चुनें (Select Crop)</Label>
                  <Select value={fertilizerData.crop} onValueChange={(value) => setFertilizerData({...fertilizerData, crop: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="फसल चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          {crop.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>फसल की अवस्था (Crop Stage)</Label>
                  <Select value={fertilizerData.stage} onValueChange={(value) => setFertilizerData({...fertilizerData, stage: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="अवस्था चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {cropStages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculateFertilizerDose} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  खुराक कैलकुलेट करें
                </Button>
              </div>

              {fertilizerResult && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-success/10 to-success/5 p-4 rounded-lg border border-success/20">
                    <h4 className="font-semibold text-success mb-3">सिफारिश (Recommendations)</h4>
                    
                    <div className="space-y-2 mb-4">
                      {fertilizerResult.recommendations.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm font-medium">{item.product}</span>
                          <div className="text-right">
                            <div className="font-bold">{item.dose} {item.unit}</div>
                            <div className="text-xs text-success">₹{item.cost}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">कुल लागत:</span>
                        <span className="text-lg font-bold text-success">₹{fertilizerResult.totalCost}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>समय:</strong> {fertilizerResult.timing}
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>निर्देश:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {fertilizerResult.instructions.map((instruction: string, index: number) => (
                              <li key={index}>{instruction}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <Button className="w-full mt-3" variant="outline">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        उत्पाद खरीदें
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="pesticide" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>खेत का क्षेत्रफल (Farm Area)</Label>
                  <Input
                    placeholder="हेक्टेयर में (in hectares)"
                    value={pesticideData.area}
                    onChange={(e) => setPesticideData({...pesticideData, area: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>फसल चुनें (Select Crop)</Label>
                  <Select value={pesticideData.crop} onValueChange={(value) => setPesticideData({...pesticideData, crop: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="फसल चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      {crops.map((crop) => (
                        <SelectItem key={crop.value} value={crop.value}>
                          {crop.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>कीट/रोग का प्रकार (Pest/Disease Type)</Label>
                  <Select value={pesticideData.pestType} onValueChange={(value) => setPesticideData({...pesticideData, pestType: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="समस्या चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="insect">कीट (Insects)</SelectItem>
                      <SelectItem value="fungus">फंगस (Fungal Disease)</SelectItem>
                      <SelectItem value="weed">खरपतवार (Weeds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>गंभीरता (Severity)</Label>
                  <Select value={pesticideData.severity} onValueChange={(value) => setPesticideData({...pesticideData, severity: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="गंभीरता चुनें" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">हल्की (Mild)</SelectItem>
                      <SelectItem value="moderate">मध्यम (Moderate)</SelectItem>
                      <SelectItem value="severe">गंभीर (Severe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={calculatePesticideDose} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  खुराक कैलकुलेट करें
                </Button>
              </div>

              {pesticideResult && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-warning/10 to-warning/5 p-4 rounded-lg border border-warning/20">
                    <h4 className="font-semibold text-warning mb-3">छिड़काव सिफारिश (Spray Recommendations)</h4>
                    
                    <div className="space-y-2 mb-4">
                      {pesticideResult.recommendations.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                          <span className="text-sm font-medium">{item.product}</span>
                          <div className="text-right">
                            <div className="font-bold">{item.dose} {item.unit}</div>
                            {item.cost > 0 && <div className="text-xs text-warning">₹{item.cost}</div>}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold">कुल लागत:</span>
                        <span className="text-lg font-bold text-warning">₹{pesticideResult.totalCost}</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-3">
                        <strong>समय:</strong> {pesticideResult.timing}
                      </div>

                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-sm">
                          <strong>सुरक्षा निर्देश:</strong>
                          <ul className="list-disc list-inside mt-1">
                            {pesticideResult.instructions.map((instruction: string, index: number) => (
                              <li key={index}>{instruction}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                      
                      <Button className="w-full mt-3" variant="outline">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        उत्पाद खरीदें
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Quick Reference Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-600" />
                पानी की मात्रा
              </h4>
              <p className="text-sm text-blue-700">
                आम तौर पर 200-400 लीटर पानी प्रति हेक्टेयर का उपयोग करें
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-600" />
                सुझाव
              </h4>
              <p className="text-sm text-green-700">
                हमेशा स्थानीय कृषि विशेषज्ञ से सलाह लें
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DoseCalculator;
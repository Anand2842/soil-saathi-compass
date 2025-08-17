import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  ShoppingCart, 
  TrendingUp,
  Mic,
  Volume2,
  MapPin
} from 'lucide-react';

interface SimpleFarmerInterfaceProps {
  farmerData: {
    name: string;
    location: string;
    cropHealth: 'good' | 'warning' | 'critical';
    alerts: Array<{
      type: 'pest' | 'weather' | 'nutrition';
      message: string;
      urgency: 'low' | 'medium' | 'high';
    }>;
    todayActions: Array<{
      action: string;
      cost: number;
      expectedROI: string;
    }>;
    monthlyROI: string;
  };
}

const SimpleFarmerInterface: React.FC<SimpleFarmerInterfaceProps> = ({ farmerData }) => {
  const [isListening, setIsListening] = useState(false);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'good': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleVoiceCommand = () => {
    setIsListening(!isListening);
    // Voice recognition logic would go here
  };

  const handleWhatsAppExpert = () => {
    const message = `नमस्ते! मुझे अपनी फसल के बारे में मदद चाहिए। मेरी स्थिति: ${farmerData.location}`;
    window.open(`https://wa.me/918888888888?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCallExpert = () => {
    window.open('tel:+918888888888', '_self');
  };

  return (
    <div className="min-h-screen bg-background p-4 space-y-4">
      {/* Header */}
      <Card className="bg-primary text-primary-foreground">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">नमस्ते {farmerData.name} जी</h1>
              <div className="flex items-center gap-1 text-sm opacity-90">
                <MapPin size={14} />
                {farmerData.location}
              </div>
            </div>
            <Button
              variant="secondary"
              size="icon"
              onClick={handleVoiceCommand}
              className={isListening ? "bg-red-500" : ""}
            >
              <Mic size={20} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Crop Health Status */}
      <Card>
        <CardContent className="p-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold">आज की फसल स्थिति</h2>
            <Badge className={`text-lg px-4 py-2 ${getHealthColor(farmerData.cropHealth)}`}>
              {farmerData.cropHealth === 'good' && '🌿 स्वस्थ'}
              {farmerData.cropHealth === 'warning' && '⚠️ सावधान'}
              {farmerData.cropHealth === 'critical' && '🚨 तुरंत ध्यान दें'}
            </Badge>
            <div className="text-2xl font-bold text-primary">
              मासिक लाभ: {farmerData.monthlyROI}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent Alerts */}
      {farmerData.alerts.filter(alert => alert.urgency === 'high').map((alert, index) => (
        <Card key={index} className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-red-600" size={24} />
              <div>
                <p className="font-semibold text-red-800">तुरंत कार्य</p>
                <p className="text-red-700">{alert.message}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Today's Actions */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp size={20} />
            आज क्या करें
          </h3>
          <div className="space-y-3">
            {farmerData.todayActions.map((action, index) => (
              <div key={index} className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <p className="font-medium">{action.action}</p>
                  <Badge variant="outline">₹{action.cost}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  अपेक्षित लाभ: {action.expectedROI}
                </p>
                <Button className="w-full mt-2" size="sm">
                  <ShoppingCart size={16} className="mr-2" />
                  खरीदें
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expert Help */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">विशेषज्ञ सहायता</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              onClick={handleWhatsAppExpert}
              className="bg-green-600 hover:bg-green-700 text-white h-16"
            >
              <MessageCircle size={24} className="mb-1" />
              <div className="text-xs">WhatsApp पर<br />सवाल भेजें</div>
            </Button>
            <Button 
              onClick={handleCallExpert}
              variant="outline"
              className="h-16"
            >
              <Phone size={24} className="mb-1" />
              <div className="text-xs">कॉल करें<br />1800-123-4567</div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Voice Output for Read Aloud */}
      <Card className="bg-muted">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Volume2 size={16} />
            <span>बोलकर सुनने के लिए माइक बटन दबाएं</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SimpleFarmerInterface;
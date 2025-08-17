import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Mic, 
  Image as ImageIcon,
  Phone,
  CheckCircle,
  Clock
} from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  type: 'text' | 'voice' | 'image';
  content: string;
  timestamp: Date;
  from: 'farmer' | 'expert';
  status: 'sent' | 'delivered' | 'read';
}

const WhatsAppIntegration: React.FC = () => {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([
    {
      id: '1',
      type: 'text',
      content: 'नमस्ते! मेरी गेहूं की फसल में पीले पत्ते आ रहे हैं। क्या करूं?',
      timestamp: new Date(Date.now() - 300000),
      from: 'farmer',
      status: 'read'
    },
    {
      id: '2',
      type: 'text',
      content: 'नमस्ते राम जी! यह नाइट्रोजन की कमी लग रही है। क्या आपने यूरिया का छिड़काव किया है?',
      timestamp: new Date(Date.now() - 240000),
      from: 'expert',
      status: 'read'
    },
    {
      id: '3',
      type: 'text',
      content: 'नहीं सर, अभी तक नहीं किया। कब और कितना डालना चाहिए?',
      timestamp: new Date(Date.now() - 180000),
      from: 'farmer',
      status: 'read'
    },
    {
      id: '4',
      type: 'text',
      content: 'अभी 2 दिन में 50 किलो प्रति एकड़ यूरिया डालें। बारिश से पहले कर लें। मैं आपको लिंक भेज रहा हूँ।',
      timestamp: new Date(Date.now() - 120000),
      from: 'expert',
      status: 'read'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: WhatsAppMessage = {
      id: Date.now().toString(),
      type: 'text',
      content: newMessage,
      timestamp: new Date(),
      from: 'farmer',
      status: 'sent'
    };

    setMessages([...messages, message]);
    setNewMessage('');

    // Simulate expert response
    setTimeout(() => {
      const expertResponse: WhatsAppMessage = {
        id: (Date.now() + 1).toString(),
        type: 'text',
        content: 'धन्यवाद! मैं इसकी जांच करके आपको सुझाव दूंगा।',
        timestamp: new Date(),
        from: 'expert',
        status: 'sent'
      };
      setMessages(prev => [...prev, expertResponse]);
    }, 2000);
  };

  const startVoiceMessage = () => {
    setIsRecording(true);
    // Voice recording logic here
    setTimeout(() => {
      setIsRecording(false);
      const voiceMessage: WhatsAppMessage = {
        id: Date.now().toString(),
        type: 'voice',
        content: 'Voice message recorded (02:15)',
        timestamp: new Date(),
        from: 'farmer',
        status: 'sent'
      };
      setMessages(prev => [...prev, voiceMessage]);
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Clock size={12} className="text-muted-foreground" />;
      case 'delivered': return <CheckCircle size={12} className="text-muted-foreground" />;
      case 'read': return <CheckCircle size={12} className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-background">
      {/* WhatsApp Header */}
      <Card>
        <CardHeader className="bg-green-600 text-white p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold">AS</span>
            </div>
            <div>
              <CardTitle className="text-white text-lg">एग्री सलाहकार</CardTitle>
              <p className="text-green-100 text-sm">ऑनलाइन • कृषि विशेषज्ञ</p>
            </div>
            <div className="ml-auto">
              <Button variant="ghost" size="icon" className="text-white">
                <Phone size={20} />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="mt-2">
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.from === 'farmer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.from === 'farmer'
                      ? 'bg-green-500 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {message.type === 'voice' && (
                    <div className="flex items-center gap-2">
                      <Mic size={16} />
                      <span className="text-sm">{message.content}</span>
                    </div>
                  )}
                  {message.type === 'text' && (
                    <p className="text-sm">{message.content}</p>
                  )}
                  <div className="flex items-center justify-end gap-1 mt-1">
                    <span className="text-xs opacity-70">
                      {message.timestamp.toLocaleTimeString('hi-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    {message.from === 'farmer' && getStatusIcon(message.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="mt-2">
        <CardContent className="p-2">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={startVoiceMessage}
              className={isRecording ? "bg-red-100 text-red-600" : ""}
            >
              <Mic size={20} />
            </Button>
            <Input
              placeholder="यहाँ टाइप करें..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button
              variant="ghost"
              size="icon"
            >
              <ImageIcon size={20} />
            </Button>
            <Button
              size="icon"
              onClick={sendMessage}
              className="bg-green-600 hover:bg-green-700"
            >
              <Send size={20} />
            </Button>
          </div>
          
          {isRecording && (
            <div className="flex items-center justify-center gap-2 mt-2 p-2 bg-red-50 rounded">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600">रिकॉर्डिंग... (बोलना बंद करें)</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="mt-2">
        <CardContent className="p-3">
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="text-xs">
              फसल की फोटो भेजें
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              मौसम की जानकारी
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              बाजार भाव
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              विशेषज्ञ से कॉल
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Trust Indicators */}
      <Card className="mt-2 bg-blue-50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle size={16} className="text-blue-600" />
            <span className="text-blue-800">सरकारी प्रमाणित कृषि सलाहकार</span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-1">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-green-800">10,000+ किसानों ने भरोसा किया</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatsAppIntegration;
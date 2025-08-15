import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ShoppingCart, 
  Star, 
  Clock, 
  TrendingUp, 
  Package, 
  Shield,
  Zap,
  MapPin,
  Phone,
  CheckCircle,
  AlertCircle,
  Timer
} from 'lucide-react';
import { generateMarketplaceVendors, MarketplaceVendor } from '@/data/enhancedDemoData';

interface EnhancedMarketplaceProps {
  location: string;
  currentCrop: string;
}

const EnhancedMarketplace: React.FC<EnhancedMarketplaceProps> = ({ location, currentCrop }) => {
  const [vendors, setVendors] = useState<MarketplaceVendor[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('fertilizer');
  const [cartItems, setCartItems] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<number>(127);

  useEffect(() => {
    setVendors(generateMarketplaceVendors(location));
    
    // Simulate live order updates
    const interval = setInterval(() => {
      setRecentOrders(prev => prev + Math.floor(Math.random() * 3));
    }, 45000);

    return () => clearInterval(interval);
  }, [location]);

  const filteredVendors = vendors.filter(vendor => vendor.type === selectedCategory);

  const categories = [
    { id: 'fertilizer', name: 'Fertilizers', icon: '🌱', count: 45 },
    { id: 'seeds', name: 'Seeds', icon: '🌾', count: 32 },
    { id: 'equipment', name: 'Equipment', icon: '🚜', count: 28 },
    { id: 'insurance', name: 'Insurance', icon: '🛡️', count: 12 },
    { id: 'credit', name: 'Credit', icon: '💰', count: 8 }
  ];

  const getTotalGMV = () => {
    return vendors.reduce((total, vendor) => {
      return total + vendor.products.reduce((vendorTotal, product) => {
        return vendorTotal + (product.price * Math.floor(Math.random() * 50));
      }, 0);
    }, 0);
  };

  const addToCart = (productName: string) => {
    setCartItems(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Marketplace Header with Live Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              <span>Smart Marketplace - {location}</span>
            </CardTitle>
            <Badge variant="outline" className="animate-pulse">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">₹{(getTotalGMV() / 100000).toFixed(1)}L</div>
              <div className="text-sm text-muted-foreground">Today's GMV</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{recentOrders}</div>
              <div className="text-sm text-muted-foreground">Orders Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{vendors.length}</div>
              <div className="text-sm text-muted-foreground">Active Vendors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Navigation */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-5">
              {categories.map(category => (
                <TabsTrigger key={category.id} value={category.id} className="text-xs">
                  <span className="mr-1">{category.icon}</span>
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(category => (
              <TabsContent key={category.id} value={category.id} className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {category.count} products available in {location}
                  </div>
                  <Button variant="outline" size="sm" className="text-xs">
                    <ShoppingCart className="h-3 w-3 mr-1" />
                    Cart ({cartItems})
                  </Button>
                </div>

                {/* Vendor Cards */}
                <div className="space-y-4">
                  {filteredVendors.map(vendor => (
                    <Card key={vendor.id} className="border-2 hover:border-primary/20 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold">{vendor.name}</h3>
                              {vendor.verified && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{vendor.rating}</span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {vendor.orderVolume}+ orders
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{vendor.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Responds {vendor.responseTime}</span>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-3">
                          {vendor.products.map((product, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex-1">
                                <div className="font-medium">{product.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  ₹{product.price.toLocaleString()} per {product.unit}
                                </div>
                                {product.discount && (
                                  <Badge variant="destructive" className="text-xs mt-1">
                                    {product.discount}% OFF
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-right space-y-2">
                                <div className="text-sm">
                                  <span className={`font-medium ${product.availability < 10 ? 'text-destructive' : 'text-success'}`}>
                                    {product.availability} units
                                  </span>
                                </div>
                                <Button 
                                  size="sm" 
                                  onClick={() => addToCart(product.name)}
                                  disabled={product.availability === 0}
                                >
                                  {product.availability > 0 ? 'Add to Cart' : 'Out of Stock'}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Vendor Actions */}
                        <div className="flex space-x-2 mt-4 pt-4 border-t">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Phone className="h-3 w-3 mr-1" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Package className="h-3 w-3 mr-1" />
                            Bulk Order
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <Shield className="h-3 w-3 mr-1" />
                            Insurance
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Special Offers & Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <span>Smart Recommendations for {currentCrop}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded text-white">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-blue-800">Price Alert</div>
                  <div className="text-sm text-blue-700">
                    DAP fertilizer prices expected to rise 8% next week. Order now to save ₹2,400.
                  </div>
                </div>
                <Button size="sm" variant="default">
                  Order Now
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded text-white">
                  <Timer className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-green-800">Seasonal Offer</div>
                  <div className="text-sm text-green-700">
                    Premium seeds for {currentCrop} - 15% discount ends in 3 days. Limited stock.
                  </div>
                </div>
                <Button size="sm" variant="default">
                  Claim Offer
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500 rounded text-white">
                  <Shield className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-purple-800">Insurance Reminder</div>
                  <div className="text-sm text-purple-700">
                    Crop insurance premium due in 5 days. Renew now for uninterrupted coverage.
                  </div>
                </div>
                <Button size="sm" variant="default">
                  Renew
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedMarketplace;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Star, Truck, Phone } from "lucide-react";

const Marketplace = () => {
  const products = [
    {
      id: 1,
      name: "Nitrogen Fertilizer (Urea)",
      price: "₹1,200",
      originalPrice: "₹1,400",
      rating: 4.5,
      vendor: "Agro Solutions",
      deliveryTime: "2-3 days",
      category: "Fertilizer",
      recommended: true,
      image: "🌾"
    },
    {
      id: 2,
      name: "Organic Pesticide Spray",
      price: "₹850",
      originalPrice: "₹950",
      rating: 4.3,
      vendor: "Green Farm Co.",
      deliveryTime: "1-2 days",
      category: "Pesticide",
      recommended: false,
      image: "🌿"
    },
    {
      id: 3,
      name: "Soil pH Testing Kit",
      price: "₹450",
      originalPrice: "₹500",
      rating: 4.7,
      vendor: "Farm Tech",
      deliveryTime: "Same day",
      category: "Equipment",
      recommended: true,
      image: "🧪"
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-primary" />
          Agricultural Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Recommended Products Banner */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="font-semibold text-accent mb-2">🎯 Recommended for Your Farm</h3>
            <p className="text-sm text-muted-foreground">
              Based on your soil analysis and crop health assessment
            </p>
          </div>

          {/* Product List */}
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="text-2xl">{product.image}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{product.name}</h4>
                        {product.recommended && (
                          <Badge className="bg-accent/10 text-accent" variant="secondary">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{product.vendor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-accent text-accent" />
                          <span className="text-xs">{product.rating}</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Truck className="h-3 w-3" />
                          {product.deliveryTime}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold">{product.price}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        {product.originalPrice}
                      </span>
                    </div>
                    <Badge variant="outline" className="mt-1">
                      {product.category}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="flex-1" size="sm">
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Add to Cart
                  </Button>
                  <Button variant="outline" size="sm">
                    <Phone className="h-4 w-4 mr-1" />
                    Call
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Categories */}
          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Browse Categories</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="justify-start">
                🌾 Seeds & Fertilizers
              </Button>
              <Button variant="outline" className="justify-start">
                🚜 Farm Equipment
              </Button>
              <Button variant="outline" className="justify-start">
                🌿 Pesticides & Herbicides
              </Button>
              <Button variant="outline" className="justify-start">
                📱 Smart Farming Tools
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Marketplace;
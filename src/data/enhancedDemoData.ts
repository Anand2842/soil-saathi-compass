// Enhanced demo data with real-time simulation capabilities
import { DemoScenario } from './demoData';

export interface RealTimeMarketData {
  cropName: string;
  currentPrice: number;
  priceChange: number;
  trend: 'up' | 'down' | 'stable';
  demandLevel: 'high' | 'medium' | 'low';
  marketVolume: number;
}

export interface WeatherAlert {
  id: string;
  type: 'warning' | 'info' | 'critical';
  title: string;
  message: string;
  actionRequired: boolean;
  timestamp: Date;
  impact: string;
}

export interface FieldMetrics {
  healthScore: number;
  moistureLevel: number;
  nutrientIndex: number;
  pestRisk: number;
  yieldPotential: number;
  lastUpdated: Date;
}

export interface FinancialImpact {
  currentRevenue: number;
  projectedRevenue: number;
  inputCosts: number;
  savedCosts: number;
  profitMargin: number;
  roiPercentage: number;
  carbonCredits: number;
  governmentSubsidy: number;
}

export interface AIRecommendation {
  id: string;
  priority: 'high' | 'medium' | 'low';
  category: 'irrigation' | 'fertilizer' | 'pesticide' | 'harvest' | 'market';
  title: string;
  description: string;
  expectedImpact: string;
  cost: number;
  timeframe: string;
  successProbability: number;
  urgency: boolean;
}

export interface MarketplaceVendor {
  id: string;
  name: string;
  type: 'fertilizer' | 'seeds' | 'equipment' | 'insurance' | 'credit';
  rating: number;
  location: string;
  products: Array<{
    name: string;
    price: number;
    unit: string;
    availability: number;
    discount?: number;
  }>;
  verified: boolean;
  responseTime: string;
  orderVolume: number;
}

// Real-time market data simulation
export const generateRealTimeMarketData = (crops: string[]): RealTimeMarketData[] => {
  const basePrice = { wheat: 2500, rice: 3200, cotton: 6800, sugarcane: 350, maize: 2200 };
  
  return crops.map(crop => {
    const price = basePrice[crop as keyof typeof basePrice] || 2000;
    const change = (Math.random() - 0.5) * 200;
    
    return {
      cropName: crop,
      currentPrice: Math.round(price + change),
      priceChange: Math.round(change),
      trend: change > 50 ? 'up' : change < -50 ? 'down' : 'stable',
      demandLevel: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
      marketVolume: Math.round(Math.random() * 10000 + 5000)
    };
  });
};

// Dynamic weather alerts based on location and season
export const generateWeatherAlerts = (location: string): WeatherAlert[] => {
  const alerts = [
    {
      id: '1',
      type: 'warning' as const,
      title: 'Heavy Rainfall Expected',
      message: `Monsoon intensity increasing in ${location}. Consider harvesting mature crops within 48 hours.`,
      actionRequired: true,
      timestamp: new Date(),
      impact: 'May reduce yield by 15-20% if not harvested'
    },
    {
      id: '2',
      type: 'info' as const,
      title: 'Optimal Irrigation Window',
      message: 'Soil moisture at 65%. Perfect time for deep watering before dry spell.',
      actionRequired: false,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      impact: 'Can improve yield by 12-15%'
    },
    {
      id: '3',
      type: 'critical' as const,
      title: 'Pest Outbreak Alert',
      message: 'Brown plant hopper detected in neighboring fields. Immediate action recommended.',
      actionRequired: true,
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      impact: 'Potential 30-40% crop loss if untreated'
    }
  ];

  return alerts.slice(0, Math.floor(Math.random() * 3) + 1);
};

// Dynamic field metrics with realistic fluctuations
export const generateFieldMetrics = (crop: string, stage: string): FieldMetrics => {
  const baseMetrics = {
    healthScore: 75 + Math.random() * 20,
    moistureLevel: 60 + Math.random() * 30,
    nutrientIndex: 70 + Math.random() * 25,
    pestRisk: Math.random() * 40,
    yieldPotential: 80 + Math.random() * 15
  };

  // Adjust based on crop type and growth stage
  if (crop === 'rice' && stage === 'flowering') {
    baseMetrics.moistureLevel += 10;
    baseMetrics.yieldPotential += 5;
  }

  return {
    ...baseMetrics,
    healthScore: Math.round(baseMetrics.healthScore),
    moistureLevel: Math.round(baseMetrics.moistureLevel),
    nutrientIndex: Math.round(baseMetrics.nutrientIndex),
    pestRisk: Math.round(baseMetrics.pestRisk),
    yieldPotential: Math.round(baseMetrics.yieldPotential),
    lastUpdated: new Date()
  };
};

// Financial impact calculator with real-time updates
export const calculateFinancialImpact = (scenario: DemoScenario): FinancialImpact => {
  const baseRevenue = scenario.fieldData.area * 50000; // ₹50k per acre base
  const improvement = scenario.roi / 100;
  
  return {
    currentRevenue: Math.round(baseRevenue * (1 + improvement)),
    projectedRevenue: Math.round(baseRevenue * (1 + improvement + 0.1)),
    inputCosts: Math.round(baseRevenue * 0.4),
    savedCosts: Math.round(baseRevenue * 0.15),
    profitMargin: Math.round((baseRevenue * improvement) * 0.6),
    roiPercentage: scenario.roi,
    carbonCredits: Math.round(scenario.fieldData.area * 1200),
    governmentSubsidy: Math.round(baseRevenue * 0.15)
  };
};

// Intelligent AI recommendations based on context
export const generateAIRecommendations = (scenario: DemoScenario): AIRecommendation[] => {
  const { farmer, fieldData } = scenario;
  const recommendations = [];

  // Location-specific recommendations
  if (farmer.location.includes('Punjab')) {
    recommendations.push({
      id: '1',
      priority: 'high' as const,
      category: 'irrigation' as const,
      title: 'Switch to Drip Irrigation',
      description: 'Water table declining in Punjab. Drip irrigation can reduce water usage by 40%.',
      expectedImpact: '+18% yield, -40% water usage',
      cost: 45000,
      timeframe: '2-3 weeks installation',
      successProbability: 92,
      urgency: true
    });
  }

  // Crop-specific recommendations
  if (fieldData.primaryCrop === 'wheat') {
    recommendations.push({
      id: '2',
      priority: 'medium' as const,
      category: 'fertilizer' as const,
      title: 'Apply Zinc Sulfate',
      description: 'Soil analysis shows zinc deficiency. Apply 25kg/acre for better grain filling.',
      expectedImpact: '+12% grain weight, improved protein',
      cost: 1500,
      timeframe: 'Apply within 7 days',
      successProbability: 88,
      urgency: false
    });
  }

  // Season-specific recommendations
  const currentMonth = new Date().getMonth();
  if (currentMonth >= 6 && currentMonth <= 9) { // Monsoon season
    recommendations.push({
      id: '3',
      priority: 'high' as const,
      category: 'pesticide' as const,
      title: 'Preventive Fungicide Spray',
      description: 'High humidity increases fungal disease risk. Preventive spray recommended.',
      expectedImpact: 'Prevents 25-30% yield loss',
      cost: 2800,
      timeframe: 'Apply before next rainfall',
      successProbability: 85,
      urgency: true
    });
  }

  return recommendations;
};

// Enhanced marketplace vendors with dynamic data
export const generateMarketplaceVendors = (location: string): MarketplaceVendor[] => {
  return [
    {
      id: 'v1',
      name: 'Kisan Agro Solutions',
      type: 'fertilizer',
      rating: 4.8,
      location: `${location} District`,
      products: [
        { name: 'DAP Fertilizer', price: 1450, unit: '50kg bag', availability: 45 },
        { name: 'Urea', price: 280, unit: '45kg bag', availability: 120, discount: 5 }
      ],
      verified: true,
      responseTime: '< 2 hours',
      orderVolume: 1250
    },
    {
      id: 'v2',
      name: 'Smart Irrigation Systems',
      type: 'equipment',
      rating: 4.6,
      location: `${location} District`,
      products: [
        { name: 'Drip Irrigation Kit', price: 12500, unit: '1 acre', availability: 8 },
        { name: 'Sprinkler System', price: 8500, unit: '1 acre', availability: 12 }
      ],
      verified: true,
      responseTime: '< 4 hours',
      orderVolume: 340
    },
    {
      id: 'v3',
      name: 'Bharti AXA Crop Insurance',
      type: 'insurance',
      rating: 4.4,
      location: 'Regional Office',
      products: [
        { name: 'Weather-Based Insurance', price: 2500, unit: 'per acre', availability: 100 },
        { name: 'Yield Protection', price: 3200, unit: 'per acre', availability: 100 }
      ],
      verified: true,
      responseTime: '< 24 hours',
      orderVolume: 890
    }
  ];
};

// Success story timeline data
export const generateSuccessTimeline = (scenario: DemoScenario) => {
  const startDate = new Date('2024-01-15');
  
  return [
    {
      date: startDate,
      event: 'Farmer Onboarding',
      description: `${scenario.farmer.name} joined Soil Saathi platform`,
      impact: 'Baseline assessment completed',
      metrics: { healthScore: 58, yield: '2.8 tons/acre' }
    },
    {
      date: new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000),
      event: 'First Satellite Analysis',
      description: 'NDVI analysis revealed nitrogen deficiency in 40% of field',
      impact: 'Targeted fertilizer application recommended',
      metrics: { healthScore: 62, yield: 'Projected improvement' }
    },
    {
      date: new Date(startDate.getTime() + 60 * 24 * 60 * 60 * 1000),
      event: 'Smart Irrigation Installed',
      description: 'Drip irrigation system installed based on soil moisture data',
      impact: '35% water savings, improved nutrient uptake',
      metrics: { healthScore: 75, yield: '3.2 tons/acre' }
    },
    {
      date: new Date(startDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      event: 'Pest Management Success',
      description: 'Early pest detection prevented major outbreak',
      impact: 'Avoided ₹25,000 potential loss',
      metrics: { healthScore: 82, yield: '3.5 tons/acre' }
    },
    {
      date: new Date(startDate.getTime() + 120 * 24 * 60 * 60 * 1000),
      event: 'Record Harvest',
      description: 'Achieved highest yield in 5 years',
      impact: `${scenario.roi}% increase, ₹${(scenario.roi * 1000).toLocaleString()} additional income`,
      metrics: { healthScore: 88, yield: '4.1 tons/acre' }
    }
  ];
};

export default {
  generateRealTimeMarketData,
  generateWeatherAlerts,
  generateFieldMetrics,
  calculateFinancialImpact,
  generateAIRecommendations,
  generateMarketplaceVendors,
  generateSuccessTimeline
};
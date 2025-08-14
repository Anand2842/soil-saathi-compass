// Enhanced Demo Data for Investor Presentation
// Realistic Indian farming scenarios with regional specificity

export interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  state: string;
  district: string;
  farmSize: number;
  primaryCrop: string;
  language: string;
  phone: string;
  experience: number;
  landOwnership: 'owned' | 'leased' | 'sharecropped';
  irrigationType: string;
  monthlyIncome: number;
  demographics: {
    age: number;
    education: string;
    familySize: number;
    smartphones: number;
  };
  challenges: string[];
  successStory: string;
  yieldImprovement: number;
  costSavings: number;
  revenueIncrease: number;
}

export interface RegionData {
  state: string;
  districts: string[];
  primaryCrops: string[];
  avgFarmSize: number;
  soilTypes: string[];
  climateZone: string;
  rainfall: number;
  temperature: { min: number; max: number };
  growingSeason: string;
  marketAccess: 'excellent' | 'good' | 'moderate' | 'poor';
}

export interface MarketplaceVendor {
  id: string;
  name: string;
  location: string;
  type: 'cooperative' | 'private' | 'government' | 'online';
  rating: number;
  products: string[];
  deliveryRadius: number;
  paymentMethods: string[];
  verified: boolean;
  languages: string[];
  contactNumber: string;
  gstNumber?: string;
}

export interface DemoScenario {
  title: string;
  description: string;
  farmer: FarmerProfile;
  fieldData: any;
  beforeAfter: {
    before: { yield: number; profit: number; issues: string[] };
    after: { yield: number; profit: number; improvements: string[] };
  };
  timeline: string;
  roi: number;
}

// Realistic Indian Farmer Profiles
export const farmerProfiles: FarmerProfile[] = [
  {
    id: 'bihar_001',
    name: 'राम कुमार सिंह (Ram Kumar Singh)',
    location: 'Nalanda, Bihar',
    state: 'Bihar',
    district: 'Nalanda',
    farmSize: 1.2,
    primaryCrop: 'धान (Paddy)',
    language: 'Hindi/Bhojpuri',
    phone: '+91 94XXX-XXXXX',
    experience: 15,
    landOwnership: 'owned',
    irrigationType: 'Tube well + Rainwater',
    monthlyIncome: 25000,
    demographics: {
      age: 42,
      education: 'Class 8',
      familySize: 6,
      smartphones: 2
    },
    challenges: ['Erratic rainfall', 'Fertilizer costs', 'Market price volatility'],
    successStory: 'Increased paddy yield by 35% using satellite-guided irrigation timing',
    yieldImprovement: 35,
    costSavings: 18000,
    revenueIncrease: 42000
  },
  {
    id: 'punjab_001',
    name: 'ਗੁਰਦੀਪ ਸਿੰਘ (Gurdeep Singh)',
    location: 'Ludhiana, Punjab',
    state: 'Punjab',
    district: 'Ludhiana',
    farmSize: 3.8,
    primaryCrop: 'ਕਣਕ (Wheat)',
    language: 'Punjabi/Hindi',
    phone: '+91 98XXX-XXXXX',
    experience: 22,
    landOwnership: 'owned',
    irrigationType: 'Canal + Drip system',
    monthlyIncome: 75000,
    demographics: {
      age: 48,
      education: 'Graduate',
      familySize: 5,
      smartphones: 3
    },
    challenges: ['Soil degradation', 'Water table depletion', 'Input costs rising'],
    successStory: 'Reduced fertilizer use by 25% while maintaining yields through precision farming',
    yieldImprovement: 15,
    costSavings: 35000,
    revenueIncrease: 28000
  },
  {
    id: 'karnataka_001',
    name: 'ರಾಮೇಶ್ ರೆಡ್ಡಿ (Ramesh Reddy)',
    location: 'Belgaum, Karnataka',
    state: 'Karnataka',
    district: 'Belgaum',
    farmSize: 2.1,
    primaryCrop: 'ಕಬ್ಬು (Sugarcane)',
    language: 'Kannada/Hindi',
    phone: '+91 90XXX-XXXXX',
    experience: 18,
    landOwnership: 'owned',
    irrigationType: 'Borewell + Sprinkler',
    monthlyIncome: 55000,
    demographics: {
      age: 39,
      education: 'Class 12',
      familySize: 4,
      smartphones: 2
    },
    challenges: ['Water scarcity', 'Pest attacks', 'Sugar mill payments delayed'],
    successStory: 'Early pest detection through satellite monitoring saved 60% of crop',
    yieldImprovement: 28,
    costSavings: 22000,
    revenueIncrease: 85000
  },
  {
    id: 'maharashtra_001',
    name: 'सुनील पाटील (Sunil Patil)',
    location: 'Nashik, Maharashtra',
    state: 'Maharashtra',
    district: 'Nashik',
    farmSize: 1.8,
    primaryCrop: 'अंगूर (Grapes)',
    language: 'Marathi/Hindi',
    phone: '+91 97XXX-XXXXX',
    experience: 12,
    landOwnership: 'owned',
    irrigationType: 'Drip irrigation',
    monthlyIncome: 65000,
    demographics: {
      age: 35,
      education: 'Class 10',
      familySize: 5,
      smartphones: 2
    },
    challenges: ['Fungal diseases', 'Export quality standards', 'Climate change'],
    successStory: 'Achieved export quality grapes with 40% reduction in fungicide use',
    yieldImprovement: 32,
    costSavings: 28000,
    revenueIncrease: 95000
  }
];

// Regional Data
export const regionData: RegionData[] = [
  {
    state: 'Bihar',
    districts: ['Nalanda', 'Patna', 'Bhojpur', 'Vaishali', 'Muzaffarpur'],
    primaryCrops: ['Paddy', 'Wheat', 'Maize', 'Sugarcane'],
    avgFarmSize: 1.1,
    soilTypes: ['Alluvial', 'Sandy loam'],
    climateZone: 'Subtropical humid',
    rainfall: 1200,
    temperature: { min: 15, max: 35 },
    growingSeason: 'Kharif & Rabi',
    marketAccess: 'moderate'
  },
  {
    state: 'Punjab',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda'],
    primaryCrops: ['Wheat', 'Paddy', 'Cotton', 'Maize'],
    avgFarmSize: 3.8,
    soilTypes: ['Alluvial', 'Sandy'],
    climateZone: 'Semi-arid',
    rainfall: 650,
    temperature: { min: 5, max: 42 },
    growingSeason: 'Year-round',
    marketAccess: 'excellent'
  },
  {
    state: 'Karnataka',
    districts: ['Belgaum', 'Bangalore Rural', 'Mysore', 'Hassan', 'Mandya'],
    primaryCrops: ['Sugarcane', 'Cotton', 'Coffee', 'Ragi'],
    avgFarmSize: 2.3,
    soilTypes: ['Red soil', 'Black soil', 'Laterite'],
    climateZone: 'Tropical',
    rainfall: 900,
    temperature: { min: 18, max: 32 },
    growingSeason: 'Monsoon dependent',
    marketAccess: 'good'
  }
];

// Verified Marketplace Vendors
export const marketplaceVendors: MarketplaceVendor[] = [
  {
    id: 'bihar_coop_001',
    name: 'बिहार किसान सहकारी समिति',
    location: 'Patna, Bihar',
    type: 'cooperative',
    rating: 4.6,
    products: ['Fertilizers', 'Seeds', 'Pesticides', 'Farm tools'],
    deliveryRadius: 50,
    paymentMethods: ['UPI', 'Cash', 'Bank transfer'],
    verified: true,
    languages: ['Hindi', 'Bhojpuri'],
    contactNumber: '+91 612-XXX-XXXX',
    gstNumber: '10XXXXX0000X1ZX'
  },
  {
    id: 'punjab_agri_001',
    name: 'Punjab Agri Solutions',
    location: 'Ludhiana, Punjab',
    type: 'private',
    rating: 4.8,
    products: ['Advanced fertilizers', 'Hybrid seeds', 'Irrigation equipment'],
    deliveryRadius: 100,
    paymentMethods: ['UPI', 'Credit card', 'EMI'],
    verified: true,
    languages: ['Punjabi', 'Hindi', 'English'],
    contactNumber: '+91 161-XXX-XXXX',
    gstNumber: '03XXXXX0000X1ZX'
  },
  {
    id: 'karnataka_tech_001',
    name: 'Karnataka Farm Tech',
    location: 'Belgaum, Karnataka',
    type: 'private',
    rating: 4.5,
    products: ['Drip systems', 'Solar pumps', 'Organic fertilizers'],
    deliveryRadius: 75,
    paymentMethods: ['UPI', 'Cash on delivery', 'NEFT'],
    verified: true,
    languages: ['Kannada', 'Hindi', 'English'],
    contactNumber: '+91 831-XXX-XXXX'
  }
];

// Success Metrics for Investor Dashboard
export const successMetrics = {
  userGrowth: {
    currentUsers: 125000,
    monthlyGrowth: 15.8,
    quarterlyGrowth: 47.2,
    yearlyGrowth: 285.6,
    targetUsers: 500000,
    projectedReach: 850000
  },
  farmersHelped: {
    totalFarmers: 95000,
    activeFarmers: 78000,
    avgFarmSize: 2.1,
    totalAreaCovered: 163800, // hectares
    statesActive: 12,
    districtsActive: 156
  },
  yieldImprovements: {
    averageIncrease: 27.5, // percentage
    totalValueCreated: 18500000, // INR crores
    costSavings: 12300000, // INR crores
    waterSaved: 2.8, // billion liters
    fertilizerReduced: 35.4 // percentage
  },
  marketplaceGMV: {
    monthlyGMV: 8500000, // INR
    quarterlyGMV: 24500000,
    yearlyGMV: 89000000,
    avgOrderValue: 3200,
    totalOrders: 45000,
    vendorNetwork: 2400
  },
  technology: {
    satelliteImages: 45000,
    aiAnalyses: 125000,
    accuracyRate: 89.3,
    responseTime: 2.4, // seconds
    uptime: 99.7,
    languagesSupported: 8
  }
};

// Demo Scenarios for Different Investor Presentations
export const demoScenarios: DemoScenario[] = [
  {
    title: 'Bihar Paddy Farmer Success Story',
    description: 'How satellite-guided irrigation increased yield by 35%',
    farmer: farmerProfiles[0],
    fieldData: {
      location: { lat: 25.2041, lng: 85.1000 },
      size: 1.2,
      soilType: 'Alluvial',
      irrigationType: 'Tube well'
    },
    beforeAfter: {
      before: { yield: 3.2, profit: 85000, issues: ['Over-irrigation', 'Nutrient deficiency', 'Pest risk'] },
      after: { yield: 4.32, profit: 127000, improvements: ['Optimal water use', 'Precision nutrition', 'Early pest detection'] }
    },
    timeline: '6 months',
    roi: 280
  },
  {
    title: 'Punjab Wheat Precision Farming',
    description: 'Reduced input costs while maintaining premium yields',
    farmer: farmerProfiles[1],
    fieldData: {
      location: { lat: 30.9000, lng: 75.8500 },
      size: 3.8,
      soilType: 'Alluvial',
      irrigationType: 'Canal + Drip'
    },
    beforeAfter: {
      before: { yield: 45, profit: 285000, issues: ['Excess fertilizer', 'Uneven irrigation', 'Soil degradation'] },
      after: { yield: 45, profit: 348000, improvements: ['25% less fertilizer', 'Uniform irrigation', 'Soil health improved'] }
    },
    timeline: '2 crop seasons',
    roi: 180
  }
];

// Investment Projections
export const investmentProjections = {
  currentValuation: 25000000, // 25 Cr INR
  projectedValuation: {
    year1: 45000000,
    year2: 85000000,
    year3: 150000000
  },
  revenueModel: {
    subscriptions: 40, // percentage
    marketplace: 35,
    premiumServices: 15,
    dataLicensing: 10
  },
  fundingRequirements: {
    total: 50000000, // 50 Cr INR
    breakdown: {
      technology: 25000000,
      marketing: 15000000,
      operations: 7000000,
      workingCapital: 3000000
    }
  }
};

export default {
  farmerProfiles,
  regionData,
  marketplaceVendors,
  successMetrics,
  demoScenarios,
  investmentProjections
};
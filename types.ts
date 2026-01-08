
export type Language = 'fr' | 'en';

export enum HotelStanding {
  ECONOMY = "Economy (1-2 Stars)",
  MIDSCALE = "Midscale (3-4 Stars)",
  LUXURY = "Luxury (5 Stars & Palace)"
}

export interface ChartDataPoint {
  year: string;
  value: number; 
  to?: number; 
  adr?: number; 
  revpar?: number; 
  category?: string;
}

export interface MonthlyPerformance {
  month: string;
  to: number; 
  adr: number; 
  revpar: number;
}

export interface TourismStats {
  month: string;
  nightsDomestic: number; 
  nightsInternational: number; 
  avgStayDuration: number; 
}

export interface AnnualTourismStats {
  year: string;
  nightsDomestic: number;
  nightsInternational: number;
  total: number;
}

export interface HistoricalPopulation {
  year: string;
  population: number;
}

export interface SupplyDistribution {
  category: string; 
  hotels: number;
  rooms: number;
}

export interface Competitor {
  name: string;
  stars: number; 
  roomCount: {
    total: number;
    standard: number;
    suites: number;
  };
  amenities: string[]; 
  services: string[]; 
  rating: number;
  priceLevel: string;
  distance: string;
  strength: string;
  weakness: string;
  webUrl: string; 
}

export interface GeoData {
  nom: string;
  code: string; 
  population: number;
  codeDepartement: string;
  codeRegion: string;
  centre: {
    coordinates: [number, number]; 
  };
}

export interface CatchmentZone {
  type: "Primary Zone" | "Secondary Zone" | "Tertiary Zone"; 
  radius: string; 
  population: string; 
  evolution: string; 
  density: string; 
}

// --- NEW 10-YEAR BUSINESS PLAN TYPES (DETAIL) ---

export interface FinancialAssumptions {
  // Structure
  roomCount: number;
  surface: number; // Total Surface (m2)
  daysOpen: number;
  
  // Market Assumptions
  targetOccupancy: number; 
  targetAdr: number; 
  
  // Growth & Inflation
  annualInflation: number; 
  adrGrowth: number; 
  
  // Ramp-up
  rampUpYear1: number; 
  rampUpYear2: number;
  rampUpYear3: number;

  // Ancillary Revenue
  fbRevenuePerRoom: number; 
  otherRevenueShare: number; 

  // Departmental Ratios (Global % of Dept Revenue)
  roomsCostRatio: number; // Global Cost Rooms Division (% Room Rev)
  fbCostRatio: number; // Global Cost F&B (% F&B Rev)
  
  // Undistributed Ratios (% Total Revenue)
  adminRatio: number;
  marketingRatio: number;
  pomRatio: number; // Maintenance
  utilitiesRatio: number; // Energy/Water
  
  // Fees & Non-Op
  managementFees: number; // % Total Rev
  insurancePropertyTaxes: number; // Fixed annual amount
  reserves: number; // FF&E % Total Rev
  capex: number; // Fixed annual amount (Owner Capex)
}

export interface YearlyResult {
  year: number;
  surface: number; 
  inflation: number; 
  occupancy: number;
  adr: number;
  revpar: number;
  
  // Revenues
  revenueRoom: number;
  revenueFB: number;
  revenueOther: number;
  totalRevenue: number;

  // Departmental Expenses Breakdown (Calculated)
  roomsCOS: number; // Cost of Sales / Supplies
  roomsPayroll: number;
  roomsOther: number;
  
  fbCOS: number;
  fbPayroll: number;
  fbOther: number;
  
  totalDeptExpenses: number;
  totalDeptIncome: number;

  // Undistributed Expenses
  adminExpenses: number;
  marketingExpenses: number;
  pomExpenses: number;
  utilitiesExpenses: number;
  itExpenses: number;
  
  totalUndistributed: number;

  // Results hierarchy
  gop: number; 
  fees: number;
  nonOperating: number;
  ebitda: number;
  ffe: number;
  ebitdaLessFFE: number;
  capex: number;
  ebitdaLessCapex: number;
  
  margin: number; 
}

// --- NEW: Valuation Types ---
export interface ValuationParams {
  capRate: number; // Taux de capitalisation (Yield)
  discountRate: number; // Taux d'actualisation (WACC)
  exitCapRate: number; // Taux de sortie
  pricePerKey: number; // Prix par clé (Comparables)
  transactionCosts: number; // % (Droits, Notaire, Agent)
  renovationCapex: number; // Montant forfaitaire Day 1
}

export interface TransactionRef {
  name: string;
  location: string;
  year: string;
  price: number;
  keys: number;
  pricePerKey: number;
  standing: number; // Stars
  buyerProfile: string; // REIT, Private Equity, Family Office...
  yield?: number; // Yield at acquisition
}

export interface MarketStudyData {
  location: string;
  standing: string;
  geoData?: GeoData;
  summary: string;
  
  marketTrends: string;

  keyMetrics: {
    occupancyRate: string;
    adr: string;
    revpar: string;
    supplyGrowth: string;
  };

  supply: {
    totalHotels: number;
    totalRooms: number;
    campings: number;
    otherResidences: number;
    distribution: SupplyDistribution[]; 
    analysis: string; 
  };

  economy: {
    topEmployers: Array<{ name: string; sector: string; workforce: string }>;
    unemploymentRate: string;
    majorProjects: string[]; 
    businessDensity: string;
    growthSectors: string[];
  };

  demographics: {
    totalPopulation: string;
    growthRate: string;
    ageStructure: string;
    householdIncome: string; 
    purchasingPower: string;
    historicalData: HistoricalPopulation[]; 
  };

  catchment: {
    zones: CatchmentZone[];
    analysis: string;
  };

  transport: {
    nearestStation: string;
    railTraffic: string; 
    nearestAirport: string;
    airportConnectivity: string; 
    roadInfrastructure: string; 
    trafficAnalysis: string; 
    publicTransit: string; 
    connectivityScore: string; 
  };

  tourism: {
    hotelCapacity: string;
    annualNights: string;
    seasonalityCurve: string;
    mainAttractions: string[];
    localEvents: Array<{ name: string; period: string; impact: string }>;
    targetAudience: Array<{ type: string; percentage: string; motivation: string }>;
    inseeStats: TourismStats[]; 
    annualStats: AnnualTourismStats[]; 
  };

  realEstate: {
    averagePriceM2: string;
    commercialRentTrend: string;
    neighborhoodVibe: string;
  };

  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  
  historicalData: ChartDataPoint[];
  forecastData: ChartDataPoint[];
  seasonalityData: MonthlyPerformance[]; 
  competitors: Competitor[];
  groundingUrls: string[];
}

export interface GenerationState {
  isLoading: boolean;
  step: string;
  error: string | null;
}
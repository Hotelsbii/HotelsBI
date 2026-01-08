
import { Language } from "../types";

export interface HotelPerformance {
  to: number; // Taux d'Occupation (%)
  pm: number; // Prix Moyen (ADR) (€)
  revpar: number; // Revenue Per Available Room (€)
}

const REGION_MAP: Record<string, string> = {
  "11": "Île-de-France",
  "24": "Centre-Val de Loire",
  "27": "Bourgogne-Franche-Comté",
  "28": "Normandie",
  "32": "Hauts-de-France",
  "44": "Grand Est",
  "52": "Pays de la Loire",
  "53": "Bretagne",
  "75": "Nouvelle-Aquitaine",
  "76": "Occitanie",
  "84": "Auvergne-Rhône-Alpes",
  "93": "Provence-Alpes-Côte d'Azur",
  "94": "Corse"
};

const PERFORMANCE_DB: Record<string, { to: number[], pm: number[] }> = {
  // ... (Garder les mêmes données DB)
  "paris": { to: [32, 45, 72, 78, 81], pm: [180, 210, 280, 310, 350] },
  "lyon": { to: [30, 42, 65, 71, 73], pm: [90, 105, 125, 135, 142] },
  "marseille": { to: [35, 48, 68, 74, 76], pm: [95, 110, 130, 145, 155] },
  "bordeaux": { to: [31, 44, 66, 72, 74], pm: [92, 108, 128, 138, 145] },
  "lille": { to: [28, 40, 62, 69, 71], pm: [85, 95, 115, 125, 130] },
  "nice": { to: [34, 46, 67, 73, 75], pm: [110, 130, 160, 180, 195] },
  "toulouse": { to: [29, 41, 63, 68, 70], pm: [80, 90, 105, 115, 120] },
  "strasbourg": { to: [27, 39, 64, 70, 72], pm: [88, 100, 120, 132, 140] },
  "nantes": { to: [30, 43, 65, 70, 72], pm: [82, 92, 110, 120, 125] },
  "rennes": { to: [29, 41, 63, 68, 70], pm: [78, 88, 102, 112, 118] },
  "biarritz": { to: [36, 49, 69, 74, 76], pm: [120, 140, 175, 190, 205] },
  "cannes": { to: [33, 45, 66, 72, 74], pm: [150, 180, 250, 280, 310] },
  "deauville": { to: [38, 51, 68, 73, 75], pm: [140, 160, 200, 220, 235] },
  "Île-de-France": { to: [31, 44, 70, 76, 79], pm: [140, 160, 210, 240, 270] },
  "Auvergne-Rhône-Alpes": { to: [32, 45, 64, 69, 71], pm: [85, 95, 112, 122, 128] },
  "Provence-Alpes-Côte d'Azur": { to: [35, 48, 66, 72, 74], pm: [115, 135, 165, 185, 200] },
  "Nouvelle-Aquitaine": { to: [33, 46, 65, 70, 72], pm: [88, 98, 115, 125, 132] },
  "Occitanie": { to: [31, 43, 62, 67, 69], pm: [80, 90, 105, 114, 120] },
  "Grand Est": { to: [29, 41, 61, 66, 68], pm: [82, 92, 108, 118, 124] },
  "Hauts-de-France": { to: [28, 40, 60, 65, 67], pm: [78, 88, 102, 110, 115] },
  "Pays de la Loire": { to: [30, 42, 63, 68, 70], pm: [80, 90, 106, 115, 120] },
  "Bretagne": { to: [32, 45, 66, 71, 73], pm: [84, 94, 110, 118, 125] },
  "Normandie": { to: [31, 43, 64, 69, 71], pm: [86, 96, 114, 124, 130] },
  "Bourgogne-Franche-Comté": { to: [29, 40, 59, 64, 66], pm: [75, 85, 98, 106, 112] },
  "Centre-Val de Loire": { to: [30, 42, 61, 66, 68], pm: [76, 86, 100, 108, 114] },
  "Corse": { to: [38, 52, 70, 75, 77], pm: [130, 150, 190, 210, 225] },
  "France": { to: [32, 45, 64, 68, 70], pm: [90, 100, 118, 128, 135] }
};

type SeasonalityProfile = {
  toFactors: number[]; 
  priceFactors: number[]; 
};

const PROFILES: Record<string, SeasonalityProfile> = {
  "COASTAL": {
    toFactors: [0.6, 0.65, 0.75, 0.85, 0.95, 1.1, 1.35, 1.4, 1.1, 0.9, 0.7, 0.65],
    priceFactors: [0.7, 0.75, 0.8, 0.9, 1.0, 1.2, 1.5, 1.6, 1.1, 0.9, 0.8, 0.85]
  },
  "URBAN_BUSINESS": {
    toFactors: [0.75, 0.8, 0.95, 1.05, 1.1, 1.15, 0.85, 0.7, 1.1, 1.15, 0.95, 0.85],
    priceFactors: [0.85, 0.9, 1.0, 1.1, 1.15, 1.2, 0.8, 0.75, 1.1, 1.1, 0.95, 0.9]
  },
  "MOUNTAIN": {
    toFactors: [1.3, 1.4, 1.2, 0.5, 0.3, 0.4, 0.8, 0.9, 0.5, 0.3, 0.4, 1.2],
    priceFactors: [1.4, 1.5, 1.3, 0.7, 0.6, 0.6, 0.8, 0.9, 0.6, 0.6, 0.7, 1.3]
  },
  "AVERAGE": {
    toFactors: [0.8, 0.85, 0.9, 1.0, 1.05, 1.1, 1.2, 1.15, 1.05, 1.0, 0.9, 0.95],
    priceFactors: [0.9, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.95]
  }
};

const CITY_PROFILES: Record<string, string> = {
  "biarritz": "COASTAL", "cannes": "COASTAL", "nice": "COASTAL", "deauville": "COASTAL",
  "ajaccio": "COASTAL", "bastia": "COASTAL", "paris": "URBAN_BUSINESS", "lyon": "URBAN_BUSINESS",
  "lille": "URBAN_BUSINESS", "toulouse": "URBAN_BUSINESS", "strasbourg": "URBAN_BUSINESS",
  "bordeaux": "URBAN_BUSINESS", "courchevel": "MOUNTAIN", "chamonix": "MOUNTAIN"
};

const REGION_PROFILES: Record<string, string> = {
  "Île-de-France": "URBAN_BUSINESS", "Provence-Alpes-Côte d'Azur": "COASTAL",
  "Corse": "COASTAL", "Auvergne-Rhône-Alpes": "MOUNTAIN", "Bretagne": "COASTAL",
  "Nouvelle-Aquitaine": "COASTAL"
};

export const getPerformanceData = (cityName: string, regionCode: string, language: Language = 'fr') => {
  const normalizedCity = cityName.toLowerCase().trim();
  const regionName = REGION_MAP[regionCode];
  
  let dataKey = "France";
  let label = language === 'fr' ? "Moyenne Nationale" : "National Average";
  let matchType = "national";
  let profileKey = "AVERAGE";

  if (PERFORMANCE_DB[normalizedCity]) {
    dataKey = normalizedCity;
    label = cityName; 
    matchType = "city";
    profileKey = CITY_PROFILES[normalizedCity] || "AVERAGE";
  } else if (regionName && PERFORMANCE_DB[regionName]) {
    dataKey = regionName;
    label = language === 'fr' ? `Région ${regionName}` : `${regionName} Region`;
    matchType = "region";
    profileKey = REGION_PROFILES[regionName] || "AVERAGE";
  }

  const rawData = PERFORMANCE_DB[dataKey];
  const profile = PROFILES[profileKey] || PROFILES["AVERAGE"];

  const years = ["2021", "2022", "2023", "2024", "2025 (YTD)"];
  
  const historicalData = years.map((year, i) => {
    const to = rawData.to[i] || rawData.to[rawData.to.length - 1];
    const pm = rawData.pm[i] || rawData.pm[rawData.pm.length - 1];
    const revpar = Math.round((to * pm) / 100);
    return {
      year,
      value: to,
      to: to,
      adr: pm,
      revpar: revpar
    };
  });

  const lastDataPoint = historicalData[historicalData.length - 1];
  
  const months = language === 'fr'
    ? ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const seasonalityData = months.map((month, i) => {
    let monthlyTo = Math.round(lastDataPoint.to * profile.toFactors[i]);
    if (monthlyTo > 98) monthlyTo = 98;
    if (monthlyTo < 10) monthlyTo = 10;

    const monthlyAdr = Math.round(lastDataPoint.adr * profile.priceFactors[i]);
    
    return {
      month,
      to: monthlyTo,
      adr: monthlyAdr,
      revpar: Math.round((monthlyTo * monthlyAdr) / 100)
    };
  });

  return {
    label,
    matchType,
    historicalData,
    forecastData: [], 
    seasonalityData,
    currentMetrics: {
        occupancy: `${lastDataPoint.to}%`,
        adr: `${lastDataPoint.adr}€`,
        revpar: `${lastDataPoint.revpar}€`
    }
  };
};
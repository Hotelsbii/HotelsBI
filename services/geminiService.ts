
import { GoogleGenAI } from "@google/genai";
import { MarketStudyData, HotelStanding, Language } from "../types";
import { fetchCityData, searchAddress, fetchCommuneDetails, GeoApiResponse } from "./geoGouv";
import { getPerformanceData } from "./performanceData";
import { fetchSNCFData, SncfStationData } from "./sncfService";
import { getTourismStats, getLongTermTourismStats } from "./inseeService";
import { getHistoricalPopulation } from "./populationService";

// Use direct process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  let cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }
  return cleaned;
};

// Default data structure
const DEFAULT_MARKET_DATA = {
    summary: "Analysis in progress or data temporarily unavailable.",
    marketTrends: "Not available",
    keyMetrics: { occupancyRate: "N/A", adr: "N/A", revpar: "N/A", supplyGrowth: "Stable" },
    supply: { 
        totalHotels: 0, totalRooms: 0, campings: 0, otherResidences: 0, 
        distribution: [], analysis: "Data not available" 
    },
    economy: { 
        topEmployers: [], unemploymentRate: "N/A", majorProjects: [], 
        businessDensity: "N/A", growthSectors: [] 
    },
    demographics: { 
        totalPopulation: "N/A", growthRate: "0%", ageStructure: "N/A", 
        householdIncome: "N/A", purchasingPower: "N/A" 
    },
    catchment: { zones: [], analysis: "Analysis not available" },
    transport: { 
        nearestStation: "N/A", railTraffic: "N/A", nearestAirport: "N/A", 
        airportConnectivity: "N/A", roadInfrastructure: "N/A", 
        trafficAnalysis: "N/A", publicTransit: "N/A", connectivityScore: "N/A" 
    },
    tourism: { 
        hotelCapacity: "N/A", annualNights: "N/A", seasonalityCurve: "N/A", 
        mainAttractions: [], localEvents: [], targetAudience: [] 
    },
    realEstate: { averagePriceM2: "N/A", commercialRentTrend: "N/A", neighborhoodVibe: "N/A" },
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    competitors: []
};

/**
 * Generates a comprehensive market study using Gemini with Google Maps Grounding.
 * Enriched with real data from geo.api.gouv.fr, INSEE, SNCF and internal performance DB.
 */
export const generateMarketStudy = async (
  locationInput: string,
  standing: string,
  preciseGeo?: GeoApiResponse,
  language: Language = 'fr'
): Promise<MarketStudyData> => {
  try {
    let geoData: GeoApiResponse | null = preciseGeo || null;

    // 1. Location Resolution Strategy
    if (!geoData) {
        const searchResults = await searchAddress(locationInput);
        if (searchResults.length > 0) {
            geoData = searchResults[0]; 
        } else {
            geoData = await fetchCityData(locationInput);
        }
    }

    // 2. Data Enrichment (Population & Region)
    if (geoData && (!geoData.population || geoData.population === 0)) {
        const communeDetails = await fetchCommuneDetails(geoData.code);
        if (communeDetails) {
            geoData.population = communeDetails.population || 0;
            geoData.codeRegion = communeDetails.codeRegion || geoData.codeRegion;
        }
    }
    
    const locationName = geoData ? (geoData.label || `${geoData.nom} (${geoData.codeDepartement})`) : locationInput;
    const cityForDb = geoData ? geoData.nom : locationInput;
    const regionForDb = geoData ? geoData.codeRegion : "";
    const realPopulation = geoData && geoData.population ? geoData.population : 0;
    const populationStr = realPopulation > 0 ? realPopulation.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US') : "N/A";
    
    // 3. Fetch Performance Data & Tourism Stats
    const perfData = getPerformanceData(cityForDb, regionForDb, language);
    const inseeStats = getTourismStats(regionForDb, language);
    const annualStats = getLongTermTourismStats(regionForDb);
    const historicalPop = getHistoricalPopulation(cityForDb, realPopulation);

    // 4. Fetch SNCF Data (Real Traffic)
    let sncfData: SncfStationData | null = null;
    let transportPrompt = "";
    if (geoData?.centre?.coordinates) {
        sncfData = await fetchSNCFData(geoData.centre.coordinates);
        if (sncfData) {
            transportPrompt = `
            REAL SNCF DATA (Do not invent, inject exactly as provided):
            - Nearest Station: ${sncfData.name} (${sncfData.distance}m from location).
            - Modes: ${sncfData.modes.join(', ')}.
            - Traffic Intensity: ${sncfData.nextDeparturesCount} departures/hour (Real-time).
            - Main Lines/Directions: ${sncfData.lines.join(', ')}.
            `;
        }
    }

    const modelId = "gemini-2.5-flash";

    // Prepare Population Trend String for prompt
    const growthTrend = historicalPop.length > 0 
        ? ((historicalPop[historicalPop.length-1].population - historicalPop[0].population) / historicalPop[0].population * 100).toFixed(1)
        : "0";
    const growthSign = parseFloat(growthTrend) > 0 ? "+" : "";

    // Target Language String
    const targetLang = language === 'fr' ? 'FRENCH' : 'ENGLISH';

    const prompt = `
      Act as a senior hotel investment consultant.
      Create a comprehensive market study for a ${standing} hotel project located at: ${locationName}.
      
      MANDATORY DATA (Sources: INSEE, SIRENE, OpenData):
      - 2024 Administrative Population: ${populationStr} inhabitants.
      - Demographic Trend (INSEE Source): ${growthSign}${growthTrend}% since 1990.
      - Market Performance (${perfData.label}): Occ: ${perfData.currentMetrics.occupancy}, ADR: ${perfData.currentMetrics.adr}, RevPAR: ${perfData.currentMetrics.revpar}.
      ${transportPrompt}
      
      SPECIFIC INSTRUCTIONS "CONNECTIVITY":
      Use your Google Maps tool to find precisely:
      1. The nearest airport, its name, and distance.
      2. Major highways or roads nearby (e.g., A6, N104).
      3. Local public transport situation around the exact address.

      INSTRUCTIONS "COMPETITION" (DETAILED):
      Identify 3 REAL direct competitors. For each, provide: Stars, Capacity (Total/Std/Suites), Amenities, Services, Maps Link.

      INSTRUCTIONS "CATCHMENT AREAS" (URBAN ISOCHRONES):
      Based on strong urban density (heavy traffic).
      - Primary Zone: 0-15 min (Very local, < 3km).
      - Secondary Zone: 15-30 min (Close suburbs, < 10km).
      - Tertiary Zone: 30-60 min (Greater area, < 25km).
      Estimate the population of these zones based on real density.
      
      Generate a VALID JSON in ${targetLang}.
      IMPORTANT: The Keys of the JSON object must remain in ENGLISH (e.g. "summary", "supply"), but the String Values must be in ${targetLang}.

      {
        "location": "${locationName}",
        "standing": "${standing}",
        "summary": "Executive summary (min 200 words).",
        "supply": {
            "totalHotels": 45,
            "totalRooms": 2150,
            "campings": 3,
            "otherResidences": 5,
            "distribution": [
                {"category": "1-2 Stars", "hotels": 12, "rooms": 450},
                {"category": "3 Stars", "hotels": 18, "rooms": 900},
                {"category": "4 Stars", "hotels": 10, "rooms": 600},
                {"category": "5 Stars", "hotels": 5, "rooms": 200}
            ],
            "analysis": "Supply analysis..."
        },
        "economy": {
           "topEmployers": [{"name": "Company1", "sector": "Sector", "workforce": "Count"}],
           "unemploymentRate": "7.4%",
           "majorProjects": ["Project 1"],
           "businessDensity": "Economic fabric analysis...",
           "growthSectors": ["Sector 1"]
        },
        "demographics": {
           "totalPopulation": "${populationStr}",
           "growthRate": "${growthSign}${growthTrend}% (1990-2024)",
           "ageStructure": "Age structure analysis (e.g., Aging vs Student)...",
           "householdIncome": "Median income",
           "purchasingPower": "Analysis..."
        },
        "catchment": {
            "analysis": "Catchment area analysis based on isochrones...",
            "zones": [
                { "type": "Primary Zone", "radius": "0-15 min", "population": "XX XXX hab", "evolution": "+X% / year", "density": "High" },
                { "type": "Secondary Zone", "radius": "15-30 min", "population": "XX XXX hab", "evolution": "Stable", "density": "Medium" },
                { "type": "Tertiary Zone", "radius": "30-60 min", "population": "XX XXX hab", "evolution": "+X%", "density": "Low" }
            ]
        },
        "transport": {
           "nearestStation": "${sncfData ? sncfData.name : 'TGV Station...'}",
           "railTraffic": "${sncfData ? sncfData.modes.join(', ') + '. Freq: ' + sncfData.nextDeparturesCount + ' trains/h' : 'Rail traffic analysis...'}",
           "nearestAirport": "Airport Name (Distance)",
           "airportConnectivity": "Flight types (Domestic/Intl) and connected hubs",
           "roadInfrastructure": "List of nearby highways (Axx) and national roads",
           "trafficAnalysis": "Road access ease and typical traffic conditions",
           "publicTransit": "Details Bus/Tram/Metro within walking distance (e.g., Line 4 at 200m)",
           "connectivityScore": "Score out of 10 (e.g., 8.5/10)"
        },
        "tourism": {
           "hotelCapacity": "Capacity...",
           "annualNights": "Volume...",
           "seasonalityCurve": "Desc...",
           "mainAttractions": ["Attr1"],
           "localEvents": [{"name": "Event1", "period": "Month", "impact": "High"}],
           "targetAudience": [{"type": "Business", "percentage": "45%", "motivation": "..."}]
        },
        "realEstate": {
            "averagePriceM2": "Price...",
            "commercialRentTrend": "Trend...",
            "neighborhoodVibe": "Vibe..."
        },
        "marketTrends": "Analysis...",
        "swot": {
          "strengths": ["S1"], "weaknesses": ["W1"], "opportunities": ["O1"], "threats": ["T1"]
        },
        "competitors": [
          { 
            "name": "Hotel A", 
            "stars": 4,
            "roomCount": { "total": 85, "standard": 70, "suites": 15 },
            "amenities": ["Pool", "Spa", "Parking"],
            "services": ["Room Service", "Shuttle"],
            "rating": 4.5, 
            "priceLevel": "€€€", 
            "distance": "0.3 km", 
            "strength": "...", 
            "weakness": "...",
            "webUrl": "https://maps.google.com/?q=..."
          }
        ]
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const groundingUrls: string[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri) groundingUrls.push(chunk.web.uri);
        if (chunk.maps?.uri) groundingUrls.push(chunk.maps.uri);
      });
    }

    const text = response.text || "";
    const jsonString = cleanJson(text);
    
    let parsedData: any = {};
    try {
        parsedData = JSON.parse(jsonString);
    } catch (e) {
        console.error("JSON Parse failed", text);
        console.warn("Using default data structure due to JSON error.");
        parsedData = {}; // Fallback to empty to trigger defaults merge
    }

    // Secure Merge
    const mergedData = {
        ...DEFAULT_MARKET_DATA,
        ...parsedData,
        keyMetrics: { ...DEFAULT_MARKET_DATA.keyMetrics, ...(parsedData.keyMetrics || {}) },
        supply: { ...DEFAULT_MARKET_DATA.supply, ...(parsedData.supply || {}) },
        economy: { ...DEFAULT_MARKET_DATA.economy, ...(parsedData.economy || {}) },
        demographics: { ...DEFAULT_MARKET_DATA.demographics, ...(parsedData.demographics || {}) },
        catchment: { ...DEFAULT_MARKET_DATA.catchment, ...(parsedData.catchment || {}) },
        transport: { ...DEFAULT_MARKET_DATA.transport, ...(parsedData.transport || {}) },
        tourism: { ...DEFAULT_MARKET_DATA.tourism, ...(parsedData.tourism || {}) },
        realEstate: { ...DEFAULT_MARKET_DATA.realEstate, ...(parsedData.realEstate || {}) },
        swot: { ...DEFAULT_MARKET_DATA.swot, ...(parsedData.swot || {}) },
        competitors: Array.isArray(parsedData.competitors) ? parsedData.competitors : []
    };

    if (sncfData) {
        mergedData.transport.nearestStation = `${sncfData.name} (${sncfData.distance < 1000 ? sncfData.distance + 'm' : (sncfData.distance/1000).toFixed(1) + 'km'})`;
        if (!mergedData.transport.railTraffic || mergedData.transport.railTraffic === "N/A" || mergedData.transport.railTraffic.includes("Analysis")) {
             const modesStr = sncfData.modes.length > 0 ? sncfData.modes.join(', ') : 'Trains';
             mergedData.transport.railTraffic = `${modesStr}. Traffic: ${sncfData.nextDeparturesCount} departures/h. Destinations: ${sncfData.lines.join(', ')}.`;
        }
    }

    return {
      ...mergedData,
      location: locationName,
      standing: standing,
      geoData: geoData || undefined,
      groundingUrls,
      historicalData: perfData.historicalData,
      forecastData: perfData.forecastData,
      seasonalityData: perfData.seasonalityData,
      demographics: {
          ...mergedData.demographics,
          historicalData: historicalPop // Inject historical curve
      },
      tourism: {
          ...mergedData.tourism,
          inseeStats: inseeStats,
          annualStats: annualStats
      },
      keyMetrics: {
        occupancyRate: perfData.currentMetrics.occupancy,
        adr: perfData.currentMetrics.adr,
        revpar: perfData.currentMetrics.revpar,
        supplyGrowth: mergedData.keyMetrics?.supplyGrowth || "Stable"
      }
    };

  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};
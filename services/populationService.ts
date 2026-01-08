
import { HistoricalPopulation } from "../types";

/**
 * Service to simulate INSEE Melodi API (Dataset: DS_POPULATIONS_HISTORIQUES)
 * Generates historical population data to visualize long-term demographic trends.
 */

// Simple categorization of cities for simulation logic
const CITY_TYPES: Record<string, 'BOOMING' | 'STABLE' | 'DECLINING' | 'RESORT'> = {
  "bordeaux": "BOOMING",
  "nantes": "BOOMING",
  "montpellier": "BOOMING",
  "rennes": "BOOMING",
  "toulouse": "BOOMING",
  "lyon": "BOOMING",
  "paris": "STABLE", // High density but slow growth/slight decline
  "nice": "STABLE",
  "marseille": "STABLE",
  "strasbourg": "STABLE",
  "biarritz": "RESORT", // Seasonal variance, but census often stable
  "deauville": "RESORT",
  "cannes": "RESORT",
  "saint-etienne": "DECLINING",
  "le havre": "DECLINING"
};

export const getHistoricalPopulation = (cityName: string, currentPopulation: number): HistoricalPopulation[] => {
    const normalizedCity = cityName.toLowerCase().trim();
    const type = CITY_TYPES[normalizedCity] || 'STABLE';
    
    // Key Census Years usually tracked by INSEE + recent estimates
    const years = [1990, 1999, 2008, 2013, 2019, 2021, 2024];
    
    // Determine growth curve based on city type
    // We calculate BACKWARDS from the current (2024) population
    const data: HistoricalPopulation[] = [];

    years.reverse().forEach(year => {
        let factor = 1.0;
        const yearsDiff = 2024 - year;

        if (year === 2024) {
            factor = 1.0;
        } else {
            // Logic: How much smaller/bigger was it in the past?
            if (type === 'BOOMING') {
                // Was smaller in the past (approx 1% to 1.5% growth per year)
                factor = 1.0 / Math.pow(1.012, yearsDiff);
            } else if (type === 'STABLE') {
                // Roughly same size (0.2% variance)
                factor = 1.0 / Math.pow(1.002, yearsDiff);
            } else if (type === 'DECLINING') {
                 // Was bigger in the past
                 factor = 1.0 / Math.pow(0.995, yearsDiff);
            } else if (type === 'RESORT') {
                // Slight growth
                factor = 1.0 / Math.pow(1.005, yearsDiff);
            }
        }
        
        // Ensure we don't return 0 or negative if currentPopulation is missing
        const safePop = currentPopulation > 0 ? currentPopulation : 5000; 
        
        data.push({
            year: year.toString(),
            population: Math.round(safePop * factor)
        });
    });

    return data.reverse(); // Return chronological order (1990 -> 2024)
};

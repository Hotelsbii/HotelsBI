
/**
 * Service to interact with the French Government's Geo API (api.gouv.fr)
 * Used to fetch real administrative data to ground the AI generation.
 */

export interface GeoApiResponse {
  nom: string;
  code: string;
  codesPostaux: string[];
  population: number;
  centre: {
    type: "Point";
    coordinates: [number, number];
  };
  codeDepartement: string;
  codeRegion: string;
  // Address specific fields
  label?: string;
  context?: string;
  type?: string;
}

// Fetch basic city data by name (Legacy/Fallback)
export const fetchCityData = async (query: string): Promise<GeoApiResponse | null> => {
  try {
    const url = `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&fields=nom,code,codesPostaux,centre,population,codeDepartement,codeRegion&boost=population&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error("Geo API Error:", error);
    return null;
  }
};

// Fetch detailed commune data by INSEE Code (Population, Region, etc.)
export const fetchCommuneDetails = async (code: string): Promise<Partial<GeoApiResponse> | null> => {
  try {
    const url = `https://geo.api.gouv.fr/communes/${code}?fields=nom,code,population,codeDepartement,codeRegion`;
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Commune Details API Error:", error);
    return null;
  }
};

// Search address using BAN (Base Adresse Nationale)
export const searchAddress = async (query: string): Promise<GeoApiResponse[]> => {
  if (query.length < 3) return [];
  
  try {
    const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`;
    
    const response = await fetch(url);
    if (!response.ok) return [];
    
    const data = await response.json();
    
    return data.features.map((feature: any) => ({
      nom: feature.properties.city,
      code: feature.properties.citycode,
      codesPostaux: [feature.properties.postcode],
      population: 0, // Placeholder, will be enriched later via fetchCommuneDetails
      centre: {
        type: "Point",
        coordinates: feature.geometry.coordinates // [lon, lat]
      },
      codeDepartement: feature.properties.context ? feature.properties.context.split(',')[0].trim() : "",
      codeRegion: "", // Placeholder
      label: feature.properties.label,
      context: feature.properties.context,
      type: feature.properties.type
    }));

  } catch (error) {
    console.error("Address API Error:", error);
    return [];
  }
};

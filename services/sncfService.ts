
/**
 * Service to interact with the SNCF API (Navitia)
 * Key provided: 8a7aaee1-1dda-4e4d-b6dc-760ec233e832
 */

const SNCF_API_KEY = '8a7aaee1-1dda-4e4d-b6dc-760ec233e832';
const BASE_URL = 'https://api.sncf.com/v1/coverage/sncf';

export interface SncfStationData {
  name: string;
  distance: number; // en mètres
  modes: string[]; // ex: ["CommercialMode:TGV", "CommercialMode:TER"]
  nextDeparturesCount: number; // Nombre de départs dans la prochaine heure
  lines: string[]; // Noms des lignes/directions principales
}

export const fetchSNCFData = async (coordinates: [number, number]): Promise<SncfStationData | null> => {
  try {
    // Navitia utilise le format "lon;lat"
    const coordString = `${coordinates[0]};${coordinates[1]}`;
    
    // 1. Trouver la gare la plus proche (rayon 5km)
    const placesUrl = `${BASE_URL}/coords/${coordString}/places?type[]=stop_area&distance=5000`;
    
    const placesResponse = await fetch(placesUrl, {
      headers: { 'Authorization': 'Basic ' + btoa(SNCF_API_KEY + ':') }
    });
    
    if (!placesResponse.ok) return null;
    
    const placesData = await placesResponse.json();
    
    if (!placesData.places || placesData.places.length === 0) {
      return null;
    }

    // Prendre le premier résultat (le plus proche)
    const nearestPlace = placesData.places[0];
    const stopAreaId = nearestPlace.id;
    const stationName = nearestPlace.name;
    const distance = nearestPlace.distance || 0;

    // 2. Récupérer les prochains départs pour analyser le trafic
    const departuresUrl = `${BASE_URL}/stop_areas/${stopAreaId}/departures?data_freshness=realtime&count=20`;
    
    const departuresResponse = await fetch(departuresUrl, {
      headers: { 'Authorization': 'Basic ' + btoa(SNCF_API_KEY + ':') }
    });

    let nextDeparturesCount = 0;
    let modes = new Set<string>();
    let lines = new Set<string>();

    if (departuresResponse.ok) {
        const depData = await departuresResponse.json();
        if (depData.departures) {
            nextDeparturesCount = depData.departures.length;
            depData.departures.forEach((dep: any) => {
                if (dep.display_informations) {
                    // Nettoyage des modes (ex: "CommercialMode:TGV" -> "TGV")
                    const modeRaw = dep.display_informations.commercial_mode;
                    if (modeRaw) modes.add(modeRaw);
                    
                    const direction = dep.display_informations.direction;
                    if (direction) lines.add(direction.split(' (')[0]); // Simplifier le nom
                }
            });
        }
    }

    return {
      name: stationName,
      distance: parseInt(distance, 10),
      modes: Array.from(modes),
      nextDeparturesCount: nextDeparturesCount,
      lines: Array.from(lines).slice(0, 3) // Garder les 3 directions principales
    };

  } catch (error) {
    console.error("SNCF API Error:", error);
    return null;
  }
};

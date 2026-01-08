
import { TourismStats, AnnualTourismStats, Language } from "../types";

const PROFILES: Record<string, 'COASTAL' | 'MOUNTAIN' | 'URBAN' | 'RURAL'> = {
  "11": "URBAN", // Ile-de-France
  "93": "COASTAL", // PACA
  "53": "COASTAL", // Bretagne
  "94": "COASTAL", // Corse
  "84": "MOUNTAIN", // Auvergne-Rhône-Alpes
  "44": "RURAL", // Grand Est
  "75": "COASTAL", // Nouvelle-Aquitaine
  "76": "RURAL", // Occitanie (Mixte, mais simplified)
  "32": "RURAL", // Hauts-de-France
  "28": "COASTAL", // Normandie
  "52": "COASTAL", // Pays de la Loire
  "24": "RURAL", // Centre-Val de Loire
  "27": "RURAL", // Bourgogne-Franche-Comté
};

export const getTourismStats = (regionCode: string, language: Language = 'fr'): TourismStats[] => {
  const profile = PROFILES[regionCode] || 'RURAL';
  
  const months = language === 'fr' 
    ? ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"]
    : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  let baseNights = 100;
  let internationalShare = 0.3; 

  if (profile === 'URBAN') { baseNights = 500; internationalShare = 0.5; }
  if (profile === 'COASTAL') { baseNights = 200; internationalShare = 0.4; }
  
  return months.map((month, i) => {
    let seasonFactor = 1.0;
    let stayDuration = 1.8;

    if (profile === 'COASTAL') {
        if (i === 6 || i === 7) { seasonFactor = 2.5; stayDuration = 3.5; }
        else if (i === 4 || i === 5 || i === 8) { seasonFactor = 1.5; stayDuration = 2.5; }
        else { seasonFactor = 0.6; stayDuration = 1.5; }
    } 
    else if (profile === 'MOUNTAIN') {
        if (i === 0 || i === 1 || i === 11) { seasonFactor = 2.2; stayDuration = 4.0; }
        else if (i === 6 || i === 7) { seasonFactor = 1.6; stayDuration = 2.5; }
        else { seasonFactor = 0.4; stayDuration = 1.4; }
    }
    else if (profile === 'URBAN') {
        if (i === 7) { seasonFactor = 0.8; stayDuration = 2.2; }
        else if (i === 4 || i === 5 || i === 8 || i === 9) { seasonFactor = 1.3; stayDuration = 2.0; }
        else { seasonFactor = 1.0; stayDuration = 1.8; }
    }
    else { 
        if (i > 4 && i < 9) { seasonFactor = 1.4; stayDuration = 2.0; }
        else { seasonFactor = 0.8; stayDuration = 1.3; }
    }

    const nightsTotal = Math.round(baseNights * seasonFactor * (0.9 + Math.random() * 0.2) * 10);
    const currentIntlShare = seasonFactor > 1.2 ? internationalShare * 1.2 : internationalShare;
    
    return {
        month,
        nightsDomestic: Math.round(nightsTotal * (1 - currentIntlShare)),
        nightsInternational: Math.round(nightsTotal * currentIntlShare),
        avgStayDuration: parseFloat(stayDuration.toFixed(1))
    };
  });
};

export const getLongTermTourismStats = (regionCode: string): AnnualTourismStats[] => {
    const profile = PROFILES[regionCode] || 'RURAL';
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 10;
    
    let baseVolume = 5000;
    if (profile === 'URBAN') baseVolume = 15000;
    if (profile === 'COASTAL') baseVolume = 8000;

    const stats: AnnualTourismStats[] = [];

    for (let i = 0; i <= 10; i++) {
        const year = startYear + i;
        let growthFactor = 1.0;
        let intlShare = 0.35;

        if (year < 2020) {
            growthFactor = 1 + (i * 0.03); 
            intlShare = profile === 'URBAN' ? 0.5 : 0.35;
        } else if (year === 2020) {
            growthFactor = 0.55; 
            intlShare = 0.15;
        } else if (year === 2021) {
            growthFactor = 0.75;
            intlShare = 0.20;
        } else if (year === 2022) {
            growthFactor = 0.95;
            intlShare = profile === 'URBAN' ? 0.45 : 0.30;
        } else {
            growthFactor = 1 + ((i - 6) * 0.04);
            intlShare = profile === 'URBAN' ? 0.52 : 0.38;
        }

        const total = Math.round(baseVolume * growthFactor);
        const nightsInternational = Math.round(total * intlShare);
        const nightsDomestic = total - nightsInternational;

        stats.push({
            year: year.toString(),
            nightsDomestic,
            nightsInternational,
            total
        });
    }

    return stats;
};
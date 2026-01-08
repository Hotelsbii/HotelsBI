
import { FinancialAssumptions, YearlyResult, HotelStanding } from "../types";

// Valeurs par défaut selon le standing
export const getDefaultAssumptions = (standing: string, marketAdr: string, marketOcc: string): FinancialAssumptions => {
  const isLuxury = standing.includes(HotelStanding.LUXURY);
  const isEconomy = standing.includes(HotelStanding.ECONOMY);

  const cleanAdr = parseFloat(marketAdr.replace(/[^0-9.]/g, '')) || 100;
  const cleanOcc = parseFloat(marketOcc.replace(/[^0-9.]/g, '')) || 65;
  
  const roomCount = 60;
  // Estimation surface brute : 45m2/clé (Midscale) incluant circulations, lobby, back office
  const surfacePerKey = isLuxury ? 65 : (isEconomy ? 28 : 40);

  return {
    roomCount: roomCount,
    surface: roomCount * surfacePerKey, 
    daysOpen: 365,
    targetOccupancy: cleanOcc,
    targetAdr: cleanAdr,
    
    // Macro
    annualInflation: 2.0,
    adrGrowth: 2.5, 

    // Ramp-up
    rampUpYear1: 75, // Démarrage plus progressif
    rampUpYear2: 90,
    rampUpYear3: 100, 

    // Revenus
    fbRevenuePerRoom: isLuxury ? 50 : (isEconomy ? 5 : 20),
    otherRevenueShare: isLuxury ? 8 : 3, 

    // Dépenses (Ratios Standards - Ajustés pour EBITDA réaliste ~40%)
    // Rooms Dept : CP + Frais Généraux. Souvent 25-30% du CA Chambres.
    roomsCostRatio: isLuxury ? 30 : (isEconomy ? 25 : 28), 
    
    // F&B Dept : Marge faible (20-30%), donc coût ~75-80%
    fbCostRatio: 78, 

    // Undistributed (% Total Rev)
    // Administration & Général : Souvent 8-10%
    adminRatio: 9.0,
    // Commercial & Marketing : Souvent 5-7% (OTAs commissions often partly here or in Rooms)
    marketingRatio: 6.0,
    // Maintenance (POM) : Souvent 4-5%
    pomRatio: 4.5,
    // Energie (Utilities) : Forte hausse récente, souvent 4-6%
    utilitiesRatio: 5.0,
    
    // Fees & Non-Op
    managementFees: 3.0, // Base Fees
    insurancePropertyTaxes: 25000, // Ajusté à la hausse
    reserves: 4.0, // FF&E Reserve (Souvent 3-5%)
    capex: 15000 // Owner capex base
  };
};

// Recalcule les totaux (Revenue, Expenses, EBITDA...) d'une année basée sur ses composantes unitaires
// Utilisé quand l'utilisateur modifie une cellule spécifique (ex: Marketing) sans vouloir relancer toute la projection
export const recalculateYearlyTotals = (data: YearlyResult): YearlyResult => {
    // 1. Revenue Sum
    // Note: If Occupancy/ADR changed, revenueRoom should have been updated before calling this.
    // Here we just sum the values.
    const totalRevenue = data.revenueRoom + data.revenueFB + data.revenueOther;
    
    // 2. Department Expenses Sum
    const totalDeptExpenses = data.roomsCOS + data.roomsPayroll + data.roomsOther + 
                              data.fbCOS + data.fbPayroll + data.fbOther;
                              // Note: We assume 'Other Dept' cost is folded into one of these or handled separately. 
                              // For simplicity in this advanced mode, we stick to the explicit fields in YearlyResult.

    const totalDeptIncome = totalRevenue - totalDeptExpenses;

    // 3. Undistributed Sum
    const totalUndistributed = data.adminExpenses + data.marketingExpenses + data.pomExpenses + data.utilitiesExpenses + data.itExpenses;

    // 4. Results
    const gop = totalDeptIncome - totalUndistributed;
    
    // MODIFICATION: FF&E est déduit AVANT l'EBITDA
    const ebitda = gop - data.fees - data.nonOperating - data.ffe;
    
    const ebitdaLessFFE = ebitda; // Redondant mais on garde pour compatibilité type
    const ebitdaLessCapex = ebitda - data.capex;

    const margin = totalRevenue > 0 ? (ebitda / totalRevenue) * 100 : 0;
    
    return {
        ...data,
        totalRevenue,
        totalDeptExpenses,
        totalDeptIncome,
        totalUndistributed,
        gop,
        ebitda,
        ebitdaLessFFE,
        ebitdaLessCapex,
        margin: parseFloat(margin.toFixed(1))
    };
};

// Fonction pour recalculer une année spécifique après une modification manuelle des DRIVERS (TO, ADR, Inflation)
export const recalculateYearlyResult = (currentData: YearlyResult, assumptions: FinancialAssumptions): YearlyResult => {
  const inflationIndex = Math.pow(1 + currentData.inflation / 100, currentData.year - 1);
  
  // On utilise les valeurs d'Occupation et ADR qui viennent d'être modifiées manuellement (ou calculées)
  const occupancyPercent = currentData.occupancy;
  const adr = currentData.adr;

  // 2. Revenues Recalculation
  const roomNights = assumptions.roomCount * assumptions.daysOpen * (occupancyPercent / 100);
  const revenueRoom = roomNights * adr;
  
  const fbPriceInflated = assumptions.fbRevenuePerRoom * inflationIndex;
  const revenueFB = roomNights * fbPriceInflated;
  const revenueOther = revenueRoom * (assumptions.otherRevenueShare / 100);
  
  // 3. Departmental Expenses (Standard Ratios)
  const totalRoomsCost = revenueRoom * (assumptions.roomsCostRatio / 100);
  const roomsPayroll = totalRoomsCost * 0.75; // Payroll majoritaire
  const roomsCOS = totalRoomsCost * 0.15; // Produits d'accueil, linge...
  const roomsOther = totalRoomsCost * 0.10;

  const totalFBCost = revenueFB * (assumptions.fbCostRatio / 100);
  const fbCOS = totalFBCost * 0.35; // Food Cost ~30-35%
  const fbPayroll = totalFBCost * 0.55; // Service
  const fbOther = totalFBCost * 0.10;

  // 4. Undistributed Expenses
  const totalRevTemp = revenueRoom + revenueFB + revenueOther; // Need temp total for ratios
  const adminExpenses = totalRevTemp * (assumptions.adminRatio / 100);
  const marketingExpenses = totalRevTemp * (assumptions.marketingRatio / 100);
  const pomExpenses = totalRevTemp * (assumptions.pomRatio / 100);
  const utilitiesExpenses = totalRevTemp * (assumptions.utilitiesRatio / 100);
  const itExpenses = totalRevTemp * 0.015; // IT un peu plus élevé aujourd'hui

  // 5. Fees & Non-Op
  const fees = totalRevTemp * (assumptions.managementFees / 100);
  const nonOperating = assumptions.insurancePropertyTaxes * inflationIndex;
  const ffe = totalRevTemp * (assumptions.reserves / 100);
  const capex = assumptions.capex * inflationIndex;

  const calculatedData: YearlyResult = {
    ...currentData,
    revenueRoom: Math.round(revenueRoom),
    revenueFB: Math.round(revenueFB),
    revenueOther: Math.round(revenueOther),
    
    roomsCOS: Math.round(roomsCOS),
    roomsPayroll: Math.round(roomsPayroll),
    roomsOther: Math.round(roomsOther),
    fbCOS: Math.round(fbCOS),
    fbPayroll: Math.round(fbPayroll),
    fbOther: Math.round(fbOther),
    
    adminExpenses: Math.round(adminExpenses),
    marketingExpenses: Math.round(marketingExpenses),
    pomExpenses: Math.round(pomExpenses),
    utilitiesExpenses: Math.round(utilitiesExpenses),
    itExpenses: Math.round(itExpenses),
    
    fees: Math.round(fees),
    nonOperating: Math.round(nonOperating),
    ffe: Math.round(ffe),
    capex: Math.round(capex),
    
    // Placeholders, will be recalc by totals
    totalRevenue: 0, totalDeptExpenses: 0, totalDeptIncome: 0, totalUndistributed: 0,
    gop: 0, ebitda: 0, ebitdaLessFFE: 0, ebitdaLessCapex: 0, margin: 0,
    revpar: parseFloat((revenueRoom / (assumptions.roomCount * assumptions.daysOpen)).toFixed(2))
  };

  return recalculateYearlyTotals(calculatedData);
};

export const calculate10YearProjection = (assumptions: FinancialAssumptions): YearlyResult[] => {
  const results: YearlyResult[] = [];

  for (let year = 1; year <= 10; year++) {
    const inflationIndex = Math.pow(1 + assumptions.annualInflation / 100, year - 1);
    
    // 1. Occupancy & ADR
    let occupancyPercent = assumptions.targetOccupancy;
    if (year === 1) occupancyPercent *= (assumptions.rampUpYear1 / 100);
    else if (year === 2) occupancyPercent *= (assumptions.rampUpYear2 / 100);
    else if (year === 3) occupancyPercent *= (assumptions.rampUpYear3 / 100);
    if (occupancyPercent > 98) occupancyPercent = 98;

    const adr = assumptions.targetAdr * Math.pow(1 + assumptions.adrGrowth / 100, year - 1);

    // Construct base object
    const initialData: YearlyResult = {
        year,
        surface: assumptions.surface,
        inflation: assumptions.annualInflation,
        occupancy: occupancyPercent,
        adr: parseFloat(adr.toFixed(2)),
        // Placeholders
        revpar: 0, revenueRoom: 0, revenueFB: 0, revenueOther: 0, totalRevenue: 0,
        roomsCOS: 0, roomsPayroll: 0, roomsOther: 0, fbCOS: 0, fbPayroll: 0, fbOther: 0,
        totalDeptExpenses: 0, totalDeptIncome: 0,
        adminExpenses: 0, marketingExpenses: 0, pomExpenses: 0, utilitiesExpenses: 0, itExpenses: 0,
        totalUndistributed: 0, gop: 0, fees: 0, nonOperating: 0, ebitda: 0, ffe: 0,
        ebitdaLessFFE: 0, capex: 0, ebitdaLessCapex: 0, margin: 0
    };

    results.push(recalculateYearlyResult(initialData, assumptions));
  }

  return results;
};

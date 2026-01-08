
import React, { useState, useEffect } from 'react';
import { FinancialAssumptions, YearlyResult, MarketStudyData, ValuationParams, TransactionRef } from '../types';
import { calculate10YearProjection, getDefaultAssumptions, recalculateYearlyResult, recalculateYearlyTotals } from '../services/financialService';
import { 
  Calculator, Edit3, FileSpreadsheet, TrendingUp, FileText, DollarSign, Building2, BedDouble, Ruler, Layers, ArrowDownRight
} from 'lucide-react';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip as RechartsTooltip, Legend, ResponsiveContainer, Area
} from 'recharts';
import { useLanguage } from './LanguageContext';

interface BusinessPlanProps {
  marketData: MarketStudyData;
}

const TableInput = ({ 
    value, 
    onUpdate, 
    negative = false,
    className = ""
}: { 
    value: number; 
    onUpdate: (val: string) => void; 
    negative?: boolean;
    className?: string;
}) => {
    const { language } = useLanguage();

    const format = (v: number) => {
        if (v === 0) return ''; 
        return v.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
    };

    const [localVal, setLocalVal] = useState(format(value));
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!isFocused) {
            setLocalVal(format(value));
        }
    }, [value, isFocused, language]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;
        setLocalVal(inputVal); 
        let cleanVal = inputVal;
        if (language === 'fr') {
             cleanVal = inputVal.replace(/\s/g, '').replace(',', '.');
        } else {
             cleanVal = inputVal.replace(/,/g, '');
        }
        onUpdate(cleanVal); 
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        let raw = localVal;
        if (language === 'fr') raw = localVal.replace(/\s/g, '');
        else raw = localVal.replace(/,/g, '');
        
        setLocalVal(raw);
        e.target.select();
    };

    return (
        <input 
            type="text" 
            inputMode="decimal"
            value={localVal} 
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={() => setIsFocused(false)}
            className={`${className} ${negative ? 'text-red-600' : 'text-slate-700'}`}
        />
    );
};

interface PnlRowGroupProps {
  label: string;
  field: keyof YearlyResult;
  data: YearlyResult[];
  isHeader?: boolean;
  isTotal?: boolean;
  readOnly?: boolean;
  negative?: boolean;
  indent?: number;
  onEdit: (yearIndex: number, field: keyof YearlyResult, value: string) => void;
  showDetails?: boolean; // New prop to toggle sub-rows
}

const PnlRowGroup: React.FC<PnlRowGroupProps> = ({ 
    label, 
    field, 
    data, 
    isHeader = false, 
    isTotal = false,
    readOnly = false,
    negative = false,
    indent = 0,
    onEdit,
    showDetails = true
}) => {
    const { t, language } = useLanguage();
    let stickyBgClass = 'bg-white';
    if (isHeader) stickyBgClass = 'bg-slate-100';
    if (isTotal) stickyBgClass = 'bg-slate-50';

    return (
      <>
        {/* Main Row */}
        <tr className={`${isHeader ? 'bg-slate-100 font-bold' : isTotal ? 'bg-slate-50 font-bold border-t border-slate-300' : 'bg-white hover:bg-slate-50'} transition-colors group border-b border-slate-100`}>
            <td className={`p-2 text-left sticky left-0 z-30 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.05)] ${stickyBgClass}`} style={{ paddingLeft: `${indent * 12 + 8}px` }}>
                {label}
            </td>
            {data.map((p, i) => (
                <td key={p.year} className="p-0 min-w-[90px] border-r border-slate-50 relative">
                    {readOnly ? (
                        <div className={`p-2 text-right ${negative ? 'text-red-500' : (isTotal ? 'text-slate-900' : 'text-slate-700')}`}>
                           {negative && p[field] > 0 ? '-' : ''}
                           {(Number(p[field]) / 1000).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </div>
                    ) : (
                        <TableInput 
                            value={p[field] as number}
                            onUpdate={(val) => onEdit(i, field, val)}
                            negative={negative}
                            className="w-full h-full p-2 text-right bg-transparent focus:bg-blue-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    )}
                </td>
            ))}
        </tr>
        
        {/* Sub-Row 1: Growth vs N-1 */}
        {showDetails && !isHeader && (
          <tr className="bg-slate-50/30">
              <td className={`text-right pr-2 sticky left-0 z-30 border-r border-slate-100 text-[9px] uppercase tracking-wide text-slate-400 ${stickyBgClass}`}>
                  {t.bp.table.growth}
              </td>
              {data.map((p, i) => {
                  const prev = data[i-1]?.[field] as number || 0;
                  const curr = p[field] as number;
                  const growth = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
                  const isPositive = growth > 0;
                  // Hide first year growth or very extreme values
                  if (i === 0) return <td key={p.year} className="border-r border-slate-50"></td>;
                  
                  return (
                      <td key={p.year} className={`text-right px-2 py-0.5 border-r border-slate-50 text-[9px] ${isPositive ? 'text-green-600' : 'text-red-400'}`}>
                          {isPositive ? '+' : ''}{growth.toFixed(1)}%
                      </td>
                  );
              })}
          </tr>
        )}

        {/* Sub-Row 2: % of Revenue */}
        {showDetails && !isHeader && (
          <tr className="bg-slate-50/30 border-b border-slate-200">
              <td className={`text-right pr-2 sticky left-0 z-30 border-r border-slate-200 text-[9px] uppercase tracking-wide text-slate-400 ${stickyBgClass}`}>
                  {t.bp.table.ratio}
              </td>
              {data.map((p) => {
                  const ratio = p.totalRevenue > 0 ? (Number(p[field]) / p.totalRevenue) * 100 : 0;
                  return (
                      <td key={p.year} className="text-right px-2 py-0.5 text-slate-500 text-[9px] border-r border-slate-50">
                          {ratio.toFixed(1)}%
                      </td>
                  );
              })}
          </tr>
        )}
      </>
    );
};

const BusinessPlanAnalysis = ({ projections, location }: { projections: YearlyResult[], location: string }) => {
    const { t, language } = useLanguage();
    if (!projections || projections.length < 3) return null;

    const y3 = projections[2]; 
    const y1 = projections[0];
    
    const fbShare = ((y3.revenueFB / y3.totalRevenue) * 100).toFixed(1);
    
    const gopMarginY1 = ((y1.gop / y1.totalRevenue) * 100).toFixed(1);
    const gopMarginY3 = ((y3.gop / y3.totalRevenue) * 100).toFixed(1);
    
    const ebitdaMarginY3 = y3.margin.toFixed(1);
    const totalRevK = (y3.totalRevenue / 1000).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { maximumFractionDigits: 0 });

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0047AB]" />
                {t.bp.analysisTitle}
            </h4>
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed text-justify">
                <div className="flex gap-3">
                    <span className="text-[#00BFFF] font-bold">•</span>
                    <p>
                        {t.bp.analysis.intro} <strong>{location}</strong>, {t.bp.analysis.intro2}
                    </p>
                </div>
                
                <div className="flex gap-3">
                    <span className="text-[#00BFFF] font-bold">•</span>
                    <p>
                        {t.bp.analysis.rampup} <strong>{y3.occupancy.toFixed(1)}%</strong> {language === 'fr' ? 'et un Prix Moyen (ADR) de' : 'and an ADR of'} <strong>{y3.adr.toFixed(0)} €</strong>, 
                        {language === 'fr' ? 'générant un CA stabilisé de' : 'generating a stabilized Revenue of'} <strong>{totalRevK} k€</strong>.
                    </p>
                </div>

                <div className="flex gap-3">
                    <span className="text-[#00BFFF] font-bold">•</span>
                    <p>
                        {t.bp.analysis.mix} <strong>{fbShare}%</strong>.
                    </p>
                </div>

                <div className="flex gap-3">
                    <span className="text-[#00BFFF] font-bold">•</span>
                    <p>
                        {t.bp.analysis.gop} <strong>{gopMarginY1}%</strong>. 
                        {language === 'fr' ? 'La stabilisation permet une progression à' : 'Stabilization allows progression to'} <strong>{gopMarginY3}%</strong> {language === 'fr' ? 'en Année 3' : 'in Year 3'}.
                    </p>
                </div>

                <div className="flex gap-3">
                    <span className="text-[#00BFFF] font-bold">•</span>
                    <p>
                        {t.bp.analysis.ebitda} <strong>{ebitdaMarginY3}%</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- VALUATION SECTION COMPONENT ---
const ValuationSection = ({ projections, roomCount, surface, location }: { projections: YearlyResult[], roomCount: number, surface: number, location: string }) => {
    const { t, language } = useLanguage();
    
    // Default Valuation Params
    const [valParams, setValParams] = useState<ValuationParams>({
        capRate: 6.5,
        discountRate: 8.5,
        exitCapRate: 7.0,
        pricePerKey: 150000,
        transactionCosts: 7.5, // New default
        renovationCapex: 250000 // New default
    });

    const updateParam = (field: keyof ValuationParams, val: string) => {
        const cleanVal = parseFloat(val.replace(',', '.'));
        if (!isNaN(cleanVal)) {
            setValParams(prev => ({ ...prev, [field]: cleanVal }));
        }
    };

    // --- MOCK TRANSACTIONS (More details) ---
    const mockTransactions: TransactionRef[] = [
        { name: "Hotel Central", location: location, year: "2023", price: 4200000, keys: 25, pricePerKey: 168000, standing: 3, buyerProfile: "Private Investor", yield: 5.8 },
        { name: "Residence du Parc", location: location, year: "2024", price: 8500000, keys: 58, pricePerKey: 146500, standing: 4, buyerProfile: "Family Office", yield: 6.2 },
        { name: "Grand Hotel", location: location, year: "2022", price: 12000000, keys: 80, pricePerKey: 150000, standing: 4, buyerProfile: "REIT", yield: 5.5 },
    ];

    // --- CALCULATIONS ---
    const stabilizedEbitda = projections[2]?.ebitda || 0; // Year 3
    const grossYieldValue = valParams.capRate > 0 ? stabilizedEbitda / (valParams.capRate / 100) : 0;

    const calculateDCF = () => {
        let npv = 0;
        // Years 1 to 10
        projections.forEach((p, i) => {
            const flow = p.ebitdaLessCapex; // Net Cash Flow after Capex
            const discountFactor = Math.pow(1 + valParams.discountRate / 100, i + 1);
            npv += flow / discountFactor;
        });
        
        // Terminal Value (Year 11 estimated as Y10 * inflation, cap at Exit Cap)
        // Simplified: Ebitda Y10 / Exit Cap discounted
        const terminalValue = (projections[9].ebitda) / (valParams.exitCapRate / 100);
        const discountedTerminalValue = terminalValue / Math.pow(1 + valParams.discountRate / 100, 10);
        
        return npv + discountedTerminalValue;
    };

    const grossDcfValue = calculateDCF();
    const grossCompValue = roomCount * valParams.pricePerKey;

    // Apply Deductions (Net Seller Calculation)
    // Formula: Gross Value - Capex - Transaction Costs (% of Gross)
    const getNetValue = (gross: number) => {
        const costs = gross * (valParams.transactionCosts / 100);
        return gross - costs - valParams.renovationCapex;
    };

    const formatCurrency = (val: number) => val.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mt-12 overflow-hidden">
            <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-[#00BFFF]" />
                        {t.valo.title}
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">{t.valo.subtitle}</p>
                </div>
            </div>

            {/* Global Params Bar */}
            <div className="bg-slate-100 p-4 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.valo.params.transCost}</span>
                    <TableInput value={valParams.transactionCosts} onUpdate={(v) => updateParam('transactionCosts', v)} className="w-full font-bold text-slate-800 outline-none" />
                 </div>
                 <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">{t.valo.params.capex}</span>
                    <TableInput value={valParams.renovationCapex} onUpdate={(v) => updateParam('renovationCapex', v)} className="w-full font-bold text-slate-800 outline-none" />
                 </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 bg-slate-50/50">
                
                {/* METHOD 1: YIELD */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h4 className="font-bold text-slate-900 mb-2">{t.valo.method1}</h4>
                    <p className="text-xs text-slate-500 mb-4">{t.valo.method1Desc}</p>
                    
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
                        <span className="text-sm font-medium text-slate-700">{t.valo.params.capRate}</span>
                        <div className="w-20">
                            <TableInput value={valParams.capRate} onUpdate={(v) => updateParam('capRate', v)} className="w-full text-right bg-transparent font-bold text-blue-600 outline-none border-b border-slate-300 focus:border-blue-500" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-400 uppercase font-bold">{t.valo.grossVal}</span>
                            <span className="text-lg font-bold text-slate-700">{formatCurrency(grossYieldValue)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">{t.valo.netVal}</span>
                            <span className="text-2xl font-extrabold text-blue-700">{formatCurrency(getNetValue(grossYieldValue))}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                            <span>{t.valo.results.perKey} (Net)</span>
                            <span>{formatCurrency(getNetValue(grossYieldValue) / roomCount)}</span>
                        </div>
                    </div>
                </div>

                {/* METHOD 2: DCF */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                    <h4 className="font-bold text-slate-900 mb-2">{t.valo.method2}</h4>
                    <p className="text-xs text-slate-500 mb-4">{t.valo.method2Desc}</p>
                    
                    <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-700">{t.valo.params.discountRate}</span>
                            <div className="w-20">
                                <TableInput value={valParams.discountRate} onUpdate={(v) => updateParam('discountRate', v)} className="w-full text-right bg-transparent font-bold text-purple-600 outline-none border-b border-slate-300 focus:border-purple-500" />
                            </div>
                        </div>
                        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="text-sm font-medium text-slate-700">{t.valo.params.exitCap}</span>
                            <div className="w-20">
                                <TableInput value={valParams.exitCapRate} onUpdate={(v) => updateParam('exitCapRate', v)} className="w-full text-right bg-transparent font-bold text-purple-600 outline-none border-b border-slate-300 focus:border-purple-500" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-400 uppercase font-bold">{t.valo.grossVal}</span>
                            <span className="text-lg font-bold text-slate-700">{formatCurrency(grossDcfValue)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">{t.valo.netVal}</span>
                            <span className="text-2xl font-extrabold text-purple-700">{formatCurrency(getNetValue(grossDcfValue))}</span>
                        </div>
                         <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                            <span>{t.valo.results.perKey} (Net)</span>
                            <span>{formatCurrency(getNetValue(grossDcfValue) / roomCount)}</span>
                        </div>
                    </div>
                </div>

                {/* METHOD 3: COMPS */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
                    <h4 className="font-bold text-slate-900 mb-2">{t.valo.method3}</h4>
                    <p className="text-xs text-slate-500 mb-4">{t.valo.method3Desc}</p>
                    
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-100 mb-6">
                        <span className="text-sm font-medium text-slate-700">{t.valo.params.priceKey}</span>
                        <div className="w-24">
                            <TableInput value={valParams.pricePerKey} onUpdate={(v) => updateParam('pricePerKey', v)} className="w-full text-right bg-transparent font-bold text-green-600 outline-none border-b border-slate-300 focus:border-green-500" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-baseline">
                            <span className="text-xs text-slate-400 uppercase font-bold">{t.valo.grossVal}</span>
                            <span className="text-lg font-bold text-slate-700">{formatCurrency(grossCompValue)}</span>
                        </div>
                        <div className="flex justify-between items-baseline pt-2 border-t border-slate-100">
                            <span className="text-sm font-bold text-slate-900">{t.valo.netVal}</span>
                            <span className="text-2xl font-extrabold text-green-700">{formatCurrency(getNetValue(grossCompValue))}</span>
                        </div>
                         <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                            <span>{t.valo.results.perSqm} (Net)</span>
                            <span>{surface > 0 ? formatCurrency(getNetValue(grossCompValue) / surface) : '-'}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* TRANSACTIONS TABLE */}
            <div className="p-6 border-t border-slate-200 bg-white">
                <h4 className="text-sm font-bold text-slate-700 uppercase mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-400" />
                    {t.valo.transactions.title}
                </h4>
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-xs text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                                <th className="p-3">{t.valo.transactions.colName}</th>
                                <th className="p-3">{t.valo.transactions.colLoc}</th>
                                <th className="p-3">{t.valo.transactions.colBuyer}</th>
                                <th className="p-3 text-center">{t.valo.transactions.colStars}</th>
                                <th className="p-3 text-right">Year</th>
                                <th className="p-3 text-right">{t.valo.transactions.colPrice}</th>
                                <th className="p-3 text-right">{t.valo.transactions.colKey}</th>
                                <th className="p-3 text-right">{t.valo.transactions.colYield}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {mockTransactions.map((tx, i) => (
                                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="p-3 font-bold text-slate-800">{tx.name}</td>
                                    <td className="p-3 text-slate-600">{tx.location}</td>
                                    <td className="p-3 text-slate-600"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase">{tx.buyerProfile}</span></td>
                                    <td className="p-3 text-center">
                                        <div className="flex justify-center">
                                            {[...Array(tx.standing)].map((_, idx) => <span key={idx} className="text-yellow-400">★</span>)}
                                        </div>
                                    </td>
                                    <td className="p-3 text-right text-slate-500">{tx.year}</td>
                                    <td className="p-3 text-right font-mono text-slate-700">{formatCurrency(tx.price)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-slate-800">{formatCurrency(tx.pricePerKey)}</td>
                                    <td className="p-3 text-right font-mono text-green-600 font-bold">{tx.yield}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const BusinessPlan: React.FC<BusinessPlanProps> = ({ marketData }) => {
  const { t, language } = useLanguage();
  const [assumptions, setAssumptions] = useState<FinancialAssumptions | null>(null);
  const [projections, setProjections] = useState<YearlyResult[]>([]);

  useEffect(() => {
    if (marketData && !assumptions) {
      const defaults = getDefaultAssumptions(
        marketData.standing,
        marketData.keyMetrics.adr,
        marketData.keyMetrics.occupancyRate
      );
      setAssumptions(defaults);
      setProjections(calculate10YearProjection(defaults));
    }
  }, [marketData]);

  const handleAssumptionChange = (field: keyof FinancialAssumptions, value: string) => {
      if (!assumptions) return;
      const cleanVal = parseFloat(value.replace(/\s/g, '').replace(',', '.'));
      if (isNaN(cleanVal)) return;

      const newAssumptions = { ...assumptions, [field]: cleanVal };
      setAssumptions(newAssumptions);

      // Recalculate all projections with new assumptions but keeping existing per-year overrides (Occ, ADR)
      const newProjections = projections.map(p => recalculateYearlyResult(p, newAssumptions));
      setProjections(newProjections);
  };

  const handleProjectionEdit = (yearIndex: number, field: keyof YearlyResult, value: string) => {
     if (!assumptions) return;
     let safeVal = 0;
     const normalizedValue = value.replace(',', '.');
     if (normalizedValue !== "") {
        safeVal = parseFloat(normalizedValue);
        if (isNaN(safeVal)) safeVal = 0;
     }

     const newProjections = [...projections];
     const currentYear = newProjections[yearIndex];
     const updatedYear = { ...currentYear, [field]: safeVal };
     
     if (field === 'occupancy' || field === 'adr' || field === 'inflation') {
         newProjections[yearIndex] = recalculateYearlyResult(updatedYear, assumptions);
     } else {
         newProjections[yearIndex] = recalculateYearlyTotals(updatedYear);
     }
     setProjections(newProjections);
  };

  const handleDownloadExcel = () => {
    if (projections.length === 0) return;
    const fmt = (num: number) => num.toFixed(2).replace('.', ',');
    const rows = [
        [t.bp.table.item, ...projections.map(p => `Year ${p.year}`)],
        ["", ...projections.map(() => "")], 
        [t.bp.table.occ, ...projections.map(p => fmt(p.occupancy))],
        [t.bp.table.adr, ...projections.map(p => fmt(p.adr))],
        [t.bp.table.revpar, ...projections.map(p => fmt(p.revpar))],
        ["", ...projections.map(() => "")],
        [t.bp.table.revTotal, ...projections.map(p => fmt(p.totalRevenue))],
        [t.bp.table.gop, ...projections.map(p => fmt(p.gop))],
        [t.bp.table.ebitda, ...projections.map(p => fmt(p.ebitda))],
        [t.bp.table.ncf, ...projections.map(p => fmt(p.ebitdaLessCapex))],
    ];
    const csvContent = "\uFEFF" + rows.map(e => e.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `BusinessPlan_${marketData.location}_10years.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCompact = (val: number) => new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { notation: "compact", compactDisplay: "short", style: 'currency', currency: 'EUR' }).format(val);
  const formatCurrency = (val: number) => new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

  if (!assumptions) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-12 overflow-hidden" data-section="business-plan">
      
      <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
        <div>
           <h3 className="text-xl font-bold flex items-center gap-2">
             <Calculator className="w-6 h-6 text-[#00BFFF]" />
             {t.bp.title}
           </h3>
           <p className="text-slate-400 text-sm mt-1">{t.bp.subtitle}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-600 hover:bg-green-500 text-white transition-all shadow-sm">
              <FileSpreadsheet className="w-4 h-4" /> Excel
           </button>
        </div>
      </div>

      <div className="flex flex-col p-6 bg-slate-50/50">
        
        {/* STRUCTURAL INPUTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-white border border-blue-100 rounded-xl shadow-sm">
            <h4 className="col-span-1 md:col-span-2 text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Building2 className="w-4 h-4 text-blue-500" />
                {t.bp.structure.title}
            </h4>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm"><BedDouble className="w-5 h-5 text-slate-600" /></div>
                    <span className="text-sm font-medium text-slate-700">{t.bp.structure.rooms}</span>
                </div>
                <div className="w-24">
                    <TableInput 
                        value={assumptions.roomCount} 
                        onUpdate={(v) => handleAssumptionChange('roomCount', v)} 
                        className="w-full text-right bg-transparent font-bold text-blue-700 text-lg outline-none border-b border-slate-300 focus:border-blue-500" 
                    />
                </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm"><Ruler className="w-5 h-5 text-slate-600" /></div>
                    <span className="text-sm font-medium text-slate-700">{t.bp.structure.surface}</span>
                </div>
                <div className="w-24">
                    <TableInput 
                        value={assumptions.surface} 
                        onUpdate={(v) => handleAssumptionChange('surface', v)} 
                        className="w-full text-right bg-transparent font-bold text-slate-700 text-lg outline-none border-b border-slate-300 focus:border-blue-500" 
                    />
                </div>
            </div>
        </div>

        {/* KPI HEADERS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white border border-blue-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">{t.bp.stabilizedRev}</div>
                <div className="text-xl font-extrabold text-[#0047AB]">{formatCompact(projections[2]?.totalRevenue || 0)}</div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-purple-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">{t.bp.stabilizedEbitda}</div>
                <div className="text-xl font-extrabold text-purple-700">{formatCompact(projections[2]?.ebitda || 0)}</div>
            </div>
                <div className="p-4 rounded-xl bg-white border border-green-100 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">{t.bp.avgMargin}</div>
                <div className="text-xl font-extrabold text-green-700">
                    {projections.length > 0 ? Math.round(projections.reduce((acc, curr) => acc + curr.margin, 0) / 10) : 0}%
                </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                <div className="text-xs text-slate-500 font-bold uppercase mb-1">{t.bp.cashFlow}</div>
                <div className="text-xl font-extrabold text-slate-700">
                        {formatCompact(projections.reduce((acc, curr) => acc + curr.ebitdaLessCapex, 0))}
                </div>
            </div>
        </div>

        {/* TABLE VIEW */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm">
            <table className="w-full text-xs text-right border-collapse min-w-[1200px] table-fixed">
                <thead className="sticky top-0 z-40">
                    <tr className="bg-slate-900 text-white font-bold shadow-md">
                        <th className="p-3 text-left w-64 sticky left-0 z-40 bg-slate-900 border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.3)]">{t.bp.table.item}</th>
                        {projections.map(p => <th key={p.year} className="p-3 w-[90px]">Y{p.year}</th>)}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                    
                    {/* DRIVERS */}
                    <tr className="bg-blue-50/20 font-bold border-b border-slate-200">
                        <td className="p-2 text-left sticky left-0 z-30 bg-white border-r border-slate-200 text-blue-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.kpi}</td>
                        <td colSpan={10}></td>
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 text-left sticky left-0 z-30 bg-white border-r border-slate-200 font-semibold text-blue-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3 text-blue-300"/>{t.bp.table.occ}
                            </div>
                        </td>
                        {projections.map((p, i) => (
                            <td key={p.year} className="p-0 border-r border-slate-50">
                                <TableInput 
                                    value={p.occupancy} 
                                    onUpdate={(val) => handleProjectionEdit(i, 'occupancy', val)}
                                    className="w-full h-full p-2 text-right bg-transparent focus:bg-blue-50 outline-none font-bold text-blue-700" 
                                />
                            </td>
                        ))}
                    </tr>
                    <tr className="bg-white">
                        <td className="p-2 text-left sticky left-0 z-30 bg-white border-r border-slate-200 font-semibold text-blue-700 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                             <div className="flex items-center gap-1">
                                <Edit3 className="w-3 h-3 text-blue-300"/>{t.bp.table.adr}
                             </div>
                        </td>
                        {projections.map((p, i) => (
                            <td key={p.year} className="p-0 border-r border-slate-50">
                                <TableInput 
                                    value={p.adr} 
                                    onUpdate={(val) => handleProjectionEdit(i, 'adr', val)}
                                    className="w-full h-full p-2 text-right bg-transparent focus:bg-blue-50 outline-none font-bold text-blue-700" 
                                />
                            </td>
                        ))}
                    </tr>
                    
                    {/* NEW GROWTH ROW FOR ADR */}
                    <tr className="bg-slate-50/30 border-b border-slate-100">
                        <td className="text-right pr-2 sticky left-0 z-30 bg-white border-r border-slate-200 text-[9px] uppercase tracking-wide text-slate-400 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                            {t.bp.table.growth}
                        </td>
                        {projections.map((p, i) => {
                            const prev = projections[i-1]?.adr || 0;
                            const curr = p.adr;
                            const growth = prev !== 0 ? ((curr - prev) / prev) * 100 : 0;
                            const isPositive = growth > 0;
                            
                            if (i === 0) return <td key={p.year} className="border-r border-slate-50"></td>;

                            return (
                                <td key={p.year} className={`text-right px-2 py-0.5 border-r border-slate-50 text-[9px] ${isPositive ? 'text-green-600' : 'text-red-400'}`}>
                                    {isPositive ? '+' : ''}{growth.toFixed(1)}%
                                </td>
                            );
                        })}
                    </tr>

                    <tr className="bg-slate-50 border-b-2 border-slate-200">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-50 border-r border-slate-200 font-semibold text-slate-600 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.revpar}</td>
                        {projections.map(p => <td key={p.year} className="p-2 font-bold text-slate-600 border-r border-slate-200">{p.revpar.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {maximumFractionDigits: 0})}</td>)}
                    </tr>

                    {/* REVENUE SECTION */}
                    <tr className="bg-slate-100 font-bold border-b border-slate-200">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-100 text-slate-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.rev}</td>
                        <td colSpan={10}></td>
                    </tr>
                    <PnlRowGroup label={t.bp.table.revRoom} field="revenueRoom" data={projections} onEdit={handleProjectionEdit} />
                    <PnlRowGroup label={t.bp.table.revFb} field="revenueFB" data={projections} onEdit={handleProjectionEdit} />
                    <PnlRowGroup label={t.bp.table.revOther} field="revenueOther" data={projections} onEdit={handleProjectionEdit} />
                    <PnlRowGroup label={t.bp.table.revTotal} field="totalRevenue" data={projections} onEdit={handleProjectionEdit} isTotal readOnly />

                    {/* DEPT EXPENSES */}
                    <tr className="bg-slate-100 font-bold border-b border-slate-200 mt-4">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-100 text-slate-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.opExp}</td>
                        <td colSpan={10}></td>
                    </tr>
                    <PnlRowGroup label={t.bp.table.cosRoom} field="roomsCOS" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.payRoom} field="roomsPayroll" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.cosFb} field="fbCOS" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.payFb} field="fbPayroll" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.deptIncome} field="totalDeptIncome" data={projections} onEdit={handleProjectionEdit} isTotal readOnly />

                    {/* UNDISTRIBUTED */}
                    <tr className="bg-slate-100 font-bold border-b border-slate-200 mt-4">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-100 text-slate-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.undist}</td>
                        <td colSpan={10}></td>
                    </tr>
                    <PnlRowGroup label={t.bp.table.admin} field="adminExpenses" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.sales} field="marketingExpenses" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.pom} field="pomExpenses" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.util} field="utilitiesExpenses" data={projections} onEdit={handleProjectionEdit} negative />
                    
                    {/* GOP */}
                    <PnlRowGroup label={t.bp.table.gop} field="gop" data={projections} onEdit={handleProjectionEdit} isTotal readOnly />

                    {/* FIXED */}
                    <tr className="bg-slate-100 font-bold border-b border-slate-200 mt-4">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-100 text-slate-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.fixed}</td>
                        <td colSpan={10}></td>
                    </tr>
                    <PnlRowGroup label={t.bp.table.fees} field="fees" data={projections} onEdit={handleProjectionEdit} negative />
                    <PnlRowGroup label={t.bp.table.ins} field="nonOperating" data={projections} onEdit={handleProjectionEdit} negative />
                    {/* MOVED FF&E HERE */}
                    <PnlRowGroup label={t.bp.table.ffe} field="ffe" data={projections} onEdit={handleProjectionEdit} negative />

                    {/* EBITDA */}
                    <tr className="bg-slate-800 text-white font-extrabold border-y-4 border-double border-white">
                        <td className="p-3 text-left sticky left-0 z-30 bg-slate-800 border-r border-slate-600 text-sm shadow-[2px_0_5px_rgba(0,0,0,0.3)]">{t.bp.table.ebitda}</td>
                        {projections.map(p => <td key={p.year} className="p-3 text-[#00BFFF] text-sm border-r border-slate-700">{(p.ebitda/1000).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {maximumFractionDigits: 0})}</td>)}
                    </tr>
                    <tr className="text-[10px] text-slate-400 bg-slate-50 border-b-2 border-slate-200">
                        <td className="text-right pr-2 sticky left-0 z-30 bg-slate-50 border-r border-slate-200 italic shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.margin}</td>
                        {projections.map((p) => <td key={p.year} className="text-right px-2 font-bold text-slate-600 border-r border-slate-200">{p.margin.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {maximumFractionDigits: 1})}%</td>)}
                    </tr>

                    {/* CAPEX */}
                    <tr className="bg-slate-100 font-bold border-b border-slate-200 mt-4">
                        <td className="p-2 text-left sticky left-0 z-30 bg-slate-100 text-slate-800 uppercase text-[10px] tracking-widest pl-4 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.invest}</td>
                        <td colSpan={10}></td>
                    </tr>
                    {/* FF&E Removed from here */}
                    <PnlRowGroup label={t.bp.table.capex} field="capex" data={projections} onEdit={handleProjectionEdit} negative showDetails={false} />

                    {/* NET CASH FLOW */}
                    <tr className="bg-green-100 font-extrabold border-t-2 border-green-300">
                        <td className="p-3 text-left sticky left-0 z-30 bg-green-100 border-r border-green-200 text-green-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">{t.bp.table.ncf}</td>
                        {projections.map(p => <td key={p.year} className="p-3 text-green-800 text-sm border-r border-green-200">{(p.ebitdaLessCapex/1000).toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US', {maximumFractionDigits: 0})}</td>)}
                    </tr>
                </tbody>
            </table>
        </div>

        {/* --- GRAPH CHART SECTION (BELOW P&L) --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-8">
            <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                {t.bp.chartTitle}
            </h4>
            <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={projections} margin={{top: 20, right: 20, left: 0, bottom: 0}}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#0047AB" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0047AB" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="colorEbitda" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#00BFFF" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="year" tickFormatter={(val) => `Y${val}`} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis yAxisId="left" orientation="left" tickFormatter={formatCompact} axisLine={false} tickLine={false} />
                        <YAxis yAxisId="right" orientation="right" domain={[0, 45]} tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} />
                        <RechartsTooltip 
                            formatter={(val:number, name:string) => [name.includes('Margin') ? `${val}%` : formatCurrency(val), name]} 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                        />
                        <Legend />
                        <Area yAxisId="left" type="monotone" dataKey="totalRevenue" name={t.bp.table.revTotal} fill="url(#colorRev)" stroke="#0047AB" />
                        <Bar yAxisId="left" dataKey="ebitda" name={t.bp.table.ebitda} fill="url(#colorEbitda)" radius={[4, 4, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="margin" name={t.bp.avgMargin} stroke="#D100D1" strokeWidth={3} dot={{r:4, fill: '#D100D1', stroke: '#fff'}} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* --- DYNAMIC TEXT ANALYSIS (BELOW CHART) --- */}
        <BusinessPlanAnalysis projections={projections} location={marketData.location} />

        {/* --- VALUATION SECTION (NEW) --- */}
        <ValuationSection projections={projections} roomCount={assumptions.roomCount} surface={assumptions.surface} location={marketData.location} />
        
      </div>
    </div>
  );
};
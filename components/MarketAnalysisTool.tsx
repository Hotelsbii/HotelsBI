
import React, { useState, useRef, useEffect } from 'react';
import { Logo } from './Logo';
import { MarketTrendChart, SupplyDistributionChart, SeasonalityChart, NightsBreakdownChart, StayDurationChart, TenYearTourismChart, PopulationGrowthChart } from './Charts';
import { generateMarketStudy } from '../services/geminiService';
import { MarketStudyData, HotelStanding, GenerationState, GeoData } from '../types';
import { searchAddress, GeoApiResponse } from '../services/geoGouv'; 
import { Pricing } from './Pricing';
import { CatchmentMap } from './CatchmentMap';
import { BusinessPlan } from './BusinessPlan'; 
import { useLanguage } from './LanguageContext';
import { 
  MapPin, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle2, 
  Download,
  Building2,
  ArrowRight,
  Loader2,
  Train,
  Car,
  Map as MapIcon,
  Factory,
  BarChart3,
  Hotel,
  Calendar,
  Briefcase,
  Landmark,
  BedDouble,
  Tent,
  Sparkles,
  Waves,
  Mountain,
  Timer,
  Navigation,
  Settings,
  X,
  CheckSquare,
  Square,
  Globe2,
  Footprints,
  Plane,
  Bus,
  Clock,
  History,
  Star,
  Coffee,
  Wifi,
  Utensils,
  ExternalLink,
  Check,
  ConciergeBell,
  Languages
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const KpiCard: React.FC<{
  label: string;
  value: string;
  trend: string;
  icon: React.ReactNode;
  neutral?: boolean;
}> = ({ label, value, trend, icon, neutral }) => {
  let colorClass = "text-green-600 bg-green-50";
  if (trend.includes("-")) colorClass = "text-red-600 bg-red-50";
  if (neutral) colorClass = "text-slate-600 bg-slate-50";

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 rounded-lg shadow-sm">
          {icon}
        </div>
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${colorClass}`}>
          {trend}
        </span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</p>
    </div>
  );
};

const SECTIONS = [
  { id: 'header', labelKey: 'header' },
  { id: 'kpi', labelKey: 'kpi' },
  { id: 'summary', labelKey: 'summary' },
  { id: 'catchment', labelKey: 'catchment' },
  { id: 'economy', labelKey: 'economy' },
  { id: 'demographics', labelKey: 'demographics' },
  { id: 'tourism', labelKey: 'tourism' },
  { id: 'competition', labelKey: 'competition' },
  { id: 'trends', labelKey: 'trends' },
  { id: 'supply', labelKey: 'supply' },
  { id: 'swot', labelKey: 'swot' },
  { id: 'business-plan', labelKey: 'bp' }, 
  { id: 'sources', labelKey: 'sources' }
];

const MarketAnalysisTool: React.FC = () => {
  const { t, language, setLanguage } = useLanguage();

  const [location, setLocation] = useState('');
  const [selectedGeo, setSelectedGeo] = useState<GeoApiResponse | null>(null); 
  const [suggestions, setSuggestions] = useState<GeoApiResponse[]>([]); 
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [standing, setStanding] = useState<string>(HotelStanding.MIDSCALE);
  const [data, setData] = useState<MarketStudyData | null>(null);
  const [state, setState] = useState<GenerationState>({
    isLoading: false,
    step: '',
    error: null
  });
  
  const [catchmentView, setCatchmentView] = useState<'macro' | 'micro'>('macro'); 

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfSections, setPdfSections] = useState<Record<string, boolean>>(
    SECTIONS.reduce((acc, s) => ({ ...acc, [s.id]: true }), {})
  );

  const resultsRef = useRef<HTMLDivElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<number | null>(null);

  const toggleSection = (id: string) => {
    setPdfSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocation(value);
    setSelectedGeo(null); 

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length > 2) {
      searchTimeout.current = window.setTimeout(async () => {
        const results = await searchAddress(value);
        setSuggestions(results);
        setShowSuggestions(true);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (geo: GeoApiResponse) => {
    setLocation(geo.label || geo.nom);
    setSelectedGeo(geo);
    setShowSuggestions(false);
  };

  const handleGenerate = async (e?: React.FormEvent, overrideLocation?: string, overrideStanding?: string) => {
    if (e) e.preventDefault();
    
    setShowSuggestions(false);

    const finalLocation = overrideLocation || location;
    const finalStanding = overrideStanding || standing;
    
    if (!finalLocation) return;

    if (overrideLocation) {
        setLocation(overrideLocation);
        setSelectedGeo(null); 
    }
    if (overrideStanding) setStanding(overrideStanding);

    setState({ isLoading: true, step: t.steps.init, error: null });
    
    try {
      setTimeout(() => setState(s => ({ ...s, step: t.steps.sirene })), 1500);
      setTimeout(() => setState(s => ({ ...s, step: t.steps.insee })), 3500);
      setTimeout(() => setState(s => ({ ...s, step: t.steps.iso })), 4500);
      setTimeout(() => setState(s => ({ ...s, step: t.steps.sncf })), 6000);
      setTimeout(() => setState(s => ({ ...s, step: t.steps.comp })), 7500);

      // PASS LANGUAGE TO SERVICE
      const result = await generateMarketStudy(finalLocation, finalStanding, selectedGeo || undefined, language);
      setData(result);
      setState({ isLoading: false, step: '', error: null });
      
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      setState({ 
        isLoading: false, 
        step: '', 
        error: "An error occurred. Please check your connection or try again." 
      });
    }
  };

  const handleDownloadPdf = async () => {
    if (!reportContentRef.current) return;

    setIsDownloadingPdf(true);
    setShowPdfModal(false);

    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const contentWidth = pageWidth - (margin * 2);
      
      let currentY = margin;

      const checkPageBreak = (heightToAdd: number) => {
        if (currentY + heightToAdd > pageHeight - margin) {
          pdf.addPage();
          currentY = margin;
          return true;
        }
        return false;
      };

      for (const section of SECTIONS) {
        if (!pdfSections[section.id]) continue;

        const elements = document.querySelectorAll(`[data-section="${section.id}"]`);
        
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i] as HTMLElement;
          const originalStyle = element.style.cssText;
          element.style.backgroundColor = '#ffffff'; 
          
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scrollY: -window.scrollY,
            windowWidth: document.documentElement.offsetWidth
          });

          element.style.cssText = originalStyle;

          const imgData = canvas.toDataURL('image/png');
          const imgProps = pdf.getImageProperties(imgData);
          const pdfImgHeight = (imgProps.height * contentWidth) / imgProps.width;

          checkPageBreak(pdfImgHeight);

          pdf.addImage(imgData, 'PNG', margin, currentY, contentWidth, pdfImgHeight);
          currentY += pdfImgHeight + 5;
        }
      }
      
      const safeLocationName = data?.location.replace(/[^a-zA-Z0-9]/g, '_') || 'market_study';
      pdf.save(`Report_HotelsBI_${safeLocationName}.pdf`);
    
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("An error occurred while generating the PDF.");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const examples = [
    {
      city: t.examples.biarritz.city,
      standing: HotelStanding.MIDSCALE,
      label: t.examples.biarritz.label,
      icon: <Waves className="w-6 h-6 text-blue-500" />,
      color: "from-blue-50 to-cyan-50",
      stats: t.examples.biarritz.stats
    },
    {
      city: t.examples.lyon.city,
      standing: HotelStanding.MIDSCALE,
      label: t.examples.lyon.label,
      icon: <Building2 className="w-6 h-6 text-slate-500" />,
      color: "from-slate-50 to-blue-50",
      stats: t.examples.lyon.stats
    },
    {
      city: t.examples.courchevel.city,
      standing: HotelStanding.LUXURY,
      label: t.examples.courchevel.label,
      icon: <Mountain className="w-6 h-6 text-purple-500" />,
      color: "from-purple-50 to-pink-50",
      stats: t.examples.courchevel.stats
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-200 selection:text-cyan-900 relative">
      
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo />
            <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
              <a href="#" className="hover:text-[#0047AB] transition-colors">{t.nav.data}</a>
              <a href="#tarifs" className="hover:text-[#0047AB] transition-colors">{t.nav.pricing}</a>
              
              {/* Language Switcher */}
              <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                 <button 
                    onClick={() => setLanguage('fr')} 
                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'fr' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    FR
                 </button>
                 <button 
                    onClick={() => setLanguage('en')} 
                    className={`px-2 py-1 rounded-md text-xs font-bold transition-all ${language === 'en' ? 'bg-white text-[#0047AB] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                 >
                    EN
                 </button>
              </div>
            </div>
            <button className="bg-slate-100 text-slate-700 px-5 py-2 rounded-full font-medium text-sm hover:bg-slate-200 transition-all">
              {t.nav.account}
            </button>
          </div>
        </div>
      </nav>

      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-pulse"></div>
            <div className="absolute top-10 right-10 w-96 h-96 bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply filter animate-pulse animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3" /> {t.hero.newVersion}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            {t.hero.title1} <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#00BFFF] to-[#D100D1]">{t.hero.title2}</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
            {t.hero.subtitle}
          </p>

          <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-blue-900/10 max-w-2xl mx-auto border border-slate-100 z-50 relative">
            <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-2 relative">
              <div className="flex-1 relative group">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                <input
                  type="text"
                  placeholder={t.hero.placeholder}
                  className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF] transition-all text-slate-900 placeholder:text-slate-400"
                  value={location}
                  onChange={handleLocationChange}
                  onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
                  required
                />
                
                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-2">
                      <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">Address API Results</div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors flex items-center gap-3 group/item"
                        >
                           <div className="p-2 bg-slate-100 rounded-full group-hover/item:bg-blue-100 transition-colors">
                              <MapIcon className="w-4 h-4 text-slate-500 group-hover/item:text-[#0047AB]" />
                           </div>
                           <div>
                              <div className="text-sm font-semibold text-slate-900">{suggestion.label}</div>
                              <div className="text-xs text-slate-500">{suggestion.context}</div>
                           </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="relative min-w-[200px]">
                 <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 z-10" />
                 <select 
                    className="w-full pl-10 pr-4 py-4 bg-slate-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00BFFF] transition-all appearance-none text-slate-900"
                    value={standing}
                    onChange={(e) => setStanding(e.target.value)}
                 >
                   {Object.values(HotelStanding).map((s) => (
                     <option key={s} value={s}>{s}</option>
                   ))}
                 </select>
              </div>
              <button 
                type="submit"
                disabled={state.isLoading}
                className="bg-gradient-to-r from-[#0047AB] to-[#00BFFF] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {state.isLoading ? <Loader2 className="animate-spin" /> : t.hero.analyze}
              </button>
            </form>
          </div>
          
          {/* Overlay to close suggestions when clicking outside */}
          {showSuggestions && (
            <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)}></div>
          )}
          
          {state.isLoading && (
            <div className="mt-8 flex flex-col items-center animate-fade-in">
              <div className="w-64 h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0047AB] to-[#D100D1] animate-gradient w-full origin-left"></div>
              </div>
              <p className="mt-3 text-slate-500 font-medium animate-pulse">{state.step}</p>
            </div>
          )}

          {state.error && (
            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100 flex items-center gap-2 justify-center max-w-xl mx-auto">
              <AlertTriangle className="w-5 h-5" />
              {state.error}
            </div>
          )}

          {!data && !state.isLoading && (
            <div className="mt-20 animate-fade-in">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">{t.hero.samples}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {examples.map((ex, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGenerate(undefined, ex.city, ex.standing)}
                    className={`group relative p-6 bg-gradient-to-br ${ex.color} border border-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left overflow-hidden`}
                  >
                    <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                      {React.cloneElement(ex.icon as React.ReactElement<any>, { className: 'w-24 h-24' })}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white rounded-lg shadow-sm">{ex.icon}</div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">{ex.label}</div>
                        <div className="text-xl font-bold text-slate-900">{ex.city}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                      <span>{ex.stats}</span>
                      <span className="flex items-center gap-1 group-hover:text-[#0047AB] transition-colors">
                        {t.hero.viewStudy} <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {data && (
        <div ref={resultsRef} className="bg-white border-t border-slate-200 min-h-screen">
          <div ref={reportContentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-slate-100" data-section="header">
              <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-[#0047AB] text-xs font-bold uppercase tracking-wide">{t.header.official}</span>
                    <span className="text-slate-400 text-sm">{t.header.generated} {new Date().toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Market Analysis: {data.location}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                    <span className="flex items-center gap-1"><MapIcon className="w-4 h-4"/> {data.geoData ? `${data.geoData.population > 0 ? data.geoData.population.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US') + (language === 'fr' ? ' hab.' : ' inhab.') : 'Precise Zone'}` : 'Unverified population'}</span>
                    <span className="flex items-center gap-1"><Hotel className="w-4 h-4"/> {data.standing}</span>
                </div>
              </div>
              <div data-html2canvas-ignore="true" className="mt-4 md:mt-0 flex gap-2">
                <button 
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 text-slate-600 hover:text-[#0047AB] transition-colors border border-slate-200 px-4 py-2 rounded-lg hover:border-[#0047AB]"
                >
                  <Settings className="w-4 h-4" /> {t.header.settings}
                </button>
                <button 
                  onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 bg-[#0047AB] text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4" /> {t.header.download}
                </button>
              </div>
            </div>

            {data.geoData && (
                <div className="w-full h-64 bg-slate-100 rounded-2xl mb-12 overflow-hidden border border-slate-200 shadow-inner relative group" data-section="header">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight={0} 
                        marginWidth={0} 
                        src={`https://maps.google.com/maps?q=${data.geoData.centre.coordinates[1]},${data.geoData.centre.coordinates[0]}&hl=${language}&z=15&output=embed`}
                        className="opacity-90 group-hover:opacity-100 transition-opacity"
                    >
                    </iframe>
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-semibold shadow-sm text-slate-600">
                        📍 {data.geoData.label || data.geoData.nom} ({data.geoData.code})
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-section="kpi">
              <KpiCard 
                label={t.kpi.occupancy} 
                value={data.keyMetrics?.occupancyRate || "N/A"} 
                trend="+2.1%" 
                icon={<Users className="w-5 h-5 text-blue-500" />} 
              />
              <KpiCard 
                label={t.kpi.adr}
                value={data.keyMetrics?.adr || "N/A"} 
                trend="+5.4%" 
                icon={<Target className="w-5 h-5 text-cyan-500" />} 
              />
              <KpiCard 
                label={t.kpi.revpar} 
                value={data.keyMetrics?.revpar || "N/A"} 
                trend="+8.2%" 
                icon={<TrendingUp className="w-5 h-5 text-purple-500" />} 
              />
              <KpiCard 
                label={t.kpi.supply} 
                value={data.keyMetrics?.supplyGrowth || "Stable"} 
                trend="Stable" 
                neutral
                icon={<Building2 className="w-5 h-5 text-slate-500" />} 
              />
            </div>

            <div className="mb-12 bg-slate-50 p-8 rounded-2xl border border-slate-100" data-section="summary">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-[#0047AB] rounded-full"></div>
                {t.summary.title}
                </h3>
                <p className="text-slate-700 leading-relaxed text-justify text-lg">
                {data.summary}
                </p>
            </div>

             {/* Catchment Area & Isochrones */}
            {data.catchment && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12" data-section="catchment">
                 <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[500px]">
                   <div className="p-3 border-b border-slate-100 flex gap-2">
                       <button 
                        onClick={() => setCatchmentView('macro')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${catchmentView === 'macro' ? 'bg-[#0047AB] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                       >
                           <Globe2 className="w-3 h-3" /> {t.catchment.macro}
                       </button>
                       <button 
                        onClick={() => setCatchmentView('micro')}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${catchmentView === 'micro' ? 'bg-[#0047AB] text-white shadow-md' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
                       >
                           <Footprints className="w-3 h-3" /> {t.catchment.micro}
                       </button>
                   </div>
                   <div className="flex-1 relative overflow-hidden">
                       {data.geoData && (
                         <CatchmentMap 
                            coordinates={data.geoData.centre.coordinates} 
                            zones={data.catchment?.zones || []} 
                            viewMode={catchmentView} 
                         />
                       )}
                       {!data.geoData && (
                         <div className="flex items-center justify-center h-full text-slate-400 text-sm">{t.catchment.unavailable}</div>
                       )}
                   </div>
                 </div>

                 <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2"><Navigation className="w-5 h-5 text-[#0047AB]" /> {t.catchment.title}</h3>
                    
                    {/* Zones Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {(data.catchment?.zones || []).map((zone, i) => {
                           let bgClass = "bg-slate-50 border-slate-100";
                           let textClass = "text-slate-500";
                           let evolutionClass = zone.evolution.includes('+') ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50";

                           if (zone.type === "Primary Zone") {
                               bgClass = "bg-red-50/30 border-red-100";
                               textClass = "text-red-600";
                           } else if (zone.type === "Secondary Zone") {
                               bgClass = "bg-orange-50/30 border-orange-100";
                               textClass = "text-orange-600";
                           } else {
                               bgClass = "bg-blue-50/30 border-blue-100";
                               textClass = "text-blue-600";
                           }

                           return (
                           <div key={i} className={`p-4 rounded-xl border ${bgClass}`}>
                              <div className="flex items-center gap-2 mb-2">
                                 <Timer className={`w-4 h-4 ${textClass}`} />
                                 <span className={`text-xs font-bold uppercase ${textClass}`}>{zone.type}</span>
                              </div>
                              <div className="text-2xl font-extrabold text-slate-900 mb-1">{zone.population}</div>
                              <div className="text-xs text-slate-600 mb-3 font-medium flex items-center gap-1">
                                  <span>{zone.radius}</span> • Density {zone.density}
                              </div>
                              <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${evolutionClass}`}>
                                 {zone.evolution}
                              </div>
                           </div>
                           );
                        })}
                    </div>
                    
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-sm text-slate-700 italic">"{data.catchment?.analysis || t.catchment.analysis}"</p>
                    </div>
                 </div>
              </div>
            )}

            {/* Démographie & Transports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
                
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" data-section="demographics">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Landmark className="w-5 h-5 text-[#0047AB]" /> {t.demographics.title}
                        </h3>
                        <div className="flex gap-2">
                             <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">{t.demographics.source}</span>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div className="grid grid-cols-3 gap-2">
                             <div className="text-center p-3 bg-slate-50 rounded-lg"><div className="text-[10px] text-slate-500 uppercase font-bold">{t.demographics.pop}</div><div className="font-bold text-slate-900">{data.demographics?.totalPopulation || "N/A"}</div></div>
                             <div className="text-center p-3 bg-slate-50 rounded-lg"><div className="text-[10px] text-slate-500 uppercase font-bold">{t.demographics.trend}</div><div className={`font-bold ${(data.demographics?.growthRate || "").includes('+') ? 'text-green-600' : 'text-red-600'}`}>{data.demographics?.growthRate || "N/A"}</div></div>
                             <div className="text-center p-3 bg-slate-50 rounded-lg"><div className="text-[10px] text-slate-500 uppercase font-bold">{t.demographics.income}</div><div className="font-bold text-slate-900">{data.demographics?.householdIncome || "N/A"}</div></div>
                        </div>

                        {/* NEW HISTORICAL POPULATION CHART */}
                        {data.demographics?.historicalData && data.demographics.historicalData.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <div className="flex items-center justify-between mb-4">
                                   <h4 className="text-xs font-bold text-slate-500 uppercase">{t.demographics.dynamics}</h4>
                                   <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full border border-slate-200">{t.demographics.histPop}</span>
                                </div>
                                <div className="h-64 w-full">
                                   <PopulationGrowthChart data={data.demographics.historicalData} />
                                </div>
                            </div>
                        )}

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mt-4">
                             <h4 className="text-sm font-bold mb-3">{t.demographics.realEstate}</h4>
                             <div className="grid grid-cols-2 gap-4 mb-3">
                                <div><span className="block text-xs text-slate-500">{t.demographics.price}</span><span className="font-bold text-[#0047AB]">{data.realEstate?.averagePriceM2 || "N/A"}</span></div>
                                <div><span className="block text-xs text-slate-500">{t.demographics.rent}</span><span className="font-medium text-slate-800 text-sm">{data.realEstate?.commercialRentTrend || "N/A"}</span></div>
                             </div>
                             <p className="text-xs text-slate-600 italic border-t border-slate-200 pt-2">"{data.realEstate?.neighborhoodVibe || "Analysis in progress..."}"</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" data-section="economy">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Factory className="w-5 h-5 text-[#0047AB]" /> {t.economy.title}
                        </h3>
                        <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">{t.economy.source}</span>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{t.economy.employers}</p>
                            {(data.economy?.topEmployers || []).map((emp, i) => (
                                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded border border-slate-100 mb-2">
                                    <div><div className="font-bold text-sm text-slate-800">{emp.name}</div><div className="text-xs text-slate-500">{emp.sector}</div></div>
                                    <div className="text-xs font-bold text-[#0047AB] bg-white px-2 py-1 rounded">{emp.workforce}</div>
                                </div>
                            ))}
                        </div>
                        <div className="col-span-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                            <div className="text-xs font-bold text-blue-700 uppercase mb-2">{t.economy.dynamics}</div>
                            <p className="text-sm text-slate-700 leading-snug">{data.economy?.businessDensity || "Analysis in progress..."}</p>
                        </div>
                         <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{t.economy.sectors}</p>
                            <div className="flex flex-wrap gap-2">
                                {(data.economy?.growthSectors || []).map((sec, i) => (<span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100">{sec}</span>))}
                            </div>
                        </div>
                        
                         {/* New Integrated Connectivity Grid */}
                         <div className="border-t border-slate-100 pt-4 mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase">{t.economy.accessibility}</p>
                                <span className="text-[10px] font-bold text-white bg-[#0047AB] px-2 py-0.5 rounded-full">{t.economy.score}: {data.transport?.connectivityScore || "N/A"}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                {/* Rail */}
                                <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Train className="w-4 h-4 text-[#0047AB]" />
                                        <span className="text-xs font-bold text-slate-800">{data.transport?.nearestStation || "Station"}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-snug">{data.transport?.railTraffic || "Normal traffic"}</p>
                                </div>
                                {/* Air */}
                                <div className="p-3 bg-sky-50/50 rounded-lg border border-sky-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Plane className="w-4 h-4 text-sky-600" />
                                        <span className="text-xs font-bold text-slate-800">{data.transport?.nearestAirport || "Airport"}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-snug">{data.transport?.airportConnectivity || "Standard connectivity"}</p>
                                </div>
                                {/* Road */}
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Car className="w-4 h-4 text-slate-500" />
                                        <span className="text-xs font-bold text-slate-800">{t.economy.road}</span>
                                    </div>
                                    <p className="text-xs text-slate-600 leading-snug"><span className="font-semibold">{data.transport?.roadInfrastructure || "Highways"}</span>. {data.transport?.trafficAnalysis}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TOURISME SECTION */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-12" data-section="tourism">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Calendar className="w-5 h-5 text-purple-600" /> {t.tourism.title}</h3>
                     <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">{t.tourism.source}</span>
                </div>
                
                {/* NOUVEAUX GRAPHIQUES INSEE */}
                <div className="space-y-8 mb-8">
                     {data.tourism?.inseeStats && data.tourism.inseeStats.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                 <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Globe2 className="w-4 h-4 text-purple-600"/> {t.tourism.origin}</h4>
                                 <NightsBreakdownChart data={data.tourism.inseeStats} />
                                 <p className="text-xs text-slate-400 mt-2 italic">{t.tourism.breakdown}</p>
                            </div>
                            <div>
                                 <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-green-600"/> {t.tourism.duration}</h4>
                                 <StayDurationChart data={data.tourism.inseeStats} />
                                 <p className="text-xs text-slate-400 mt-2 italic">{t.tourism.durationDesc}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Graphique 10 ans */}
                    {data.tourism?.annualStats && data.tourism.annualStats.length > 0 && (
                        <div>
                             <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><History className="w-4 h-4 text-[#0047AB]"/> {t.tourism.trend}</h4>
                             <TenYearTourismChart data={data.tourism.annualStats} />
                             <p className="text-xs text-slate-400 mt-2 italic">{t.tourism.trendDesc}</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 border-t border-slate-100 pt-6">
                    <div className="lg:col-span-1 space-y-4">
                        <p className="text-xs font-semibold text-slate-500 uppercase">{t.tourism.events}</p>
                        {(data.tourism?.localEvents || []).map((evt, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="bg-purple-200 text-purple-800 text-xs font-bold px-2 py-1 rounded uppercase">{evt.period}</div>
                                <div><div className="font-bold text-sm text-slate-900">{evt.name}</div><div className="text-xs text-purple-700 mt-1">Impact: {evt.impact}</div></div>
                            </div>
                        ))}
                         <div className="mt-4"><p className="text-xs font-semibold text-slate-500 uppercase mb-1">{t.tourism.attractions}</p><div className="flex flex-wrap gap-2">{(data.tourism?.mainAttractions || []).map((att, i) => (<span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">{att}</span>))}</div></div>
                    </div>
                    <div className="lg:col-span-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-4">{t.tourism.audience}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {(data.tourism?.targetAudience || []).map((persona, i) => (
                                <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-start mb-2"><div className="font-bold text-slate-900">{persona.type}</div><div className="text-lg font-extrabold text-[#00BFFF]">{persona.percentage}</div></div>
                                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mb-3"><div className="h-full bg-[#00BFFF]" style={{ width: persona.percentage }}></div></div>
                                    <p className="text-xs text-slate-500 leading-relaxed">{persona.motivation}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 bg-slate-50 rounded-xl"><div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-slate-500"/><span className="font-semibold text-sm">{t.tourism.seasonality}</span></div><p className="text-sm text-slate-700 italic">"{data.tourism?.seasonalityCurve || "Analysis in progress..."}"</p></div>
                    </div>
                </div>
            </div>

            {/* COMPETITION DÉTAILLÉE */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-12" data-section="competition">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><Target className="w-5 h-5 text-red-500" /> {t.competition.title}</h3>
                    <div className="space-y-6">
                        {(data.competitors || []).map((comp, i) => (
                            <div key={i} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="bg-white p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xl border border-slate-200">
                                            {comp.name?.charAt(0) || "H"}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-lg font-bold text-slate-900">{comp.name}</h4>
                                                <div className="flex">
                                                    {[...Array(comp.stars || 0)].map((_, idx) => (
                                                        <Star key={idx} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                                <span>{comp.distance}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className="font-medium text-slate-700">{comp.priceLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-bold border border-green-100 flex items-center gap-1">
                                            <Star className="w-3 h-3" /> {comp.rating}/5
                                        </div>
                                        {comp.webUrl && (
                                            <a 
                                                href={comp.webUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="px-3 py-1 bg-[#0047AB] text-white rounded-lg text-sm font-bold hover:bg-blue-800 transition-colors flex items-center gap-1 shadow-sm"
                                            >
                                                {t.competition.view} <ExternalLink className="w-3 h-3" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                                    
                                    {/* Capacité */}
                                    <div className="p-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.competition.capacity}</div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <BedDouble className="w-5 h-5 text-purple-600" />
                                            <span className="text-2xl font-extrabold text-slate-900">{comp.roomCount?.total || "N/A"}</span>
                                            <span className="text-xs text-slate-500">{t.competition.total}</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex justify-between text-xs">
                                                <span className="text-slate-600">{t.competition.std}</span>
                                                <span className="font-bold text-slate-900">{comp.roomCount?.standard || "-"}</span>
                                            </div>
                                            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                                <div className="bg-purple-500 h-full" style={{ width: `${(comp.roomCount?.standard / comp.roomCount?.total) * 100}%` }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs pt-1">
                                                <span className="text-slate-600">{t.competition.suite}</span>
                                                <span className="font-bold text-slate-900">{comp.roomCount?.suites || "-"}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Équipements */}
                                    <div className="p-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.competition.amenities}</div>
                                        <div className="flex flex-wrap gap-2">
                                            {comp.amenities && comp.amenities.map((item, idx) => (
                                                <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-600">
                                                    {item.toLowerCase().includes('pool') && <Waves className="w-3 h-3 text-blue-500"/>}
                                                    {item.toLowerCase().includes('wifi') && <Wifi className="w-3 h-3 text-slate-500"/>}
                                                    {item.toLowerCase().includes('parking') && <Car className="w-3 h-3 text-slate-500"/>}
                                                    {item.toLowerCase().includes('spa') && <Sparkles className="w-3 h-3 text-purple-500"/>}
                                                    {item.toLowerCase().includes('restaurant') && <Utensils className="w-3 h-3 text-orange-500"/>}
                                                    {item}
                                                </span>
                                            ))}
                                            {(!comp.amenities || comp.amenities.length === 0) && <span className="text-xs text-slate-400 italic">Not specified</span>}
                                        </div>
                                    </div>

                                    {/* Services */}
                                    <div className="p-4">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.competition.services}</div>
                                        <ul className="space-y-1">
                                            {comp.services && comp.services.map((srv, idx) => (
                                                <li key={idx} className="text-xs text-slate-600 flex items-start gap-1.5">
                                                    <Check className="w-3 h-3 text-green-500 mt-0.5 shrink-0" />
                                                    {srv}
                                                </li>
                                            ))}
                                            {(!comp.services || comp.services.length === 0) && <span className="text-xs text-slate-400 italic">Not specified</span>}
                                        </ul>
                                    </div>

                                    {/* SWOT Rapide */}
                                    <div className="p-4 bg-slate-50/50">
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.competition.positioning}</div>
                                        <div className="space-y-2">
                                            <div>
                                                <span className="text-[10px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded uppercase">{t.competition.strength}</span>
                                                <p className="text-xs text-slate-700 mt-1 leading-snug">{comp.strength}</p>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 rounded uppercase">{t.competition.weakness}</span>
                                                <p className="text-xs text-slate-700 mt-1 leading-snug">{comp.weakness}</p>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm" data-section="trends">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#0047AB]"/> {t.trends.title}</h3>
                    <MarketTrendChart historical={data.historicalData} forecast={data.forecastData} />
                    <div className="mt-4 p-4 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100"><p className="font-semibold text-slate-800 mb-2">{t.trends.analysis}</p>{data.marketTrends}</div>
                    
                    {data.seasonalityData && data.seasonalityData.length > 0 && (
                        <div className="mt-8 border-t border-slate-100 pt-8">
                            <h4 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wide">{t.trends.seasonality}</h4>
                            <SeasonalityChart data={data.seasonalityData} />
                            <p className="mt-2 text-xs text-slate-400 italic text-center">{t.trends.source}</p>
                        </div>
                    )}
            </div>

            {data.supply && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-12" data-section="supply">
                  <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><BedDouble className="w-5 h-5 text-[#D100D1]" /> {t.supply.title}</h3>
                      <span className="text-[10px] uppercase font-bold text-slate-400 border border-slate-200 px-2 py-1 rounded">{t.supply.source}</span>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-50 p-4 rounded-xl text-center"><div className="text-3xl font-extrabold text-[#0047AB]">{data.supply.totalHotels}</div><div className="text-xs font-bold text-slate-500 uppercase mt-1">{t.supply.hotels}</div></div>
                              <div className="bg-slate-50 p-4 rounded-xl text-center"><div className="text-3xl font-extrabold text-[#D100D1]">{data.supply.totalRooms}</div><div className="text-xs font-bold text-slate-500 uppercase mt-1">{t.supply.rooms}</div></div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-green-50 p-3 rounded-lg flex items-center gap-3"><Tent className="w-5 h-5 text-green-600" /><div><div className="font-bold text-slate-900">{data.supply.campings}</div><div className="text-[10px] text-slate-500 uppercase">{t.supply.campings}</div></div></div>
                              <div className="bg-orange-50 p-3 rounded-lg flex items-center gap-3"><Building2 className="w-5 h-5 text-orange-600" /><div><div className="font-bold text-slate-900">{data.supply.otherResidences}</div><div className="text-[10px] text-slate-500 uppercase">{t.supply.residences}</div></div></div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-xl text-sm border border-slate-100"><p className="font-semibold text-slate-800 mb-1">{t.supply.analysis}</p><p className="text-slate-600 italic leading-snug">"{data.supply.analysis}"</p></div>
                      </div>
                      <div className="lg:col-span-2">
                          <p className="text-xs font-semibold text-slate-500 uppercase mb-4 text-center">{t.supply.distribution}</p>
                          <SupplyDistributionChart distribution={data.supply.distribution} />
                      </div>
                  </div>
              </div>
            )}

            <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl mb-12" data-section="swot">
                <h3 className="text-xl font-bold mb-8 text-center">{t.swot.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-green-400 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> {t.swot.s}</h4>
                            <ul className="space-y-2">{(data.swot?.strengths || []).map((item, i) => (<li key={i} className="text-sm text-slate-300 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-green-400">{item}</li>))}</ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-red-400 mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {t.swot.w}</h4>
                            <ul className="space-y-2">{(data.swot?.weaknesses || []).map((item, i) => (<li key={i} className="text-sm text-slate-300 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-red-400">{item}</li>))}</ul>
                        </div>
                    </div>
                    <div className="space-y-6">
                         <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> {t.swot.o}</h4>
                            <ul className="space-y-2">{(data.swot?.opportunities || []).map((item, i) => (<li key={i} className="text-sm text-slate-300 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-blue-400">{item}</li>))}</ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-bold uppercase tracking-wider text-orange-400 mb-3 flex items-center gap-2"><Target className="w-4 h-4" /> {t.swot.t}</h4>
                            <ul className="space-y-2">{(data.swot?.threats || []).map((item, i) => (<li key={i} className="text-sm text-slate-300 pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-orange-400">{item}</li>))}</ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- NEW SECTION: BUSINESS PLAN --- */}
            <BusinessPlan marketData={data} />

             {data.groundingUrls && data.groundingUrls.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100" data-section="sources">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">{t.sources.verified}</h4>
                <div className="flex flex-wrap gap-2">
                  {data.groundingUrls.slice(0, 3).map((url, idx) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 underline truncate max-w-full hover:text-blue-800">{t.sources.link} {idx + 1} <ArrowRight className="inline w-2 h-2" /></a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Pricing />

      <footer className="text-center py-8 bg-slate-100 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Logo className="text-lg justify-center mb-2" />
          <p className="text-slate-500 text-sm">© {new Date().getFullYear()} HotelsBI Engine. All rights reserved.</p>
        </div>
      </footer>

      {showPdfModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isDownloadingPdf && setShowPdfModal(false)}></div>
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="text-lg font-bold text-slate-900">{t.pdf.title}</h3>
                 <button onClick={() => setShowPdfModal(false)} disabled={isDownloadingPdf} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="p-6 overflow-y-auto flex-1">
                 <p className="text-sm text-slate-500 mb-4">{t.pdf.desc}</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SECTIONS.map((section) => (
                       <div 
                         key={section.id} 
                         className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${pdfSections[section.id] ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200 hover:border-blue-200'}`}
                         onClick={() => !isDownloadingPdf && toggleSection(section.id)}
                       >
                          <div className={`shrink-0 ${pdfSections[section.id] ? 'text-[#0047AB]' : 'text-slate-400'}`}>
                             {pdfSections[section.id] ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                          </div>
                          <span className={`text-sm font-medium ${pdfSections[section.id] ? 'text-blue-900' : 'text-slate-600'}`}>{(t as any)[section.labelKey]?.title || section.labelKey}</span>
                       </div>
                    ))}
                 </div>
              </div>

              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                 <button 
                   onClick={() => setShowPdfModal(false)}
                   disabled={isDownloadingPdf}
                   className="px-4 py-2 text-slate-600 font-medium hover:text-slate-900 transition-colors disabled:opacity-50"
                 >
                   {t.pdf.cancel}
                 </button>
                 <button 
                   onClick={handleDownloadPdf}
                   disabled={isDownloadingPdf}
                   className="flex items-center gap-2 bg-[#0047AB] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 transition-all disabled:opacity-70 shadow-lg shadow-blue-500/20"
                 >
                   {isDownloadingPdf ? (
                     <><Loader2 className="w-4 h-4 animate-spin" /> {t.pdf.generating}</>
                   ) : (
                     <><Download className="w-4 h-4" /> {t.pdf.export}</>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default MarketAnalysisTool;
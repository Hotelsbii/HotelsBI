
import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const PricingCard: React.FC<{
  title: string;
  price: string;
  period?: string;
  features: string[];
  isPopular?: boolean;
  buttonText: string;
  popularLabel?: string;
}> = ({ title, price, period, features, isPopular, buttonText, popularLabel }) => (
  <div className={`relative p-8 bg-white rounded-2xl border ${isPopular ? 'border-[#00BFFF] shadow-xl shadow-blue-500/10' : 'border-slate-200 shadow-sm'} flex flex-col`}>
    {isPopular && (
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#0047AB] to-[#00BFFF] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
        {popularLabel}
      </div>
    )}
    <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
    <div className="flex items-end gap-1 mb-6">
      <span className="text-4xl font-extrabold text-slate-900">{price}</span>
      {period && <span className="text-slate-500 font-medium mb-1">{period}</span>}
    </div>
    
    <ul className="space-y-4 mb-8 flex-1">
      {features.map((feat, i) => (
        <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
          <CheckCircle2 className={`w-5 h-5 shrink-0 ${isPopular ? 'text-[#00BFFF]' : 'text-slate-400'}`} />
          {feat}
        </li>
      ))}
    </ul>
    
    <button className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
      isPopular 
        ? 'bg-[#0047AB] text-white hover:bg-blue-800 shadow-lg shadow-blue-500/20' 
        : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
    }`}>
      {buttonText}
    </button>
  </div>
);

export const Pricing: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="py-20 bg-slate-50" id="tarifs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">{t.pricing.title}</h2>
          <p className="text-slate-600 text-lg">{t.pricing.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingCard 
            title={t.pricing.freemium.title}
            price={t.pricing.freemium.price}
            features={[
              "1 Simplified study / month",
              "Basic demographic data",
              "Competitor Overview (Top 3)",
              "Limited PDF Export"
            ]}
            buttonText={t.pricing.freemium.btn}
          />
          <PricingCard 
            title={t.pricing.adhoc.title}
            price={t.pricing.adhoc.price}
            period={t.pricing.adhoc.period}
            features={[
              "Full Market Study",
              "SIRENE & INSEE API Data",
              "Seasonality Analysis (Melodi)",
              "Full & Customizable PDF Export",
              "Priority Support"
            ]}
            isPopular
            popularLabel={t.pricing.adhoc.popular}
            buttonText={t.pricing.adhoc.btn}
          />
          <PricingCard 
            title={t.pricing.enterprise.title}
            price={t.pricing.enterprise.price}
            period={t.pricing.enterprise.period}
            features={[
              "Unlimited Studies",
              "Full API Access",
              "Real-time Data",
              "Multi-user",
              "Dedicated Project Manager",
              "CRM Integration"
            ]}
            buttonText={t.pricing.enterprise.btn}
          />
        </div>
      </div>
    </div>
  );
};
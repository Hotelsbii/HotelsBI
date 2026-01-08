
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
  ComposedChart,
  Line
} from 'recharts';
import { ChartDataPoint, SupplyDistribution, MonthlyPerformance, TourismStats, AnnualTourismStats, HistoricalPopulation } from '../types';

export const MarketTrendChart: React.FC<{ historical: ChartDataPoint[]; forecast: ChartDataPoint[] }> = ({ historical }) => {
  // We only use historical data now, per strict requirements
  const data = [...historical];

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorRevPar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00BFFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#00BFFF" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          
          <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#0047AB', fontSize: 12 }} domain={[0, 100]} label={{ value: 'Occup. (%)', angle: -90, position: 'insideLeft', fill: '#0047AB', fontSize: 10 }} />
          
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#00BFFF', fontSize: 12 }} label={{ value: 'RevPAR (€)', angle: 90, position: 'insideRight', fill: '#00BFFF', fontSize: 10 }} />

          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            formatter={(value: any, name: any, props: any) => {
                if (name === "RevPAR") return [`${value} €`, name];
                if (name === "Occupancy Rate") return [`${value} %`, name];
                return [value, name];
            }}
            labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>

          <Bar yAxisId="right" dataKey="revpar" name="Historical RevPAR" fill="url(#colorRevPar)" barSize={40} radius={[4, 4, 0, 0]} />

          <Line yAxisId="left" type="monotone" dataKey="to" name="Occupancy Rate" stroke="#0047AB" strokeWidth={3} dot={{ r: 4, fill: "#0047AB", strokeWidth: 2, stroke: "#fff" }} />
          
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-[10px] text-slate-500 font-medium">
         Source: Internal Database - Data as of 01/08/2025 (YTD)
      </div>
    </div>
  );
};

export const SeasonalityChart: React.FC<{ data: MonthlyPerformance[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorTO" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0047AB" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#0047AB" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          
          <YAxis yAxisId="left" orientation="left" axisLine={false} tickLine={false} tick={{ fill: '#0047AB', fontSize: 12 }} domain={[0, 100]} label={{ value: 'Occup. (%)', angle: -90, position: 'insideLeft', fill: '#0047AB', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#D100D1', fontSize: 12 }} label={{ value: 'ADR (€)', angle: 90, position: 'insideRight', fill: '#D100D1', fontSize: 10 }} />

          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }}/>

          <Area yAxisId="left" type="monotone" dataKey="to" name="Monthly Avg (Occ %)" fill="url(#colorTO)" stroke="#0047AB" strokeWidth={2} />
          
          <Line yAxisId="right" type="monotone" dataKey="adr" name="Monthly Avg (ADR €)" stroke="#D100D1" strokeWidth={3} dot={{ r: 4, fill: "#D100D1", strokeWidth: 2, stroke: "#fff" }} />

        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-2 text-center text-[10px] text-slate-500 font-medium">
         Source: Observed seasonality profile over the last 12 rolling months
      </div>
    </div>
  );
};

export const NightsBreakdownChart: React.FC<{ data: TourismStats[] }> = ({ data }) => {
    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} label={{ value: 'Nights (thousands)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
            
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              formatter={(value: number, name: string, props: any) => {
                 const total = props.payload.nightsDomestic + props.payload.nightsInternational;
                 const percent = ((value / total) * 100).toFixed(0);
                 return [`${value} (${percent}%)`, name];
              }}
            />
            
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="nightsDomestic" name="Domestic Guests" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
            <Bar dataKey="nightsInternational" name="International Guests" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
};

export const TenYearTourismChart: React.FC<{ data: AnnualTourismStats[] }> = ({ data }) => {
    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 11 }} label={{ value: 'Total Nights (thousands)', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 10 }} />
            
            <Tooltip 
              cursor={{ fill: '#f1f5f9' }} 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
              formatter={(value: number, name: string, props: any) => {
                 const total = props.payload.total;
                 const percent = ((value / total) * 100).toFixed(0);
                 return [`${value.toLocaleString()} (${percent}%)`, name];
              }}
            />
            
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Bar dataKey="nightsDomestic" name="Domestic" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
            <Bar dataKey="nightsInternational" name="International" stackId="a" fill="#a855f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
};

export const StayDurationChart: React.FC<{ data: TourismStats[] }> = ({ data }) => {
    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
             <defs>
                <linearGradient id="colorStay" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                </linearGradient>
              </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#10b981', fontSize: 11 }} domain={['dataMin - 0.5', 'dataMax + 0.5']} label={{ value: 'Avg Days', angle: -90, position: 'insideLeft', fill: '#10b981', fontSize: 10 }} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            <Area type="monotone" dataKey="avgStayDuration" name="Avg Stay Duration" stroke="#10b981" strokeWidth={3} fill="url(#colorStay)" dot={{ r: 4, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
};

export const CompetitorChart: React.FC<{ competitors: any[] }> = ({ competitors }) => {
    const data = competitors.slice(0, 5).map(c => ({
        name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
        rating: c.rating,
        fullRating: c.rating
    }));

    return (
        <div className="w-full h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 5]} hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11, fill: '#475569'}} />
                    <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px' }} />
                    <Bar dataKey="rating" fill="#00BFFF" radius={[0, 4, 4, 0]} barSize={20} name="Guest Rating" />
                </BarChart>
             </ResponsiveContainer>
        </div>
    )
}

export const SupplyDistributionChart: React.FC<{ distribution: SupplyDistribution[] }> = ({ distribution }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={distribution}
          margin={{ top: 20, right: 20, bottom: 20, left: 0 }}
        >
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" orientation="left" stroke="#0047AB" axisLine={false} tickLine={false} label={{ value: 'Nb Hotels', angle: -90, position: 'insideLeft', fill: '#0047AB', fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" stroke="#D100D1" axisLine={false} tickLine={false} label={{ value: 'Capacity (Rooms)', angle: 90, position: 'insideRight', fill: '#D100D1', fontSize: 10 }} />
          <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar yAxisId="left" dataKey="hotels" name="Hotel Count" fill="#0047AB" barSize={30} radius={[4, 4, 0, 0]} />
          <Line yAxisId="right" type="monotone" dataKey="rooms" name="Room Count" stroke="#D100D1" strokeWidth={2} dot={{ r: 4 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export const PopulationGrowthChart: React.FC<{ data: HistoricalPopulation[] }> = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis domain={['auto', 'auto']} axisLine={false} tickLine={false} tick={{ fill: '#ef4444', fontSize: 11 }} label={{ value: 'Population', angle: -90, position: 'insideLeft', fill: '#ef4444', fontSize: 10 }} />
          <Tooltip 
             contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
             formatter={(value: number) => [value.toLocaleString(), "Inhabitants"]}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Area type="monotone" dataKey="population" name="Total Population" stroke="#ef4444" strokeWidth={3} fill="url(#colorPop)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
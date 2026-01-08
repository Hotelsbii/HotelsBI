
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { CatchmentZone } from '../types';
import { useLanguage } from './LanguageContext';

interface CatchmentMapProps {
  coordinates: [number, number]; // [longitude, latitude] form API Gouv
  zones: CatchmentZone[];
  viewMode: 'macro' | 'micro'; // Nouvelle prop pour gérer le mode d'affichage
}

export const CatchmentMap: React.FC<CatchmentMapProps> = ({ coordinates, zones, viewMode }) => {
  const { t, language } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // API Gouv returns [lon, lat], Leaflet expects [lat, lon]
    const center: [number, number] = [coordinates[1], coordinates[0]];

    // Initialize Map only once
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        center: center,
        zoom: viewMode === 'micro' ? 16 : 11, // Zoom par défaut un peu plus proche pour le mode macro
        scrollWheelZoom: false,
        zoomControl: false,
        attributionControl: false
      });

      // CartoDB Positron (Clean map style)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(mapInstance.current);

      // Add Zoom Control manually to top right
      L.control.zoom({
        position: 'topright'
      }).addTo(mapInstance.current);
    } 

    const map = mapInstance.current;

    // Update view based on mode
    if (viewMode === 'micro') {
      map.setView(center, 16);
    } else {
      map.setView(center, 11);
    }

    // Clear existing layers (except tiles)
    map.eachLayer((layer) => {
      if (layer instanceof L.Circle || layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icon for Hotel Location
    const icon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #0047AB; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker(center, { icon: icon }).addTo(map)
      .bindPopup("<b>Project Location</b>")
      .openPopup();

    if (viewMode === 'macro') {
        // --- MACRO MODE (Isochrones) ---
        // English keys matching the ones in geminiService.ts and types.ts
        const radii = {
          "Primary Zone": 2500,    // 2.5 km (0-15 min dense)
          "Secondary Zone": 8000,  // 8 km (15-30 min)
          "Tertiary Zone": 20000   // 20 km (30-60 min)
        };
    
        const colors = {
          "Primary Zone": "#ef4444", // Red - High Density
          "Secondary Zone": "#f97316", // Orange
          "Tertiary Zone": "#3b82f6" // Blue
        };
    
        // Draw Zones (Reverse order so smaller circles are on top)
        const reversedZones = [...zones].reverse();
    
        reversedZones.forEach((zone) => {
          const radius = radii[zone.type] || 2500;
          const color = colors[zone.type] || "#cbd5e1";
          
          const circle = L.circle(center, {
            color: color,
            fillColor: color,
            fillOpacity: zone.type === "Primary Zone" ? 0.15 : 0.08,
            weight: 2,
            dashArray: zone.type === "Tertiary Zone" ? "5, 10" : undefined,
            radius: radius
          }).addTo(map);
    
          const tooltipContent = `
            <div style="font-family: 'Inter', sans-serif; text-align: center; min-width: 130px;">
              <div style="font-weight: 800; text-transform: uppercase; font-size: 10px; color: ${color}; letter-spacing: 0.5px; margin-bottom: 2px;">${zone.type}</div>
              <div style="font-weight: 700; font-size: 14px; color: #1e293b;">${zone.population}</div>
              <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Density: <b>${zone.density}</b></div>
              <div style="font-size: 10px; color: ${zone.evolution?.includes('+') ? '#16a34a' : '#dc2626'}; font-weight:600;">Evolution: ${zone.evolution}</div>
            </div>
          `;
    
          circle.bindTooltip(tooltipContent, {
            permanent: false,
            direction: 'top',
            opacity: 0.95,
            className: 'custom-tooltip'
          });
        });

    } else {
        // --- MICRO MODE (Walking) ---
        // 5 min walk ~= 400m
        L.circle(center, {
            color: '#10b981', // Green
            fillColor: '#10b981',
            fillOpacity: 0.1,
            weight: 2,
            dashArray: '5, 10',
            radius: 400 
        }).addTo(map).bindTooltip("5 min walk (400m)", { permanent: true, direction: 'right', className: 'text-xs font-bold text-green-600 bg-transparent border-0 shadow-none' });

        // 1km radius
        L.circle(center, {
            color: '#64748b',
            fillColor: 'transparent',
            weight: 1,
            radius: 1000
        }).addTo(map).bindTooltip("1km Radius", { permanent: true, direction: 'bottom', className: 'text-xs text-slate-400 bg-transparent border-0 shadow-none' });
    }

  }, [coordinates, zones, viewMode]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100">
        <div ref={mapRef} className="w-full h-full z-0" style={{ minHeight: '300px' }} />
        
        {/* Legend Overlay - Fixed Positioning and Source Added */}
        <div className="absolute bottom-6 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border border-slate-200 z-[999] text-xs pointer-events-auto max-w-[220px]">
            {viewMode === 'macro' ? (
                <>
                    <div className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Isochrones Catchment (Car)</div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#ef4444] opacity-50 border border-[#ef4444] shrink-0"></div>
                        <span className="text-slate-600 font-medium">Primary Zone (0-15 min)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full bg-[#f97316] opacity-30 border border-[#f97316] shrink-0"></div>
                        <span className="text-slate-600 font-medium">Secondary Zone (15-30 min)</span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-3 h-3 rounded-full bg-[#3b82f6] opacity-20 border border-[#3b82f6] shrink-0"></div>
                        <span className="text-slate-600 font-medium">Tertiary Zone (30-60 min)</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100 leading-tight">
                        Source : INSEE API
                        <br/>
                        <span className="font-mono text-[9px]">DS_POPULATIONS_HISTORIQUES</span>
                    </div>
                </>
            ) : (
                <>
                    <div className="font-bold text-slate-800 mb-3 border-b border-slate-100 pb-2">Immediate Surroundings</div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-3 h-3 rounded-full border-2 border-[#10b981] bg-[#10b981]/10 shrink-0"></div>
                        <span className="text-slate-600 font-medium">Pedestrian Zone (5 min)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-slate-400 shrink-0"></div>
                        <span className="text-slate-600 font-medium">District (1 km)</span>
                    </div>
                </>
            )}
        </div>
    </div>
  );
};
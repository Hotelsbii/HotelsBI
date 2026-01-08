import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`font-extrabold text-2xl tracking-tighter select-none ${className}`}>
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] via-[#00BFFF] to-[#D100D1]">
        HOTELSBI
      </span>
    </div>
  );
};
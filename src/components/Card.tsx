import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick, hoverEffect = true }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        glass-panel ai-panel rounded-2xl p-6 relative overflow-hidden group
        ${hoverEffect ? 'hover:bg-slate-800/80 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Hover glow effect */}
      {hoverEffect && (
        <div className="absolute inset-0 bg-gradient-to-r from-ion-500/0 via-ion-500/10 to-emerald-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      )}
      {children}
    </div>
  );
};

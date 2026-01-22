import React from 'react';

type ProgressBarProps = {
  value: number;
};

export const ProgressBar: React.FC<ProgressBarProps> = ({ value }) => (
  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
    <div
      className="h-full bg-ion-500 transition-all"
      style={{ width: `${value}%` }}
    />
  </div>
);

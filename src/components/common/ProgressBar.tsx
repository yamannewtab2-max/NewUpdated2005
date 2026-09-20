import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  showLabel = false,
  label,
  className = '',
}) => {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const getBarColor = (val: number) => {
    if (val >= 100) return 'bg-emerald-500';
    if (val >= 60) return 'bg-indigo-600';
    if (val >= 25) return 'bg-amber-500';
    return 'bg-slate-400';
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
          <span className="text-slate-500">{label || 'Progress'}</span>
          <span className="text-slate-700 font-mono font-semibold">{safeProgress}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50 ${heightClasses[height]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${getBarColor(safeProgress)}`}
          style={{ width: `${safeProgress}%` }}
        />
      </div>
    </div>
  );
};

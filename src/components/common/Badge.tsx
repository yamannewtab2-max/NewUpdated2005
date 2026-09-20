import React from 'react';
import { PaymentStatus } from '../../types';

interface BadgeProps {
  status?: PaymentStatus | 'neutral' | 'indigo';
  children: React.ReactNode;
  size?: 'sm' | 'md';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status = 'neutral',
  children,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  const styles = {
    paid: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    partial: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    unpaid: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    neutral: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      dot: 'bg-slate-400',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      dot: 'bg-indigo-500',
    },
  };

  const current = styles[status] || styles.neutral;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs whitespace-nowrap ${current.bg} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};

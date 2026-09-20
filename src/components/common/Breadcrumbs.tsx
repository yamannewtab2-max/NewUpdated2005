import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { TrackingGroup } from '../../types';

interface BreadcrumbsProps {
  hierarchy: TrackingGroup[];
  onSelectGroup: (groupId: string | null) => void;
  rootLabel?: string;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  hierarchy,
  onSelectGroup,
  rootLabel = 'All Groups',
  className = '',
}) => {
  return (
    <nav className={`flex items-center flex-wrap gap-1.5 text-xs font-medium text-slate-500 ${className}`}>
      <button
        onClick={() => onSelectGroup(null)}
        className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100"
      >
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span>{rootLabel}</span>
      </button>

      {hierarchy.map((grp, index) => {
        const isLast = index === hierarchy.length - 1;
        return (
          <React.Fragment key={grp.id}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            {isLast ? (
              <span className="font-semibold text-slate-900 px-1 py-0.5 bg-slate-100/80 rounded-md">
                {grp.name}
              </span>
            ) : (
              <button
                onClick={() => onSelectGroup(grp.id)}
                className="hover:text-indigo-600 transition-colors p-1 rounded-md hover:bg-slate-100 truncate max-w-[140px]"
              >
                {grp.name}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

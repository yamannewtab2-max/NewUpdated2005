import React from 'react';
import { useApp } from '../../context/AppContext';
import { GroupStats } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import { TrendingUp, Users } from 'lucide-react';

interface GroupOverviewCardsProps {
  stats: GroupStats;
  groupName: string;
}

/** One money figure inside the summary card — always stays inside its column. */
const MoneyStat: React.FC<{ label: string; value: string; tone: 'slate' | 'emerald' | 'amber' }> = ({
  label,
  value,
  tone,
}) => {
  const valueTone =
    tone === 'emerald' ? 'text-emerald-700' : tone === 'amber' ? 'text-amber-700' : 'text-slate-900';

  return (
    <div className="min-w-0 px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 leading-tight break-words">
        {label}
      </div>
      <div
        className={`mt-1 text-[13px] sm:text-sm font-bold font-mono tabular-nums leading-tight break-words ${valueTone}`}
      >
        {value}
      </div>
    </div>
  );
};

export const GroupOverviewCards: React.FC<GroupOverviewCardsProps> = ({ stats, groupName }) => {
  const { t, formatMoney } = useApp();

  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Header: name + progress */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-1.5 min-w-0">
            <TrendingUp className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="truncate">{t.overview.groupOverview}</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate" dir="auto">
            {groupName}
          </p>
        </div>
        <span className="shrink-0 text-lg font-bold font-mono tabular-nums text-slate-900">
          {stats.progressPercentage}%
        </span>
      </div>

      <div className="px-4 py-3">
        <ProgressBar progress={stats.progressPercentage} height="sm" />
      </div>

      {/* Money: one row, three columns, dividers instead of heavy boxes */}
      <div className="grid grid-cols-3 divide-x divide-slate-100 border-t border-slate-100">
        <MoneyStat
          label={t.overview.expectedAmount}
          value={formatMoney(stats.totalExpected)}
          tone="slate"
        />
        <MoneyStat
          label={t.overview.amountCollected}
          value={formatMoney(stats.totalCollected)}
          tone="emerald"
        />
        <MoneyStat
          label={t.overview.remainingAmount}
          value={formatMoney(stats.remainingAmount)}
          tone="amber"
        />
      </div>

      {/* Status as light pills — one row instead of three boxes */}
      <div className="flex items-center gap-1.5 flex-wrap px-4 py-3 border-t border-slate-100">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {stats.paidCount} {t.overview.paidStudents}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          {stats.partialCount} {t.overview.partiallyPaid}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          {stats.unpaidCount} {t.overview.unpaidStudents}
        </span>
        <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
          <Users className="w-3 h-3" />
          {stats.totalStudents}
        </span>
      </div>
    </div>
  );
};

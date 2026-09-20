import React from 'react';
import { useApp } from '../../context/AppContext';
import { GroupStats } from '../../types';
import { ProgressBar } from '../common/ProgressBar';
import {
  Users,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface GroupOverviewCardsProps {
  stats: GroupStats;
  groupName: string;
}

export const GroupOverviewCards: React.FC<GroupOverviewCardsProps> = ({ stats, groupName }) => {
  const { t, formatMoney } = useApp();

  return (
    <div className="space-y-4">
      {/* Top Bar with Progress */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              {t.overview.groupOverview} — {groupName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {stats.paidCount} {t.overview.paidStudents.toLowerCase()} • {stats.partialCount}{' '}
              {t.overview.partiallyPaid.toLowerCase()} • {stats.unpaidCount}{' '}
              {t.overview.unpaidStudents.toLowerCase()}
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <span className="text-2xl font-bold font-mono tracking-tight text-slate-900">
              {stats.progressPercentage}%
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {t.overview.paymentProgress}
            </span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <ProgressBar progress={stats.progressPercentage} height="md" />
      </div>

      {/* 4 Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">{t.overview.totalStudents}</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {stats.totalStudents}
            </span>
            <span className="text-xs text-slate-400 ml-1.5">{t.dashboard.studentsLabel}</span>
          </div>
        </div>

        {/* Expected Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">{t.overview.expectedAmount}</span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {formatMoney(stats.totalExpected)}
            </span>
          </div>
        </div>

        {/* Amount Collected */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-emerald-600 font-semibold">
              {t.overview.amountCollected}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
              {formatMoney(stats.totalCollected)}
            </span>
          </div>
        </div>

        {/* Remaining Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium text-slate-500">{t.overview.remainingAmount}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
              {formatMoney(stats.remainingAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Student Status Trio Breakdown */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100/80">
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
            {t.overview.paidStudents}
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-emerald-800 mt-0.5">
            {stats.paidCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100/80">
          <p className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">
            {t.overview.partiallyPaid}
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-amber-900 mt-0.5">
            {stats.partialCount}
          </p>
        </div>

        <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100/80">
          <p className="text-[11px] font-semibold text-rose-700 uppercase tracking-wide">
            {t.overview.unpaidStudents}
          </p>
          <p className="text-lg sm:text-xl font-bold font-mono text-rose-800 mt-0.5">
            {stats.unpaidCount}
          </p>
        </div>
      </div>
    </div>
  );
};

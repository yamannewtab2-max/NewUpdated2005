import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../common/ProgressBar';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { GroupModal } from '../groups/GroupModal';
import {
  FolderTree,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Search,
  ChevronRight,
  Layers,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    t,
    groups,
    getGlobalStats,
    getGroupStats,
    setSelectedGroupId,
    setActiveView,
    formatMoney,
  } = useApp();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const globalStats = getGlobalStats();

  // Filter groups
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;
    const q = search.toLowerCase();
    return groups.filter((g) => g.name.toLowerCase().includes(q));
  }, [groups, search]);

  const handleOpenGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setActiveView('groups');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t.dashboard.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">{t.dashboard.subtitle}</p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {t.dashboard.createGroupBtn}
        </Button>
      </div>

      {/* Global Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Expected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">
              {t.dashboard.totalExpected}
            </span>
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {formatMoney(globalStats.totalExpected)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Across all active groups</p>
          </div>
        </div>

        {/* Total Collected */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-emerald-600">
              {t.dashboard.totalCollected}
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
              {formatMoney(globalStats.totalCollected)}
            </span>
            <p className="text-[11px] text-emerald-600/90 font-medium mt-1">
              {globalStats.overallProgress}% collected
            </p>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-amber-700">
              {t.dashboard.remainingAmount}
            </span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800">
              {formatMoney(globalStats.remainingAmount)}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">To be collected</p>
          </div>
        </div>

        {/* Total Students & Groups */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-indigo-600">
              {t.dashboard.totalStudents}
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
              {globalStats.totalStudents}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">
              in {globalStats.totalGroups} {t.dashboard.totalGroups.toLowerCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Global Collection Progress Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">{t.dashboard.overallProgress}</h3>
              <p className="text-xs text-slate-400">
                {formatMoney(globalStats.totalCollected)} collected of{' '}
                {formatMoney(globalStats.totalExpected)} expected
              </p>
            </div>
          </div>
          <span className="text-xl font-bold font-mono text-indigo-400">
            {globalStats.overallProgress}%
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${globalStats.overallProgress}%` }}
          />
        </div>
      </div>

      {/* Tracking Groups Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              {t.dashboard.allGroupsHeading}
            </h3>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredGroups.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.dashboard.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Groups Grid Cards */}
        {filteredGroups.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="w-6 h-6" />}
            title={t.dashboard.noGroupsFound}
            description={t.dashboard.noGroupsDesc}
            actionLabel={t.dashboard.createGroupBtn}
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((grp) => {
              const stats = getGroupStats(grp.id, true);
              const isSubgroup = grp.parentId !== null;
              const parent = isSubgroup ? groups.find((p) => p.id === grp.parentId) : null;

              return (
                <div
                  key={grp.id}
                  onClick={() => handleOpenGroup(grp.id)}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-150 cursor-pointer flex flex-col justify-between group text-left"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                        {isSubgroup ? (
                          <FolderTree className="w-4 h-4" />
                        ) : (
                          <Layers className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                            {grp.name}
                          </h4>
                        </div>
                        {parent && (
                          <span className="text-[10px] text-slate-400 block truncate">
                            under {parent.name}
                          </span>
                        )}
                        <p className="text-xs text-slate-500 font-mono mt-0.5">
                          {stats.totalStudents} {t.dashboard.studentsLabel} • Rate:{' '}
                          {formatMoney(grp.paymentAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="p-1 rounded-lg text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Financial Details: Expected, Collected, Remaining */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50">
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {t.dashboard.expected}
                        </span>
                        <span className="font-mono font-bold text-slate-800 text-[11px] sm:text-xs">
                          {formatMoney(stats.totalExpected)}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-emerald-50/60">
                        <span className="text-[10px] text-emerald-700 font-semibold block">
                          {t.dashboard.collected}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 text-[11px] sm:text-xs">
                          {formatMoney(stats.totalCollected)}
                        </span>
                      </div>

                      <div className="p-2 rounded-lg bg-amber-50/60">
                        <span className="text-[10px] text-amber-800 font-semibold block">
                          {t.dashboard.remaining}
                        </span>
                        <span className="font-mono font-bold text-amber-900 text-[11px] sm:text-xs">
                          {formatMoney(stats.remainingAmount)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Status Tags */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[11px] text-slate-500">
                          {stats.paidCount} {t.dashboard.paid.toLowerCase()} • {stats.partialCount}{' '}
                          {t.dashboard.partial.toLowerCase()} • {stats.unpaidCount}{' '}
                          {t.dashboard.unpaid.toLowerCase()}
                        </span>
                        <span className="font-mono font-bold text-slate-700 text-xs">
                          {stats.progressPercentage}%
                        </span>
                      </div>
                      <ProgressBar progress={stats.progressPercentage} height="sm" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isCreateModalOpen && (
        <GroupModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      )}
    </div>
  );
};

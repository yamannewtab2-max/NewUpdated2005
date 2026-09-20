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
  CalendarDays,
  TriangleAlert,
  Wallet,
} from 'lucide-react';
import { currentMonthKey, daysLeftInMonth, monthKeyOf, monthLabel, nextResetDate } from '../../utils/months';
import { summarizeMonth } from '../../utils/monthlyPayments';

export const DashboardView: React.FC = () => {
  const {
    t,
    language,
    groups,
    students,
    monthlyPayments,
    paymentEntries,
    getGlobalStats,
    getGroupStats,
    setSelectedGroupId,
    setActiveView,
    formatMoney,
  } = useApp();

  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const globalStats = getGlobalStats();

  // Current-month payment status (rolls over automatically on the 1st)
  const monthStats = useMemo(
    () => summarizeMonth(students, monthlyPayments),
    [students, monthlyPayments]
  );
  const currentKey = currentMonthKey();
  const daysLeft = daysLeftInMonth(currentKey);
  const resetLabel = new Date(nextResetDate()).toLocaleDateString(
    language === 'id' ? 'id-ID' : 'en-GB',
    { day: 'numeric', month: 'short', year: 'numeric' }
  );

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

      {/* Overview + This Month — two compact cards (was four tiles + a banner + four sub-tiles) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Overall collection */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {t.dashboard.overallProgress}
              </h3>
              <p className="text-[11px] text-slate-500 font-mono tabular-nums truncate">
                {formatMoney(globalStats.totalCollected)} / {formatMoney(globalStats.totalExpected)}
              </p>
            </div>
            <span className="shrink-0 text-xl font-bold font-mono tabular-nums text-slate-900">
              {globalStats.overallProgress}%
            </span>
          </div>

          <div className="mt-3">
            <ProgressBar progress={globalStats.overallProgress} height="md" />
          </div>

          <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px] min-w-0">
            <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100 min-w-0">
              <Clock className="w-3 h-3 shrink-0" />
              <span className="truncate">{formatMoney(globalStats.remainingAmount)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              <Users className="w-3 h-3" />
              {globalStats.totalStudents}
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
              <Layers className="w-3 h-3" />
              {globalStats.totalGroups}
            </span>
          </div>
        </div>

        {/* This month */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs min-w-0 overflow-hidden">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {t.dashboard.thisMonthTitle} · {monthLabel(currentKey, language)}
              </h3>
              <p className="text-[11px] text-slate-500 truncate">
                {t.dashboard.dayCounterLabel
                  .replace('{day}', String(monthStats.dayOfMonth))
                  .replace('{total}', String(monthStats.daysInMonth))}
                {' · '}
                {daysLeft > 0
                  ? t.dashboard.daysLeftLabel.replace('{days}', String(daysLeft))
                  : t.dashboard.monthEndedLabel}
              </p>
            </div>
            <span className="shrink-0 text-xl font-bold font-mono tabular-nums text-slate-900">
              {monthStats.paidCount}
              <span className="text-slate-400 text-sm">/{monthStats.totalStudents}</span>
            </span>
          </div>

          <div className="mt-3">
            <ProgressBar progress={monthStats.percentPaid} height="md" />
          </div>

          <div className="mt-3 flex items-center gap-1.5 flex-wrap text-[11px] min-w-0">
            <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-0">
              <Wallet className="w-3 h-3 shrink-0" />
              <span className="truncate font-mono tabular-nums">{formatMoney(monthStats.collected)}</span>
            </span>
            {monthStats.unpaidCount > 0 && (
              <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                <TriangleAlert className="w-3 h-3" />
                {monthStats.unpaidCount} {t.dashboard.unpaid.toLowerCase()}
              </span>
            )}
            {monthStats.partialCount > 0 && (
              <span className="inline-flex items-center gap-1.5 font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {monthStats.partialCount} {t.dashboard.partial.toLowerCase()}
              </span>
            )}
            <span className="ml-auto text-slate-400 shrink-0">
              {t.dashboard.nextResetLabel.replace('{date}', resetLabel)}
            </span>
          </div>
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
              // Lists without students are payment logs: show this month's payments.
              const isPaymentOnly = (grp.studentIds || []).length === 0;
              const monthEntries = isPaymentOnly
                ? paymentEntries.filter((e) => {
                    if (e.groupId !== grp.id) return false;
                    try {
                      return monthKeyOf(new Date(e.createdAt)) === currentKey;
                    } catch {
                      return false;
                    }
                  })
                : [];
              const monthTotal = monthEntries.reduce((sum, e) => sum + e.amount, 0);

              return (
                <div
                  key={grp.id}
                  onClick={() => handleOpenGroup(grp.id)}
                  className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-150 cursor-pointer group text-left min-w-0 overflow-hidden flex flex-col gap-3"
                >
                  {/* Name + progress percentage */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                      {isSubgroup ? <FolderTree className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        dir="auto"
                        className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate"
                      >
                        {grp.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {isPaymentOnly
                          ? `${monthLabel(currentKey, language)} · ${monthEntries.length} ${t.groups.recordedPayments.toLowerCase()}`
                          : `${stats.totalStudents} ${t.dashboard.studentsLabel}${
                              grp.paymentAmount > 0 ? ` · ${formatMoney(grp.paymentAmount)}` : ''
                            }${parent ? ` · ${parent.name}` : ''}`}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 font-bold font-mono tabular-nums ${
                        isPaymentOnly ? 'text-sm text-emerald-700' : 'text-sm text-slate-900'
                      }`}
                    >
                      {isPaymentOnly ? formatMoney(monthTotal) : `${stats.progressPercentage}%`}
                    </span>
                  </div>

                  {!isPaymentOnly && (
                    <>
                      <ProgressBar progress={stats.progressPercentage} height="sm" />

                      <div className="flex items-center justify-between gap-2 text-[11px] min-w-0">
                        <span className="min-w-0 truncate font-mono tabular-nums">
                          <span className="font-bold text-emerald-700">
                            {formatMoney(stats.totalCollected)}
                          </span>
                          <span className="text-slate-400"> / {formatMoney(stats.totalExpected)}</span>
                        </span>
                        {stats.unpaidCount > 0 && (
                          <span className="shrink-0 inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {stats.unpaidCount} {t.dashboard.unpaid.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
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

import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { currentMonthKey, monthLabel, shiftMonth } from '../../utils/months';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { StudentProfileModal } from '../students/StudentProfileModal';
import { CalendarDays, CheckCircle2, ChevronDown, XCircle } from 'lucide-react';

type OpenList = 'paid' | 'unpaid' | null;

/**
 * Month view: pick a tracking group, then a month, and see the two answers the
 * owner actually asks for — who paid and who did not — as two big buttons.
 *
 * Months always run from the current month backwards (a year, further if the
 * group has older records), so an old month can be reopened and settled late.
 * Each month is answered from its own dated monthly record — a month nobody paid
 * in reads 0 rather than repeating the current month's names. The one exception
 * is the current month, where a tracking list marked paid still counts, because
 * that flag carries no date and means "paid now".
 *
 * The check button on a row marks *that month* paid, which is what makes the
 * counts real per month.
 */
export const CalendarView: React.FC = () => {
  const { t, language, groups, students, payments, monthlyPayments, getGroup, getSubgroups, setActiveView, markMonthPaid, clearMonthlyPayment } = useApp();

  const [groupId, setGroupId] = useState<string>('');
  const [month, setMonth] = useState<string>(currentMonthKey());
  const [openList, setOpenList] = useState<OpenList>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [undoTarget, setUndoTarget] = useState<Student | null>(null);

  /** Every tracking group, flattened with its depth for indentation. */
  const groupOptions = useMemo(() => {
    const out: { id: string; name: string; depth: number }[] = [];
    const walk = (parentId: string | null, depth: number) => {
      getSubgroups(parentId).forEach((g) => {
        out.push({ id: g.id, name: g.name, depth });
        walk(g.id, depth + 1);
      });
    };
    walk(null, 0);
    return out;
  }, [groups, getSubgroups]);

  const group = groupId ? getGroup(groupId) : undefined;

  /** The group plus every nested group under it. */
  const groupIds = useMemo(() => {
    if (!groupId) return [] as string[];
    const ids: string[] = [];
    const walk = (id: string) => {
      ids.push(id);
      getSubgroups(id).forEach((g) => walk(g.id));
    };
    walk(groupId);
    return ids;
  }, [groupId, groups, getSubgroups]);

  const roster = useMemo(() => {
    if (groupIds.length === 0) return [] as Student[];
    const ids = new Set<string>();
    groupIds.forEach((id) => (getGroup(id)?.studentIds || []).forEach((sid) => ids.add(sid)));
    return students.filter((s) => ids.has(s.id));
  }, [groupIds, groups, students]);

  /**
   * Current month first, then back through the last twelve months — and further
   * back if the group has older records, so past months can always be reopened
   * without ever inventing months the list has no history for.
   */
  const months = useMemo(() => {
    const today = currentMonthKey();
    const rosterIds = new Set(roster.map((s) => s.id));
    const recorded = monthlyPayments
      .filter((p) => rosterIds.has(p.studentId) && p.month)
      .map((p) => p.month)
      .sort();
    const windowStart = shiftMonth(today, -11);
    const start = recorded.length > 0 && recorded[0] < windowStart ? recorded[0] : windowStart;
    const list: string[] = [];
    for (let m = start; m <= today; m = shiftMonth(m, 1)) list.push(m);
    return list.reverse();
  }, [roster, monthlyPayments]);

  /**
   * Every month is answered from its own dated record, so a month nobody paid in
   * shows 0 — never the current month's names repeated backwards.
   * The only exception is the current month, where a tracking list marked paid
   * still counts (that list flag carries no date, and it means "paid now").
   */
  const { paid, unpaid } = useMemo(() => {
    const paidStudents: Student[] = [];
    const unpaidStudents: Student[] = [];
    const isCurrent = month === currentMonthKey();
    const monthRecord = new Map(
      monthlyPayments.filter((p) => p.month === month).map((p) => [p.studentId, p]),
    );
    const paidInLists = isCurrent
      ? new Set(
          payments
            .filter((r) => groupIds.includes(r.groupId) && r.status === 'paid')
            .map((r) => r.studentId),
        )
      : new Set<string>();

    roster.forEach((s) => {
      const record = monthRecord.get(s.id);
      const isPaid = record?.status === 'paid' || paidInLists.has(s.id);
      (isPaid ? paidStudents : unpaidStudents).push(s);
    });
    return { paid: paidStudents, unpaid: unpaidStudents };
  }, [roster, month, payments, monthlyPayments, groupIds]);

  const listToShow = openList === 'paid' ? paid : openList === 'unpaid' ? unpaid : [];
  const emptyMessage =
    openList === 'paid'
      ? paid.length === 0
        ? t.calendar.nonePaid
        : null
      : unpaid.length === 0
        ? t.calendar.allPaid
        : null;

  if (groupOptions.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeading title={t.calendar.title} subtitle={t.calendar.subtitle} />
        <EmptyState
          icon={<CalendarDays className="w-6 h-6" />}
          title={t.calendar.noGroups}
          description={t.calendar.noGroupsDesc}
          actionLabel={t.nav.trackingGroups}
          onAction={() => setActiveView('groups')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeading title={t.calendar.title} subtitle={t.calendar.subtitle} />

      {/* 1 — which tracking group */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
        <label htmlFor="calendar-group" className="text-xs font-bold text-slate-500 uppercase tracking-wide">
          {t.calendar.selectGroup}
        </label>
        <div className="relative">
          <select
            id="calendar-group"
            value={groupId}
            onChange={(e) => {
              setGroupId(e.target.value);
              setOpenList(null);
              setMonth(currentMonthKey());
            }}
            className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
          >
            <option value="">{t.calendar.chooseGroup}</option>
            {groupOptions.map((g) => (
              <option key={g.id} value={g.id}>
                {`${'\u00A0\u00A0'.repeat(g.depth)}${g.name}`}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {!group ? (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-sm text-slate-500">
          {t.calendar.chooseGroupPrompt}
        </div>
      ) : (
        <>
          {/* 2 — which month (this month first) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t.calendar.month}</span>
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              {months.map((m) => {
                const active = m === month;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setMonth(m);
                      setOpenList(null);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                      active
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {monthLabel(m, language)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3 — the two questions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setOpenList(openList === 'paid' ? null : 'paid')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                openList === 'paid'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-emerald-200 bg-white hover:border-emerald-400'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div className="mt-2 text-sm font-bold text-emerald-800">{t.calendar.paid}</div>
              <div className="text-2xl font-bold text-emerald-700 leading-none">{paid.length}</div>
            </button>

            <button
              type="button"
              onClick={() => setOpenList(openList === 'unpaid' ? null : 'unpaid')}
              className={`p-4 rounded-2xl border-2 text-left transition-all ${
                openList === 'unpaid'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-rose-200 bg-white hover:border-rose-400'
              }`}
            >
              <XCircle className="w-5 h-5 text-rose-600" />
              <div className="mt-2 text-sm font-bold text-rose-800">{t.calendar.notPaid}</div>
              <div className="text-2xl font-bold text-rose-700 leading-none">{unpaid.length}</div>
            </button>
          </div>

          {/* 4 — the names behind the pressed button */}
          {openList && (
            <div className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2">
                <span className="text-sm font-bold text-slate-800">
                  {openList === 'paid' ? t.calendar.paid : t.calendar.notPaid}
                </span>
                <span className="text-xs text-slate-500">
                  {`${monthLabel(month, language)} · ${t.calendar.studentsCount.replace('{count}', String(listToShow.length))}`}
                </span>
              </div>

              {roster.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">{t.calendar.noStudents}</div>
              ) : listToShow.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">{emptyMessage}</div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {listToShow.map((student) => {
                    const isPaid = openList === 'paid';
                    return (
                      <li key={student.id} className="flex items-center gap-2 pl-4 pr-3 py-2.5">
                        <button
                          type="button"
                          onClick={() => setProfileStudent(student)}
                          className="flex-1 min-w-0 text-right"
                          dir="auto"
                        >
                          <span className="block truncate text-sm font-semibold text-slate-800">{student.name}</span>
                        </button>
                        <WhatsAppButton student={student} size="sm" />
                        {/* Records the payment against the month on screen, so a
                            payment made late for an old month lands on that month. */}
                        <button
                          type="button"
                          title={isPaid ? t.groups.markUnpaidConfirm : t.students.markPaidBtn}
                          aria-label={isPaid ? t.groups.markUnpaidConfirm : t.students.markPaidBtn}
                          onClick={() => (isPaid ? setUndoTarget(student) : markMonthPaid(student.id, month))}
                          className={`shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${
                            isPaid
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'bg-white border-slate-300 text-slate-400 hover:border-emerald-400 hover:text-emerald-600'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </>
      )}

      <StudentProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />

      <ConfirmDialog
        isOpen={undoTarget !== null}
        onClose={() => setUndoTarget(null)}
        onConfirm={() => {
          if (undoTarget) clearMonthlyPayment(undoTarget.id, month);
          setUndoTarget(null);
        }}
        title={t.groups.markUnpaidTitle}
        message={t.groups.markUnpaidMessage.replace('{name}', undoTarget?.name ?? '')}
        confirmText={t.groups.markUnpaidConfirm}
        variant="danger"
      />
    </div>
  );
};

const PageHeading: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div>
    <h1 className="text-xl font-bold text-slate-900">{title}</h1>
    <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
  </div>
);

import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { currentMonthKey, monthLabel } from '../../utils/months';
import { summarizeMonth } from '../../utils/monthlyPayments';
import { CalendarDays, Users, CheckCircle2, Clock, Wallet, ArrowLeft } from 'lucide-react';

interface MahjaProfileModalProps {
  mahjaId: string | null;
  onClose: () => void;
}

/** Compact Mahja summary: this month's collection for the whole Mahja, nothing else. */
export const MahjaProfileModal: React.FC<MahjaProfileModalProps> = ({ mahjaId, onClose }) => {
  const { t, language, mahjas, students, monthlyPayments, formatMoney } = useApp();

  const mahja = mahjas.find((m) => m.id === mahjaId) || null;
  const [listTab, setListTab] = useState<'paid' | 'unpaid' | null>(null);

  const data = useMemo(() => {
    if (!mahja) return null;
    const mahjaStudents = students.filter((s) => s.mahjaId === mahja.id);
    const month = summarizeMonth(mahjaStudents, monthlyPayments);

    // Per-student state for the current month, so the lists can show who is who.
    const rows = mahjaStudents.map((s) => {
      const record = monthlyPayments.find(
        (r) => r.studentId === s.id && r.month === month.month
      );
      return { student: s, status: record?.status ?? 'unpaid', amount: record?.amountPaid ?? 0 };
    });

    return {
      month,
      rows,
      paidRows: rows.filter((r) => r.status === 'paid'),
      unpaidRows: rows.filter((r) => r.status !== 'paid'),
    };
  }, [mahja, students, monthlyPayments]);

  if (!mahja || !data) return null;

  const currentKey = currentMonthKey();
  const { month } = data;
  const allPaid = month.totalStudents > 0 && month.unpaidCount === 0;

  return (
    <Modal isOpen={true} onClose={onClose} title={mahja.name} maxWidth="lg">
      <div className="space-y-4">
        {listTab ? (
          /* ---- Who paid / who didn't, inside this same popup ---- */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setListTab(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.groups.wizardBack}
              </button>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setListTab('paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    listTab === 'paid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.students.paidThisMonthLabel} ({data.paidRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setListTab('unpaid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    listTab === 'unpaid' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.students.notPaidThisMonthLabel} ({data.unpaidRows.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <CalendarDays className="w-3.5 h-3.5" />
              <span className="font-semibold">{monthLabel(currentKey, language)}</span>
            </div>

            {(() => {
              const list = listTab === 'paid' ? data.paidRows : data.unpaidRows;
              if (list.length === 0) {
                return (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    {listTab === 'paid' ? t.students.noPaymentsYet : t.students.noMissedMonths}
                  </p>
                );
              }
              return (
                <div className="space-y-1.5 max-h-[52vh] overflow-y-auto pr-1">
                  {list.map(({ student, status, amount }) => (
                    <div
                      key={student.id}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 min-w-0 ${
                        status === 'paid'
                          ? 'border-emerald-200 bg-emerald-50/40'
                          : status === 'partial'
                          ? 'border-amber-200 bg-amber-50/40'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          status === 'paid'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : status === 'partial'
                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        {status === 'paid' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {status === 'paid'
                          ? t.students.paidBadge
                          : status === 'partial'
                          ? t.students.partialBadge
                          : t.students.unpaidBadge}
                      </span>
                      {amount > 0 && (
                        <span className="shrink-0 text-[11px] font-mono tabular-nums text-slate-500">
                          {formatMoney(amount)}
                        </span>
                      )}
                      <span className="flex-1" />
                      <span
                        dir="auto"
                        className="text-sm font-semibold text-slate-900 truncate max-w-[55%] text-right"
                      >
                        {student.name}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <>
        {/* Name + this month's progress for the Mahja */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="min-w-0 flex-1">
            {mahja.description && (
              <p dir="auto" className="text-xs text-slate-500 break-words">
                {mahja.description}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
              <CalendarDays className="w-3.5 h-3.5 shrink-0" />
              <span className={allPaid ? 'text-emerald-700 font-semibold' : 'text-amber-800 font-semibold'}>
                {monthLabel(currentKey, language)}
              </span>
              <span className="text-slate-300">·</span>
              <span className="font-mono tabular-nums">
                {month.paidCount}/{month.totalStudents} {t.dashboard.studentsPaidLabel}
              </span>
            </div>
          </div>
          <span
            className={`shrink-0 text-lg font-bold font-mono tabular-nums ${
              allPaid ? 'text-emerald-700' : 'text-slate-900'
            }`}
          >
            {month.percentPaid}%
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              allPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-emerald-400'
            }`}
            style={{ width: `${month.percentPaid}%` }}
          />
        </div>

        {/* The only numbers that matter */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="min-w-0 px-3 py-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {t.students.studentsLabel}
            </div>
            <div className="mt-0.5 text-sm font-bold text-slate-900 tabular-nums">
              {month.totalStudents}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setListTab('paid')}
            className="min-w-0 px-3 py-2.5 text-start hover:bg-emerald-50/50 transition-colors cursor-pointer"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {t.students.paidThisMonthLabel}
            </div>
            <div className="mt-0.5 text-sm font-bold text-emerald-700 tabular-nums">
              {month.paidCount}
            </div>
          </button>
          <button
            type="button"
            onClick={() => setListTab('unpaid')}
            className="min-w-0 px-3 py-2.5 text-start hover:bg-amber-50/50 transition-colors cursor-pointer"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-600" />
              {t.students.notPaidThisMonthLabel}
            </div>
            <div
              className={`mt-0.5 text-sm font-bold tabular-nums ${
                month.unpaidCount > 0 ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {month.unpaidCount}
            </div>
          </button>
        </div>

        {/* Collected */}
        <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2.5 min-w-0">
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 shrink-0">
            <Wallet className="w-3.5 h-3.5" />
            {t.dashboard.collectedThisMonthLabel}
          </span>
          <span className="text-sm font-bold font-mono tabular-nums text-emerald-800 truncate">
            {formatMoney(month.collected)}
          </span>
        </div>

          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

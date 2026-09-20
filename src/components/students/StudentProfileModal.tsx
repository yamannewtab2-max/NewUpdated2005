import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { levelBadgeColor, levelNumber } from '../../utils/level';
import { currentMonthKey, monthLabel, daysLeftInMonth, nextResetDate } from '../../utils/months';
import { summarizeStudentMonths, isMissedMonth, MonthRow, MonthRowStatus } from '../../utils/monthlyPayments';
import {
  Building2,
  DoorOpen,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
  Wallet,
  TrendingUp,
  TriangleAlert,
  ArrowLeft,
  Edit2,
  UserX,
  Trash2,
} from 'lucide-react';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { displayPhone } from '../../utils/whatsapp';

interface StudentProfileModalProps {
  student: Student | null;
  onClose: () => void;
  /** Optional actions (the Student Manager lists are name-only now). */
  onEdit?: (student: Student) => void;
  onRemoveFromRoom?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const statusBadgeClass: Record<MonthRowStatus, string> = {
  paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  partial: 'bg-amber-50 text-amber-800 border-amber-200',
  unpaid: 'bg-rose-50 text-rose-700 border-rose-200',
};

const formatDate = (iso: string | undefined, lang: 'en' | 'id'): string => {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
};

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  student,
  onClose,
  onEdit,
  onRemoveFromRoom,
  onDelete,
}) => {
  const {
    t,
    language,
    formatMoney,
    mahjas,
    rooms,
    getStudentGroups,
    monthlyPayments,
    suggestedMonthlyDue,
    setStudentMonthlyDue,
    recordMonthlyPayment,
    markMonthPaid,
    clearMonthlyPayment,
  } = useApp();

  const [dueInput, setDueInput] = useState('');
  const [breakdownTab, setBreakdownTab] = useState<'paid' | 'missed' | null>(null);
  const [amountInputs, setAmountInputs] = useState<Record<string, string>>({});

  const studentId = student?.id ?? '';
  const suggestedDue = studentId ? suggestedMonthlyDue(studentId) : 0;

  useEffect(() => {
    setDueInput(suggestedDue ? String(suggestedDue) : '');
    setAmountInputs({});
  }, [studentId, suggestedDue]);

  const summary = useMemo(() => {
    if (!student) return null;
    return summarizeStudentMonths(student, monthlyPayments);
  }, [student, monthlyPayments]);

  if (!student || !summary) return null;

  const mahja = mahjas.find((m) => m.id === student.mahjaId);
  const room = rooms.find((r) => r.id === student.roomId);
  const groups = getStudentGroups(student.id);
  const currentKey = currentMonthKey();
  const rows = summary.rows; // already newest-first from the util
  const monthRows = summary.rows;
  const resetDate = formatDate(nextResetDate().toISOString(), language);
  const currentRow = summary.currentMonth;
  const currentLabel = monthLabel(currentKey, language);

  const saveDue = () => {
    const value = Math.max(0, Number(dueInput) || 0);
    setStudentMonthlyDue(student.id, value);
  };

  // The due only changes when Confirm is pressed.
  const dueDirty = (Number(dueInput) || 0) !== suggestedDue;

  const recordRow = (row: MonthRow) => {
    const typed = Number(amountInputs[row.month]);
    const amount = typed > 0 ? typed : row.amountDue || suggestedDue;
    // No amount configured anywhere? Still mark the month paid.
    if (amount > 0) recordMonthlyPayment(student.id, row.month, amount);
    else markMonthPaid(student.id, row.month);
    setAmountInputs((prev) => ({ ...prev, [row.month]: '' }));
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={t.students.profileTitle} maxWidth="2xl">
      <div className="space-y-5">
        {breakdownTab ? (
          /* ---- Paid / missed months, shown inside this same popup ---- */
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setBreakdownTab(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {t.groups.wizardBack}
              </button>

              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setBreakdownTab('paid')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    breakdownTab === 'paid' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.students.monthsPaidLabel} ({summary.paidCount})
                </button>
                <button
                  type="button"
                  onClick={() => setBreakdownTab('missed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    breakdownTab === 'missed' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.students.monthsMissedLabel} ({summary.missedMonths.length})
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-bold text-slate-900 break-words" dir="auto">
                {student.name}
              </span>
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                {levelNumber(student.level)}
              </span>
            </div>

            {(() => {
              const rows =
                breakdownTab === 'paid'
                  ? monthRows.filter((r) => r.status === 'paid')
                  : monthRows.filter((r) => isMissedMonth(r, currentKey));

              if (rows.length === 0) {
                return (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    {breakdownTab === 'paid' ? t.students.noPaymentsYet : t.students.noMissedMonths}
                  </p>
                );
              }

              return (
                <div className="space-y-1.5">
                  {rows.map((row) => (
                    <div
                      key={row.month}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                        breakdownTab === 'missed'
                          ? 'border-rose-200 bg-rose-50/40'
                          : 'border-emerald-200 bg-emerald-50/30'
                      }`}
                    >
                      <span
                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          statusBadgeClass[row.status]
                        }`}
                      >
                        {breakdownTab === 'missed' ? (
                          <TriangleAlert className="w-3 h-3" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3" />
                        )}
                        {breakdownTab === 'missed' ? t.students.missedBadge : t.students.paidBadge}
                      </span>
                      <span className="text-xs font-semibold text-slate-800 shrink-0 min-w-[112px]">
                        {monthLabel(row.month, language)}
                      </span>
                      <span className="flex-1" />
                      <span className="text-[11px] font-mono text-slate-600 shrink-0">
                        {row.amountPaid > 0 ? formatMoney(row.amountPaid) : row.status === 'paid' ? '' : '—'}
                        {row.amountDue > 0 && row.amountPaid !== row.amountDue
                          ? ` / ${formatMoney(row.amountDue)}`
                          : ''}
                      </span>
                      {row.paidAt && (
                        <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
                          {t.students.paidOnLabel.replace('{date}', formatDate(row.paidAt, language))}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}

            {!suggestedDue && (
              <p className="text-[11px] text-amber-600">{t.students.setDueHint}</p>
            )}
          </div>
        ) : (
          <>
        {/* Identity */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
              {levelNumber(student.level)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <div dir="auto" className="text-base font-bold text-slate-900 break-words min-w-0">
                  {student.name}
                </div>
                <WhatsAppButton student={student} size="md" />
              </div>
              {student.phone && (
                <div dir="ltr" className="text-[11px] text-slate-500 font-mono mt-0.5">
                  {displayPhone(student.phone)}
                </div>
              )}
              <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-500">
                {student.level && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${levelBadgeColor(
                      student.level
                    )}`}
                  >
                    {student.level}
                  </span>
                )}
                {mahja && (
                  <span dir="auto" className="inline-flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    {mahja.name}
                  </span>
                )}
                {room && (
                  <span dir="auto" className="inline-flex items-center gap-1">
                    <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                    {room.name}
                  </span>
                )}
                {!student.roomId && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    {t.students.unassignedTab}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current month state */}
          <div
            className={`shrink-0 rounded-xl border px-3 py-2 text-xs ${
              currentRow?.status === 'paid'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="font-semibold">{currentLabel}</div>
            <div className="mt-0.5 flex items-center gap-1.5">
              {currentRow?.status === 'paid' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {t.students.paidBadge}
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  {currentRow?.status === 'partial' ? t.students.partialBadge : t.students.unpaidBadge} ·{' '}
                  {t.dashboard.daysLeftLabel.replace('{days}', String(daysLeftInMonth(currentKey)))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tracking groups */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            {t.students.trackingGroupsHeading}
          </h4>
          {groups.length === 0 ? (
            <p className="text-xs text-slate-400">{t.students.noTrackingGroups}</p>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              {groups.map((g) => (
                <span
                  key={g.id}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200"
                >
                  {g.name}
                  {g.paymentAmount > 0 && (
                    <span className="ml-1.5 font-mono text-slate-500">
                      {formatMoney(g.paymentAmount)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Summary tiles */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-indigo-600" />
            {t.students.paymentSummaryHeading}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                {t.students.totalPaidLabel}
              </div>
              <div className="text-sm font-bold text-slate-900 mt-1 break-words">
                {formatMoney(summary.totalPaid)}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setBreakdownTab('paid')}
              className="p-3 rounded-xl bg-white border border-slate-200 text-start hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors cursor-pointer"
            >
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                {t.students.monthsPaidLabel}
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">{summary.paidCount}</div>
            </button>
            <button
              type="button"
              onClick={() => setBreakdownTab('missed')}
              className={`p-3 rounded-xl border text-start transition-colors cursor-pointer ${
                summary.missedMonths.length > 0
                  ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300'
                  : 'bg-white border-slate-200 hover:border-rose-200'
              }`}
            >
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <TriangleAlert className="w-3 h-3 text-rose-600" />
                {t.students.monthsMissedLabel}
              </div>
              <div
                className={`text-lg font-bold mt-0.5 ${
                  summary.missedMonths.length > 0 ? 'text-rose-600' : 'text-slate-900'
                }`}
              >
                {summary.missedMonths.length}
              </div>
            </button>
            <div className="p-3 rounded-xl bg-white border border-slate-200">
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <CalendarDays className="w-3 h-3 text-indigo-600" />
                {t.students.monthlyDueLabel}
              </div>
              <input
                type="number"
                min={0}
                value={dueInput}
                onChange={(e) => setDueInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveDue();
                }}
                placeholder="0"
                className="mt-1 w-full text-sm font-semibold px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
              />
              {dueDirty && (
                <button
                  type="button"
                  onClick={saveDue}
                  className="mt-1 w-full text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg py-1 transition-colors cursor-pointer"
                >
                  {t.students.confirmBtn}
                </button>
              )}
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            {t.dashboard.nextResetLabel.replace('{date}', resetDate)}
          </p>
          {!suggestedDue && (
            <p className="text-[11px] text-amber-600 mt-1">{t.students.setDueHint}</p>
          )}
        </div>

        {/* Monthly history */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            {t.students.paymentHistoryHeading}
          </h4>
          <div className="space-y-1.5 pr-1">
            {rows.map((row) => {
              const missed = row.month < currentKey && (row.status === 'unpaid' || row.status === 'partial');
              return (
                <div
                  key={row.month}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${
                    missed ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white'
                  }`}
                >
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${statusBadgeClass[row.status]}`}
                  >
                    {row.status === 'paid' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : row.status === 'partial' ? (
                      <Clock className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {row.status === 'paid'
                      ? t.students.paidBadge
                      : row.status === 'partial'
                      ? t.students.partialBadge
                      : t.students.unpaidBadge}
                  </span>

                  <span className="text-xs font-semibold text-slate-800 shrink-0 min-w-[110px]">
                    {monthLabel(row.month, language)}
                  </span>

                  {missed && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 shrink-0">
                      {t.students.missedBadge}
                    </span>
                  )}

                  <span className="text-[11px] font-mono text-slate-600 flex-1 text-right truncate">
                    {row.amountPaid > 0 ? formatMoney(row.amountPaid) : row.status === 'paid' ? '' : '—'}
                    {row.amountDue > 0 && row.amountPaid !== row.amountDue
                      ? ` / ${formatMoney(row.amountDue)}`
                      : ''}
                  </span>

                  {row.paidAt && (
                    <span className="text-[10px] text-slate-400 shrink-0 hidden sm:inline">
                      {t.students.paidOnLabel.replace('{date}', formatDate(row.paidAt, language))}
                    </span>
                  )}

                  <div className="flex items-center gap-1 shrink-0">
                      {row.status !== 'paid' && (
                        <>
                          <input
                            type="number"
                            min={0}
                            value={amountInputs[row.month] ?? ''}
                            onChange={(e) =>
                              setAmountInputs((prev) => ({ ...prev, [row.month]: e.target.value }))
                            }
                            placeholder={String(row.amountDue || suggestedDue || 0)}
                            title={t.students.markPaidBtn}
                            className="w-20 text-[11px] px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800"
                          />
                          <button
                            type="button"
                            title={t.students.markPaidBtn}
                            onClick={() => recordRow(row)}
                            className="p-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      {row.amountPaid > 0 && (
                        <button
                          type="button"
                          title={t.students.clearPaymentBtn}
                          onClick={() => clearMonthlyPayment(student.id, row.month)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                </div>
              );
            })}
          </div>
        </div>

          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            {onEdit && (
              <button
                type="button"
                title="Edit"
                onClick={() => onEdit(student)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            {onRemoveFromRoom && student.roomId && (
              <button
                type="button"
                title="Remove from room"
                onClick={() => onRemoveFromRoom(student)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
              >
                <UserX className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                title="Delete student"
                onClick={() => onDelete(student)}
                className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

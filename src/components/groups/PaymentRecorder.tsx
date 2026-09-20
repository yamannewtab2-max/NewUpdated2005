import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, Wallet, BookmarkPlus, X } from 'lucide-react';
import { currentMonthKey, monthKeyOf } from '../../utils/months';

interface PaymentRecorderProps {
  groupId: string;
  /** 'month' shows only the payments recorded this month (used in list cards). */
  scope?: 'month' | 'all';
}

/**
 * Payment log for lists that have no students: type the amount and what it was
 * for, press +, and it is saved for this list.
 */
export const PaymentRecorder: React.FC<PaymentRecorderProps> = ({ groupId, scope = 'all' }) => {
  const {
    t,
    language,
    paymentEntries,
    addPaymentEntry,
    deletePaymentEntry,
    notePresets,
    addNotePreset,
    removeNotePreset,
    formatMoney,
  } = useApp();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const allEntries = paymentEntries
    .filter((e) => e.groupId === groupId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const monthKey = currentMonthKey();
  const entries =
    scope === 'month'
      ? allEntries.filter((e) => {
          try {
            return monthKeyOf(new Date(e.createdAt)) === monthKey;
          } catch {
            return false;
          }
        })
      : allEntries;

  const total = entries.reduce((sum, e) => sum + e.amount, 0);
  const canAdd = (Number(amount) || 0) !== 0;

  const submit = () => {
    if (!canAdd) return;
    addPaymentEntry(groupId, Number(amount), note);
    setAmount('');
    setNote('');
  };

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-GB', {
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-3">
      {/* Amount + what for + add */}
      <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2.5 min-w-0">
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={t.groups.recordAmountPlaceholder}
          className="w-24 sm:w-32 shrink-0 text-sm font-semibold px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-600 tabular-nums text-slate-900"
        />
        <input
          type="text"
          dir="auto"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder={t.groups.recordNotePlaceholder}
          className="flex-1 min-w-0 text-sm px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-indigo-600 text-slate-800"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!canAdd}
          title={t.groups.addPaymentBtn}
          aria-label={t.groups.addPaymentBtn}
          className="shrink-0 p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Saved "what was it for" phrases — tap one to refill the box */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {notePresets.map((word) => (
          <span
            key={word}
            className="inline-flex items-center gap-0.5 rounded-full border border-slate-200 bg-white pl-2.5 pr-0.5 py-0.5 max-w-full"
          >
            <button
              type="button"
              onClick={() => setNote(word)}
              dir="auto"
              title={word}
              className="text-[11px] font-medium text-slate-700 max-w-[110px] truncate hover:text-indigo-600 cursor-pointer"
            >
              {word}
            </button>
            <button
              type="button"
              onClick={() => removeNotePreset(word)}
              title={t.groups.removePhrase}
              aria-label={t.groups.removePhrase}
              className="p-0.5 rounded-full text-slate-300 hover:text-rose-500 hover:bg-rose-50 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <button
          type="button"
          onClick={() => addNotePreset(note)}
          disabled={!note.trim()}
          title={t.groups.savePhraseHint}
          className="inline-flex items-center gap-1 rounded-full border border-dashed border-slate-300 px-2.5 py-0.5 text-[11px] font-semibold text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <BookmarkPlus className="w-3 h-3" />
          {t.groups.savePhrase}
        </button>
      </div>

      {/* Total */}
      <div className="flex items-center justify-between gap-2 rounded-xl bg-emerald-50/60 border border-emerald-100 px-3 py-2 min-w-0">
        <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1.5 shrink-0">
          <Wallet className="w-3.5 h-3.5" />
          {t.groups.recordedPayments}
          <span className="font-mono">({entries.length})</span>
        </span>
        <span className="text-sm font-bold font-mono tabular-nums text-emerald-800 truncate">
          {formatMoney(total)}
        </span>
      </div>

      {/* Entries */}
      {entries.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-5">{t.groups.noPaymentsRecorded}</p>
      ) : (
        <div className="space-y-1.5 max-h-[45vh] overflow-y-auto pr-1">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 min-w-0"
            >
              <span className="shrink-0 text-[11px] font-bold font-mono tabular-nums text-slate-900">
                {formatMoney(entry.amount)}
              </span>
              <span className="shrink-0 text-[10px] text-slate-400">{formatDate(entry.createdAt)}</span>
              <span className="flex-1" />
              {entry.note && (
                <span dir="auto" className="text-xs text-slate-600 truncate max-w-[45%] text-right">
                  {entry.note}
                </span>
              )}
              <button
                type="button"
                onClick={() => deletePaymentEntry(entry.id)}
                title={t.students.clearPaymentBtn}
                aria-label={t.students.clearPaymentBtn}
                className="shrink-0 p-1 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

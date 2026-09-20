import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { levelNumber } from '../../utils/level';
import { amountLocale, groupDigits, parseGroupedAmount } from '../../utils/amountInput';
import {
  FolderTree,
  Users,
  Search,
  CheckSquare,
  Square,
  Building2,
  ArrowRight,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

interface TrackingListWizardProps {
  isOpen: boolean;
  onClose: () => void;
  defaultParentId?: string | null;
}

type Step = 1 | 2 | 3 | 4;
type MemberView = 'mahja' | 'name';
type PriceMode = 'same' | 'different';

const UNASSIGNED = '__unassigned__';

/** How many students the "By name" list renders at once (a phone cannot take 195). */
const NAME_PAGE_SIZE = 40;

export const TrackingListWizard: React.FC<TrackingListWizardProps> = ({
  isOpen,
  onClose,
  defaultParentId = null,
}) => {
  const {
    t,
    students,
    mahjas,
    rooms,
    addGroup,
    updatePayment,
    formatMoney,
    currencySymbol,
    currency,
  } = useApp();

  const amountGrouping = amountLocale(currency);
  const defaultAmount = groupDigits(currency === 'IDR' ? '50000' : '100', amountGrouping);

  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(defaultParentId);

  const [memberView, setMemberView] = useState<MemberView>('mahja');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMahjaIds, setSelectedMahjaIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(NAME_PAGE_SIZE);
  const [mode, setMode] = useState<'students' | 'payments'>('students');

  const [priceMode, setPriceMode] = useState<PriceMode>('same');
  const [sameAmount, setSameAmount] = useState<string>(defaultAmount);
  const [bulkAmount, setBulkAmount] = useState<string>(defaultAmount);
  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setStep(1);
    setName('');
    setParentId(defaultParentId);
    setMemberView('mahja');
    setSelectedIds([]);
    setSelectedMahjaIds([]);
    setSearch('');
    setVisibleCount(NAME_PAGE_SIZE);
    setMode('students');
    setPriceMode('same');
    setSameAmount(defaultAmount);
    setBulkAmount(defaultAmount);
    setAmounts({});
    setErrorName('');
  }, [isOpen, defaultParentId, defaultAmount]);

  // Keep a per-student amount for everyone selected (different-price mode)
  useEffect(() => {
    setAmounts((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) {
        if (next[id] === undefined) next[id] = bulkAmount;
      }
      for (const id of Object.keys(next)) {
        if (!selectedIds.includes(id)) delete next[id];
      }
      return next;
    });
  }, [selectedIds, bulkAmount]);

  const studentsByMahja = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of students) {
      const key = s.mahjaId || UNASSIGNED;
      map.set(key, [...(map.get(key) || []), s.id]);
    }
    return map;
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.level && s.level.toLowerCase().includes(q))
    );
  }, [students, search]);

  const selectedStudents = useMemo(
    () => students.filter((s) => selectedIds.includes(s.id)),
    [students, selectedIds]
  );

  useEffect(() => {
    setVisibleCount(NAME_PAGE_SIZE);
  }, [search, memberView]);

  const effectiveAmount = (studentId: string): number =>
    priceMode === 'same'
      ? Math.max(0, parseGroupedAmount(sameAmount))
      : Math.max(0, parseGroupedAmount(amounts[studentId] ?? bulkAmount));

  const totalExpected = useMemo(
    () => selectedStudents.reduce((sum, s) => sum + effectiveAmount(s.id), 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedStudents, priceMode, sameAmount, amounts, bulkAmount]
  );

  const toggleStudent = (id: string) =>
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleMahja = (key: string) => {
    const ids = studentsByMahja.get(key) || [];
    const isOn = selectedMahjaIds.includes(key);
    setSelectedMahjaIds((prev) => (isOn ? prev.filter((k) => k !== key) : [...prev, key]));
    setSelectedIds((prev) => {
      const set = new Set(prev);
      if (isOn) ids.forEach((id) => set.delete(id));
      else ids.forEach((id) => set.add(id));
      return [...set];
    });
  };

  const selectAll = () => {
    setSelectedIds(students.map((s) => s.id));
    setSelectedMahjaIds([...mahjas.map((m) => m.id), ...(studentsByMahja.has(UNASSIGNED) ? [UNASSIGNED] : [])]);
  };

  const clearAll = () => {
    setSelectedIds([]);
    setSelectedMahjaIds([]);
  };

  const applyBulkToAll = (value: string) => {
    const grouped = groupDigits(value, amountGrouping);
    setBulkAmount(grouped);
    setAmounts((prev) => {
      const next = { ...prev };
      for (const id of selectedIds) next[id] = grouped;
      return next;
    });
  };

  const next = () => {
    if (step === 1 && !name.trim()) {
      setErrorName(t.groups.namePlaceholder);
      return;
    }
    setErrorName('');
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  };

  const back = () => setStep((s) => (s > 1 ? ((s - 1) as Step) : s));

  const submit = () => {
    if (!name.trim()) {
      setStep(1);
      setErrorName(t.groups.namePlaceholder);
      return;
    }
    const withStudents = mode === 'students';
    const baseAmount = withStudents
      ? priceMode === 'same'
        ? parseGroupedAmount(sameAmount)
        : parseGroupedAmount(bulkAmount)
      : 0;

    const group = addGroup({
      name: name.trim(),
      parentId: parentId || null,
      paymentAmount: Math.max(0, baseAmount),
      studentIds: withStudents ? selectedIds : [],
    });

    // Per-student amounts override the group default
    if (withStudents && priceMode === 'different') {
      for (const id of selectedIds) {
        const amount = Math.max(0, parseGroupedAmount(amounts[id] ?? bulkAmount));
        if (amount !== Math.max(0, baseAmount)) updatePayment(group.id, id, 0, amount);
      }
    }
    onClose();
  };

  const steps =
    mode === 'payments'
      ? [{ n: 1 as Step, label: t.groups.wizardStepName }]
      : [
          { n: 1 as Step, label: t.groups.wizardStepName },
          { n: 2 as Step, label: t.groups.wizardStepMembers },
          { n: 3 as Step, label: t.groups.wizardStepPrice },
          { n: 4 as Step, label: t.groups.wizardStepReview },
        ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t.groups.modalCreateTitle} maxWidth="2xl">
      <div className="space-y-5">
        {/* Step indicator */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {steps.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => s.n < step && setStep(s.n)}
              className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-colors ${
                s.n === step
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : s.n < step
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 cursor-pointer'
                  : 'bg-white text-slate-400 border-slate-200'
              }`}
            >
              {s.n < step ? <CheckCircle2 className="w-3 h-3" /> : <span>{s.n}</span>}
              {s.label}
            </button>
          ))}
          <span className="text-[11px] text-slate-400 ml-auto">
            {t.groups.wizardStepOf
              .replace('{current}', String(step))
              .replace('{total}', String(steps.length))}
          </span>
        </div>

        {/* STEP 1 — Name */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t.groups.wizardNameTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{t.groups.wizardNameDesc}</p>
            </div>
            <Input
              label={t.groups.nameLabel}
              placeholder={t.groups.namePlaceholder}
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errorName}
              leftIcon={<FolderTree className="w-4 h-4" />}
              autoFocus
            />

            {/* Does this list contain students? */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setMode('students')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'students'
                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t.groups.wizardWithStudents}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.groups.wizardWithStudentsDesc}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode('payments')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  mode === 'payments'
                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">
                  {t.groups.wizardWithoutStudents}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.groups.wizardWithoutStudentsDesc}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 — Members */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{t.groups.wizardMembersTitle}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{t.groups.wizardMembersDesc}</p>
              </div>
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 shrink-0">
                {t.groups.wizardSelectedCount.replace('{count}', String(selectedIds.length))}
              </span>
            </div>

            {/* View mode + batch actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMemberView('mahja')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    memberView === 'mahja' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.groups.wizardViewByMahja}
                </button>
                <button
                  type="button"
                  onClick={() => setMemberView('name')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    memberView === 'name' ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  {t.groups.wizardViewByName}
                </button>
              </div>
              <button
                type="button"
                onClick={selectAll}
                className="text-[11px] font-semibold text-slate-700 hover:text-indigo-700 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {t.groups.wizardAllStudents}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="text-[11px] font-semibold text-slate-700 hover:text-rose-600 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                {t.groups.wizardClearSelection}
              </button>
            </div>

            {/* By Mahja */}
            {memberView === 'mahja' && (
              <div className="space-y-3">
                <p className="text-[11px] text-slate-400">{t.groups.wizardSelectMahjas}</p>
                <div className="flex flex-wrap gap-2">
                  {mahjas.map((m) => {
                    const ids = studentsByMahja.get(m.id) || [];
                    const on = selectedMahjaIds.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleMahja(m.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          on
                            ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-1 ring-indigo-400'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[10rem]">{m.name}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {t.groups.wizardMahjaStudents.replace('{count}', String(ids.length))}
                        </span>
                      </button>
                    );
                  })}

                  {studentsByMahja.has(UNASSIGNED) && (
                    <button
                      type="button"
                      onClick={() => toggleMahja(UNASSIGNED)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedMahjaIds.includes(UNASSIGNED)
                          ? 'bg-amber-50 border-amber-400 text-amber-900 ring-1 ring-amber-400'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" />
                      {t.students.unassignedTab}
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {t.groups.wizardMahjaStudents.replace(
                          '{count}',
                          String((studentsByMahja.get(UNASSIGNED) || []).length)
                        )}
                      </span>
                    </button>
                  )}
                </div>
                {selectedIds.length === 0 && (
                  <p className="text-[11px] text-amber-600">{t.groups.wizardNoSelection}</p>
                )}
              </div>
            )}

            {/* By name */}
            {memberView === 'name' && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    dir="auto"
                    placeholder={t.groups.wizardSearchByName}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <p className="text-[10px] text-slate-400 px-0.5">
                  {t.groups.wizardShowingResults
                    .replace('{shown}', String(Math.min(visibleCount, filteredStudents.length)))
                    .replace('{total}', String(filteredStudents.length))}
                </p>

                <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
                  {filteredStudents.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">
                      {t.students.noStudentsFound}
                    </div>
                  ) : (
                    filteredStudents.slice(0, visibleCount).map((s) => {
                      const on = selectedIds.includes(s.id);
                      const mahja = mahjas.find((m) => m.id === s.mahjaId);
                      const room = rooms.find((r) => r.id === s.roomId);
                      return (
                        <div
                          key={s.id}
                          onClick={() => toggleStudent(s.id)}
                          className={`flex items-center gap-2.5 px-2.5 py-2 cursor-pointer transition-colors ${
                            on ? 'bg-indigo-50/40' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-indigo-600 shrink-0">
                            {on ? (
                              <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-300" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                dir="auto"
                                className="text-xs font-semibold text-slate-800 truncate flex-1 text-right"
                              >
                                {s.name}
                              </span>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                {levelNumber(s.level)}
                              </span>
                            </div>
                            {(mahja || room) && (
                              <div className="text-[10px] text-slate-400 truncate mt-0.5">
                                {[mahja?.name, room?.name].filter(Boolean).join(' · ')}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {filteredStudents.length > visibleCount && (
                  <button
                    type="button"
                    onClick={() => setVisibleCount((n) => n + NAME_PAGE_SIZE)}
                    className="w-full text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-lg py-2 transition-colors cursor-pointer"
                  >
                    {t.groups.wizardShowMore.replace(
                      '{count}',
                      String(filteredStudents.length - visibleCount)
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 3 — Price */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t.groups.wizardPriceTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{t.groups.wizardPriceDesc}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPriceMode('same')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  priceMode === 'same'
                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t.groups.wizardPriceSame}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.groups.paymentAmountHelp}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setPriceMode('different')}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  priceMode === 'different'
                    ? 'bg-indigo-50 border-indigo-400 ring-1 ring-indigo-400'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{t.groups.wizardPriceDifferent}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {t.groups.wizardBulkHelp}
                </div>
              </button>
            </div>

            {/* Same price: one box only */}
            {priceMode === 'same' && (
              <Input
                type="text"
                inputMode="numeric"
                label={t.groups.paymentAmountLabel}
                value={sameAmount}
                onChange={(e) => setSameAmount(groupDigits(e.target.value, amountGrouping))}
                leftIcon={
                  <span className="text-xs font-mono font-bold text-slate-500">{currencySymbol}</span>
                }
                helperText={t.groups.paymentAmountHelp}
              />
            )}

            {/* Different: bulk box on top, then per student */}
            {priceMode === 'different' && (
              <div className="space-y-3">
                <div className="mx-auto w-full sm:w-72 text-center">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {t.groups.wizardBulkLabel}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={bulkAmount}
                      onChange={(e) => applyBulkToAll(e.target.value)}
                      className="w-full text-sm font-semibold text-center px-3 py-2 bg-white border border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 tabular-nums"
                    />
                    <button
                      type="button"
                      onClick={() => applyBulkToAll(bulkAmount)}
                      className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 px-2.5 py-2 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      {t.groups.wizardBulkApply}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.groups.wizardBulkHelp}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">
                    {t.groups.wizardPerStudent}
                  </p>
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {selectedStudents.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                      >
                        <span dir="auto" className="text-xs font-semibold text-slate-800 truncate min-w-0 flex-1">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                          {levelNumber(s.level)}
                        </span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={amounts[s.id] ?? ''}
                          onChange={(e) =>
                            setAmounts((prev) => ({
                              ...prev,
                              [s.id]: groupDigits(e.target.value, amountGrouping),
                            }))
                          }
                          className="w-24 shrink-0 text-xs text-right px-2 py-1 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-800 tabular-nums"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-200 px-3 py-2.5">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                {t.groups.wizardTotalExpected}
              </span>
              <span className="text-sm font-bold font-mono text-slate-900">
                {formatMoney(totalExpected)}
              </span>
            </div>
          </div>
        )}

        {/* STEP 4 — Review & submit */}
        {step === 4 && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">{t.groups.wizardReviewTitle}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{t.groups.wizardReviewDesc}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-white border border-slate-200 min-w-0">
                <div className="text-[11px] text-slate-500">{t.groups.nameLabel}</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 break-words">
                  {name || '—'}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <div className="text-[11px] text-slate-500">{t.groups.wizardMembersLabel}</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5">{selectedIds.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 min-w-0">
                <div className="text-[11px] text-slate-500">{t.groups.wizardPriceModeLabel}</div>
                <div className="text-xs font-bold text-slate-900 mt-0.5 break-words">
                  {priceMode === 'same' ? t.groups.wizardPriceSame : t.groups.wizardPriceDifferent}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200 min-w-0">
                <div className="text-[11px] text-slate-500">{t.groups.wizardTotalExpected}</div>
                <div className="text-xs font-bold font-mono text-slate-900 mt-0.5 break-words">
                  {formatMoney(totalExpected)}
                </div>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
              {selectedStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2"
                >
                  <span dir="auto" className="text-xs font-semibold text-slate-800 truncate min-w-0 flex-1">
                    {s.name}
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    {levelNumber(s.level)}
                  </span>
                  <span className="text-xs font-mono text-slate-700 shrink-0">
                    {formatMoney(effectiveAmount(s.id))}
                  </span>
                </div>
              ))}
              {selectedStudents.length === 0 && (
                <p className="text-[11px] text-amber-600">{t.groups.wizardNoSelection}</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" onClick={step === 1 ? onClose : back}>
            {step === 1 ? t.students.cancel : t.groups.wizardBack}
          </Button>
          {mode === 'payments' ? (
            <Button variant="primary" onClick={submit} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              {t.groups.wizardSubmit}
            </Button>
          ) : step < 4 ? (
            <Button variant="primary" onClick={next} rightIcon={<ArrowRight className="w-4 h-4" />}>
              {t.groups.wizardNext}
            </Button>
          ) : (
            <Button variant="primary" onClick={submit} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              {t.groups.wizardSubmit}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

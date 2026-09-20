import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { TrackingGroup } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Search, FolderTree, DollarSign, CheckSquare, Square, Users } from 'lucide-react';

interface GroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: TrackingGroup | null;
  defaultParentId?: string | null;
}

export const GroupModal: React.FC<GroupModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
  defaultParentId = null,
}) => {
  const {
    t,
    groups,
    students,
    studentGroups,
    addGroup,
    updateGroup,
    setGroupStudents,
    formatMoney,
    getAllDescendantGroupIds,
    currencySymbol,
    currency,
  } = useApp();

  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(defaultParentId);
  const [paymentAmount, setPaymentAmount] = useState<number | string>(
    currency === 'IDR' ? 50000 : 100
  );
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [errorName, setErrorName] = useState('');

  // When editing, exclude self and descendants from parent choices to avoid circular trees
  const validParentOptions = useMemo(() => {
    if (!groupToEdit) return groups;
    const descendantIds = getAllDescendantGroupIds(groupToEdit.id);
    return groups.filter((g) => g.id !== groupToEdit.id && !descendantIds.includes(g.id));
  }, [groups, groupToEdit, getAllDescendantGroupIds]);

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setParentId(groupToEdit.parentId);
      setPaymentAmount(groupToEdit.paymentAmount);
      setSelectedStudentIds(Array.isArray(groupToEdit.studentIds) ? [...groupToEdit.studentIds] : []);
    } else {
      setName('');
      setParentId(defaultParentId);
      setPaymentAmount(currency === 'IDR' ? 50000 : 100);
      setSelectedStudentIds([]);
    }
    setStudentSearch('');
    setErrorName('');
  }, [groupToEdit, defaultParentId, isOpen, currency]);

  // Filter students from Student Manager
  const filteredStudents = useMemo(() => {
    if (!studentSearch.trim()) return students;
    const q = studentSearch.toLowerCase();
    return students.filter(
      (s) => s.name.toLowerCase().includes(q) || (s.level && s.level.toLowerCase().includes(q))
    );
  }, [students, studentSearch]);

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id);
    setSelectedStudentIds((prev) => {
      const combined = new Set([...prev, ...allFilteredIds]);
      return Array.from(combined);
    });
  };

  const handleDeselectAll = () => {
    const allFilteredIds = new Set(filteredStudents.map((s) => s.id));
    setSelectedStudentIds((prev) => prev.filter((id) => !allFilteredIds.has(id)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorName(t.groups.namePlaceholder);
      return;
    }

    const numAmount = Math.max(0, Number(paymentAmount) || 0);

    if (groupToEdit) {
      updateGroup(groupToEdit.id, {
        name,
        parentId: parentId || null,
        paymentAmount: numAmount,
      });
      // Also update enrolled students
      setGroupStudents(groupToEdit.id, selectedStudentIds);
    } else {
      addGroup({
        name,
        parentId: parentId || null,
        paymentAmount: numAmount,
        studentIds: selectedStudentIds,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groupToEdit ? t.groups.modalEditTitle : t.groups.modalCreateTitle}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <Input
          label={t.groups.nameLabel}
          placeholder={t.groups.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorName}
          leftIcon={<FolderTree className="w-4 h-4" />}
          autoFocus
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Parent Group Selection for Hierarchical Organization */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide">
              {t.groups.parentGroupLabel}
            </label>
            <select
              value={parentId || ''}
              onChange={(e) => setParentId(e.target.value ? e.target.value : null)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-2xs"
            >
              <option value="">{t.groups.noneRoot}</option>
              {validParentOptions.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.parentId ? `(under ${groups.find((p) => p.id === g.parentId)?.name || 'Parent'})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Amount */}
          <Input
            type="number"
            min="0"
            step="any"
            label={t.groups.paymentAmountLabel}
            placeholder={currency === 'IDR' ? '50000' : '100'}
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            leftIcon={
              <span className="text-xs font-mono font-bold text-slate-500">
                {currencySymbol}
              </span>
            }
            helperText={t.groups.paymentAmountHelp}
          />
        </div>

        {/* Student Selector Section */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" />
                {t.groups.selectStudentsLabel}
              </label>
              <p className="text-[11px] text-slate-400">{t.groups.selectStudentsHelp}</p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
              {selectedStudentIds.length} selected
            </span>
          </div>

          {/* Search and batch actions */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={t.groups.searchStudentsPlaceholder}
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-[11px] font-medium text-slate-600 hover:text-indigo-600 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {t.groups.selectAll}
            </button>
            <button
              type="button"
              onClick={handleDeselectAll}
              className="text-[11px] font-medium text-slate-600 hover:text-rose-600 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              {t.groups.deselectAll}
            </button>
          </div>

          {/* Student checkbox list */}
          <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white">
            {students.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">{t.students.noStudentsFound}</p>
                <p className="text-[11px] text-slate-400">
                  You can create this group now and assign students later once added to the Student Manager.
                </p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {t.students.noStudentsFound}
              </div>
            ) : (
              filteredStudents.map((student) => {
                const isSelected = selectedStudentIds.includes(student.id);
                const sg = student.studentGroupId
                  ? studentGroups.find((g) => g.id === student.studentGroupId)
                  : null;
                return (
                  <div
                    key={student.id}
                    onClick={() => toggleStudent(student.id)}
                    className={`flex items-center justify-between p-2.5 hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="text-indigo-600">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 fill-indigo-600 text-white" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-slate-800">{student.name}</p>
                          {student.level && (
                            <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              {student.level}
                            </span>
                          )}
                          {sg && (
                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {sg.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-semibold text-indigo-600">
                        Enrolled
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {groupToEdit ? t.groups.updateGroup : t.groups.saveGroup}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

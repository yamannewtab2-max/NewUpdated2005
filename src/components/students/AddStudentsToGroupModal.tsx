import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentGroup } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Search, Check, UserPlus, Users } from 'lucide-react';

interface AddStudentsToGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetGroup: StudentGroup;
}

export const AddStudentsToGroupModal: React.FC<AddStudentsToGroupModalProps> = ({
  isOpen,
  onClose,
  targetGroup,
}) => {
  const { t, students, studentGroups, assignStudentsToGroup } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterUngroupedOnly, setFilterUngroupedOnly] = useState(false);

  // Available students (those not already in this group)
  const availableStudents = useMemo(() => {
    return students.filter((s) => s.studentGroupId !== targetGroup.id);
  }, [students, targetGroup.id]);

  const filteredStudents = useMemo(() => {
    let list = availableStudents;
    if (filterUngroupedOnly) {
      list = list.filter((s) => !s.studentGroupId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) => s.name.toLowerCase().includes(q) || (s.level && s.level.toLowerCase().includes(q))
      );
    }
    return list;
  }, [availableStudents, filterUngroupedOnly, search]);

  const handleToggleStudent = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id));
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length === 0) return;
    assignStudentsToGroup(selectedIds, targetGroup.id);
    onClose();
  };

  const getGroupName = (id?: string | null) => {
    if (!id) return null;
    return studentGroups.find((g) => g.id === id)?.name;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.students.addExistingStudentsTitle.replace('{group}', targetGroup.name)}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          {t.students.addExistingStudentsDesc}
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={t.students.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-sm pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterUngroupedOnly(!filterUngroupedOnly)}
            className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap ${
              filterUngroupedOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Ungrouped Only ({availableStudents.filter((s) => !s.studentGroupId).length})
          </button>
        </div>

        {/* Select All Bar */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between text-xs px-1 text-slate-500">
            <button
              type="button"
              onClick={handleSelectAll}
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              {selectedIds.length === filteredStudents.length
                ? 'Deselect All'
                : `Select All (${filteredStudents.length})`}
            </button>
            <span>
              {selectedIds.length} selected
            </span>
          </div>
        )}

        {/* Student List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {filteredStudents.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              {availableStudents.length === 0
                ? 'All students in the directory are already in this group.'
                : t.students.noStudentsToSelect}
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              const currentGroupName = getGroupName(student.studentGroupId);

              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">{student.name}</p>
                      {student.level && (
                        <div className="flex items-center gap-2 text-xs text-amber-700 mt-0.5 font-medium">
                          <span>{student.level}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Current Group Badge */}
                  <div>
                    {currentGroupName ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-medium">
                        <Users className="w-3 h-3" />
                        From {currentGroupName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[11px] font-medium">
                        Ungrouped
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            Selected students will be assigned to <strong>{targetGroup.name}</strong>
          </span>

          <div className="flex items-center gap-2.5">
            <Button type="button" variant="secondary" onClick={onClose}>
              {t.students.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleConfirm}
              disabled={selectedIds.length === 0}
              leftIcon={<UserPlus className="w-4 h-4" />}
            >
              {t.students.assignSelectedStudents} ({selectedIds.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

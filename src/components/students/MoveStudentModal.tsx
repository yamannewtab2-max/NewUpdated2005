import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ArrowRightLeft, Users, UserCheck } from 'lucide-react';

interface MoveStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const MoveStudentModal: React.FC<MoveStudentModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { t, studentGroups, moveStudent } = useApp();
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    student.studentGroupId || ''
  );

  const handleConfirm = () => {
    const targetId = selectedGroupId.trim() ? selectedGroupId : null;
    moveStudent(student.id, targetId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.students.moveStudentTitle}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          {t.students.moveStudentDesc.replace('{student}', student.name)}
        </p>

        <div className="space-y-2">
          {/* Option: Ungrouped */}
          <label
            onClick={() => setSelectedGroupId('')}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
              selectedGroupId === ''
                ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${
                  selectedGroupId === ''
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm">{t.students.noGroupAssigned}</span>
            </div>
            {selectedGroupId === '' && (
              <UserCheck className="w-4 h-4 text-indigo-600" />
            )}
          </label>

          {/* Options: All Custom Student Groups */}
          {studentGroups.map((grp) => (
            <label
              key={grp.id}
              onClick={() => setSelectedGroupId(grp.id)}
              className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                selectedGroupId === grp.id
                  ? 'bg-indigo-50/70 border-indigo-500 text-indigo-950 font-semibold ring-1 ring-indigo-500'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                    selectedGroupId === grp.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {grp.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <span className="text-sm block">{grp.name}</span>
                  {grp.description && (
                    <span className="text-[11px] text-slate-400 block font-normal truncate max-w-[200px]">
                      {grp.description}
                    </span>
                  )}
                </div>
              </div>
              {selectedGroupId === grp.id && (
                <UserCheck className="w-4 h-4 text-indigo-600" />
              )}
            </label>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirm}
            leftIcon={<ArrowRightLeft className="w-4 h-4" />}
          >
            {t.students.moveBtn}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudentGroup } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Users, FileText } from 'lucide-react';

interface StudentGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupToEdit?: StudentGroup | null;
  onCreated?: (group: StudentGroup) => void;
}

export const StudentGroupModal: React.FC<StudentGroupModalProps> = ({
  isOpen,
  onClose,
  groupToEdit,
  onCreated,
}) => {
  const { t, addStudentGroup, updateStudentGroup } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    if (groupToEdit) {
      setName(groupToEdit.name);
      setDescription(groupToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrorName('');
  }, [groupToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorName(t.students.groupNamePlaceholder);
      return;
    }

    if (groupToEdit) {
      updateStudentGroup(groupToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      const created = addStudentGroup({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      if (onCreated) {
        onCreated(created);
      }
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={groupToEdit ? t.students.editGroupModalTitle : t.students.createGroupModalTitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.students.groupNameLabel}
          placeholder={t.students.groupNamePlaceholder}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setErrorName('');
          }}
          error={errorName}
          leftIcon={<Users className="w-4 h-4" />}
          autoFocus
          helperText="e.g. Sanan Ula, Class 1A, Grade 7, etc."
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {t.students.groupDescLabel}
          </label>
          <textarea
            rows={3}
            placeholder={t.students.groupDescPlaceholder}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-sm px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs resize-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {groupToEdit ? t.students.update : t.students.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

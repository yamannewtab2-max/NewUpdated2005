import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Mahja } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Building2, FileText } from 'lucide-react';

interface MahjaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mahjaToEdit?: Mahja | null;
  onCreated?: (mahja: Mahja) => void;
}

export const MahjaModal: React.FC<MahjaModalProps> = ({
  isOpen,
  onClose,
  mahjaToEdit,
  onCreated,
}) => {
  const { t, addMahja, updateMahja } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorName, setErrorName] = useState('');

  useEffect(() => {
    if (mahjaToEdit) {
      setName(mahjaToEdit.name);
      setDescription(mahjaToEdit.description || '');
    } else {
      setName('');
      setDescription('');
    }
    setErrorName('');
  }, [mahjaToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorName(t.students.mahjaNamePlaceholder);
      return;
    }

    if (mahjaToEdit) {
      updateMahja(mahjaToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      const created = addMahja({
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
      title={mahjaToEdit ? t.students.editMahjaModalTitle : t.students.createMahjaModalTitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label={t.students.mahjaNameLabel}
          placeholder={t.students.mahjaNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorName}
          leftIcon={<Building2 className="w-4 h-4" />}
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              {t.students.mahjaDescLabel}
            </span>
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.students.mahjaDescPlaceholder}
            className="w-full text-sm p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {mahjaToEdit ? t.students.update : t.students.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

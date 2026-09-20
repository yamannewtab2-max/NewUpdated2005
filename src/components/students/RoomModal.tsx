import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Room } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { DoorOpen, Building2, FileText } from 'lucide-react';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMahjaId: string;
  roomToEdit?: Room | null;
  onCreated?: (room: Room) => void;
}

export const RoomModal: React.FC<RoomModalProps> = ({
  isOpen,
  onClose,
  targetMahjaId,
  roomToEdit,
  onCreated,
}) => {
  const { t, mahjas, addRoom, updateRoom } = useApp();
  const [mahjaId, setMahjaId] = useState(targetMahjaId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errorName, setErrorName] = useState('');

  const targetMahja = mahjas.find((m) => m.id === (roomToEdit?.mahjaId || mahjaId));

  useEffect(() => {
    if (roomToEdit) {
      setMahjaId(roomToEdit.mahjaId);
      setName(roomToEdit.name);
      setDescription(roomToEdit.description || '');
    } else {
      setMahjaId(targetMahjaId);
      setName('');
      setDescription('');
    }
    setErrorName('');
  }, [roomToEdit, targetMahjaId, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorName(t.students.roomNamePlaceholder);
      return;
    }

    if (roomToEdit) {
      updateRoom(roomToEdit.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
    } else {
      const created = addRoom({
        mahjaId,
        name: name.trim(),
        description: description.trim() || undefined,
      });
      if (onCreated) {
        onCreated(created);
      }
    }
    onClose();
  };

  const modalTitle = roomToEdit
    ? t.students.editRoomModalTitle
    : t.students.createRoomModalTitle.replace('{mahja}', targetMahja?.name || 'Mahja');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mahja indicator */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {t.students.mahjaLabel}
          </label>
          <div className="text-sm font-medium text-slate-800 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            {targetMahja?.name || 'Selected Mahja'}
          </div>
        </div>

        <Input
          label={t.students.roomNameLabel}
          placeholder={t.students.roomNamePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorName}
          leftIcon={<DoorOpen className="w-4 h-4" />}
          autoFocus
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            {t.students.roomDescLabel}
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t.students.roomDescPlaceholder}
            className="w-full text-sm p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {roomToEdit ? t.students.update : t.students.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

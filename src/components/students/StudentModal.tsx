import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { User, Award, Building2, DoorOpen } from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentToEdit?: Student | null;
  initialMahjaId?: string | null;
  initialRoomId?: string | null;
  initialStudentGroupId?: string | null;
}

const DEFAULT_LEVELS = ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level Unknown'];

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  studentToEdit,
  initialMahjaId,
  initialRoomId,
  initialStudentGroupId,
}) => {
  const { t, mahjas, rooms, addStudent, updateStudent } = useApp();
  const [name, setName] = useState('');
  const [level, setLevel] = useState('Level 1');
  const [customLevel, setCustomLevel] = useState('');
  const [isCustomLevel, setIsCustomLevel] = useState(false);
  const [mahjaId, setMahjaId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [errorName, setErrorName] = useState('');

  // Available rooms for selected Mahja
  const availableRooms = React.useMemo(() => {
    if (!mahjaId) return [];
    return rooms.filter((r) => r.mahjaId === mahjaId);
  }, [mahjaId, rooms]);

  useEffect(() => {
    if (studentToEdit) {
      setName(studentToEdit.name);
      const studentLevel = studentToEdit.level || 'Level 1';
      if (DEFAULT_LEVELS.includes(studentLevel)) {
        setLevel(studentLevel);
        setIsCustomLevel(false);
        setCustomLevel('');
      } else {
        setLevel('custom');
        setIsCustomLevel(true);
        setCustomLevel(studentLevel);
      }
      setMahjaId(studentToEdit.mahjaId || '');
      setRoomId(studentToEdit.roomId || '');
    } else {
      setName('');
      setLevel('Level 1');
      setIsCustomLevel(false);
      setCustomLevel('');
      setMahjaId(initialMahjaId || '');
      setRoomId(initialRoomId || '');
    }
    setErrorName('');
  }, [studentToEdit, initialMahjaId, initialRoomId, isOpen]);

  // When mahja changes, if room doesn't belong to it, clear room
  const handleMahjaChange = (newMahjaId: string) => {
    setMahjaId(newMahjaId);
    if (!newMahjaId) {
      setRoomId('');
    } else {
      const roomStillValid = rooms.some(
        (r) => r.mahjaId === newMahjaId && r.id === roomId
      );
      if (!roomStillValid) {
        setRoomId('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorName(t.students.namePlaceholder);
      return;
    }

    const chosenLevel = isCustomLevel ? customLevel.trim() || 'Level 1' : level;
    const chosenMahjaId = mahjaId.trim() ? mahjaId : null;
    const chosenRoomId = roomId.trim() ? roomId : null;

    if (studentToEdit) {
      updateStudent(studentToEdit.id, {
        name,
        level: chosenLevel,
        mahjaId: chosenMahjaId,
        roomId: chosenRoomId,
      });
    } else {
      addStudent({
        name,
        level: chosenLevel,
        mahjaId: chosenMahjaId,
        roomId: chosenRoomId,
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={studentToEdit ? t.students.modalEditTitle : t.students.modalAddTitle}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <Input
          label={t.students.nameLabel}
          placeholder={t.students.namePlaceholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errorName}
          leftIcon={<User className="w-4 h-4" />}
          autoFocus
        />

        {/* Level / Ranking */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              {t.students.levelLabel}
            </span>
          </label>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {DEFAULT_LEVELS.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  setLevel(lvl);
                  setIsCustomLevel(false);
                }}
                className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  !isCustomLevel && level === lvl
                    ? 'bg-amber-50 border-amber-500 text-amber-900 ring-1 ring-amber-500 shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCustomLevel(!isCustomLevel)}
              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              {isCustomLevel ? 'Use preset levels (Level 1 - 4)' : '+ Custom level / ranking'}
            </button>
          </div>

          {isCustomLevel && (
            <input
              type="text"
              placeholder="e.g. Level 5, Advanced, Grade A"
              value={customLevel}
              onChange={(e) => setCustomLevel(e.target.value)}
              className="mt-2 w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20"
              autoFocus
            />
          )}
        </div>

        {/* Mahja Assignment (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {t.students.mahjaLabel}
            </span>
            <span className="text-[11px] font-normal text-slate-400">Optional</span>
          </label>
          <div className="relative">
            <select
              value={mahjaId}
              onChange={(e) => handleMahjaChange(e.target.value)}
              className="w-full text-sm pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">{t.students.noMahjaAssigned}</option>
              {mahjas.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Room Assignment (Optional, depends on Mahja) */}
        {mahjaId && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                {t.students.roomLabel}
              </span>
              <span className="text-[11px] font-normal text-slate-400">Optional</span>
            </label>
            <div className="relative">
              <select
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                className="w-full text-sm pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-slate-700 appearance-none cursor-pointer"
              >
                <option value="">{t.students.noRoomAssigned}</option>
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.description ? `(${r.description})` : ''}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {availableRooms.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No rooms exist in this Mahja yet. You can create rooms in the hierarchy view.
              </p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {studentToEdit ? t.students.update : t.students.save}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

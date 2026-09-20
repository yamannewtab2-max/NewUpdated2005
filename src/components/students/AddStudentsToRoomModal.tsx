import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Room, Mahja } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Search, Check, UserPlus, Building2, DoorOpen, Award } from 'lucide-react';

interface AddStudentsToRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRoom: Room;
  targetMahja: Mahja;
}

export const AddStudentsToRoomModal: React.FC<AddStudentsToRoomModalProps> = ({
  isOpen,
  onClose,
  targetRoom,
  targetMahja,
}) => {
  const { t, students, mahjas, rooms, assignStudentsToRoom } = useApp();
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filterUnassignedOnly, setFilterUnassignedOnly] = useState(false);

  // Available students (those not already in this room)
  const availableStudents = useMemo(() => {
    return students.filter((s) => s.roomId !== targetRoom.id);
  }, [students, targetRoom.id]);

  const filteredStudents = useMemo(() => {
    let list = availableStudents;
    if (filterUnassignedOnly) {
      list = list.filter((s) => !s.roomId);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.level && s.level.toLowerCase().includes(q))
      );
    }
    return list;
  }, [availableStudents, filterUnassignedOnly, search]);

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
    assignStudentsToRoom(selectedIds, targetMahja.id, targetRoom.id);
    onClose();
  };

  const getStudentLocation = (s: { mahjaId?: string | null; roomId?: string | null }) => {
    if (!s.roomId) return 'Unassigned';
    const m = mahjas.find((item) => item.id === s.mahjaId);
    const r = rooms.find((item) => item.id === s.roomId);
    if (m && r) return `${m.name} • ${r.name}`;
    if (r) return r.name;
    return 'Assigned';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.students.addExistingStudentsToRoomTitle
        .replace('{room}', targetRoom.name)
        .replace('{mahja}', targetMahja.name)}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          {t.students.addExistingStudentsToRoomDesc}
        </p>

        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={t.students.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterUnassignedOnly(!filterUnassignedOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors whitespace-nowrap cursor-pointer ${
              filterUnassignedOnly
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {filterUnassignedOnly ? 'Showing Unassigned Only' : 'Filter Unassigned Only'}
          </button>
        </div>

        {/* Select All Row */}
        {filteredStudents.length > 0 && (
          <div className="flex items-center justify-between py-1 text-xs text-slate-500 border-b border-slate-100">
            <span>
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} available
            </span>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              {selectedIds.length === filteredStudents.length
                ? 'Deselect All'
                : 'Select All'}
            </button>
          </div>
        )}

        {/* Students List */}
        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t.students.noStudentsToSelect}
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isSelected = selectedIds.includes(student.id);
              const location = getStudentLocation(student);
              const isUnassigned = !student.roomId;

              return (
                <div
                  key={student.id}
                  onClick={() => handleToggleStudent(student.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 truncate">
                          {student.name}
                        </span>
                        {student.level && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                            {student.level}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span
                          className={`text-[11px] ${
                            isUnassigned ? 'text-amber-600 font-medium' : 'text-slate-400'
                          }`}
                        >
                          {location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {selectedIds.length} student{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex items-center gap-3">
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
              {t.students.assignSelectedStudents}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

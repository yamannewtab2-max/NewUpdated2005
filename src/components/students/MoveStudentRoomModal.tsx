import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Building2, DoorOpen, UserCheck, UserX, ArrowRightLeft } from 'lucide-react';

interface MoveStudentRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const MoveStudentRoomModal: React.FC<MoveStudentRoomModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { t, mahjas, rooms, moveStudentToRoom } = useApp();

  // Selected state: { mahjaId: string | null, roomId: string | null }
  const [selectedLocation, setSelectedLocation] = useState<{
    mahjaId: string | null;
    roomId: string | null;
  }>({
    mahjaId: student.mahjaId || null,
    roomId: student.roomId || null,
  });

  const handleConfirm = () => {
    moveStudentToRoom(student.id, selectedLocation.mahjaId, selectedLocation.roomId);
    onClose();
  };

  const isCurrent = (mahjaId: string | null, roomId: string | null) => {
    return selectedLocation.mahjaId === mahjaId && selectedLocation.roomId === roomId;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.students.moveStudentToRoomTitle}
      maxWidth="md"
    >
      <div className="space-y-4">
        <p className="text-xs text-slate-500">
          {t.students.moveStudentToRoomDesc.replace('{student}', student.name)}
        </p>

        <div className="max-h-80 overflow-y-auto space-y-3 pr-1">
          {/* Option: Unassigned */}
          <div
            onClick={() => setSelectedLocation({ mahjaId: null, roomId: null })}
            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
              isCurrent(null, null)
                ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400 text-amber-950'
                : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                  isCurrent(null, null)
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                <UserX className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold block">
                  {t.students.noMahjaAssigned}
                </span>
                <span className="text-[11px] text-slate-400">
                  Keep student in unassigned pool
                </span>
              </div>
            </div>
            {isCurrent(null, null) && <UserCheck className="w-4 h-4 text-amber-600" />}
          </div>

          {/* Mahja & Room options */}
          {mahjas.map((mahja) => {
            const mahjaRooms = rooms.filter((r) => r.mahjaId === mahja.id);

            return (
              <div
                key={mahja.id}
                className="border border-slate-200 rounded-xl overflow-hidden bg-white"
              >
                <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    {mahja.name}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {mahjaRooms.length} room{mahjaRooms.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="p-2 space-y-1.5">
                  {mahjaRooms.length === 0 ? (
                    <div className="py-2 text-center text-xs text-slate-400">
                      No rooms in this Mahja
                    </div>
                  ) : (
                    mahjaRooms.map((room) => {
                      const selected = isCurrent(mahja.id, room.id);

                      return (
                        <div
                          key={room.id}
                          onClick={() =>
                            setSelectedLocation({ mahjaId: mahja.id, roomId: room.id })
                          }
                          className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                            selected
                              ? 'bg-indigo-50/80 border-indigo-400 ring-1 ring-indigo-400 text-indigo-950 font-semibold'
                              : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <DoorOpen
                              className={`w-4 h-4 ${
                                selected ? 'text-indigo-600' : 'text-slate-400'
                              }`}
                            />
                            <span className="text-sm">{room.name}</span>
                            {room.description && (
                              <span className="text-[11px] text-slate-400 font-normal truncate max-w-[150px]">
                                • {room.description}
                              </span>
                            )}
                          </div>
                          {selected && <UserCheck className="w-4 h-4 text-indigo-600" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
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

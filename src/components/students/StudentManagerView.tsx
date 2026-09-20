import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Mahja, Room } from '../../types';
import { StudentModal } from './StudentModal';
import { MahjaModal } from './MahjaModal';
import { RoomModal } from './RoomModal';
import { AddStudentsToRoomModal } from './AddStudentsToRoomModal';
import { MoveStudentRoomModal } from './MoveStudentRoomModal';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Building2,
  DoorOpen,
  ArrowRightLeft,
  UserPlus,
  UserCheck,
  UserX,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const StudentManagerView: React.FC = () => {
  const {
    t,
    students,
    mahjas,
    rooms,
    deleteStudent,
    deleteMahja,
    deleteRoom,
    getStudentGroups,
    setSelectedGroupId,
    setActiveView,
    moveStudentToRoom,
  } = useApp();

  // Primary view mode: 'hierarchy' | 'all-table' | 'unassigned'
  const [viewMode, setViewMode] = useState<'hierarchy' | 'all-table' | 'unassigned'>('hierarchy');

  // Selected Mahja in hierarchy view
  const [selectedMahjaId, setSelectedMahjaId] = useState<string>(() => {
    return mahjas[0]?.id || '';
  });

  // Make sure selectedMahjaId is valid if mahjas change
  React.useEffect(() => {
    if (mahjas.length > 0) {
      if (!selectedMahjaId || !mahjas.some((m) => m.id === selectedMahjaId)) {
        setSelectedMahjaId(mahjas[0].id);
      }
    } else {
      setSelectedMahjaId('');
    }
  }, [mahjas, selectedMahjaId]);

  // Search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  // Modal states
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [addStudentPrefill, setAddStudentPrefill] = useState<{
    mahjaId?: string;
    roomId?: string;
  }>({});
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToMove, setStudentToMove] = useState<Student | null>(null);

  const [isMahjaModalOpen, setIsMahjaModalOpen] = useState(false);
  const [mahjaToEdit, setMahjaToEdit] = useState<Mahja | null>(null);
  const [mahjaToDelete, setMahjaToDelete] = useState<Mahja | null>(null);

  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [targetRoomMahjaId, setTargetRoomMahjaId] = useState<string>('');
  const [roomToEdit, setRoomToEdit] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const [addExistingRoomTarget, setAddExistingRoomTarget] = useState<{
    mahja: Mahja;
    room: Room;
  } | null>(null);

  // Active Mahja object
  const activeMahja = useMemo(() => {
    return mahjas.find((m) => m.id === selectedMahjaId) || null;
  }, [mahjas, selectedMahjaId]);

  // Rooms for the active Mahja
  const activeMahjaRooms = useMemo(() => {
    if (!selectedMahjaId) return [];
    return rooms.filter((r) => r.mahjaId === selectedMahjaId);
  }, [rooms, selectedMahjaId]);

  // Map of students per room
  const studentsByRoomMap = useMemo(() => {
    const map: Record<string, Student[]> = {};
    for (const r of rooms) {
      map[r.id] = [];
    }
    for (const s of students) {
      if (s.roomId) {
        if (!map[s.roomId]) map[s.roomId] = [];
        map[s.roomId].push(s);
      }
    }
    return map;
  }, [rooms, students]);

  // Unassigned students
  const unassignedStudents = useMemo(() => {
    return students.filter((s) => !s.roomId);
  }, [students]);

  // All students filtered for table view
  const filteredAllStudents = useMemo(() => {
    let list = students;
    if (viewMode === 'unassigned') {
      list = unassignedStudents;
    }
    if (filterLevel !== 'all') {
      list = list.filter((s) => s.level === filterLevel);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.level && s.level.toLowerCase().includes(q))
      );
    }
    return list;
  }, [students, unassignedStudents, viewMode, filterLevel, searchQuery]);

  const getLocationLabel = (student: Student) => {
    if (!student.roomId) return { mahja: 'Unassigned', room: '' };
    const m = mahjas.find((item) => item.id === student.mahjaId);
    const r = rooms.find((item) => item.id === student.roomId);
    return {
      mahja: m?.name || 'Mahja',
      room: r?.name || 'Room',
    };
  };

  const getLevelBadgeColor = (level?: string) => {
    switch (level) {
      case 'Level 1':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Level 2':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Level 3':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Level 4':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Level Unknown':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {t.students.title}
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {students.length} students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-xl">
            {t.students.mahjaSubtitle}
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              setMahjaToEdit(null);
              setIsMahjaModalOpen(true);
            }}
            leftIcon={<Building2 className="w-4 h-4 text-indigo-600" />}
          >
            {t.students.newMahjaBtn}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setStudentToEdit(null);
              setAddStudentPrefill({
                mahjaId: selectedMahjaId || undefined,
              });
              setIsAddStudentOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            {t.students.addStudentBtn}
          </Button>
        </div>
      </div>

      {/* Overview Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Mahja</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{mahjas.length}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <DoorOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rooms</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{rooms.length}</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
            <Users className="w-3.5 h-3.5 text-indigo-600" />
            <span>Total Students</span>
          </div>
          <div className="text-lg font-bold text-slate-900">{students.length}</div>
        </div>

        <div
          onClick={() => setViewMode('unassigned')}
          className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
            unassignedStudents.length > 0
              ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs mb-1">
            <span
              className={`flex items-center gap-1.5 ${
                unassignedStudents.length > 0 ? 'text-amber-800 font-medium' : 'text-slate-500'
              }`}
            >
              <UserX className="w-3.5 h-3.5 text-amber-600" />
              <span>Unassigned</span>
            </span>
            {unassignedStudents.length > 0 && (
              <span className="text-[10px] bg-amber-200/70 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                Action
              </span>
            )}
          </div>
          <div className="text-lg font-bold text-slate-900">{unassignedStudents.length}</div>
        </div>
      </div>

      {/* Main View Mode Selector Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setViewMode('hierarchy')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'hierarchy'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Mahja → Room Hierarchy
          </button>

          <button
            type="button"
            onClick={() => setViewMode('all-table')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'all-table'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            {t.students.allStudentsTab}
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                viewMode === 'all-table'
                  ? 'bg-indigo-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {students.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('unassigned')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
              viewMode === 'unassigned'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            {t.students.unassignedTab}
            {unassignedStudents.length > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  viewMode === 'unassigned'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {unassignedStudents.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: HIERARCHY (Mahja → Room → Students) */}
      {viewMode === 'hierarchy' && (
        <div className="space-y-5">
          {mahjas.length === 0 ? (
            <EmptyState
              icon={<Building2 className="w-8 h-8 text-indigo-500" />}
              title="No Mahjas Created"
              description="Create a Mahja (e.g. Mahja 26) to start organizing rooms and students in the hierarchy."
              actionLabel={t.students.newMahjaBtn}
              onAction={() => {
                setMahjaToEdit(null);
                setIsMahjaModalOpen(true);
              }}
            />
          ) : (
            <>
              {/* Mahja Tabs Navigation */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {mahjas.map((m) => {
                  const mRooms = rooms.filter((r) => r.mahjaId === m.id);
                  const mStudentsCount = students.filter((s) => s.mahjaId === m.id).length;
                  const isSelected = selectedMahjaId === m.id;

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMahjaId(m.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-950 ring-1 ring-indigo-500 shadow-2xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Building2
                        className={`w-4 h-4 ${
                          isSelected ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{m.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {mRooms.length} rooms • {mStudentsCount}
                      </span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => {
                    setMahjaToEdit(null);
                    setIsMahjaModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-dashed border-slate-300 text-slate-600 hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.students.newMahjaBtn}
                </button>
              </div>

              {/* Active Mahja Card Header */}
              {activeMahja && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">
                            {activeMahja.name}
                          </h3>
                          {activeMahja.description && (
                            <p className="text-xs text-slate-500 mt-0.5">
                              {activeMahja.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setTargetRoomMahjaId(activeMahja.id);
                          setRoomToEdit(null);
                          setIsRoomModalOpen(true);
                        }}
                        leftIcon={<DoorOpen className="w-3.5 h-3.5 text-indigo-600" />}
                      >
                        {t.students.newRoomBtn}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setMahjaToEdit(activeMahja);
                          setIsMahjaModalOpen(true);
                        }}
                        leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
                      >
                        {t.students.editMahjaBtn}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMahjaToDelete(activeMahja)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      >
                        {t.students.deleteMahjaBtn}
                      </Button>
                    </div>
                  </div>

                  {/* Rooms inside this Mahja */}
                  <div className="pt-5 space-y-5">
                    {activeMahjaRooms.length === 0 ? (
                      <div className="py-10 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                        <DoorOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <h4 className="text-sm font-semibold text-slate-700">
                          {t.students.emptyMahjaMessage}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1 mb-4 max-w-sm mx-auto">
                          {t.students.emptyMahjaDesc}
                        </p>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            setTargetRoomMahjaId(activeMahja.id);
                            setRoomToEdit(null);
                            setIsRoomModalOpen(true);
                          }}
                          leftIcon={<Plus className="w-3.5 h-3.5" />}
                        >
                          {t.students.newRoomBtn}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {activeMahjaRooms.map((room) => {
                          const roomStudents = studentsByRoomMap[room.id] || [];

                          return (
                            <div
                              key={room.id}
                              className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden"
                            >
                              {/* Room Header */}
                              <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <DoorOpen className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-slate-900">
                                        {room.name}
                                      </span>
                                      <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                        {roomStudents.length} student{roomStudents.length !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    {room.description && (
                                      <span className="text-xs text-slate-400 block mt-0.5">
                                        {room.description}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Room Action Buttons */}
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() =>
                                      setAddExistingRoomTarget({
                                        mahja: activeMahja,
                                        room,
                                      })
                                    }
                                    leftIcon={<UserPlus className="w-3.5 h-3.5 text-indigo-600" />}
                                  >
                                    Add Existing Students
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setStudentToEdit(null);
                                      setAddStudentPrefill({
                                        mahjaId: activeMahja.id,
                                        roomId: room.id,
                                      });
                                      setIsAddStudentOpen(true);
                                    }}
                                    leftIcon={<Plus className="w-3.5 h-3.5 text-slate-600" />}
                                  >
                                    New Student
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setRoomToEdit(room);
                                      setTargetRoomMahjaId(activeMahja.id);
                                      setIsRoomModalOpen(true);
                                    }}
                                    leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setRoomToDelete(room)}
                                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                                    leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                                  >
                                    Delete
                                  </Button>
                                </div>
                              </div>

                              {/* Students in this room */}
                              <div className="p-3">
                                {roomStudents.length === 0 ? (
                                  <div className="py-6 text-center text-xs text-slate-400">
                                    <p className="mb-2">{t.students.emptyRoomMessage}</p>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setAddExistingRoomTarget({
                                          mahja: activeMahja,
                                          room,
                                        })
                                      }
                                      className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                                    >
                                      + Add existing students to this room
                                    </button>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {roomStudents.map((student) => {
                                      const trackingGroups = getStudentGroups(student.id);

                                      return (
                                        <div
                                          key={student.id}
                                          className="p-3 rounded-xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all shadow-2xs group flex flex-col justify-between"
                                        >
                                          <div>
                                            <div className="flex items-start justify-between gap-2">
                                              <span className="text-sm font-semibold text-slate-900 leading-tight">
                                                {student.name}
                                              </span>
                                              {student.level && (
                                                <span
                                                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border shrink-0 ${getLevelBadgeColor(
                                                    student.level
                                                  )}`}
                                                >
                                                  {student.level}
                                                </span>
                                              )}
                                            </div>

                                            {trackingGroups.length > 0 && (
                                              <div className="mt-2 flex items-center gap-1 flex-wrap">
                                                {trackingGroups.slice(0, 2).map((tg) => (
                                                  <span
                                                    key={tg.id}
                                                    onClick={() => {
                                                      setSelectedGroupId(tg.id);
                                                      setActiveView('groups');
                                                    }}
                                                    className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 cursor-pointer"
                                                  >
                                                    {tg.name}
                                                  </span>
                                                ))}
                                                {trackingGroups.length > 2 && (
                                                  <span className="text-[10px] text-slate-400">
                                                    +{trackingGroups.length - 2}
                                                  </span>
                                                )}
                                              </div>
                                            )}
                                          </div>

                                          {/* Student Actions */}
                                          <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100">
                                            <button
                                              type="button"
                                              onClick={() => setStudentToMove(student)}
                                              className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 cursor-pointer"
                                            >
                                              <ArrowRightLeft className="w-3 h-3" />
                                              Move
                                            </button>

                                            <div className="flex items-center gap-1">
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  setStudentToEdit(student);
                                                  setIsAddStudentOpen(true);
                                                }}
                                                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                                title="Edit Student"
                                              >
                                                <Edit2 className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  moveStudentToRoom(student.id, null, null);
                                                }}
                                                className="p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                                                title="Remove from room (Keep Unassigned)"
                                              >
                                                <UserX className="w-3.5 h-3.5" />
                                              </button>
                                              <button
                                                type="button"
                                                onClick={() => setStudentToDelete(student)}
                                                className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                                title="Delete Student"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* VIEW MODE 2 & 3: ALL STUDENTS / UNASSIGNED STUDENTS TABLE */}
      {(viewMode === 'all-table' || viewMode === 'unassigned') && (
        <div className="space-y-4">
          {/* Search & Level Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder={t.students.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-500/20 shadow-2xs text-slate-800"
              />
            </div>

            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-amber-500" />
                Level:
              </span>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-700 font-medium cursor-pointer shadow-2xs"
              >
                <option value="all">All Levels</option>
                <option value="Level 1">Level 1</option>
                <option value="Level 2">Level 2</option>
                <option value="Level 3">Level 3</option>
                <option value="Level 4">Level 4</option>
                <option value="Level Unknown">Level Unknown</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
            {filteredAllStudents.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                {viewMode === 'unassigned'
                  ? 'All students are assigned to rooms! No unassigned students found.'
                  : t.students.noStudentsFound}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">{t.students.tableHeaderStudent}</th>
                      <th className="py-3 px-4">{t.students.tableHeaderLevel}</th>
                      <th className="py-3 px-4">{t.students.tableHeaderMahjaRoom}</th>
                      <th className="py-3 px-4">{t.students.tableHeaderGroups}</th>
                      <th className="py-3 px-4 text-right">{t.students.tableHeaderActions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredAllStudents.map((student) => {
                      const location = getLocationLabel(student);
                      const trackingGroups = getStudentGroups(student.id);

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          {/* Student Name */}
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {student.name}
                          </td>

                          {/* Level / Ranking */}
                          <td className="py-3 px-4">
                            <span
                              className={`font-semibold text-[11px] px-2.5 py-0.5 rounded-full border inline-block ${getLevelBadgeColor(
                                student.level
                              )}`}
                            >
                              {student.level || 'Level 1'}
                            </span>
                          </td>

                          {/* Mahja & Room */}
                          <td className="py-3 px-4">
                            {student.roomId ? (
                              <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                                <span>{location.mahja}</span>
                                <span className="text-slate-300">•</span>
                                <DoorOpen className="w-3.5 h-3.5 text-slate-400" />
                                <span>{location.room}</span>
                              </div>
                            ) : (
                              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium inline-block">
                                Unassigned
                              </span>
                            )}
                          </td>

                          {/* Tracking Groups */}
                          <td className="py-3 px-4">
                            {trackingGroups.length > 0 ? (
                              <div className="flex items-center gap-1 flex-wrap">
                                {trackingGroups.map((tg) => (
                                  <span
                                    key={tg.id}
                                    onClick={() => {
                                      setSelectedGroupId(tg.id);
                                      setActiveView('groups');
                                    }}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium hover:bg-slate-200 cursor-pointer"
                                  >
                                    {tg.name}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400">
                                {t.students.notEnrolled}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStudentToMove(student)}
                                leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                              >
                                Move
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setStudentToEdit(student);
                                  setIsAddStudentOpen(true);
                                }}
                                leftIcon={<Edit2 className="w-3.5 h-3.5 text-slate-500" />}
                              >
                                Edit
                              </Button>
                              <button
                                type="button"
                                onClick={() => setStudentToDelete(student)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                title="Delete student"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODALS */}

      {/* 1. Add / Edit Student Modal */}
      <StudentModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        initialMahjaId={addStudentPrefill.mahjaId}
        initialRoomId={addStudentPrefill.roomId}
      />

      {/* 2. Create / Edit Mahja Modal */}
      <MahjaModal
        isOpen={isMahjaModalOpen}
        onClose={() => {
          setIsMahjaModalOpen(false);
          setMahjaToEdit(null);
        }}
        mahjaToEdit={mahjaToEdit}
        onCreated={(created) => {
          setSelectedMahjaId(created.id);
        }}
      />

      {/* 3. Create / Edit Room Modal */}
      <RoomModal
        isOpen={isRoomModalOpen}
        onClose={() => {
          setIsRoomModalOpen(false);
          setRoomToEdit(null);
        }}
        targetMahjaId={targetRoomMahjaId}
        roomToEdit={roomToEdit}
      />

      {/* 4. Add Existing Students to Room Modal */}
      {addExistingRoomTarget && (
        <AddStudentsToRoomModal
          isOpen={true}
          onClose={() => setAddExistingRoomTarget(null)}
          targetMahja={addExistingRoomTarget.mahja}
          targetRoom={addExistingRoomTarget.room}
        />
      )}

      {/* 5. Move Student Between Rooms Modal */}
      {studentToMove && (
        <MoveStudentRoomModal
          isOpen={true}
          onClose={() => setStudentToMove(null)}
          student={studentToMove}
        />
      )}

      {/* 6. Delete Student Confirmation */}
      {studentToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setStudentToDelete(null)}
          onConfirm={() => {
            deleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }}
          title={t.students.deleteConfirmTitle}
          message={t.students.deleteConfirmMessage.replace(
            '{name}',
            studentToDelete.name
          )}
          confirmText={t.students.deleteBtn}
          variant="danger"
        />
      )}

      {/* 7. Delete Mahja Confirmation */}
      {mahjaToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setMahjaToDelete(null)}
          onConfirm={() => {
            deleteMahja(mahjaToDelete.id);
            setMahjaToDelete(null);
          }}
          title={t.students.deleteMahjaConfirmTitle}
          message={t.students.deleteMahjaConfirmMessage.replace(
            '{name}',
            mahjaToDelete.name
          )}
          confirmText={t.students.deleteMahjaBtn}
          variant="danger"
        />
      )}

      {/* 8. Delete Room Confirmation */}
      {roomToDelete && (
        <ConfirmDialog
          isOpen={true}
          onClose={() => setRoomToDelete(null)}
          onConfirm={() => {
            deleteRoom(roomToDelete.id);
            setRoomToDelete(null);
          }}
          title={t.students.deleteRoomConfirmTitle}
          message={t.students.deleteRoomConfirmMessage.replace(
            '{name}',
            roomToDelete.name
          )}
          confirmText={t.students.deleteRoomBtn}
          variant="danger"
        />
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, Mahja, Room } from '../../types';
import { StudentModal } from './StudentModal';
import { MahjaModal } from './MahjaModal';
import { RoomModal } from './RoomModal';
import { AddStudentsToRoomModal } from './AddStudentsToRoomModal';
import { StudentProfileModal } from './StudentProfileModal';
import { MahjaProfileModal } from './MahjaProfileModal';
import { WhatsAppButton } from '../common/WhatsAppButton';
import { levelNumber, levelBadgeColor, levelLabels } from '../../utils/level';
import { currentMonthKey } from '../../utils/months';
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
  UserPlus,
  UserCheck,
  UserX,
  Award,
  Layers,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

/** Square icon-only action button — keeps card headers inside their box instead of overflowing. */
const IconAction: React.FC<{
  title: string;
  onClick: () => void;
  danger?: boolean;
  children: React.ReactNode;
}> = ({ title, onClick, danger, children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={`p-1.5 rounded-lg border bg-white shrink-0 transition-colors cursor-pointer ${
      danger
        ? 'border-red-200 text-red-600 hover:bg-red-50'
        : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-800 hover:bg-slate-50'
    }`}
  >
    {children}
  </button>
);

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
    monthlyPayments,
    payments,
  } = useApp();

  // Primary view mode: 'hierarchy' | 'all-table' | 'unassigned'
  const [viewMode, setViewMode] = useState<'hierarchy' | 'all-table' | 'unassigned'>('hierarchy');

  // Selected Mahja in hierarchy view
  const [selectedMahjaId, setSelectedMahjaId] = useState<string>(() => {
    return mahjas[0]?.id || '';
  });

  // Mahja whose rooms are open; null = show the Mahja button directory
  const [openMahjaId, setOpenMahjaId] = useState<string | null>(null);

  // Room whose students are open; null = show the room button list
  const [openRoomId, setOpenRoomId] = useState<string | null>(null);

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

  // Leave the rooms view if the Mahja being shown was deleted
  React.useEffect(() => {
    if (openMahjaId && !mahjas.some((m) => m.id === openMahjaId)) {
      setOpenMahjaId(null);
    }
  }, [mahjas, openMahjaId]);

  // Leave the students view if the room being shown was deleted
  React.useEffect(() => {
    if (openRoomId && !rooms.some((r) => r.id === openRoomId)) {
      setOpenRoomId(null);
    }
  }, [rooms, openRoomId]);

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
  const [profileStudentId, setProfileStudentId] = useState<string | null>(null);
  const [profileMahjaId, setProfileMahjaId] = useState<string | null>(null);

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

  // Room currently opened for its student list
  const activeRoom = useMemo(() => {
    return rooms.find((r) => r.id === openRoomId) || null;
  }, [rooms, openRoomId]);

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

  // Students inside the opened room
  const activeRoomStudents = useMemo(() => {
    if (!activeRoom) return [];
    return studentsByRoomMap[activeRoom.id] || [];
  }, [activeRoom, studentsByRoomMap]);

  /**
   * Paid / late for the current month: the monthly ledger counts, and so does a
   * paid record in any tracking list.
   */
  const studentMonthStatus = (studentId: string): 'paid' | 'partial' | 'unpaid' => {
    const key = currentMonthKey();
    const record = monthlyPayments.find((p) => p.studentId === studentId && p.month === key);
    if (record?.status === 'paid') return 'paid';
    if (payments.some((p) => p.studentId === studentId && p.status === 'paid')) return 'paid';
    if (record?.status === 'partial') return 'partial';
    return 'unpaid';
  };

  // Student whose profile is open (kept by id so edits stay in sync)
  const profileStudent = useMemo(
    () => students.find((s) => s.id === profileStudentId) || null,
    [students, profileStudentId]
  );

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

  const getLevelBadgeColor = levelBadgeColor;

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
              title={t.students.noMahjasTitle}
              description={t.students.noMahjasDesc}
              actionLabel={t.students.newMahjaBtn}
              onAction={() => {
                setMahjaToEdit(null);
                setIsMahjaModalOpen(true);
              }}
            />
          ) : (
            <>
              {/* Mahja button directory (replaced by the rooms view once a Mahja is opened) */}
              {!openMahjaId && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                      {t.students.mahjasTitle}
                    </h3>
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {mahjas.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{t.students.mahjaDirectoryHint}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {mahjas.map((m) => {
                    const mRooms = rooms.filter((r) => r.mahjaId === m.id);
                    const mStudentsCount = students.filter((s) => s.mahjaId === m.id).length;

                    return (
                      <div key={m.id} className="relative group">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedMahjaId(m.id);
                            setOpenMahjaId(m.id);
                            setOpenRoomId(null);
                          }}
                          className="w-full h-full text-left bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-3 transition-all cursor-pointer hover:border-indigo-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                        <div className="flex items-start justify-between gap-3 pr-10">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div dir="auto" className="text-sm font-bold text-slate-900 truncate">
                                {m.name}
                              </div>
                              {m.description && (
                                <div dir="auto" className="text-xs text-slate-500 truncate">
                                  {m.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            {mRooms.length} {t.students.roomsCountLabel}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            {mStudentsCount} {t.students.studentsCountLabel}
                          </span>
                          <span className="ml-auto text-[11px] font-semibold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            {t.students.openMahjaLabel}
                          </span>
                        </div>
                        </button>

                        {/* Mahja profile (info) */}
                        <button
                          type="button"
                          title={t.students.mahjaInfoBtn}
                          aria-label={t.students.mahjaInfoBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileMahjaId(m.id);
                          }}
                          className="absolute top-3 right-3 p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50 transition-colors cursor-pointer"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}

                  {/* New Mahja tile */}
                  <button
                    type="button"
                    onClick={() => {
                      setMahjaToEdit(null);
                      setIsMahjaModalOpen(true);
                    }}
                    className="rounded-2xl border border-dashed border-slate-300 p-4 flex items-center justify-center gap-2 min-h-[104px] text-xs font-semibold text-slate-600 transition-colors cursor-pointer hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50"
                  >
                    <Plus className="w-4 h-4" />
                    {t.students.newMahjaBtn}
                  </button>
                </div>
              </div>
              )}

              {/* Back to the Mahja button directory */}
              {activeMahja && openMahjaId && (
                <button
                  type="button"
                  onClick={() => {
                    setOpenRoomId(null);
                    setOpenMahjaId(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t.students.backToMahjas}
                </button>
              )}

              {/* Active Mahja Card Header */}
              {openMahjaId && activeMahja && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 dir="auto" className="text-lg font-bold text-slate-900">
                            {activeMahja.name}
                          </h3>
                          {activeMahja.description && (
                            <p dir="auto" className="text-xs text-slate-500 mt-0.5">
                              {activeMahja.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Icon-only actions so the header never overflows */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <IconAction
                        title={t.students.newRoomBtn}
                        onClick={() => {
                          setTargetRoomMahjaId(activeMahja.id);
                          setRoomToEdit(null);
                          setIsRoomModalOpen(true);
                        }}
                      >
                        <DoorOpen className="w-4 h-4" />
                      </IconAction>
                      <IconAction
                        title={t.students.editMahjaBtn}
                        onClick={() => {
                          setMahjaToEdit(activeMahja);
                          setIsMahjaModalOpen(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4" />
                      </IconAction>
                      <IconAction
                        title={t.students.deleteMahjaBtn}
                        danger
                        onClick={() => setMahjaToDelete(activeMahja)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconAction>
                    </div>
                  </div>

                  {/* Rooms inside this Mahja */}
                  <div className="pt-5 space-y-5">
                    <div className="flex items-center gap-2">
                      <DoorOpen className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-sm font-bold text-slate-800">
                        {t.students.roomsHeading.replace('{mahja}', '').trim()}{' '}
                        <span dir="auto">{activeMahja.name}</span>
                      </h4>
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {activeMahjaRooms.length}
                      </span>
                    </div>
                    {openRoomId && activeRoom ? (
                      <div className="space-y-3">
                        {/* Back to the room list */}
                        <button
                          type="button"
                          onClick={() => setOpenRoomId(null)}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          {t.students.backToRooms}
                        </button>

                        <div className="rounded-xl border border-slate-200 bg-slate-50/40 overflow-hidden">
                          {/* Room Header */}
                          <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <DoorOpen className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span dir="auto" className="text-sm font-bold text-slate-900">
                                    {activeRoom.name}
                                  </span>
                                  <span className="text-[11px] font-mono px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 font-semibold">
                                    {activeRoomStudents.length} {t.students.studentsCountLabel}
                                  </span>
                                </div>
                                {activeRoom.description && (
                                  <span dir="auto" className="text-xs text-slate-400 block mt-0.5">
                                    {activeRoom.description}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Icon-only room actions */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <IconAction
                                title={t.students.addExistingStudentsToRoomBtn}
                                onClick={() =>
                                  setAddExistingRoomTarget({
                                    mahja: activeMahja,
                                    room: activeRoom,
                                  })
                                }
                              >
                                <UserPlus className="w-4 h-4" />
                              </IconAction>
                              <IconAction
                                title={t.students.addStudentBtn}
                                onClick={() => {
                                  setStudentToEdit(null);
                                  setAddStudentPrefill({
                                    mahjaId: activeMahja.id,
                                    roomId: activeRoom.id,
                                  });
                                  setIsAddStudentOpen(true);
                                }}
                              >
                                <Plus className="w-4 h-4" />
                              </IconAction>
                              <IconAction
                                title={t.students.editRoomBtn}
                                onClick={() => {
                                  setRoomToEdit(activeRoom);
                                  setTargetRoomMahjaId(activeMahja.id);
                                  setIsRoomModalOpen(true);
                                }}
                              >
                                <Edit2 className="w-4 h-4" />
                              </IconAction>
                              <IconAction
                                title={t.students.deleteRoomBtn}
                                danger
                                onClick={() => setRoomToDelete(activeRoom)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </IconAction>
                            </div>
                          </div>

                          {/* Students in this room */}
                          <div className="p-3">
                            {activeRoomStudents.length === 0 ? (
                              <div className="py-6 text-center text-xs text-slate-400">
                                <p className="mb-2">{t.students.emptyRoomMessage}</p>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setAddExistingRoomTarget({
                                      mahja: activeMahja,
                                      room: activeRoom,
                                    })
                                  }
                                  className="text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                                >
                                  {t.students.addExistingStudentsToRoomBtn}
                                </button>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {activeRoomStudents.map((student) => {
                                  const status = studentMonthStatus(student.id);
                                  return (
                                    <div key={student.id} className="flex items-center gap-1 min-w-0">
                                      <button
                                        type="button"
                                        onClick={() => setProfileStudentId(student.id)}
                                        title={t.students.viewProfileBtn}
                                      className={`w-full flex items-center gap-2 rounded-xl border px-3 py-2 min-w-0 text-start transition-colors cursor-pointer ${
                                        status === 'paid'
                                          ? 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
                                          : status === 'partial'
                                          ? 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
                                          : 'border-slate-200 bg-white hover:bg-slate-50'
                                      }`}
                                    >
                                      <span
                                        className={`shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                          status === 'paid'
                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                            : status === 'partial'
                                            ? 'border-amber-200 bg-amber-50 text-amber-800'
                                            : 'border-slate-200 bg-slate-50 text-slate-600'
                                        }`}
                                      >
                                        {status === 'paid' ? (
                                          <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                          <Clock className="w-3 h-3" />
                                        )}
                                        {status === 'paid'
                                          ? t.students.paidBadge
                                          : status === 'partial'
                                          ? t.students.partialBadge
                                          : t.students.unpaidBadge}
                                      </span>
                                      <span className="flex-1" />
                                      <span
                                        dir="auto"
                                        className="text-sm font-semibold text-slate-900 truncate max-w-[60%] text-right"
                                      >
                                          {student.name}
                                        </span>
                                      </button>
                                      <WhatsAppButton student={student} />
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : activeMahjaRooms.length === 0 ? (
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
                      <div className="space-y-2">
                        {/* One button per room, names stacked one per line */}
                        {activeMahjaRooms.map((room) => {
                          const roomStudents = studentsByRoomMap[room.id] || [];

                          return (
                            <button
                              key={room.id}
                              type="button"
                              onClick={() => setOpenRoomId(room.id)}
                              className="group w-full text-left bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 transition-all cursor-pointer hover:border-indigo-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                            >
                              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                                <DoorOpen className="w-4 h-4" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div dir="auto" className="text-sm font-bold text-slate-900 truncate">
                                  {room.name}
                                </div>
                                {room.description && (
                                  <div dir="auto" className="text-xs text-slate-500 truncate">
                                    {room.description}
                                  </div>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                                {roomStudents.length} {t.students.studentsCountLabel}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 shrink-0" />
                            </button>
                          );
                        })}

                        {/* New Room button row */}
                        <button
                          type="button"
                          onClick={() => {
                            setTargetRoomMahjaId(activeMahja.id);
                            setRoomToEdit(null);
                            setIsRoomModalOpen(true);
                          }}
                          className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 transition-colors cursor-pointer hover:text-indigo-600 hover:border-indigo-400 hover:bg-indigo-50/50"
                        >
                          <Plus className="w-4 h-4" />
                          {t.students.newRoomBtn}
                        </button>
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
                {levelLabels().map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
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

                  <tbody className="divide-y divide-slate-100 text-xs">
                    {filteredAllStudents.map((student) => {
                      const status = studentMonthStatus(student.id);

                      return (
                        <tr
                          key={student.id}
                          onClick={() => setProfileStudentId(student.id)}
                          title={t.students.viewProfileBtn}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                        >
                          {/* Paid this month? */}
                          <td className="py-2.5 px-4 whitespace-nowrap w-[1%]">
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                status === 'paid'
                                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                  : status === 'partial'
                                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                                  : 'border-slate-200 bg-slate-50 text-slate-600'
                              }`}
                            >
                              {status === 'paid' ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3" />
                              )}
                              {status === 'paid'
                                ? t.students.paidBadge
                                : status === 'partial'
                                ? t.students.partialBadge
                                : t.students.unpaidBadge}
                            </span>
                          </td>

                          {/* Name */}
                          <td className="py-2.5 px-4 min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span
                                dir="auto"
                                className="flex-1 text-sm font-semibold text-slate-900 truncate text-right"
                              >
                                {student.name}
                              </span>
                              <WhatsAppButton student={student} />
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
          // return to the button directory so the new Mahja button is visible
          setOpenMahjaId(null);
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

      {/* Mahja profile: rooms, students, month payment status */}
      {profileMahjaId && (
        <MahjaProfileModal mahjaId={profileMahjaId} onClose={() => setProfileMahjaId(null)} />
      )}

      {/* Student profile: tracking groups + monthly payment history */}
      {profileStudent && (
        <StudentProfileModal
          student={profileStudent}
          onClose={() => setProfileStudentId(null)}
          onEdit={(s) => {
            setProfileStudentId(null);
            setStudentToEdit(s);
            setIsAddStudentOpen(true);
          }}
          onRemoveFromRoom={(s) => {
            setProfileStudentId(null);
            moveStudentToRoom(s.id, null, null);
          }}
          onDelete={(s) => {
            setProfileStudentId(null);
            setStudentToDelete(s);
          }}
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

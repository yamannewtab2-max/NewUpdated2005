import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Student,
  Mahja,
  Room,
  StudentGroup,
  TrackingGroup,
  PaymentRecord,
  MonthlyPayment,
  PaymentEntry,
  Language,
  Currency,
  ActiveView,
  Toast,
  GroupStats,
  GlobalStats,
  PaymentStatus,
} from '../types';
import { initialStudents, initialMahjas, initialRooms, initialGroups, initialPayments } from '../mock/initialData';
import { buildRosterSeed } from '../data/roster';
import { translations } from '../i18n/translations';
import { monthStatus } from '../utils/monthlyPayments';
import { normalizeLevel } from '../utils/level';
import { currentMonthKey } from '../utils/months';
import { bootstrapCloud, pushCloudState, queueCloudWrite, type CloudStatus, type SyncedKey } from '../lib/cloudSync';
import { signInWithGoogle, signOutUser, watchAuth } from '../lib/auth';

interface AppContextType {
  // State
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (curr: Currency) => void;
  currencySymbol: string;
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
  t: typeof translations.en;
  
  // Data
  students: Student[];
  mahjas: Mahja[];
  rooms: Room[];
  studentGroups: StudentGroup[];
  groups: TrackingGroup[];
  payments: PaymentRecord[];
  toasts: Toast[];

  // Student Actions
  addStudent: (data: {
    name: string;
    phone?: string;
    level?: string;
    mahjaId?: string | null;
    roomId?: string | null;
    studentGroupId?: string | null;
    notes?: string;
  }) => Student;
  updateStudent: (
    id: string,
    data: {
      name: string;
      phone?: string;
      level?: string;
      mahjaId?: string | null;
      roomId?: string | null;
      studentGroupId?: string | null;
      notes?: string;
    }
  ) => void;
  deleteStudent: (id: string) => void;

  // Mahja Management
  addMahja: (data: { name: string; description?: string }) => Mahja;
  updateMahja: (id: string, data: { name?: string; description?: string }) => void;
  deleteMahja: (id: string) => void;
  getMahja: (id: string) => Mahja | undefined;

  // Room Management
  addRoom: (data: { mahjaId: string; name: string; description?: string }) => Room;
  updateRoom: (id: string, data: { name?: string; description?: string }) => void;
  deleteRoom: (id: string) => void;
  getRoom: (id: string) => Room | undefined;
  getRoomsByMahja: (mahjaId: string) => Room[];

  // Student Room & Hierarchy Assignment
  assignStudentsToRoom: (studentIds: string[], mahjaId: string | null, roomId: string | null) => void;
  moveStudentToRoom: (studentId: string, mahjaId: string | null, roomId: string | null) => void;
  getStudentsByRoom: (roomId: string) => Student[];
  getStudentsByMahja: (mahjaId: string) => Student[];
  getUnassignedStudents: () => Student[];

  // Student Groups (Inside Student Manager)
  addStudentGroup: (data: { name: string; description?: string }) => StudentGroup;
  updateStudentGroup: (id: string, data: { name?: string; description?: string }) => void;
  deleteStudentGroup: (id: string) => void;
  assignStudentsToGroup: (studentIds: string[], studentGroupId: string | null) => void;
  moveStudent: (studentId: string, targetStudentGroupId: string | null) => void;
  getStudentGroup: (id: string) => StudentGroup | undefined;

  // Group Actions
  addGroup: (data: {
    name: string;
    parentId: string | null;
    paymentAmount: number;
    studentIds: string[];
    description?: string;
  }) => TrackingGroup;
  updateGroup: (id: string, data: Partial<Omit<TrackingGroup, 'id' | 'createdAt'>>) => void;
  deleteGroup: (id: string) => void;
  setGroupStudents: (groupId: string, studentIds: string[]) => void;

  // Payment Actions
  updatePayment: (groupId: string, studentId: string, paidAmount: number, requiredAmount?: number) => void;
  markAsPaid: (groupId: string, studentId: string) => void;

  // Monthly Payments — every student owes a fee for every month
  monthlyPayments: MonthlyPayment[];
  monthlyDues: Record<string, number>;
  /** Due for a student: explicit monthly due, else the sum of their tracking-group amounts. */
  suggestedMonthlyDue: (studentId: string) => number;
  /** What a student still owes — used for the WhatsApp reminder. */
  getStudentUnpaidAmount: (studentId: string) => number;
  setStudentMonthlyDue: (studentId: string, amount: number) => void;
  /** Record (or overwrite) the amount paid by a student for a given 'YYYY-MM'. */
  recordMonthlyPayment: (
    studentId: string,
    month: string,
    amountPaid: number,
    notes?: string,
    amountDueOverride?: number
  ) => void;
  /** Mark a month fully paid using the student's monthly due. */
  markMonthPaid: (studentId: string, month: string) => void;
  clearMonthlyPayment: (studentId: string, month: string) => void;

  // Recorded payments for student-less lists
  paymentEntries: PaymentEntry[];
  addPaymentEntry: (groupId: string, amount: number, note?: string) => void;
  deletePaymentEntry: (id: string) => void;
  /** Reusable "what was it for" phrases: click one to refill the box. */
  notePresets: string[];
  addNotePreset: (phrase: string) => void;
  removeNotePreset: (phrase: string) => void;

  // Helpers & Queries
  formatMoney: (amount: number) => string;
  getGroup: (id: string) => TrackingGroup | undefined;
  getSubgroups: (parentId: string | null) => TrackingGroup[];
  getGroupHierarchy: (groupId: string) => TrackingGroup[];
  getAllDescendantGroupIds: (groupId: string) => string[];
  getGroupStats: (groupId: string, includeSubgroups?: boolean) => GroupStats;
  getGlobalStats: () => GlobalStats;
  getStudent: (id: string) => Student | undefined;
  getStudentGroups: (studentId: string) => TrackingGroup[];
  getStudentPayment: (groupId: string, studentId: string) => PaymentRecord | undefined;

  // Toast Actions
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // System
  resetToMockData: () => void;
  /** Where the Firebase copy stands: 'downloaded' (cloud is the source), 'seeded'
   *  (this device pushed its data up), 'signedOut' / 'denied' (no access),
   *  'offline' (no cloud reachable), 'loading'. */
  cloudStatus: CloudStatus;
  /** The allowed Google account currently signed in, or null. */
  authEmail: string | null;
  /** Open the Google account chooser (only the allowed accounts get through). */
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Force-upload this device's data, replacing the cloud copy. */
  pushLocalToCloud: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/** How long a notification stays on screen before removing itself. */
const TOAST_AUTO_DISMISS_MS = 500;

const STORAGE_KEYS = {
  STUDENTS: 'trackly_students_clean_v4',
  MAHJAS: 'trackly_mahjas_v2',
  ROOMS: 'trackly_rooms_v2',
  STUDENT_GROUPS: 'trackly_student_groups_v1',
  GROUPS: 'trackly_groups_clean_v2',
  PAYMENTS: 'trackly_payments_clean_v2',
  MONTHLY_PAYMENTS: 'trackly_monthly_payments_v1',
  MONTHLY_DUES: 'trackly_monthly_dues_v1',
  PAYMENT_ENTRIES: 'trackly_payment_entries_v1',
  NOTE_PRESETS: 'trackly_note_presets_v1',
  ROSTER_SEEDED: 'trackly_roster_26_31_seeded_v1',
  NOTE_PRESETS_SEEDED: 'trackly_note_presets_seeded_v1',
  LANGUAGE: 'trackly_lang_v1',
  CURRENCY: 'trackly_currency_v2',
};

/**
 * Default "what was it for" phrases — the institution's expense items.
 * (على حسب = as needed, شهريا = monthly; the chip carries the item name only.)
 */
const DEFAULT_NOTE_PRESETS = [
  'الرز', // rice — as needed
  'الإدم', // sides — as needed
  'أجرة الطباخ', // cook's wage — monthly
  'الشبكة', // network — monthly
  'الكهرباء', // electricity — monthly
  'غير ذلك', // other — as needed
];

/**
 * One-time import of the real dormitory roster (mahjas 26–31 from the PDF).
 * On the first load after this ships, the demo students/rooms/mahjas are replaced
 * by the roster, and student-linked data that pointed at the demo set is dropped.
 * Payment phrases (note presets) are kept.
 */
const ROSTER_IMPORT_PENDING = (() => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ROSTER_SEEDED) !== '1';
  } catch {
    return false;
  }
})();

const ROSTER_SEED = buildRosterSeed();

if (ROSTER_IMPORT_PENDING) {
  try {
    localStorage.setItem(STORAGE_KEYS.ROSTER_SEEDED, '1');
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTHLY_PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTHLY_DUES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_ENTRIES);
  } catch {
    /* ignore */
  }
}

// Clean legacy demo data from localStorage if present
try {
  localStorage.removeItem('trackly_students_v1');
  localStorage.removeItem('trackly_students_clean_v2');
  localStorage.removeItem('trackly_students_clean_v3');
  localStorage.removeItem('trackly_mahjas_v1');
  localStorage.removeItem('trackly_rooms_v1');
} catch {
  // ignore
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local storage initializers with safe fallbacks
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      return (saved === 'id' || saved === 'en') ? saved : 'en';
    } catch {
      return 'en';
    }
  });

  const [currency, setCurrencyState] = useState<Currency>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY);
      return (saved === 'USD' || saved === 'IDR' || saved === 'EUR') ? saved : 'IDR';
    } catch {
      return 'IDR';
    }
  });

  const currencySymbol = useMemo(() => {
    if (currency === 'IDR') return 'Rp';
    if (currency === 'EUR') return '€';
    return '$';
  }, [currency]);

  const [mahjas, setMahjas] = useState<Mahja[]>(() => {
    if (ROSTER_IMPORT_PENDING) return ROSTER_SEED.mahjas as Mahja[];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAHJAS);
      return saved ? JSON.parse(saved) : initialMahjas;
    } catch {
      return initialMahjas;
    }
  });

  const [rooms, setRooms] = useState<Room[]>(() => {
    if (ROSTER_IMPORT_PENDING) return ROSTER_SEED.rooms as Room[];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROOMS);
      return saved ? JSON.parse(saved) : initialRooms;
    } catch {
      return initialRooms;
    }
  });

  const [students, setStudents] = useState<Student[]>(() => {
    // Older builds could store a level as a number; normalise so every view can
    // treat student.level as a string (a numeric level used to crash the wizard).
    const clean = (list: Student[]): Student[] => list.map((s) => ({ ...s, level: normalizeLevel(s.level) }));
    if (ROSTER_IMPORT_PENDING) return clean(ROSTER_SEED.students as Student[]);
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (saved) {
        const parsed: Student[] = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          return clean(parsed);
        }
      }
      return clean(initialStudents);
    } catch {
      return clean(initialStudents);
    }
  });

  const [studentGroups, setStudentGroups] = useState<StudentGroup[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.STUDENT_GROUPS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [groups, setGroups] = useState<TrackingGroup[]>(() => {
    if (ROSTER_IMPORT_PENDING) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GROUPS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((g: any) => ({
            id: String(g.id || `group-${Date.now()}`),
            name: String(g.name || 'Untitled Group'),
            parentId: g.parentId || null,
            paymentAmount: Number(g.paymentAmount) || 0,
            studentIds: Array.isArray(g.studentIds) ? g.studentIds.filter(Boolean) : [],
            createdAt: g.createdAt || new Date().toISOString(),
            description: g.description,
          }));
        }
      }
      return initialGroups;
    } catch {
      return initialGroups;
    }
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    if (ROSTER_IMPORT_PENDING) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((p: any) => ({
            id: String(p.id || `pay-${Date.now()}`),
            groupId: String(p.groupId || ''),
            studentId: String(p.studentId || ''),
            requiredAmount: Number(p.requiredAmount) || 0,
            paidAmount: Number(p.paidAmount) || 0,
            status: (p.status === 'paid' || p.status === 'partial' || p.status === 'unpaid') ? p.status : 'unpaid',
            lastUpdated: p.lastUpdated || new Date().toISOString(),
            notes: p.notes,
          }));
        }
      }
      return initialPayments;
    } catch {
      return initialPayments;
    }
  });

  const [monthlyPayments, setMonthlyPayments] = useState<MonthlyPayment[]>(() => {
    if (ROSTER_IMPORT_PENDING) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_PAYMENTS);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        return parsed
          .map((p: any) => ({
            id: String(p.id || `mp-${p.studentId}-${p.month}`),
            studentId: String(p.studentId || ''),
            month: String(p.month || ''),
            amountDue: Number(p.amountDue) || 0,
            amountPaid: Number(p.amountPaid) || 0,
            status: (p.status === 'paid' || p.status === 'partial' || p.status === 'unpaid') ? p.status : 'unpaid',
            paidAt: p.paidAt,
            notes: p.notes,
          }))
          .filter((p: MonthlyPayment) => p.studentId && p.month);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [monthlyDues, setMonthlyDues] = useState<Record<string, number>>(() => {
    if (ROSTER_IMPORT_PENDING) return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MONTHLY_DUES);
      const parsed = saved ? JSON.parse(saved) : null;
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  });

  const [paymentEntries, setPaymentEntries] = useState<PaymentEntry[]>(() => {
    if (ROSTER_IMPORT_PENDING) return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENT_ENTRIES);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        return parsed
          .map((e: any) => ({
            id: String(e.id || `pe-${Date.now()}`),
            groupId: String(e.groupId || ''),
            amount: Number(e.amount) || 0,
            note: e.note,
            createdAt: e.createdAt || new Date().toISOString(),
          }))
          .filter((e: PaymentEntry) => e.groupId);
      }
      return [];
    } catch {
      return [];
    }
  });

  const [activeView, setActiveView] = useState<ActiveView>('dashboard');
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Translations
  const t = useMemo(() => translations[language], [language]);

  // Persist state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MAHJAS, JSON.stringify(mahjas));
    } catch (e) {
      console.warn('Failed saving mahjas to localStorage', e);
    }
  }, [mahjas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
    } catch (e) {
      console.warn('Failed saving rooms to localStorage', e);
    }
  }, [rooms]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    } catch (e) {
      console.warn('Failed saving students to localStorage', e);
    }
  }, [students]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STUDENT_GROUPS, JSON.stringify(studentGroups));
    } catch (e) {
      console.warn('Failed saving student groups to localStorage', e);
    }
  }, [studentGroups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
    } catch (e) {
      console.warn('Failed saving groups to localStorage', e);
    }
  }, [groups]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.warn('Failed saving payments to localStorage', e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_PAYMENTS, JSON.stringify(monthlyPayments));
    } catch (e) {
      console.warn('Failed saving monthly payments to localStorage', e);
    }
  }, [monthlyPayments]);

  const [notePresets, setNotePresets] = useState<string[]>(() => {
    let stored: string[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTE_PRESETS);
      const parsed = saved ? JSON.parse(saved) : null;
      if (Array.isArray(parsed)) {
        stored = parsed.map((w: any) => String(w)).filter((w: string) => w.trim().length > 0);
      }
    } catch {
      /* ignore */
    }

    // Seed the expense items once (also for devices that already stored an empty
    // list before these defaults existed). After that, what the user keeps is final.
    try {
      if (localStorage.getItem(STORAGE_KEYS.NOTE_PRESETS_SEEDED) !== '1') {
        localStorage.setItem(STORAGE_KEYS.NOTE_PRESETS_SEEDED, '1');
        const merged = [...DEFAULT_NOTE_PRESETS, ...stored.filter((w) => !DEFAULT_NOTE_PRESETS.includes(w))];
        localStorage.setItem(STORAGE_KEYS.NOTE_PRESETS, JSON.stringify(merged));
        return merged;
      }
    } catch {
      /* ignore */
    }

    return stored.length > 0 ? stored : stored;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTE_PRESETS, JSON.stringify(notePresets));
    } catch (e) {
      console.warn('Failed saving note presets to localStorage', e);
    }
  }, [notePresets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENT_ENTRIES, JSON.stringify(paymentEntries));
    } catch (e) {
      console.warn('Failed saving payment entries to localStorage', e);
    }
  }, [paymentEntries]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MONTHLY_DUES, JSON.stringify(monthlyDues));
    } catch (e) {
      console.warn('Failed saving monthly dues to localStorage', e);
    }
  }, [monthlyDues]);

  // ---------------------------------------------------------------------------
  // Firebase / Firestore sync (signed in with Google)
  // ---------------------------------------------------------------------------
  // localStorage stays the app's own persistence; Firestore is a second copy so
  // the real roster and the payment history survive a cleared browser, a new
  // phone, or reinstalling. Only the allowed Google accounts can read or write it
  // (see the Firestore rules), so the sync starts when a user signs in — and the
  // app stays fully usable from localStorage while signed out.
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>('loading');
  const [authEmail, setAuthEmail] = useState<string | null>(null);
  const cloudBooted = useRef(false);
  // Kept current on every render so a sign-in uploads what this device holds *now*.
  const localSnapshot = useRef<Record<string, unknown>>({});
  useEffect(() => {
    localSnapshot.current = {
      mahjas,
      rooms,
      students,
      studentGroups,
      groups,
      payments,
      monthlyPayments,
      monthlyDues,
      paymentEntries,
      notePresets,
    };
  });

  useEffect(() => {
    let stopped = false;
    let unsubscribe: (() => void) | undefined;

    // No "cancelled" guard on the bootstrap itself: React StrictMode mounts effects
    // twice in development, and swallowing the second run's result left the app
    // stuck on 'loading' forever. The ref makes the cloud round-trip happen once
    // per signed-in session, so applying its result unconditionally is correct.
    const runBootstrap = () => {
      cloudBooted.current = true;
      setCloudStatus('loading');
      void bootstrapCloud(localSnapshot.current)
        .then(({ status, applied }) => {
          const has = (key: SyncedKey) => applied[key] !== undefined;
          const cloudStudents = applied.students;
          if (Array.isArray(cloudStudents) && cloudStudents.length > 0) {
            setStudents((cloudStudents as Student[]).map((s) => ({ ...s, level: normalizeLevel(s.level) })));
          }
          if (has('mahjas')) setMahjas(applied.mahjas as Mahja[]);
          if (has('rooms')) setRooms(applied.rooms as Room[]);
          if (has('studentGroups')) setStudentGroups(applied.studentGroups as StudentGroup[]);
          if (has('groups')) setGroups(applied.groups as TrackingGroup[]);
          if (has('payments')) setPayments(applied.payments as PaymentRecord[]);
          if (has('monthlyPayments')) setMonthlyPayments(applied.monthlyPayments as MonthlyPayment[]);
          if (has('monthlyDues')) setMonthlyDues(applied.monthlyDues as Record<string, number>);
          if (has('paymentEntries')) setPaymentEntries(applied.paymentEntries as PaymentEntry[]);
          if (has('notePresets')) setNotePresets(applied.notePresets as string[]);
          setCloudStatus(status);
        })
        .catch((e) => {
          // Never leave the UI on "checking…": a rejected bootstrap means no cloud.
          console.warn('[cloud] bootstrap failed', e);
          setCloudStatus('offline');
        });
    };

    void watchAuth((user) => {
      if (stopped) return;
      if (!user) {
        cloudBooted.current = false;
        setAuthEmail(null);
        setCloudStatus('signedOut');
        return;
      }
      if (!user.allowed) {
        setAuthEmail(null);
        setCloudStatus('denied');
        return;
      }
      setAuthEmail(user.email);
      if (!cloudBooted.current) runBootstrap();
    }).then((un) => {
      unsubscribe = un;
      if (stopped) un();
    });

    return () => {
      stopped = true;
      unsubscribe?.();
    };
  }, []);

  // Push every change up — debounced and de-duplicated inside queueCloudWrite.
  useEffect(() => {
    if (cloudStatus !== 'downloaded' && cloudStatus !== 'seeded') return;
    queueCloudWrite('mahjas', mahjas);
    queueCloudWrite('rooms', rooms);
    queueCloudWrite('students', students);
    queueCloudWrite('studentGroups', studentGroups);
    queueCloudWrite('groups', groups);
    queueCloudWrite('payments', payments);
    queueCloudWrite('monthlyPayments', monthlyPayments);
    queueCloudWrite('monthlyDues', monthlyDues);
    queueCloudWrite('paymentEntries', paymentEntries);
    queueCloudWrite('notePresets', notePresets);
  }, [
    cloudStatus,
    mahjas,
    rooms,
    students,
    studentGroups,
    groups,
    payments,
    monthlyPayments,
    monthlyDues,
    paymentEntries,
    notePresets,
  ]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    } catch {
      // ignore
    }
  }, []);

  const setCurrency = useCallback((curr: Currency) => {
    setCurrencyState(curr);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, curr);
    } catch {
      // ignore
    }
  }, []);

  // Toast notification system
  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts
    // Notifications auto-dismiss — they must never pile up on screen.
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_AUTO_DISMISS_MS);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Currency formatter
  const formatMoney = useCallback(
    (amount: number): string => {
      const safeAmount = Number.isFinite(amount) ? amount : 0;
      if (currency === 'IDR') {
        return new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
          maximumFractionDigits: 0,
        }).format(safeAmount);
      }
      if (currency === 'EUR') {
        return new Intl.NumberFormat('de-DE', {
          style: 'currency',
          currency: 'EUR',
          minimumFractionDigits: 2,
        }).format(safeAmount);
      }
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
      }).format(safeAmount);
    },
    [currency]
  );

  // Student CRUD
  const addStudent = useCallback(
    (data: {
      name: string;
      phone?: string;
      level?: string;
      mahjaId?: string | null;
      roomId?: string | null;
      studentGroupId?: string | null;
      notes?: string;
    }) => {
      const newStudent: Student = {
        id: `student-${Date.now()}`,
        name: data.name.trim(),
        phone: data.phone?.trim() || undefined,
        level: data.level?.trim() || 'Level 1',
        mahjaId: data.mahjaId || null,
        roomId: data.roomId || null,
        studentGroupId: data.studentGroupId || null,
        notes: data.notes?.trim(),
        createdAt: new Date().toISOString(),
      };
      setStudents((prev) => [newStudent, ...prev]);
      addToast({
        type: 'success',
        title: t.toasts.studentAdded,
        message: newStudent.name,
      });
      return newStudent;
    },
    [t, addToast]
  );

  const updateStudent = useCallback(
    (
      id: string,
      data: {
        name: string;
        phone?: string;
        level?: string;
        mahjaId?: string | null;
        roomId?: string | null;
        studentGroupId?: string | null;
        notes?: string;
      }
    ) => {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                name: data.name.trim(),
                phone: data.phone !== undefined ? data.phone.trim() || undefined : s.phone,
                level: data.level !== undefined ? data.level.trim() : s.level,
                mahjaId: data.mahjaId !== undefined ? data.mahjaId : s.mahjaId,
                roomId: data.roomId !== undefined ? data.roomId : s.roomId,
                studentGroupId: data.studentGroupId !== undefined ? data.studentGroupId : s.studentGroupId,
                notes: data.notes !== undefined ? data.notes?.trim() : s.notes,
              }
            : s
        )
      );
      addToast({
        type: 'success',
        title: t.toasts.studentUpdated,
        message: data.name,
      });
    },
    [t, addToast]
  );

  // Mahja Management (Mahja -> Room -> Students)
  const addMahja = useCallback(
    (data: { name: string; description?: string }) => {
      const newMahja: Mahja = {
        id: `mahja-${Date.now()}`,
        name: data.name.trim(),
        description: data.description?.trim(),
        createdAt: new Date().toISOString(),
      };
      setMahjas((prev) => [...prev, newMahja]);
      addToast({
        type: 'success',
        title: 'Mahja Created',
        message: newMahja.name,
      });
      return newMahja;
    },
    [addToast]
  );

  const updateMahja = useCallback(
    (id: string, data: { name?: string; description?: string }) => {
      setMahjas((prev) =>
        prev.map((m) =>
          m.id === id
            ? {
                ...m,
                name: data.name !== undefined ? data.name.trim() : m.name,
                description: data.description !== undefined ? data.description.trim() : m.description,
              }
            : m
        )
      );
      addToast({
        type: 'success',
        title: 'Mahja Updated',
        message: data.name,
      });
    },
    [addToast]
  );

  const deleteMahja = useCallback(
    (id: string) => {
      const target = mahjas.find((m) => m.id === id);
      setMahjas((prev) => prev.filter((m) => m.id !== id));
      // Delete all rooms inside this Mahja
      setRooms((prev) => prev.filter((r) => r.mahjaId !== id));
      // Make students in this Mahja unassigned (retaining student and payment data)
      setStudents((prev) =>
        prev.map((s) => (s.mahjaId === id ? { ...s, mahjaId: null, roomId: null } : s))
      );
      addToast({
        type: 'info',
        title: 'Mahja Deleted',
        message: target ? `${target.name} and its rooms deleted. Students are now unassigned.` : undefined,
      });
    },
    [mahjas, addToast]
  );

  const getMahja = useCallback(
    (id: string) => mahjas.find((m) => m.id === id),
    [mahjas]
  );

  // Room Management
  const addRoom = useCallback(
    (data: { mahjaId: string; name: string; description?: string }) => {
      const newRoom: Room = {
        id: `room-${Date.now()}`,
        mahjaId: data.mahjaId,
        name: data.name.trim(),
        description: data.description?.trim(),
        createdAt: new Date().toISOString(),
      };
      setRooms((prev) => [...prev, newRoom]);
      addToast({
        type: 'success',
        title: 'Room Created',
        message: newRoom.name,
      });
      return newRoom;
    },
    [addToast]
  );

  const updateRoom = useCallback(
    (id: string, data: { name?: string; description?: string }) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                name: data.name !== undefined ? data.name.trim() : r.name,
                description: data.description !== undefined ? data.description.trim() : r.description,
              }
            : r
        )
      );
      addToast({
        type: 'success',
        title: 'Room Updated',
        message: data.name,
      });
    },
    [addToast]
  );

  const deleteRoom = useCallback(
    (id: string) => {
      const target = rooms.find((r) => r.id === id);
      setRooms((prev) => prev.filter((r) => r.id !== id));
      // Make students in this room unassigned
      setStudents((prev) =>
        prev.map((s) => (s.roomId === id ? { ...s, roomId: null, mahjaId: null } : s))
      );
      addToast({
        type: 'info',
        title: 'Room Deleted',
        message: target ? `${target.name} deleted. Students in this room are now unassigned.` : undefined,
      });
    },
    [rooms, addToast]
  );

  const getRoom = useCallback(
    (id: string) => rooms.find((r) => r.id === id),
    [rooms]
  );

  const getRoomsByMahja = useCallback(
    (mahjaId: string) => rooms.filter((r) => r.mahjaId === mahjaId),
    [rooms]
  );

  const getStudentsByRoom = useCallback(
    (roomId: string) => students.filter((s) => s.roomId === roomId),
    [students]
  );

  const getStudentsByMahja = useCallback(
    (mahjaId: string) => students.filter((s) => s.mahjaId === mahjaId),
    [students]
  );

  const getUnassignedStudents = useCallback(
    () => students.filter((s) => !s.roomId && !s.mahjaId),
    [students]
  );

  const assignStudentsToRoom = useCallback(
    (studentIds: string[], mahjaId: string | null, roomId: string | null) => {
      const set = new Set(studentIds);
      setStudents((prev) =>
        prev.map((s) => (set.has(s.id) ? { ...s, mahjaId, roomId } : s))
      );
      const targetRoom = roomId ? rooms.find((r) => r.id === roomId)?.name : 'Unassigned';
      addToast({
        type: 'success',
        title: 'Students Assigned',
        message: `${studentIds.length} student(s) placed in ${targetRoom}`,
      });
    },
    [rooms, addToast]
  );

  const moveStudentToRoom = useCallback(
    (studentId: string, mahjaId: string | null, roomId: string | null) => {
      const student = students.find((s) => s.id === studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, mahjaId, roomId } : s))
      );
      const targetRoom = roomId ? rooms.find((r) => r.id === roomId)?.name : 'Unassigned';
      addToast({
        type: 'success',
        title: 'Student Moved',
        message: `${student?.name || 'Student'} moved to ${targetRoom}`,
      });
    },
    [students, rooms, addToast]
  );

  // Student Groups CRUD (Inside Student Manager)
  const addStudentGroup = useCallback(
    (data: { name: string; description?: string }) => {
      const newGroup: StudentGroup = {
        id: `sg-${Date.now()}`,
        name: data.name.trim(),
        description: data.description?.trim(),
        createdAt: new Date().toISOString(),
      };
      setStudentGroups((prev) => [...prev, newGroup]);
      addToast({
        type: 'success',
        title: 'Group Created',
        message: newGroup.name,
      });
      return newGroup;
    },
    [addToast]
  );

  const updateStudentGroup = useCallback(
    (id: string, data: { name?: string; description?: string }) => {
      setStudentGroups((prev) =>
        prev.map((g) =>
          g.id === id
            ? {
                ...g,
                name: data.name !== undefined ? data.name.trim() : g.name,
                description: data.description !== undefined ? data.description.trim() : g.description,
              }
            : g
        )
      );
      addToast({
        type: 'success',
        title: 'Group Updated',
        message: data.name,
      });
    },
    [addToast]
  );

  const deleteStudentGroup = useCallback(
    (id: string) => {
      const target = studentGroups.find((g) => g.id === id);
      setStudentGroups((prev) => prev.filter((g) => g.id !== id));
      // Ungroup all students that belonged to this group (they remain fully manageable)
      setStudents((prev) =>
        prev.map((s) => (s.studentGroupId === id ? { ...s, studentGroupId: null } : s))
      );
      addToast({
        type: 'info',
        title: 'Group Deleted',
        message: target ? `${target.name} removed. Students are now Ungrouped.` : undefined,
      });
    },
    [studentGroups, addToast]
  );

  const assignStudentsToGroup = useCallback(
    (studentIds: string[], studentGroupId: string | null) => {
      const set = new Set(studentIds);
      setStudents((prev) =>
        prev.map((s) => (set.has(s.id) ? { ...s, studentGroupId } : s))
      );
      const targetGroupName = studentGroupId
        ? studentGroups.find((g) => g.id === studentGroupId)?.name || 'Group'
        : 'Ungrouped';
      addToast({
        type: 'success',
        title: 'Students Updated',
        message: `${studentIds.length} student(s) moved to ${targetGroupName}`,
      });
    },
    [studentGroups, addToast]
  );

  const moveStudent = useCallback(
    (studentId: string, targetStudentGroupId: string | null) => {
      const student = students.find((s) => s.id === studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, studentGroupId: targetStudentGroupId } : s))
      );
      const targetGroupName = targetStudentGroupId
        ? studentGroups.find((g) => g.id === targetStudentGroupId)?.name || 'Group'
        : 'Ungrouped';
      addToast({
        type: 'success',
        title: 'Student Moved',
        message: student ? `${student.name} moved to ${targetGroupName}` : undefined,
      });
    },
    [students, studentGroups, addToast]
  );

  const getStudentGroup = useCallback(
    (id: string) => {
      return studentGroups.find((g) => g.id === id);
    },
    [studentGroups]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const target = students.find((s) => s.id === id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      // Remove student from all groups
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          studentIds: g.studentIds.filter((sid) => sid !== id),
        }))
      );
      // Remove payment records
      setPayments((prev) => prev.filter((p) => p.studentId !== id));

      if (target) {
        addToast({
          type: 'info',
          title: t.toasts.studentDeleted,
          message: target.name,
        });
      }
    },
    [students, t, addToast]
  );

  // Group helpers
  const getGroup = useCallback((id: string) => groups.find((g) => g.id === id), [groups]);

  const getSubgroups = useCallback(
    (parentId: string | null) => groups.filter((g) => g.parentId === parentId),
    [groups]
  );

  const getAllDescendantGroupIds = useCallback(
    (groupId: string): string[] => {
      const result: string[] = [];
      const visited = new Set<string>([groupId]);
      const traverse = (parentId: string) => {
        const children = groups.filter((g) => g.parentId === parentId);
        for (const child of children) {
          if (!visited.has(child.id)) {
            visited.add(child.id);
            result.push(child.id);
            traverse(child.id);
          }
        }
      };
      traverse(groupId);
      return result;
    },
    [groups]
  );

  const getGroupHierarchy = useCallback(
    (groupId: string): TrackingGroup[] => {
      const hierarchy: TrackingGroup[] = [];
      const visited = new Set<string>();
      let currentId: string | null = groupId;

      while (currentId && !visited.has(currentId)) {
        visited.add(currentId);
        const g = groups.find((grp) => grp.id === currentId);
        if (!g) break;
        hierarchy.unshift(g);
        currentId = g.parentId;
      }
      return hierarchy;
    },
    [groups]
  );

  // Group CRUD
  const addGroup = useCallback(
    (data: {
      name: string;
      parentId: string | null;
      paymentAmount: number;
      studentIds: string[];
      description?: string;
    }) => {
      const groupId = `group-${Date.now()}`;
      const safeStudentIds = Array.isArray(data.studentIds) ? data.studentIds.filter(Boolean) : [];
      const newGroup: TrackingGroup = {
        id: groupId,
        name: data.name.trim(),
        parentId: data.parentId || null,
        paymentAmount: Number(data.paymentAmount) || 0,
        studentIds: safeStudentIds,
        createdAt: new Date().toISOString(),
        description: data.description?.trim(),
      };

      setGroups((prev) => [...prev, newGroup]);

      // Initialize payment records for assigned students
      const newPayments: PaymentRecord[] = safeStudentIds.map((studentId, idx) => ({
        id: `pay-${groupId}-${studentId}-${idx}`,
        groupId,
        studentId,
        requiredAmount: newGroup.paymentAmount,
        paidAmount: 0,
        status: 'unpaid',
        lastUpdated: new Date().toISOString(),
      }));

      if (newPayments.length > 0) {
        setPayments((prev) => [...prev, ...newPayments]);
      }

      addToast({
        type: 'success',
        title: t.toasts.groupCreated,
        message: newGroup.name,
      });

      return newGroup;
    },
    [t, addToast]
  );

  const updateGroup = useCallback(
    (id: string, data: Partial<Omit<TrackingGroup, 'id' | 'createdAt'>>) => {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id !== id) return g;
          return {
            ...g,
            ...data,
            name: data.name !== undefined ? data.name.trim() : g.name,
            paymentAmount: data.paymentAmount !== undefined ? Number(data.paymentAmount) : g.paymentAmount,
          };
        })
      );

      // If paymentAmount changed, update unpaid or default records
      if (data.paymentAmount !== undefined) {
        const newRate = Number(data.paymentAmount);
        setPayments((prev) =>
          prev.map((p) => {
            if (p.groupId !== id) return p;
            // Update required amount
            const required = newRate;
            let status: PaymentStatus = 'unpaid';
            if (p.paidAmount >= required && required > 0) {
              status = 'paid';
            } else if (p.paidAmount > 0) {
              status = 'partial';
            }
            return {
              ...p,
              requiredAmount: required,
              status,
              lastUpdated: new Date().toISOString(),
            };
          })
        );
      }

      addToast({
        type: 'success',
        title: t.toasts.groupUpdated,
        message: data.name,
      });
    },
    [t, addToast]
  );

  const deleteGroup = useCallback(
    (id: string) => {
      const target = groups.find((g) => g.id === id);
      const allTargetIds = [id, ...getAllDescendantGroupIds(id)];

      setGroups((prev) => prev.filter((g) => !allTargetIds.includes(g.id)));
      setPayments((prev) => prev.filter((p) => !allTargetIds.includes(p.groupId)));

      if (selectedGroupId && allTargetIds.includes(selectedGroupId)) {
        // if user was viewing deleted group, navigate to parent or root
        setSelectedGroupId(target?.parentId || null);
      }

      if (target) {
        addToast({
          type: 'info',
          title: t.toasts.groupDeleted,
          message: target.name,
        });
      }
    },
    [groups, getAllDescendantGroupIds, selectedGroupId, t, addToast]
  );

  const setGroupStudents = useCallback(
    (groupId: string, studentIds: string[]) => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) return;

      setGroups((prev) =>
        prev.map((g) => (g.id === groupId ? { ...g, studentIds } : g))
      );

      // Update payment records
      setPayments((prev) => {
        // Keep payments for other groups
        const otherPayments = prev.filter((p) => p.groupId !== groupId);
        // Existing payments for this group
        const currentGroupPayments = prev.filter((p) => p.groupId === groupId);

        const updatedGroupPayments: PaymentRecord[] = [];

        for (const sid of studentIds) {
          const existing = currentGroupPayments.find((p) => p.studentId === sid);
          if (existing) {
            updatedGroupPayments.push(existing);
          } else {
            // New payment record
            updatedGroupPayments.push({
              id: `pay-${groupId}-${sid}-${Date.now()}`,
              groupId,
              studentId: sid,
              requiredAmount: group.paymentAmount,
              paidAmount: 0,
              status: 'unpaid',
              lastUpdated: new Date().toISOString(),
            });
          }
        }

        return [...otherPayments, ...updatedGroupPayments];
      });

      addToast({
        type: 'success',
        title: t.toasts.studentsAssigned,
        message: group.name,
      });
    },
    [groups, t, addToast]
  );

  // Payment operations
  const updatePayment = useCallback(
    (groupId: string, studentId: string, paidAmount: number, requiredAmount?: number) => {
      setPayments((prev) => {
        const index = prev.findIndex((p) => p.groupId === groupId && p.studentId === studentId);
        const group = groups.find((g) => g.id === groupId);
        const defaultRequired = group ? group.paymentAmount : 0;
        const currentRequired = requiredAmount !== undefined
          ? requiredAmount
          : index !== -1
          ? prev[index].requiredAmount
          : defaultRequired;

        const safePaid = Math.max(0, Number(paidAmount) || 0);
        let status: PaymentStatus = 'unpaid';
        if (safePaid >= currentRequired && currentRequired > 0) {
          status = 'paid';
        } else if (safePaid > 0) {
          status = 'partial';
        }

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            requiredAmount: currentRequired,
            paidAmount: safePaid,
            status,
            lastUpdated: new Date().toISOString(),
          };
          return updated;
        } else {
          // create if not existing
          return [
            ...prev,
            {
              id: `pay-${groupId}-${studentId}-${Date.now()}`,
              groupId,
              studentId,
              requiredAmount: currentRequired,
              paidAmount: safePaid,
              status,
              lastUpdated: new Date().toISOString(),
            },
          ];
        }
      });

      addToast({
        type: 'success',
        title: t.toasts.paymentUpdated,
      });
    },
    [groups, t, addToast]
  );

  const markAsPaid = useCallback(
    (groupId: string, studentId: string) => {
      const student = students.find((s) => s.id === studentId);
      const group = groups.find((g) => g.id === groupId);
      const defaultRequired = group ? group.paymentAmount : 0;

      setPayments((prev) => {
        const index = prev.findIndex((p) => p.groupId === groupId && p.studentId === studentId);
        const required = index !== -1 ? prev[index].requiredAmount : defaultRequired;

        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            paidAmount: required,
            status: 'paid',
            lastUpdated: new Date().toISOString(),
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `pay-${groupId}-${studentId}-${Date.now()}`,
              groupId,
              studentId,
              requiredAmount: required,
              paidAmount: required,
              status: 'paid',
              lastUpdated: new Date().toISOString(),
            },
          ];
        }
      });

      addToast({
        type: 'success',
        title: t.toasts.markedAsPaid,
        message: student ? student.name : undefined,
      });
    },
    [students, groups, t, addToast]
  );

  // Queries
  const getStudent = useCallback((id: string) => students.find((s) => s.id === id), [students]);

  const getStudentGroups = useCallback(
    (studentId: string) => groups.filter((g) => g.studentIds.includes(studentId)),
    [groups]
  );

  const getStudentPayment = useCallback(
    (groupId: string, studentId: string) =>
      payments.find((p) => p.groupId === groupId && p.studentId === studentId),
    [payments]
  );

  // Stats computation
  const getGroupStats = useCallback(
    (groupId: string, includeSubgroups: boolean = true): GroupStats => {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        return {
          totalStudents: 0,
          totalExpected: 0,
          totalCollected: 0,
          remainingAmount: 0,
          paidCount: 0,
          partialCount: 0,
          unpaidCount: 0,
          progressPercentage: 0,
          subgroupsCount: 0,
        };
      }

      const directSubgroups = groups.filter((g) => g.parentId === groupId);
      const targetGroupIds = includeSubgroups
        ? [groupId, ...getAllDescendantGroupIds(groupId)]
        : [groupId];

      // Gather all payments belonging to these groups
      const relevantPayments = payments.filter((p) => targetGroupIds.includes(p.groupId));

      // Also gather direct studentIds if payments not yet initialized
      const safeDirectStudentIds = Array.isArray(group.studentIds) ? group.studentIds : [];
      let directStudentsCount = safeDirectStudentIds.length;
      if (includeSubgroups) {
        const allGroupsInTree = groups.filter((g) => targetGroupIds.includes(g.id));
        const allEnrolledSet = new Set<string>();
        allGroupsInTree.forEach((grp) => (Array.isArray(grp.studentIds) ? grp.studentIds : []).forEach((sid) => allEnrolledSet.add(sid)));
        directStudentsCount = allEnrolledSet.size;
      }

      let totalExpected = 0;
      let totalCollected = 0;
      let paidCount = 0;
      let partialCount = 0;
      let unpaidCount = 0;

      for (const p of relevantPayments) {
        totalExpected += p.requiredAmount;
        totalCollected += p.paidAmount;
        if (p.status === 'paid') {
          paidCount++;
        } else if (p.status === 'partial') {
          partialCount++;
        } else {
          unpaidCount++;
        }
      }

      const remainingAmount = Math.max(0, totalExpected - totalCollected);
      const progressPercentage =
        totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

      return {
        totalStudents: relevantPayments.length > 0 ? relevantPayments.length : directStudentsCount,
        totalExpected,
        totalCollected,
        remainingAmount,
        paidCount,
        partialCount,
        unpaidCount,
        progressPercentage,
        subgroupsCount: directSubgroups.length,
      };
    },
    [groups, payments, getAllDescendantGroupIds]
  );

  const getGlobalStats = useCallback((): GlobalStats => {
    let totalExpected = 0;
    let totalCollected = 0;
    let paidStudentsCount = 0;

    for (const p of payments) {
      totalExpected += p.requiredAmount;
      totalCollected += p.paidAmount;
      if (p.status === 'paid') {
        paidStudentsCount++;
      }
    }

    const remainingAmount = Math.max(0, totalExpected - totalCollected);
    const overallProgress =
      totalExpected > 0 ? Math.min(100, Math.round((totalCollected / totalExpected) * 100)) : 0;

    return {
      totalGroups: groups.length,
      totalStudents: students.length,
      totalExpected,
      totalCollected,
      remainingAmount,
      paidStudentsCount,
      overallProgress,
    };
  }, [groups, students, payments]);

  // Reset to original mock data
  const resetToMockData = useCallback(() => {
    setStudents(initialStudents);
    setMahjas(initialMahjas);
    setRooms(initialRooms);
    setStudentGroups([]);
    setGroups(initialGroups);
    setPayments(initialPayments);
    setMonthlyPayments([]);
    setMonthlyDues({});
    setPaymentEntries([]);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.MAHJAS);
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.STUDENT_GROUPS);
    localStorage.removeItem(STORAGE_KEYS.GROUPS);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTHLY_PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.MONTHLY_DUES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENT_ENTRIES);
    addToast({
      type: 'info',
      title: t.settings.resetSuccess,
    });
  }, [t, addToast]);

  /**
   * Manual escape hatch: replace the Firebase copy with what this device holds.
   * The first device to open an empty cloud seeds it automatically; this exists
   * for the case where the cloud already holds an older copy (or was seeded from
   * a fresh browser) and *this* device is the one with the real data.
   */
  const pushLocalToCloud = useCallback(async () => {
    if (!authEmail) {
      addToast({ type: 'info', title: t.settings.signInRequired });
      return;
    }
    setCloudStatus('loading');
    const status = await pushCloudState({
      mahjas,
      rooms,
      students,
      studentGroups,
      groups,
      payments,
      monthlyPayments,
      monthlyDues,
      paymentEntries,
      notePresets,
    });
    setCloudStatus(status);
    addToast({
      type: status === 'offline' ? 'error' : 'success',
      title: status === 'offline' ? t.settings.cloudUploadFailed : t.settings.cloudUploaded,
    });
  }, [
    mahjas,
    rooms,
    students,
    studentGroups,
    groups,
    payments,
    monthlyPayments,
    monthlyDues,
    paymentEntries,
    notePresets,
    authEmail,
    t,
    addToast,
  ]);

  /** Google sign-in; the account chooser does the rest. */
  const signIn = useCallback(async () => {
    try {
      const user = await signInWithGoogle();
      // null = the browser left for a redirect sign-in; nothing more to say here.
      if (user) addToast({ type: 'success', title: t.settings.signInSuccess });
    } catch (e) {
      const code = String((e as { code?: string })?.code || '');
      const notAllowed = String((e as Error)?.message || '').includes('not-allowed');
      // A closed popup is a deliberate cancel, not an error worth shouting about.
      if (code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) return;
      console.warn('[auth] sign-in failed', e);
      addToast({
        type: 'error',
        title: notAllowed ? t.settings.signInDenied : t.settings.signInFailed,
      });
    }
  }, [t, addToast]);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
      addToast({ type: 'info', title: t.settings.signOutSuccess });
    } catch (e) {
      console.warn('[auth] sign-out failed', e);
      addToast({ type: 'error', title: t.settings.signInFailed });
    }
  }, [t, addToast]);

  // ---- Monthly payments: every student owes a fee for every month ----
  const suggestedMonthlyDue = useCallback(
    (studentId: string): number => {
      const explicit = monthlyDues[studentId];
      if (explicit !== undefined) return Number(explicit) || 0;
      const inGroups = groups.filter((g) => (g.studentIds || []).includes(studentId));
      return inGroups.reduce((sum, g) => sum + (Number(g.paymentAmount) || 0), 0);
    },
    [monthlyDues, groups]
  );

  /**
   * What a student still owes: the unpaid amounts of the tracking lists they are in.
   * If they are in no list, this month's monthly due is used instead, so the reminder
   * always names a real figure.
   */
  const getStudentUnpaidAmount = useCallback(
    (studentId: string): number => {
      const owedFromLists = payments
        .filter((r) => r.studentId === studentId && r.status !== 'paid')
        .reduce(
          (sum, r) => sum + Math.max(0, (Number(r.requiredAmount) || 0) - (Number(r.paidAmount) || 0)),
          0
        );
      if (owedFromLists > 0) return owedFromLists;

      const month = monthlyPayments.find((p) => p.studentId === studentId && p.month === currentMonthKey());
      if (month?.status === 'paid') return 0;
      const due = month?.amountDue ?? monthlyDues[studentId] ?? suggestedMonthlyDue(studentId);
      const paid = Number(month?.amountPaid) || 0;
      return Math.max(0, (Number(due) || 0) - paid);
    },
    [payments, monthlyPayments, monthlyDues, suggestedMonthlyDue]
  );

  const recordMonthlyPayment = useCallback(
    (
      studentId: string,
      month: string,
      amountPaid: number,
      notes?: string,
      amountDueOverride?: number
    ) => {
      if (!studentId || !month) return;
      const due = suggestedMonthlyDue(studentId);
      const paid = Math.max(0, Number(amountPaid) || 0);

      setMonthlyPayments((prev) => {
        const existing = prev.find((p) => p.studentId === studentId && p.month === month);
        // An explicit due wins: "paid X for this month" means the month is settled.
        const amountDue =
          amountDueOverride !== undefined
            ? Math.max(0, Number(amountDueOverride) || 0)
            : existing && existing.amountDue
            ? existing.amountDue
            : due;
        const record: MonthlyPayment = {
          id: existing?.id || `mp-${studentId}-${month}`,
          studentId,
          month,
          amountDue,
          amountPaid: paid,
          status: monthStatus(paid, amountDue),
          paidAt: new Date().toISOString(),
          notes: notes ?? existing?.notes,
        };
        return existing ? prev.map((p) => (p.id === existing.id ? record : p)) : [...prev, record];
      });
    },
    [suggestedMonthlyDue]
  );

  const markMonthPaid = useCallback(
    (studentId: string, month: string) => {
      // Explicitly marking a month paid always produces a paid month — even when
      // no amount is configured yet (the amount then simply stays 0).
      const amount = Math.max(0, suggestedMonthlyDue(studentId));
      setMonthlyPayments((prev) => {
        const existing = prev.find((p) => p.studentId === studentId && p.month === month);
        const record: MonthlyPayment = {
          id: existing?.id || `mp-${studentId}-${month}`,
          studentId,
          month,
          amountDue: existing?.amountDue || amount,
          amountPaid: amount,
          status: 'paid',
          paidAt: new Date().toISOString(),
          notes: existing?.notes,
        };
        return existing ? prev.map((p) => (p.id === existing.id ? record : p)) : [...prev, record];
      });
    },
    [suggestedMonthlyDue]
  );

  const clearMonthlyPayment = useCallback((studentId: string, month: string) => {
    setMonthlyPayments((prev) => prev.filter((p) => !(p.studentId === studentId && p.month === month)));
  }, []);

  const addNotePreset = useCallback((phrase: string) => {
    const word = phrase.trim();
    if (!word) return;
    setNotePresets((prev) => (prev.some((w) => w.toLowerCase() === word.toLowerCase()) ? prev : [...prev, word]));
  }, []);

  const removeNotePreset = useCallback((phrase: string) => {
    setNotePresets((prev) => prev.filter((w) => w !== phrase));
  }, []);

  const addPaymentEntry = useCallback((groupId: string, amount: number, note?: string) => {
    const value = Number(amount) || 0;
    if (!groupId || value === 0) return;
    setPaymentEntries((prev) => [
      ...prev,
      {
        id: `pe-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        groupId,
        amount: value,
        note: note?.trim() || undefined,
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  const deletePaymentEntry = useCallback((id: string) => {
    setPaymentEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const setStudentMonthlyDue = useCallback((studentId: string, amount: number) => {
    setMonthlyDues((prev) => ({ ...prev, [studentId]: Math.max(0, Number(amount) || 0) }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        currencySymbol,
        activeView,
        setActiveView,
        selectedGroupId,
        setSelectedGroupId,
        t,
        students,
        mahjas,
        rooms,
        studentGroups,
        groups,
        payments,
        toasts,
        addStudent,
        updateStudent,
        deleteStudent,
        addMahja,
        updateMahja,
        deleteMahja,
        getMahja,
        addRoom,
        updateRoom,
        deleteRoom,
        getRoom,
        getRoomsByMahja,
        assignStudentsToRoom,
        moveStudentToRoom,
        getStudentsByRoom,
        getStudentsByMahja,
        getUnassignedStudents,
        addStudentGroup,
        updateStudentGroup,
        deleteStudentGroup,
        assignStudentsToGroup,
        moveStudent,
        getStudentGroup,
        addGroup,
        updateGroup,
        deleteGroup,
        setGroupStudents,
        updatePayment,
        markAsPaid,
        monthlyPayments,
        monthlyDues,
        suggestedMonthlyDue,
        getStudentUnpaidAmount,
        setStudentMonthlyDue,
        recordMonthlyPayment,
        markMonthPaid,
        clearMonthlyPayment,
        paymentEntries,
        addPaymentEntry,
        deletePaymentEntry,
        notePresets,
        addNotePreset,
        removeNotePreset,
        formatMoney,
        getGroup,
        getSubgroups,
        getGroupHierarchy,
        getAllDescendantGroupIds,
        getGroupStats,
        getGlobalStats,
        getStudent,
        getStudentGroups,
        getStudentPayment,
        addToast,
        removeToast,
        resetToMockData,
        cloudStatus,
        authEmail,
        signIn,
        signOut,
        pushLocalToCloud,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

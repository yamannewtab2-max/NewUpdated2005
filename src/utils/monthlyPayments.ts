import { MonthlyPayment, PaymentStatus, Student } from '../types';
import { currentMonthKey, daysInMonth, daysLeftInMonth, shiftMonth } from './months';

/** Status of one month for one student. */
export const monthStatus = (paid: number, due: number): PaymentStatus => {
  if (paid <= 0) return 'unpaid';
  if (due > 0 && paid < due) return 'partial';
  return 'paid';
};

export type MonthRowStatus = PaymentStatus;

export interface MonthRow {
  month: string;
  status: MonthRowStatus;
  amountDue: number;
  amountPaid: number;
  paidAt?: string;
  record?: MonthlyPayment;
}

/**
 * Months to show for a student: from the first month they have a record in
 * (or the current month when there is none) through the current month,
 * newest first. Months before tracking started are never shown.
 */
export const buildStudentMonthRows = (
  _student: Student,
  records: MonthlyPayment[]
): MonthRow[] => {
  const today = currentMonthKey();
  const own = records.filter((r) => r.studentId === _student.id);
  const recorded = own.map((r) => r.month).filter(Boolean).sort();
  const start = recorded.length > 0 && recorded[0] < today ? recorded[0] : today;

  const byMonth = new Map(own.map((r) => [r.month, r]));

  const keys: string[] = [];
  for (let m = start; m <= today; m = shiftMonth(m, 1)) keys.push(m);

  return keys.reverse().map((month) => {
    const record = byMonth.get(month);
    if (record) {
      return {
        month,
        status: record.status,
        amountDue: record.amountDue,
        amountPaid: record.amountPaid,
        paidAt: record.paidAt,
        record,
      };
    }
    return { month, status: 'unpaid' as MonthRowStatus, amountDue: 0, amountPaid: 0 };
  });
};

export const isMissedMonth = (row: MonthRow, currentKey = currentMonthKey()): boolean =>
  row.month < currentKey && (row.status === 'unpaid' || row.status === 'partial');

export interface StudentMonthSummary {
  rows: MonthRow[];
  totalPaid: number;
  totalDue: number;
  paidCount: number;
  partialCount: number;
  missedMonths: string[];
  currentMonth: MonthRow | null;
}

export const summarizeStudentMonths = (
  student: Student,
  records: MonthlyPayment[]
): StudentMonthSummary => {
  const rows = buildStudentMonthRows(student, records);
  const current = currentMonthKey();
  const tracked = rows;

  return {
    rows,
    totalPaid: rows.reduce((sum, r) => sum + r.amountPaid, 0),
    totalDue: rows.reduce((sum, r) => sum + r.amountDue, 0),
    paidCount: tracked.filter((r) => r.status === 'paid').length,
    partialCount: tracked.filter((r) => r.status === 'partial').length,
    missedMonths: tracked.filter((r) => isMissedMonth(r, current)).map((r) => r.month),
    currentMonth: rows.find((r) => r.month === current) ?? null,
  };
};

export interface MonthOverview {
  month: string;
  totalStudents: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  collected: number;
  daysInMonth: number;
  dayOfMonth: number;
  daysLeft: number;
  percentPaid: number;
  paidStudentIds: string[];
}

/** How the whole cohort is doing in one month (drives the dashboard box). */
export const summarizeMonth = (
  students: Student[],
  records: MonthlyPayment[],
  month = currentMonthKey()
): MonthOverview => {
  const ofMonth = records.filter((r) => r.month === month);
  const paidIds = new Set(ofMonth.filter((r) => r.status === 'paid').map((r) => r.studentId));
  const partialIds = new Set(ofMonth.filter((r) => r.status === 'partial').map((r) => r.studentId));

  const paidCount = students.filter((s) => paidIds.has(s.id)).length;
  const partialCount = students.filter((s) => partialIds.has(s.id)).length;
  const totalStudents = students.length;

  return {
    month,
    totalStudents,
    paidCount,
    partialCount,
    unpaidCount: Math.max(0, totalStudents - paidCount - partialCount),
    collected: ofMonth.reduce((sum, r) => sum + r.amountPaid, 0),
    daysInMonth: daysInMonth(month),
    dayOfMonth: new Date().getDate(),
    daysLeft: daysLeftInMonth(month),
    percentPaid: totalStudents > 0 ? Math.round((paidCount / totalStudents) * 100) : 0,
    paidStudentIds: [...paidIds],
  };
};

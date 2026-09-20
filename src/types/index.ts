export type Language = 'en' | 'id';
export type Currency = 'USD' | 'IDR' | 'EUR';

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export interface Mahja {
  id: string;
  name: string; // e.g. "Mahja 26"
  description?: string;
  createdAt: string;
}

export interface Room {
  id: string;
  mahjaId: string;
  name: string; // e.g. "Room 1", "Room 2"
  description?: string;
  createdAt: string;
}

export interface StudentGroup {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

export interface Student {
  id: string;
  name: string;
  level?: string; // e.g. "Level 1", "Level 2", "Level 3", "Level 4"
  mahjaId?: string | null; // ID of the Mahja (or null/undefined if unassigned)
  roomId?: string | null; // ID of the Room inside Mahja (or null/undefined if unassigned)
  phone?: string; // WhatsApp / phone number, any local or international format
  studentGroupId?: string | null; // backward compatibility
  createdAt: string;
  notes?: string;
}

export interface TrackingGroup {
  id: string;
  name: string;
  parentId: string | null; // null for root level groups
  paymentAmount: number; // default required payment per student in this group
  studentIds: string[]; // student IDs assigned to this group
  createdAt: string;
  description?: string;
}

export interface PaymentRecord {
  id: string;
  groupId: string;
  studentId: string;
  requiredAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  lastUpdated: string;
  notes?: string;
}

/**
 * One monthly obligation per student (every student owes this every month).
 * `month` is 'YYYY-MM'; the record exists only once something was paid or a due was set.
 */
export interface MonthlyPayment {
  id: string;
  studentId: string;
  month: string; // 'YYYY-MM'
  amountDue: number;
  amountPaid: number;
  status: PaymentStatus;
  paidAt?: string; // when the payment was recorded
  notes?: string;
}

/**
 * A plain recorded payment inside a list that has no students
 * (e.g. "laundry" costs): amount + what it was for.
 */
export interface PaymentEntry {
  id: string;
  groupId: string;
  amount: number;
  note?: string;
  createdAt: string;
}

export interface GroupStats {
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  remainingAmount: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  progressPercentage: number;
  subgroupsCount: number;
}

export interface GlobalStats {
  totalGroups: number;
  totalStudents: number;
  totalExpected: number;
  totalCollected: number;
  remainingAmount: number;
  paidStudentsCount: number;
  overallProgress: number;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

export type ActiveView = 'dashboard' | 'students' | 'groups' | 'settings';

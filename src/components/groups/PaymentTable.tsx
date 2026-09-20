import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { StudentProfileModal } from '../students/StudentProfileModal';
import { CheckCircle2, Clock, Trash2 } from 'lucide-react';
import { currentMonthKey } from '../../utils/months';

interface PaymentTableProps {
  groupId: string;
  studentIds: string[];
}

/**
 * Compact payment list: one short row per student —
 * status button (paid / unpaid) + remove button on the left, name on the right.
 */
export const PaymentTable: React.FC<PaymentTableProps> = ({ groupId, studentIds }) => {
  const {
    t,
    getStudent,
    getStudentPayment,
    getGroup,
    markAsPaid,
    updatePayment,
    setGroupStudents,
    monthlyPayments,
    recordMonthlyPayment,
    clearMonthlyPayment,
    suggestedMonthlyDue,
  } = useApp();
  const group = getGroup(groupId);
  const currentKey = currentMonthKey();

  const [studentToRemove, setStudentToRemove] = useState<Student | null>(null);
  const [profileStudent, setProfileStudent] = useState<Student | null>(null);
  const [confirmUnpaid, setConfirmUnpaid] = useState<Student | null>(null);

  const safeStudentIds = Array.isArray(studentIds) ? studentIds.filter(Boolean) : [];

  if (safeStudentIds.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        {t.groups.noStudentsInGroupDesc}
      </div>
    );
  }

  /**
   * The list and the student profile are one thing: marking paid here also
   * records this month in the student's monthly ledger (and unmarking clears it).
   */
  const togglePaid = (studentId: string, isPaid: boolean) => {
    const record = getStudentPayment(groupId, studentId);
    const required = record ? record.requiredAmount : group ? group.paymentAmount : 0;
    if (isPaid) {
      updatePayment(groupId, studentId, 0, required);
      clearMonthlyPayment(studentId, currentKey);
    } else {
      markAsPaid(groupId, studentId);
      const amount = required > 0 ? required : suggestedMonthlyDue(studentId);
      // Settle the month with exactly what was paid here, so the profile shows Paid
      // even when the student's monthly due is a different (larger) number.
      if (amount > 0) recordMonthlyPayment(studentId, currentKey, amount, undefined, amount);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-2xs overflow-hidden max-h-[340px] overflow-y-auto">
        {safeStudentIds.map((studentId) => {
          const student = getStudent(studentId);
          if (!student) return null;

          const payment = getStudentPayment(groupId, studentId);
          const status = payment ? payment.status : 'unpaid';
          const required = payment ? payment.requiredAmount : group ? group.paymentAmount : 0;
          // Paid in either the list record or this month's ledger
          const monthlyPaid = monthlyPayments.some(
            (m) => m.studentId === studentId && m.month === currentKey && m.status === 'paid'
          );
          const isPaid = status === 'paid' || monthlyPaid;
          const shownStatus = isPaid ? 'paid' : status;

          const statusClass =
            shownStatus === 'paid'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
              : status === 'partial'
              ? 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100';

          return (
            <div
              key={studentId}
              className="flex items-center gap-2 px-2.5 py-1.5 border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
            >
              {/* Status button — tap to switch paid / unpaid */}
              <button
                type="button"
                onClick={() => (isPaid ? setConfirmUnpaid(student) : togglePaid(studentId, false))}
                title={isPaid ? t.payments.unpaidStatus : t.payments.markAsPaid}
                className={`shrink-0 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${statusClass}`}
              >
                {shownStatus === 'paid' ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <Clock className="w-3.5 h-3.5" />
                )}
                {shownStatus === 'paid'
                  ? t.payments.paidStatus
                  : shownStatus === 'partial'
                  ? t.payments.partialStatus
                  : t.payments.unpaidStatus}
              </button>

              {/* Remove this student from the list */}
              <button
                type="button"
                onClick={() => setStudentToRemove(student)}
                title={t.groups.removeFromList}
                aria-label={t.groups.removeFromList}
                className="shrink-0 p-1 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <span className="flex-1" />

              {/* Name — tap to open the student profile (months paid / not paid) */}
              <button
                type="button"
                dir="auto"
                onClick={() => setProfileStudent(student)}
                title={t.students.viewProfileBtn}
                className="text-sm font-semibold text-slate-900 truncate max-w-[60%] text-right hover:text-indigo-700 cursor-pointer"
              >
                {student.name}
              </button>
            </div>
          );
        })}
      </div>

      {profileStudent && (
        <StudentProfileModal student={profileStudent} onClose={() => setProfileStudent(null)} />
      )}

      {confirmUnpaid && (
        <ConfirmDialog
          isOpen={!!confirmUnpaid}
          onClose={() => setConfirmUnpaid(null)}
          onConfirm={() => {
            togglePaid(confirmUnpaid.id, true);
            setConfirmUnpaid(null);
          }}
          title={t.groups.markUnpaidTitle}
          message={t.groups.markUnpaidMessage.replace('{name}', confirmUnpaid.name)}
          confirmText={t.groups.markUnpaidConfirm}
          variant="danger"
        />
      )}

      {studentToRemove && (
        <ConfirmDialog
          isOpen={!!studentToRemove}
          onClose={() => setStudentToRemove(null)}
          onConfirm={() => {
            setGroupStudents(
              groupId,
              safeStudentIds.filter((id) => id !== studentToRemove.id)
            );
            setStudentToRemove(null);
          }}
          title={t.groups.removeFromListTitle}
          message={t.groups.removeFromListMessage.replace('{name}', studentToRemove.name)}
          confirmText={t.groups.removeFromListConfirm}
          variant="danger"
        />
      )}
    </>
  );
};

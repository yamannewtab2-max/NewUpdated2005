import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentRecord } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EditPaymentModal } from './EditPaymentModal';
import { Check, Edit3, DollarSign, ArrowRight } from 'lucide-react';

interface PaymentTableProps {
  groupId: string;
  studentIds: string[];
}

export const PaymentTable: React.FC<PaymentTableProps> = ({ groupId, studentIds }) => {
  const {
    t,
    getStudent,
    getStudentPayment,
    getGroup,
    getStudentGroup,
    getMahja,
    getRoom,
    markAsPaid,
    updatePayment,
    formatMoney,
    currencySymbol,
    currency,
  } = useApp();
  const group = getGroup(groupId);

  // States for confirmation and editing
  const [studentToMarkPaid, setStudentToMarkPaid] = useState<{ student: Student; required: number } | null>(null);
  const [studentToEdit, setStudentToEdit] = useState<{ student: Student; record?: PaymentRecord } | null>(null);

  // Partial payment quick-input state per student (temporary local input)
  const [quickInputAmounts, setQuickInputAmounts] = useState<Record<string, string>>({});

  const defaultRequired = group ? group.paymentAmount : currency === 'IDR' ? 50000 : 100;

  const handleQuickAmountChange = (studentId: string, value: string) => {
    setQuickInputAmounts((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleQuickPartialApply = (studentId: string, currentRequired: number) => {
    const val = quickInputAmounts[studentId];
    if (val === undefined || val === '') return;
    const num = Math.max(0, Number(val) || 0);
    updatePayment(groupId, studentId, num, currentRequired);
    // clear input
    setQuickInputAmounts((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  };

  const safeStudentIds = Array.isArray(studentIds) ? studentIds.filter(Boolean) : [];

  if (safeStudentIds.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        {t.groups.noStudentsInGroupDesc}
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 sm:px-6">{t.payments.tableStudent}</th>
              <th className="py-3 px-4">{t.payments.tableRequired}</th>
              <th className="py-3 px-4">{t.payments.tablePaid}</th>
              <th className="py-3 px-4">{t.payments.tableStatus}</th>
              <th className="py-3 px-4 sm:px-6 text-right">{t.payments.tableAction}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {safeStudentIds.map((studentId) => {
              const student = getStudent(studentId);
              if (!student) return null;

              const payment = getStudentPayment(groupId, studentId);
              const required = payment ? payment.requiredAmount : defaultRequired;
              const paid = payment ? payment.paidAmount : 0;
              const status = payment ? payment.status : 'unpaid';

              const initials = student.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              const studentGroup = student.studentGroupId ? getStudentGroup(student.studentGroupId) : null;
              const mahjaObj = student.mahjaId ? getMahja(student.mahjaId) : undefined;
              const roomObj = student.roomId ? getRoom(student.roomId) : undefined;

              return (
                <tr key={studentId} className="hover:bg-slate-50/60 transition-colors group">
                  {/* Student Name */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200/60">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                            {student.name}
                          </p>
                          {student.level && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-200">
                              {student.level}
                            </span>
                          )}
                          {studentGroup && (
                            <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100/80">
                              {studentGroup.name}
                            </span>
                          )}
                        </div>
                        {(roomObj || mahjaObj) && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="text-slate-500 font-sans">
                              {mahjaObj?.name || 'Mahja'} {roomObj ? `/ ${roomObj.name}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Required Amount */}
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-600 text-xs sm:text-sm">
                    {formatMoney(required)}
                  </td>

                  {/* Paid Amount & Quick Partial Input */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-1">
                      <span className="font-mono font-bold text-slate-900 text-xs sm:text-sm">
                        {formatMoney(paid)}
                      </span>
                      {status !== 'paid' && (
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <div className="relative flex items-center w-24 sm:w-28">
                            <span className="absolute left-2 text-[10px] text-slate-400 font-mono font-semibold">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              step="any"
                              placeholder="Partial"
                              value={quickInputAmounts[studentId] ?? ''}
                              onChange={(e) => handleQuickAmountChange(studentId, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleQuickPartialApply(studentId, required);
                                }
                              }}
                              className={`w-full text-[11px] ${
                                currencySymbol.length > 1 ? 'pl-7' : 'pl-5'
                              } pr-1.5 py-0.5 bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 font-mono`}
                            />
                          </div>
                          {quickInputAmounts[studentId] !== undefined && quickInputAmounts[studentId] !== '' && (
                            <button
                              onClick={() => handleQuickPartialApply(studentId, required)}
                              className="p-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-semibold transition-colors"
                              title="Apply amount"
                            >
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <Badge status={status}>
                      {status === 'paid'
                        ? t.payments.paidStatus
                        : status === 'partial'
                        ? `${t.payments.partialStatus} (${formatMoney(paid)})`
                        : t.payments.unpaidStatus}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {status !== 'paid' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => setStudentToMarkPaid({ student, required })}
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          className="text-xs"
                        >
                          {t.payments.markAsPaid}
                        </Button>
                      )}

                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setStudentToEdit({ student, record: payment })}
                        leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                        className="text-xs"
                      >
                        {t.payments.editPayment}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Confirmation Dialog before marking payment as paid */}
      {studentToMarkPaid && (
        <ConfirmDialog
          isOpen={!!studentToMarkPaid}
          onClose={() => setStudentToMarkPaid(null)}
          onConfirm={() => {
            markAsPaid(groupId, studentToMarkPaid.student.id);
          }}
          title={t.payments.markPaidConfirmTitle}
          message={t.payments.markPaidConfirmMessage
            .replace('{name}', studentToMarkPaid.student.name)
            .replace('{amount}', formatMoney(studentToMarkPaid.required))}
          confirmText={t.payments.confirmMarkPaidBtn}
          variant="success"
        />
      )}

      {/* Edit Payment Modal */}
      {studentToEdit && (
        <EditPaymentModal
          isOpen={!!studentToEdit}
          onClose={() => setStudentToEdit(null)}
          groupId={groupId}
          student={studentToEdit.student}
          paymentRecord={studentToEdit.record}
        />
      )}
    </>
  );
};

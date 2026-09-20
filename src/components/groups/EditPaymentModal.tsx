import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Student, PaymentRecord } from '../../types';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DollarSign, Check, X } from 'lucide-react';

interface EditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  student: Student | null;
  paymentRecord?: PaymentRecord;
}

export const EditPaymentModal: React.FC<EditPaymentModalProps> = ({
  isOpen,
  onClose,
  groupId,
  student,
  paymentRecord,
}) => {
  const { t, getGroup, updatePayment, formatMoney, currencySymbol, currency } = useApp();
  const group = getGroup(groupId);

  const defaultRequired = group ? group.paymentAmount : currency === 'IDR' ? 50000 : 100;
  const initialRequired = paymentRecord ? paymentRecord.requiredAmount : defaultRequired;
  const initialPaid = paymentRecord ? paymentRecord.paidAmount : 0;

  const [requiredAmount, setRequiredAmount] = useState<number | string>(initialRequired);
  const [paidAmount, setPaidAmount] = useState<number | string>(initialPaid);

  useEffect(() => {
    if (paymentRecord) {
      setRequiredAmount(paymentRecord.requiredAmount);
      setPaidAmount(paymentRecord.paidAmount);
    } else if (group) {
      setRequiredAmount(group.paymentAmount);
      setPaidAmount(0);
    }
  }, [paymentRecord, group, isOpen]);

  if (!student) return null;

  const numRequired = Math.max(0, Number(requiredAmount) || 0);
  const numPaid = Math.max(0, Number(paidAmount) || 0);

  // Determine prospective status
  let prospectiveStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
  if (numPaid >= numRequired && numRequired > 0) {
    prospectiveStatus = 'paid';
  } else if (numPaid > 0) {
    prospectiveStatus = 'partial';
  }

  const handleQuickFull = () => {
    setPaidAmount(numRequired);
  };

  const handleQuickHalf = () => {
    setPaidAmount(Math.round(numRequired / 2));
  };

  const handleQuickZero = () => {
    setPaidAmount(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePayment(groupId, student.id, numPaid, numRequired);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t.payments.editPaymentTitle.replace('{name}', student.name)}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student & Status Summary */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-900">{student.name}</p>
            {student.level && (
              <p className="text-[11px] text-amber-700 font-medium">{student.level}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              Current Status
            </span>
            <Badge status={prospectiveStatus}>
              {prospectiveStatus === 'paid'
                ? t.payments.paidStatus
                : prospectiveStatus === 'partial'
                ? `${t.payments.partialStatus} (${formatMoney(numPaid)})`
                : t.payments.unpaidStatus}
            </Badge>
          </div>
        </div>

        {/* Required and Paid inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            type="number"
            min="0"
            step="any"
            label={t.payments.requiredAmountLabel}
            value={requiredAmount}
            onChange={(e) => setRequiredAmount(e.target.value)}
            leftIcon={
              <span className="text-xs font-mono font-bold text-slate-500">
                {currencySymbol}
              </span>
            }
          />

          <Input
            type="number"
            min="0"
            step="any"
            label={t.payments.paidAmountLabel}
            placeholder={t.payments.enterAmountPlaceholder}
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            leftIcon={
              <span className="text-xs font-mono font-bold text-slate-500">
                {currencySymbol}
              </span>
            }
            autoFocus
          />
        </div>

        {/* Quick Amount Shortcuts */}
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1.5 block">
            Quick Actions
          </label>
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={handleQuickFull}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors inline-flex items-center gap-1"
            >
              <Check className="w-3 h-3" />
              Full ({formatMoney(numRequired)})
            </button>
            <button
              type="button"
              onClick={handleQuickHalf}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 transition-colors"
            >
              50% ({formatMoney(Math.round(numRequired / 2))})
            </button>
            <button
              type="button"
              onClick={handleQuickZero}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear ({formatMoney(0)})
            </button>
          </div>
        </div>

        {/* Balance preview */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">{t.overview.remainingAmount}:</span>
          <span className="font-mono font-bold text-slate-800">
            {formatMoney(Math.max(0, numRequired - numPaid))}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t.students.cancel}
          </Button>
          <Button type="submit" variant="primary">
            {t.payments.savePaymentBtn}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

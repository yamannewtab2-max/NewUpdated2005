import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'success';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
  isLoading = false,
}) => {
  const icons = {
    danger: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    primary: <Info className="w-5 h-5 text-indigo-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
  };

  const bgColors = {
    danger: 'bg-rose-50',
    primary: 'bg-indigo-50',
    success: 'bg-emerald-50',
  };

  const buttonVariants = {
    danger: 'danger' as const,
    primary: 'primary' as const,
    success: 'success' as const,
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl shrink-0 ${bgColors[variant]}`}>
            {icons[variant]}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed pt-0.5">{message}</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <Button variant="secondary" size="md" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={buttonVariants[variant]}
            size="md"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

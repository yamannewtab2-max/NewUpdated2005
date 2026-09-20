import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    // Overlay is the scroll container; the dialog never grows past the viewport.
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-contain">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Position wrapper: top-aligned on phones so tall dialogs stay reachable */}
      <div className="relative flex min-h-full items-start justify-center p-3 sm:items-center sm:p-6">
        {/* Modal Dialog */}
        <div
          className={`relative z-10 w-full ${maxWidthStyles[maxWidth]} flex max-h-[calc(100vh-1.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-2xl animate-in zoom-in-95 duration-200 sm:max-h-[calc(100vh-3rem)]`}
          role="dialog"
          aria-modal="true"
        >
          {/* Header — always visible, body scrolls beneath it */}
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 px-4 py-3.5 sm:px-5 sm:py-4">
            <div className="min-w-0">
              <h3 dir="auto" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight break-words">
                {title}
              </h3>
              {description && <p className="text-xs text-slate-500 mt-1 break-words">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">{children}</div>
        </div>
      </div>
    </div>
  );
};

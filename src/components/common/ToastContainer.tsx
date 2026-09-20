import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-indigo-600 shrink-0" />,
  };

  const borderColors = {
    success: 'border-emerald-100 bg-white',
    error: 'border-rose-100 bg-white',
    warning: 'border-amber-100 bg-white',
    info: 'border-indigo-100 bg-white',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl shadow-lg border ${borderColors[toast.type]} animate-in slide-in-from-bottom-2 duration-200`}
        >
          <div className="mt-0.5">{icons[toast.type]}</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800">{toast.title}</p>
            {toast.message && (
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{toast.message}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

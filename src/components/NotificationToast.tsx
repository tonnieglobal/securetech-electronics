import React from 'react';
import { CheckCircle2, MessageCircle, AlertCircle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'whatsapp' | 'info' | 'warning';
  title: string;
  description: string;
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 transition-all duration-300 animate-slideUp"
        >
          {toast.type === 'whatsapp' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <MessageCircle className="w-4 h-4 fill-emerald-500/20" />
            </div>
          ) : toast.type === 'success' ? (
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white leading-tight font-mono">
              {toast.title}
            </h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug font-mono">
              {toast.description}
            </p>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

import React from 'react';
import { X, MessageSquare, CheckCircle2, Info } from 'lucide-react';
import { useSalon } from '../context/SalonContext';

export const NotificationToast: React.FC = () => {
  const { toasts, dismissToast } = useSalon();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 flex items-start gap-3 animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="p-1.5 rounded-xl bg-slate-100 text-slate-800 shrink-0 mt-0.5">
            {toast.type === 'sms' || toast.type === 'whatsapp' ? (
              <MessageSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
          </div>

          <div className="flex-1 flex flex-col">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {toast.title}
            </span>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              {toast.message}
            </p>
            <span className="text-[10px] text-slate-400 font-mono mt-1">
              {toast.timestamp} · Automated Gateway
            </span>
          </div>

          <button
            onClick={() => dismissToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-1 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

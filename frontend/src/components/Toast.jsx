import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              isSuccess
                ? 'bg-[#F7F9F2] border-[#727C3E]/40 text-[#29231D]'
                : isError
                ? 'bg-[#FDF3F2] border-[#C84B31]/40 text-[#29231D]'
                : 'bg-[#FFFDF8] border-[#E4D8BE] text-[#29231D]'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess ? (
                <CheckCircle2 className="w-5 h-5 text-[#727C3E]" />
              ) : isError ? (
                <AlertTriangle className="w-5 h-5 text-[#C84B31]" />
              ) : (
                <Info className="w-5 h-5 text-[#D6B238]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h5 className="text-xs font-bold font-['Outfit']">{toast.title || 'Notification'}</h5>
              <p className="text-[11px] text-[#6F7889] mt-0.5 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss && onDismiss(toast.id)}
              className="text-[#6F7889] hover:text-[#29231D] p-1 rounded-lg hover:bg-black/5 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

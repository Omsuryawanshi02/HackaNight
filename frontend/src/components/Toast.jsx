import React from 'react';
<<<<<<< HEAD
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toasts = [], onDismiss }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
=======
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = Info;
        let borderClass = 'border-white/12 bg-[#1e3264]/95 text-white';
        let iconClass = 'text-[#FFE14F]';

        if (toast.type === 'success') {
          Icon = CheckCircle2;
          borderClass = 'border-emerald-500/30 bg-[#112a1e]/95 text-emerald-100';
          iconClass = 'text-emerald-400';
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = 'border-[#FFE14F]/35 bg-[#2a2510]/95 text-amber-100';
          iconClass = 'text-[#FFE14F]';
        } else if (toast.type === 'error') {
          Icon = AlertCircle;
          borderClass = 'border-rose-500/30 bg-[#2a1420]/95 text-rose-100';
          iconClass = 'text-rose-400';
        }
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a

        return (
          <div
            key={toast.id}
<<<<<<< HEAD
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
=======
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-2xl transition-all ${borderClass}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconClass}`} />
            <div className="flex-1">
              {toast.title && <h4 className="text-xs font-bold tracking-tight">{toast.title}</h4>}
              <p className="text-xs opacity-85 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition shrink-0 cursor-pointer"
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

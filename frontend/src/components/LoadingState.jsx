import React from 'react';
<<<<<<< HEAD
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Analyzing structural data...', minHeight = 'h-64' }) {
  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center p-8 bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE]`}>
      <div className="w-12 h-12 rounded-2xl bg-[#D6B238]/20 flex items-center justify-center text-[#29231D] mb-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#D6B238]" />
      </div>
      <p className="text-xs font-bold text-[#29231D] font-['Outfit']">{message}</p>
      <p className="text-[11px] text-[#6F7889] mt-1">Please wait while PRAMAAN AI processes your request.</p>
=======
import { Loader2, AlertCircle, FileX, Sparkles } from 'lucide-react';

export default function LoadingState({ 
  type = 'spinner',
  title = 'Loading data...',
  message,
  onRetry,
  step
}) {
  if (type === 'empty') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center glass-card-subtle border-dashed border-white/10">
        <div className="p-3 bg-white/5 rounded-full text-slate-400 mb-3">
          <FileX className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title || 'No records found'}</h3>
        {message && <p className="text-xs text-[#8b8c8e] mt-1 max-w-sm">{message}</p>}
      </div>
    );
  }

  if (type === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-500/10 rounded-2xl border border-rose-500/25">
        <div className="p-3 bg-rose-500/20 rounded-full text-rose-400 mb-3">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-sm font-semibold text-white">{title || 'Something went wrong'}</h3>
        {message && <p className="text-xs text-rose-300 mt-1 max-w-md">{message}</p>}
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-4 px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500 transition"
          >
            Retry Action
          </button>
        )}
      </div>
    );
  }

  if (type === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center p-10 glass-card text-center">
        <div className="relative mb-5">
          <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-[#FFE14F] animate-spin flex items-center justify-center">
          </div>
          <Sparkles className="w-6 h-6 text-[#FFE14F] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <h4 className="text-base font-bold text-white tracking-tight">{title || 'AI Vision Model Analyzing Photograph...'}</h4>
        <p className="text-xs text-[#8b8c8e] mt-1.5 max-w-md">
          {message || 'Extracting structural features, detecting rebar spacing, validating against milestone specification...'}
        </p>
        {step && (
          <div className="mt-4 px-3.5 py-1.5 glass-chip rounded-full text-xs font-mono font-medium text-[#FFE14F] border border-[#FFE14F]/30">
            {step}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Loader2 className="w-8 h-8 text-[#FFE14F] animate-spin mb-2" />
      <p className="text-xs font-medium text-[#8b8c8e]">{title}</p>
>>>>>>> 9ed836eb567ac6cf8987eb3b63d40b7ce78ad82a
    </div>
  );
}

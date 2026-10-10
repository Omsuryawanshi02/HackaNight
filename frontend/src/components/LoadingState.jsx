import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Analyzing structural data...', minHeight = 'h-64' }) {
  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center p-8 bg-[#FFFDF8] rounded-2xl border border-[#E4D8BE]`}>
      <div className="w-12 h-12 rounded-2xl bg-[#D6B238]/20 flex items-center justify-center text-[#29231D] mb-3">
        <Loader2 className="w-6 h-6 animate-spin text-[#D6B238]" />
      </div>
      <p className="text-xs font-bold text-[#29231D] font-['Outfit']">{message}</p>
      <p className="text-[11px] text-[#6F7889] mt-1">Please wait while PRAMAAN AI processes your request.</p>
    </div>
  );
}

import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  HelpCircle
} from 'lucide-react';

export default function StatusBadge({ status, size = 'md' }) {
  if (!status) return null;

  const normalized = String(status).trim().toLowerCase();

  let colorClasses = 'bg-white/6 text-slate-300 border-white/10';
  let Icon = HelpCircle;

  // Assessments
  if (normalized.includes('supports') || normalized === 'approved' || normalized === 'verified normal' || normalized === 'low' || normalized === 'resolved') {
    colorClasses = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    Icon = CheckCircle2;
  } else if (
    normalized.includes('additional') || 
    normalized.includes('more evidence') || 
    normalized.includes('moderate') || 
    normalized === 'medium' ||
    normalized.includes('warning') ||
    normalized.includes('conditional')
  ) {
    colorClasses = 'bg-[#FFE14F]/15 text-[#FFE14F] border-[#FFE14F]/35';
    Icon = AlertTriangle;
  } else if (
    normalized.includes('requires review') || 
    normalized === 'rejected' || 
    normalized.includes('high') ||
    normalized.includes('discrepancy')
  ) {
    colorClasses = 'bg-rose-500/15 text-rose-300 border-rose-500/30';
    Icon = XCircle;
  } else if (normalized.includes('pending') || normalized === 'open' || normalized.includes('investigation')) {
    colorClasses = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    Icon = Clock;
  }

  const sizeClasses = size === 'sm' 
    ? 'text-[11px] px-2 py-0.5 gap-1' 
    : 'text-xs font-medium px-2.5 py-1 gap-1.5';

  return (
    <span 
      className={`inline-flex items-center rounded-full border font-medium whitespace-nowrap shadow-xs backdrop-blur-sm ${colorClasses} ${sizeClasses}`}
      title={status}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{status}</span>
    </span>
  );
}

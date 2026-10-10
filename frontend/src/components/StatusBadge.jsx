import React from 'react';

export default function StatusBadge({ status = 'Pending', size = 'sm' }) {
  const norm = String(status).toLowerCase();

  let colorClasses = 'bg-[#EDE5D6] text-[#6F7889] border-[#E4D8BE]';

  if (norm.includes('approved') || norm.includes('completed') || norm.includes('verified') || norm.includes('resolved') || norm.includes('normal')) {
    colorClasses = 'bg-[#727C3E]/15 text-[#727C3E] border-[#727C3E]/30';
  } else if (norm.includes('high') || norm.includes('reject') || norm.includes('discrepancy') || norm.includes('open') || norm.includes('critical')) {
    colorClasses = 'bg-[#C84B31]/15 text-[#C84B31] border-[#C84B31]/30';
  } else if (norm.includes('pending') || norm.includes('review') || norm.includes('investigation') || norm.includes('progress')) {
    colorClasses = 'bg-[#D6B238]/20 text-[#29231D] border-[#D6B238]/40';
  }

  const paddingClasses = size === 'xs' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]';

  return (
    <span className={`inline-flex items-center font-bold rounded-full border ${paddingClasses} ${colorClasses} tracking-tight font-['Outfit']`}>
      {status}
    </span>
  );
}

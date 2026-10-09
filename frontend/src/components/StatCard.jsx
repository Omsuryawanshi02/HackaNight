import React from 'react';

export default function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  trendType = 'neutral',
  badge,
  onClick
}) {
  return (
    <div 
      onClick={onClick}
      className={`porcelain-card p-5 transition-all duration-200 hover:-translate-y-0.5 ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold text-[#6F7889] uppercase tracking-wider font-['Outfit']">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-[#29231D] tracking-tight font-['Outfit']">{value}</span>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#EDE5D6] font-semibold text-[#29231D] border border-[#E4D8BE]">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-[#D6B238]/20 border border-[#D6B238]/40 text-[#29231D] shrink-0">
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-bold ${
              trendType === 'positive' ? 'text-[#727C3E]' :
              trendType === 'negative' ? 'text-rose-600' :
              trendType === 'warning' ? 'text-[#8f7215]' : 'text-[#6F7889]'
            }`}>
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[#6F7889] font-medium truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

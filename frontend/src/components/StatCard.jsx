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
      className={`glass-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 ${
        onClick ? 'cursor-pointer hover:shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold text-[#8b8c8e] uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{value}</span>
            {badge && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/6 font-medium text-slate-300 border border-white/10">
                {badge}
              </span>
            )}
          </div>
        </div>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 text-[#FFE14F] shrink-0">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span className={`font-semibold ${
              trendType === 'positive' ? 'text-emerald-400' :
              trendType === 'negative' ? 'text-rose-400' :
              trendType === 'warning' ? 'text-[#FFE14F]' : 'text-slate-400'
            }`}>
              {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-[#8b8c8e] truncate">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}

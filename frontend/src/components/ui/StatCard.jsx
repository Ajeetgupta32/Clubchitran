import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'amber' }) => {
  const colorMap = {
    blue: {
      bg: 'bg-stone-100',
      text: 'text-stone-800',
      border: 'border-stone-200'
    },
    emerald: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      border: 'border-emerald-200/80'
    },
    amber: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-200/80'
    },
    rose: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      border: 'border-rose-200/80'
    },
    violet: {
      bg: 'bg-stone-100',
      text: 'text-stone-800',
      border: 'border-stone-200'
    }
  };

  const scheme = colorMap[color] || colorMap.amber;

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E8E2D5] shadow-xs flex items-start justify-between transition-all hover:border-amber-600/30 hover:shadow-md">
      <div>
        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-stone-900 mt-1.5 tracking-tight">{value}</h3>
        {subtitle && (
          <p className="text-xs text-stone-500 mt-1 flex items-center gap-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div className={`p-3 rounded-2xl ${scheme.bg} ${scheme.text} ${scheme.border} border shadow-xs`}>
          <Icon className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default StatCard;

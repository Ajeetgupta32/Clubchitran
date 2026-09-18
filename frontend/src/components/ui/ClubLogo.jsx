import React from 'react';

export const ClubLogo = ({ 
  size = 'md', 
  showText = true, 
  title = 'Chitran Club', 
  subtitle = 'Photography & Creative Society', 
  dark = false,
  className = '' 
}) => {
  const sizeMap = {
    xs: { box: 'w-7 h-7', text: 'text-sm', sub: 'text-[9px]' },
    sm: { box: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]' },
    md: { box: 'w-10 h-10', text: 'text-lg', sub: 'text-[11px]' },
    lg: { box: 'w-12 h-12', text: 'text-xl', sub: 'text-xs' },
    xl: { box: 'w-16 h-16', text: 'text-2xl', sub: 'text-sm' }
  };

  const config = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex items-center gap-3 ${className} select-none`}>
      {/* Official Kashi Chitran Club Image Logo Badge */}
      <div className={`${config.box} rounded-full bg-white p-0.5 ${dark ? 'ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/10' : 'ring-1 ring-stone-300 shadow-sm'} shrink-0 relative overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-200`}>
        <img
          src="/club-logo.jpeg"
          alt="Chitran Photography Club Logo"
          className="w-full h-full object-contain rounded-full bg-white"
          onError={(e) => {
            if (e.target.src.endsWith('/club-logo.jpeg')) {
              e.target.src = '/club-logo.png';
            } else if (e.target.src.endsWith('/club-logo.png')) {
              e.target.src = '/club--logo.png';
            } else {
              e.target.onerror = null;
            }
          }}
        />
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className={`font-black tracking-tight ${dark ? 'text-white' : 'text-stone-900'} ${config.text} leading-none`}>
              {title === 'Chitran Club' ? (
                <>Chitran <span className={`text-transparent bg-clip-text ${dark ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300' : 'bg-gradient-to-r from-amber-700 to-amber-600'}`}>Club</span></>
              ) : title === 'CampusClub' ? (
                <>Campus<span className={`text-transparent bg-clip-text ${dark ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300' : 'bg-gradient-to-r from-amber-700 to-amber-600'}`}>Club</span></>
              ) : (
                <span>{title}</span>
              )}
            </span>
          </div>
          <span className={`${config.sub} font-bold tracking-wider uppercase ${dark ? 'text-amber-400/90' : 'text-stone-500'} mt-0.5`}>
            {subtitle || 'Photography & Creative Society'}
          </span>
        </div>
      )}
    </div>
  );
};

export default ClubLogo;

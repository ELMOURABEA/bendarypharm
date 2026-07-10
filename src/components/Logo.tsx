import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'header' | 'footer' | 'large' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className = '', variant = 'header' }) => {
  const isDarkBg = variant === 'footer';
  const logoUrl = "https://play-lh.googleusercontent.com/yL9BI7YVzh_lQN4ghSJv387TvBpbGvACLzqe3FLB8l91on2fwDrOeQVFU-QzZJv-5DVdZ9ixbZTvjEKBSO82rRw=s512";

  if (variant === 'icon') {
    return (
      <div className={`w-12 h-12 flex items-center justify-center shrink-0 ${className}`}>
        <img 
          src={logoUrl} 
          alt="صيدليات البنداري" 
          className="w-full h-full object-contain"
          referrerPolicy="no-referrer"
          loading="eager"
        />
      </div>
    );
  }

  if (variant === 'large') {
    return (
      <div className={`flex flex-col items-center text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm max-w-sm mx-auto ${className}`}>
        <div className="w-48 h-48 flex items-center justify-center mb-4">
          <img 
            src={logoUrl} 
            alt="صيدليات البنداري" 
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
            loading="eager"
          />
        </div>
        <div className="flex flex-col items-center">
          <span className="text-xl font-black text-[#CE1126] tracking-tight">
            صيدليات البنداري
          </span>
          <span className="text-xs font-mono font-bold text-gray-500 mt-1">
            BENDAR since 1980
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Official Trademark Icon Image Wrapper */}
      <div className="relative shrink-0 w-12 h-12 md:w-14 md:h-14 flex items-center justify-center">
        <img 
          src={logoUrl} 
          alt="صيدليات البنداري" 
          className="w-full h-full object-contain filter drop-shadow-[0_2px_4px_rgba(206,17,38,0.15)]"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        
        {/* Dynamic green glowing online check signal */}
        {variant === 'header' && (
          <div className="absolute top-0 left-0 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </div>
        )}
      </div>

      {/* Brand Horizontal Typography (Saves vertical space, elegant and perfectly legible on all devices) */}
      <div className={`flex flex-col text-right leading-none border-r ${isDarkBg ? 'border-zinc-700' : 'border-gray-200/80'} pr-3 mr-1`}>
        <span className={`text-sm md:text-base font-black ${isDarkBg ? 'text-white' : 'text-[#CE1126]'}`}>
          صيدليات البنداري
        </span>
        <span className={`text-[10px] md:text-[11px] font-mono font-black mt-1 tracking-wide ${isDarkBg ? 'text-zinc-400' : 'text-zinc-650'}`}>
          BENDAR since 1980
        </span>
      </div>
    </div>
  );
};

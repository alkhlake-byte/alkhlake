import React from 'react';

interface MortarLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  subtitle?: string;
}

export const MortarLogo: React.FC<MortarLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  subtitle,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#2e2a3f] via-[#1c1a27] to-[#12111a] border-2 border-amber-500/40 p-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.6)] shadow-black/70 overflow-hidden group select-none shrink-0"
      >
        {/* Subtle tactical corner notches */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-amber-400/80 rounded-tl-sm pointer-events-none" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-amber-400/80 rounded-tr-sm pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-amber-400/80 rounded-bl-sm pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-amber-400/80 rounded-br-sm pointer-events-none" />

        {/* Ambient glow in center */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.15),transparent_70%)] pointer-events-none" />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.25)]"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="barrelGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#64748b" />
              <stop offset="50%" stopColor="#cbd5e1" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="baseplateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <radialGradient id="targetGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Outer Compass / Mil Scale Ring (6000/6400 mils) */}
          <circle
            cx="50"
            cy="50"
            r="44"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="1"
            strokeDasharray="2 3"
          />
          <circle
            cx="50"
            cy="50"
            r="38"
            stroke="rgba(245, 158, 11, 0.15)"
            strokeWidth="0.75"
          />

          {/* Cardinal Mil Indicators */}
          <line x1="50" y1="4" x2="50" y2="10" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="50" y1="90" x2="50" y2="96" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="4" y1="50" x2="10" y2="50" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />
          <line x1="90" y1="50" x2="96" y2="50" stroke="#f59e0b" strokeWidth="1.75" strokeLinecap="round" />

          {/* Sub Mil Ticks */}
          <line x1="18" y1="18" x2="22" y2="22" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <line x1="82" y1="18" x2="78" y2="22" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <line x1="18" y1="82" x2="22" y2="78" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
          <line x1="82" y1="82" x2="78" y2="78" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />

          {/* 2. Parabolic Ballistic Fire Trajectory Arc */}
          <path
            d="M 68 28 Q 78 12, 85 45 T 86 78"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="2.5 2.5"
            strokeLinecap="round"
            className="animate-pulse"
          />

          {/* Target Impact Area on Right Ground */}
          <circle cx="86" cy="78" r="7" fill="url(#targetGlow)" />
          <circle cx="86" cy="78" r="5" stroke="#ef4444" strokeWidth="1" strokeOpacity="0.9" />
          <circle cx="86" cy="78" r="2" fill="#ef4444" />
          <line x1="86" y1="71" x2="86" y2="85" stroke="#ef4444" strokeWidth="0.75" strokeOpacity="0.8" />
          <line x1="79" y1="78" x2="93" y2="78" stroke="#ef4444" strokeWidth="0.75" strokeOpacity="0.8" />

          {/* 3. Baseplate (Recoil Ground Spade) */}
          <path
            d="M 16 82 L 44 82 L 40 74 L 20 74 Z"
            fill="url(#baseplateGrad)"
            stroke="#94a3b8"
            strokeWidth="1.2"
          />
          {/* Baseplate teeth ribs */}
          <line x1="24" y1="75" x2="22" y2="81" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="30" y1="75" x2="30" y2="81" stroke="#cbd5e1" strokeWidth="1" />
          <line x1="36" y1="75" x2="38" y2="81" stroke="#cbd5e1" strokeWidth="1" />
          {/* Ball socket cup */}
          <circle cx="30" cy="74" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="1" />

          {/* 4. Mortar Bipod Legs */}
          {/* Left / Rear Leg */}
          <line x1="43" y1="52" x2="29" y2="76" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
          {/* Right / Front Leg with traverse shoe */}
          <line x1="43" y1="52" x2="57" y2="76" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 54 76 L 60 76" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />

          {/* Elevating Gear & Traverse Handwheel Mechanism */}
          <circle cx="43" cy="52" r="3.5" fill="#d97706" stroke="#fde68a" strokeWidth="0.75" />
          <line x1="43" y1="48" x2="43" y2="56" stroke="#ffffff" strokeWidth="0.75" />
          <line x1="39" y1="52" x2="47" y2="52" stroke="#ffffff" strokeWidth="0.75" />

          {/* Sight Unit (Panoramic Periscope Optic) */}
          <rect
            x="36"
            y="43"
            width="5"
            height="8"
            rx="1"
            fill="#1e293b"
            stroke="#f59e0b"
            strokeWidth="1"
            transform="rotate(-15 38.5 47)"
          />
          <circle cx="37" cy="45" r="1.2" fill="#38bdf8" />

          {/* 5. Main Heavy Mortar Tube / Barrel (~58° Elevation Angle) */}
          {/* Barrel Body */}
          <path
            d="M 28 73 L 64 26 L 70 31 L 34 78 Z"
            fill="url(#barrelGrad)"
            stroke="#0f172a"
            strokeWidth="1.2"
          />

          {/* Barrel Reinforcement Rings & Cooling Ribs */}
          <line x1="37" y1="62" x2="43" y2="67" stroke="#334155" strokeWidth="1.5" />
          <line x1="45" y1="51" x2="51" y2="56" stroke="#334155" strokeWidth="1.5" />
          <line x1="53" y1="41" x2="59" y2="46" stroke="#334155" strokeWidth="1.5" />

          {/* Golden Muzzle Collar / Gas Vent Ring */}
          <path
            d="M 62 23 L 72 31"
            stroke="url(#goldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M 64 25 L 70 30"
            stroke="#451a03"
            strokeWidth="1"
          />

          {/* Muzzle Flash / Trajectory Launch Spark */}
          <circle cx="68" cy="24" r="2.5" fill="#fef08a" />
          <circle cx="68" cy="24" r="1.2" fill="#ffffff" />
          <line x1="68" y1="20" x2="68" y2="17" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
          <line x1="72" y1="24" x2="75" y2="24" stroke="#fef08a" strokeWidth="1" strokeLinecap="round" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-tactical font-black text-lg sm:text-xl tracking-wide text-white drop-shadow-md">
              حاسبة الهاون التكتيكية
            </span>
            <span className="text-[9px] font-mono-numbers font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider">
              PRO
            </span>
          </div>
          <span className="text-[11px] font-mono-numbers text-amber-400 font-semibold tracking-wider flex items-center gap-1">
            <span>{subtitle || 'MORTAR TACTICAL FIRE CONTROL'}</span>
          </span>
        </div>
      )}
    </div>
  );
};

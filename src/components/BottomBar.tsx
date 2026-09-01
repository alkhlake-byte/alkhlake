import React from 'react';
import { AppTab, Language } from '../types';
import { Target, Database } from 'lucide-react';

interface BottomBarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  lang: Language;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  activeTab,
  onTabChange,
  lang,
}) => {
  const isAr = lang === 'ar';

  return (
    <nav
      className="w-full border-t border-[#2d2a3d] px-4 py-2 flex items-center justify-around sticky bottom-0 z-40 select-none shadow-2xl"
      style={{ backgroundColor: '#1c1b25' }}
    >
      {/* Right in RTL (Main Screen) */}
      <button
        type="button"
        onClick={() => onTabChange('main')}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition cursor-pointer ${
          activeTab === 'main'
            ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#292734]'
        }`}
      >
        <Target className={`w-5 h-5 mb-1 ${activeTab === 'main' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
        <span className="text-xs sm:text-sm font-medium">
          {isAr ? 'القائمة الرئيسية' : 'Main Screen'}
        </span>
      </button>

      {/* Left in RTL (Database Screen) */}
      <button
        type="button"
        onClick={() => onTabChange('database')}
        className={`flex-1 flex flex-col items-center justify-center py-2 px-3 rounded-2xl transition cursor-pointer ${
          activeTab === 'database'
            ? 'bg-amber-500/15 text-amber-400 font-bold border border-amber-500/30 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-[#292734]'
        }`}
      >
        <Database className={`w-5 h-5 mb-1 ${activeTab === 'database' ? 'text-amber-400 stroke-[2.5]' : 'text-slate-400'}`} />
        <span className="text-xs sm:text-sm font-medium">
          {isAr ? 'قاعدة البيانات' : 'Database'}
        </span>
      </button>
    </nav>
  );
};

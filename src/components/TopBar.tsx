import React, { useState } from 'react';
import {
  UserAccount,
  Language,
} from '../types';
import {
  Globe,
  Info,
  LifeBuoy,
  LogOut,
  Settings,
  Mail,
  ChevronDown,
  X,
  Compass,
  Check,
} from 'lucide-react';
import { MortarLogo } from './MortarLogo';
import { UserAccountModal } from './UserAccountModal';

interface TopBarProps {
  user: UserAccount;
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onLogout: () => void;
  onUserUpdated: (user: UserAccount) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  lang,
  onLanguageChange,
  onLogout,
  onUserUpdated,
}) => {
  const isAr = lang === 'ar';
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  const handleOpenEmailApp = () => {
    // Open email client without displaying raw email text in UI as mandated
    const subject = encodeURIComponent(isAr ? 'مدافعية الهاون - دعم فني وشكاوى' : 'Mortar App - Support');
    const body = encodeURIComponent(
      isAr
        ? 'مرحباً، أود إرسال الملاحظات التالية بخصوص تطبيق الرماية بالهاون:'
        : 'Hello, I would like to submit the following inquiry/feedback:'
    );
    window.location.href = `mailto:alkhlake@gmail.com?subject=${subject}&body=${body}`;
    setShowSupportModal(false);
  };

  return (
    <>
      {/* Top Bar Header */}
      <header
        className="w-full border-b border-[#2d2a3d] px-3 sm:px-6 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-lg select-none"
        style={{ backgroundColor: '#1c1b25' }}
      >
        {/* Left Section: User Profile Avatar & Menu */}
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1 rounded-full bg-[#292734] hover:bg-[#343144] border border-amber-500/40 hover:border-amber-400 transition cursor-pointer group"
            title={user.username}
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition pl-0.5 ml-1" />
          </button>

          {/* User Menu Dropdown */}
          {showUserDropdown && (
            <>
              {/* Backdrop to close dropdown on outside click */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserDropdown(false)}
              />

              <div
                className="absolute top-12 ltr:left-0 ltr:right-auto rtl:right-0 rtl:left-auto w-64 max-w-[calc(100vw-24px)] rounded-2xl bg-[#1c1b25] border border-[#3e3b4d] shadow-2xl p-2.5 z-50 animate-fadeIn"
                onClick={() => setShowUserDropdown(false)}
              >
                <div className="p-2.5 border-b border-[#2d2a3d] mb-1">
                  <div className="font-bold text-white text-sm truncate">{user.username}</div>
                  <div className="text-[10px] text-amber-400 font-mono-numbers">
                    {user.hasFingerprint
                      ? isAr
                        ? 'البصمة مفعلة'
                        : 'Fingerprint active'
                      : isAr
                      ? 'بدون بصمة'
                      : 'No biometrics'}
                  </div>
                </div>

                {/* Open Account Modal for 1..4 options */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    setShowAccountModal(true);
                  }}
                  className="w-full text-right rtl:text-right ltr:text-left px-3 py-2.5 rounded-xl text-xs text-slate-200 hover:bg-[#292734] hover:text-amber-300 flex items-center gap-2.5 transition cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{isAr ? 'إدارة كلمة المرور والبصمة' : 'Password & Fingerprint'}</span>
                </button>

                {/* Logout Option */}
                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full text-right rtl:text-right ltr:text-left px-3 py-2.5 rounded-xl text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2.5 transition mt-1 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>{isAr ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center: App Title & Mortar Logo */}
        <div className="flex items-center gap-2">
          <MortarLogo size={36} showText={false} />
          <div className="flex flex-col">
            <span className="font-tactical font-black text-sm sm:text-base text-white tracking-wide leading-tight">
              {isAr ? 'حاسبة الهاون التكتيكية' : 'Tactical Mortar Fire Control'}
            </span>
            <span className="text-[10px] text-amber-400/90 font-mono-numbers leading-none hidden sm:inline">
              {isAr ? 'منظومة حساب الرماية وتوجيه النيران' : 'Ballistic Fire & Elevation Solution'}
            </span>
          </div>
        </div>

        {/* Right Section: Language, About, Support */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language Button */}
          <button
            type="button"
            onClick={() => setShowLangModal(true)}
            className="p-2 rounded-xl bg-[#292734] hover:bg-[#343144] border border-[#3e3b4d] text-slate-300 hover:text-white transition flex items-center gap-1 text-xs"
            title={isAr ? 'إعدادات اللغة' : 'Language'}
          >
            <Globe className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline font-mono-numbers font-semibold">
              {isAr ? 'العربية' : 'EN'}
            </span>
          </button>

          {/* About App Button */}
          <button
            type="button"
            onClick={() => setShowAboutModal(true)}
            className="p-2 rounded-xl bg-[#292734] hover:bg-[#343144] border border-[#3e3b4d] text-slate-300 hover:text-white transition"
            title={isAr ? 'حول التطبيق' : 'About App'}
          >
            <Info className="w-4 h-4 text-amber-400" />
          </button>

          {/* Support and Complaints Button */}
          <button
            type="button"
            onClick={() => setShowSupportModal(true)}
            className="p-2 rounded-xl bg-[#292734] hover:bg-[#343144] border border-[#3e3b4d] text-slate-300 hover:text-white transition"
            title={isAr ? 'الدعم الفني والشكاوي' : 'Support & Complaints'}
          >
            <LifeBuoy className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Account / Password & Fingerprint Modal */}
      {showAccountModal && (
        <UserAccountModal
          user={user}
          lang={lang}
          onClose={() => setShowAccountModal(false)}
          onUserUpdated={(updated) => {
            onUserUpdated(updated);
          }}
        />
      )}

      {/* Language Selection Modal */}
      {showLangModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-xs rounded-2xl border border-[#3e3b4d] shadow-2xl p-5"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2a3d] mb-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>{isAr ? 'إعدادات اللغة' : 'Language Settings'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowLangModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  onLanguageChange('ar');
                  setShowLangModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-semibold transition cursor-pointer ${
                  lang === 'ar'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-[#292734] border-[#3e3b4d] text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>العربية (Arabic)</span>
                {lang === 'ar' && <Check className="w-4 h-4 text-amber-400" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  onLanguageChange('en');
                  setShowLangModal(false);
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm font-semibold transition cursor-pointer ${
                  lang === 'en'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-[#292734] border-[#3e3b4d] text-slate-300 hover:border-slate-500'
                }`}
              >
                <span>English (الإنجليزية)</span>
                {lang === 'en' && <Check className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* About App Modal */}
      {showAboutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border border-[#3e3b4d] shadow-2xl p-6 relative overflow-hidden"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2a3d] mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Info className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'حول التطبيق' : 'About App'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAboutModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center text-center space-y-3">
              <MortarLogo size={64} showText={false} />
              <div>
                <h4 className="font-tactical font-black text-xl text-white">
                  {isAr ? 'حاسبة الهاون التكتيكية' : 'Tactical Mortar Fire Control'}
                </h4>
                <p className="text-xs text-amber-400 font-mono-numbers mt-0.5">
                  {isAr ? 'منظومة حساب الرماية وتوجيه النيران v1.0.0' : 'App Version v1.0.0 (Offline)'}
                </p>
              </div>

              {/* Ballistic Law Card (Requirement #17) */}
              <div className="w-full p-4 rounded-xl bg-[#292734] border border-amber-500/20 text-right rtl:text-right ltr:text-left space-y-2 mt-2">
                <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  <span>{isAr ? 'القانون الثابت في نظام الهاونات:' : 'Fixed Mortar Ballistics Law:'}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 font-mono-numbers list-disc list-inside">
                  <li>{isAr ? 'تُقسم الدائرة إلى ٦٠٠٠ مليم بدلاً من ٣٦٠ درجة.' : 'Circle is divided into 6000 mils instead of 360 degrees.'}</li>
                  <li>{isAr ? 'الدائرة الكاملة = ٣٦٠ درجة = ٦٠٠٠ مليم.' : 'Full Circle = 360° = 6000 mils.'}</li>
                  <li>{isAr ? 'الدرجة الواحدة = ١٦.٦٦ مليم (١٦.٦٦٦٧).' : '1 Degree = 16.6667 mils.'}</li>
                  <li>{isAr ? 'المليم هي وحدة قياس الزوايا والارتفاع في الهاونات.' : 'Mil is the standard angle and elevation unit.'}</li>
                </ul>
              </div>

              <p className="text-[11px] text-slate-400 pt-2">
                {isAr
                  ? 'يعمل التطبيق بالكامل بدون إنترنت، ويحفظ جميع بياناتك بشكل آمن محلياً.'
                  : 'Works completely offline, storing all data securely on your device.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Support & Complaints Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm rounded-2xl border border-[#3e3b4d] shadow-2xl p-6 text-center"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base mb-2">
              {isAr ? 'الدعم الفني والشكاوي' : 'Support & Inquiries'}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {isAr
                ? 'لإرسال استفسار أو مقترح أو شكوى بخصوص التطبيق، انقر أدناه لفتح تطبيق البريد الإلكتروني.'
                : 'To send an inquiry, suggestion or complaint, click below to open your email client.'}
            </p>

            {/* Open Email Client Prompt without showing raw email string */}
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleOpenEmailApp}
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>{isAr ? 'فتح (تطبيق البريد الالكتروني)' : 'Open Email App'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] text-slate-300 text-xs font-semibold transition"
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

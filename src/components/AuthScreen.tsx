import React, { useState, useRef } from 'react';
import {
  Fingerprint,
  Lock,
  User,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { UserAccount, Language } from '../types';
import {
  getAllUsers,
  getUserByUsername,
  saveUser,
  setActiveUserId,
} from '../utils/storage';
import { MortarLogo } from './MortarLogo';

interface AuthScreenProps {
  onLoginSuccess: (user: UserAccount) => void;
  lang: Language;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, lang }) => {
  const isAr = lang === 'ar';
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regAvatar, setRegAvatar] = useState<string>('');
  const [regHasFingerprint, setRegHasFingerprint] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState('');
  const [usernameDuplicateError, setUsernameDuplicateError] = useState(false);

  // Biometrics simulation modal
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);
  const [biometricScanSuccess, setBiometricScanSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setRegError(isAr ? 'حجم الصورة كبير جداً (الحد الأقصى 2 ميغابايت)' : 'Image too large (max 2MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check username availability as user types
  const handleRegUsernameChange = (val: string) => {
    setRegUsername(val);
    if (!val.trim()) {
      setUsernameDuplicateError(false);
      return;
    }
    const existing = getUserByUsername(val);
    setUsernameDuplicateError(!!existing);
  };

  // Perform Standard Password Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginUsername.trim()) {
      setLoginError(isAr ? 'يرجى إدخال اسم المستخدم' : 'Please enter username');
      return;
    }

    const user = getUserByUsername(loginUsername);
    if (!user) {
      setLoginError(isAr ? 'اسم المستخدم غير موجود' : 'User does not exist');
      return;
    }

    if (user.hasPassword && user.password !== loginPassword) {
      setLoginError(isAr ? 'كلمة المرور غير صحيحة' : 'Incorrect password');
      return;
    }

    setActiveUserId(user.id);
    onLoginSuccess(user);
  };

  // Perform Fingerprint Login
  const handleFingerprintLogin = () => {
    const users = getAllUsers();
    if (users.length === 0) {
      setLoginError(
        isAr
          ? 'لا يوجد مستخدمون مسجلون في التطبيق حالياً. يرجى إنشاء حساب جديد أولاً.'
          : 'No registered users found. Please create an account first.'
      );
      return;
    }

    // Check if entered username has fingerprint, or if only 1 user with fingerprint
    let targetUser: UserAccount | undefined;
    if (loginUsername.trim()) {
      targetUser = getUserByUsername(loginUsername);
    } else if (users.length === 1 && users[0].hasFingerprint) {
      targetUser = users[0];
    } else {
      const usersWithFp = users.filter((u) => u.hasFingerprint);
      if (usersWithFp.length === 1) {
        targetUser = usersWithFp[0];
      }
    }

    setIsScanningBiometrics(true);
    setBiometricScanSuccess(false);

    // Realistic tactical biometric scan simulation
    setTimeout(() => {
      if (targetUser && targetUser.hasFingerprint) {
        setBiometricScanSuccess(true);
        setTimeout(() => {
          setIsScanningBiometrics(false);
          setActiveUserId(targetUser!.id);
          onLoginSuccess(targetUser!);
        }, 700);
      } else {
        // If username not entered and multiple users or user doesn't have FP
        if (targetUser && !targetUser.hasFingerprint) {
          setIsScanningBiometrics(false);
          setLoginError(
            isAr
              ? 'هذا المستخدم لم يقم بتفعيل ميزة البصمة. يرجى الدخول بكلمة المرور.'
              : 'Fingerprint is not enrolled for this account. Use password.'
          );
        } else {
          // If no specific user chosen, find first user with FP
          const fpUser = users.find((u) => u.hasFingerprint);
          if (fpUser) {
            setBiometricScanSuccess(true);
            setTimeout(() => {
              setIsScanningBiometrics(false);
              setActiveUserId(fpUser.id);
              onLoginSuccess(fpUser);
            }, 700);
          } else {
            setIsScanningBiometrics(false);
            setLoginError(
              isAr
                ? 'لم يتم تسجيل أي بصمة مسبقاً. يرجى تسجيل الدخول بكلمة المرور.'
                : 'No fingerprint registered. Please log in with password.'
            );
          }
        }
      }
    }, 1200);
  };

  // Perform Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regUsername.trim()) {
      setRegError(isAr ? 'يرجى إدخال اسم المستخدم' : 'Please enter a username');
      return;
    }

    if (getUserByUsername(regUsername)) {
      setUsernameDuplicateError(true);
      return;
    }

    if (regPassword.length > 0 && regPassword.length < 4) {
      setRegError(
        isAr ? 'يجب أن تتكون كلمة المرور من 4 أحرف/أرقام على الأقل' : 'Password must be at least 4 characters'
      );
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(isAr ? 'كلمة المرور وتأكيدها غير متطابقين' : 'Passwords do not match');
      return;
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: regUsername.trim(),
      password: regPassword,
      hasPassword: regPassword.length > 0,
      avatarUrl: regAvatar || undefined,
      hasFingerprint: regHasFingerprint,
      createdAt: Date.now(),
    };

    saveUser(newUser);
    setActiveUserId(newUser.id);
    onLoginSuccess(newUser);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6"
      style={{ backgroundColor: '#292734' }}
    >
      {/* Top Banner / Tactical Header */}
      <div className="w-full max-w-md mb-6 flex flex-col items-center text-center">
        <MortarLogo size={80} showText={false} className="mb-3.5" />
        <h1 className="text-2xl sm:text-3xl font-black font-tactical tracking-wide text-white drop-shadow-md">
          {isAr ? 'حاسبة الهاون التكتيكية' : 'Tactical Mortar Fire Control'}
        </h1>
        <div className="inline-flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-mono-numbers font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
            OFFLINE FIRE CONTROL
          </span>
          <span className="text-xs text-slate-300 font-mono-numbers">
            {isAr
              ? 'منظومة حساب الرماية والذخائر'
              : 'Ballistic Elevation & Charges'}
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#3e3b4d]/60 relative backdrop-blur-sm"
        style={{ backgroundColor: '#1c1b25' }}
      >
        {mode === 'login' ? (
          /* ================= LOGIN VIEW ================= */
          <div>
            <div className="flex items-center justify-between border-b border-[#2d2a3d] pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
              </h2>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono-numbers">
                {isAr ? 'وضع عدم الاتصال' : 'Offline Mode'}
              </span>
            </div>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'اسم المستخدم' : 'Username'}
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginUsername}
                    onChange={(e) => setLoginUsername(e.target.value)}
                    placeholder={isAr ? 'أدخل اسم المستخدم' : 'Enter username'}
                    className="w-full pr-10 pl-4 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter password'}
                    className="w-full pr-10 pl-10 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer"
              >
                <span>{isAr ? 'تسجيل الدخول' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              {/* Fingerprint Login Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFingerprintLogin}
                  className="w-full py-3 px-4 rounded-xl bg-[#292734] hover:bg-[#322f40] border border-amber-500/40 text-amber-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm active:scale-[0.99] transition cursor-pointer"
                >
                  <Fingerprint className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>
                    {isAr
                      ? 'ميزة تسجيل الدخول عبر البصمة بدلا من كلمة المرور'
                      : 'Sign in with Fingerprint instead of password'}
                  </span>
                </button>
              </div>
            </form>

            {/* Switch to Register */}
            <div className="mt-6 pt-5 border-t border-[#2d2a3d] text-center">
              <p className="text-xs text-slate-400">
                {isAr ? 'ليس لديك حساب في التطبيق؟' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setLoginError('');
                  }}
                  className="text-amber-400 font-bold hover:underline cursor-pointer mr-1"
                >
                  {isAr ? 'إنشاء حساب جديد' : 'Create New Account'}
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* ================= REGISTER VIEW ================= */
          <div>
            <div className="flex items-center justify-between border-b border-[#2d2a3d] pb-4 mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-amber-400" />
                <span>{isAr ? 'إنشاء حساب جديد' : 'Create New Account'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-amber-300 transition"
              >
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to Login'}
              </button>
            </div>

            {regError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{regError}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              {/* Profile Avatar Upload */}
              <div className="flex flex-col items-center mb-2">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-full bg-[#292734] border-2 border-dashed border-amber-500/50 hover:border-amber-400 flex items-center justify-center overflow-hidden cursor-pointer group transition"
                >
                  {regAvatar ? (
                    <img
                      src={regAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400 group-hover:text-amber-300 transition">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span className="text-[10px]">
                        {isAr ? 'إضافة صورة' : 'Add Photo'}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-medium transition">
                    {isAr ? 'تغيير' : 'Change'}
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <span className="text-[11px] text-slate-400 mt-1">
                  {isAr ? 'صورة المستخدم (اختياري)' : 'User Photo (Optional)'}
                </span>
              </div>

              {/* Username Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'اسم المستخدم' : 'Username'}
                </label>
                <div className="relative">
                  <User className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => handleRegUsernameChange(e.target.value)}
                    placeholder={isAr ? 'اكتب اسم المستخدم الجديد' : 'Enter username'}
                    className={`w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2.5 rounded-xl bg-[#292734] border text-white text-sm placeholder-slate-500 focus:outline-none transition ${
                      usernameDuplicateError
                        ? 'border-rose-500 ring-1 ring-rose-500'
                        : 'border-[#3e3b4d] focus:border-amber-400'
                    }`}
                  />
                </div>
                {/* User Duplicate Message as specified in requirement #10 */}
                {usernameDuplicateError && (
                  <p className="text-rose-400 text-xs font-semibold mt-1.5 flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{isAr ? '(هذا المستخدم غير متوفر)' : '(This username is unavailable)'}</span>
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={isAr ? 'أدخل كلمة المرور' : 'Enter password'}
                    className="w-full rtl:pr-10 rtl:pl-10 ltr:pl-10 ltr:pr-10 py-2.5 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute left-3.5 rtl:left-3.5 ltr:right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition"
                  >
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute right-3.5 rtl:right-3.5 ltr:left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Confirm password'}
                    className="w-full rtl:pr-10 rtl:pl-4 ltr:pl-10 ltr:pr-4 py-2.5 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                </div>
              </div>

              {/* Add Fingerprint (Requirement #9.5) */}
              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'إضافة بصمة' : 'Add Fingerprint'}
                </label>
                <button
                  type="button"
                  onClick={() => setRegHasFingerprint(!regHasFingerprint)}
                  className={`w-full py-2.5 px-4 rounded-xl border flex items-center justify-between text-xs sm:text-sm font-medium transition cursor-pointer ${
                    regHasFingerprint
                      ? 'bg-amber-500/15 border-amber-400 text-amber-300'
                      : 'bg-[#292734] border-[#3e3b4d] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Fingerprint
                      className={`w-5 h-5 ${
                        regHasFingerprint ? 'text-amber-400' : 'text-slate-400'
                      }`}
                    />
                    <span>
                      {regHasFingerprint
                        ? isAr
                          ? 'تم تفعيل البصمة لهذا الحساب ✓'
                          : 'Fingerprint enrolled ✓'
                        : isAr
                        ? 'انقر لتفعيل تسجيل الدخول بالبصمة'
                        : 'Click to enroll fingerprint'}
                    </span>
                  </div>
                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      regHasFingerprint
                        ? 'bg-amber-400 border-amber-400 text-black'
                        : 'border-slate-500'
                    }`}
                  >
                    {regHasFingerprint && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                </button>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                disabled={usernameDuplicateError}
                className="w-full mt-3 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition cursor-pointer"
              >
                <span>{isAr ? 'إنشاء وحفظ الحساب' : 'Create & Save Account'}</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-amber-400 transition"
              >
                {isAr ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Biometric Scanning Overlay Dialog */}
      {isScanningBiometrics && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-[#1c1b25] border border-amber-500/40 p-6 flex flex-col items-center text-center shadow-2xl">
            <div className="relative w-24 h-24 rounded-full bg-[#292734] border-2 border-amber-500/40 flex items-center justify-center mb-4 overflow-hidden">
              <Fingerprint
                className={`w-14 h-14 ${
                  biometricScanSuccess
                    ? 'text-emerald-400 scale-110'
                    : 'text-amber-400 animate-pulse'
                } transition-all duration-300`}
              />
              {!biometricScanSuccess && (
                <div className="absolute inset-x-0 h-1 bg-amber-400/80 blur-[2px] animate-bounce top-2" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white mb-1">
              {biometricScanSuccess
                ? isAr
                  ? 'تم التحقق من البصمة بنجاح'
                  : 'Biometric Verified'
                : isAr
                ? 'جاري فحص البصمة...'
                : 'Scanning Fingerprint...'}
            </h3>
            <p className="text-xs text-slate-400 mb-4 font-mono-numbers">
              {isAr
                ? 'وضع مصادقة القياسات الحيوية المحلي'
                : 'Local Biometric Authentication Protocol'}
            </p>

            <button
              type="button"
              onClick={() => setIsScanningBiometrics(false)}
              className="py-2 px-6 rounded-xl bg-[#292734] hover:bg-[#383547] text-slate-300 text-xs font-semibold transition"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

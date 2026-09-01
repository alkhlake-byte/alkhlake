import React, { useState } from 'react';
import {
  UserAccount,
  Language,
} from '../types';
import {
  Lock,
  Fingerprint,
  Trash2,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  X,
  Eye,
  EyeOff,
} from 'lucide-react';
import { saveUser } from '../utils/storage';

interface UserAccountModalProps {
  user: UserAccount;
  lang: Language;
  onClose: () => void;
  onUserUpdated: (updatedUser: UserAccount) => void;
}

type SubAction =
  | 'none'
  | 'change_password'
  | 'remove_password'
  | 'change_fingerprint'
  | 'remove_fingerprint';

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  user,
  lang,
  onClose,
  onUserUpdated,
}) => {
  const isAr = lang === 'ar';
  const [activeAction, setActiveAction] = useState<SubAction>('none');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [newPasswordConfirmInput, setNewPasswordConfirmInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [fingerprintEnrolling, setFingerprintEnrolling] = useState(false);

  // Validate existing password if user has one
  const verifyCurrentPassword = (): boolean => {
    if (!user.hasPassword) return true;
    if (confirmPasswordInput !== user.password) {
      setErrorMsg(isAr ? 'كلمة المرور الحالية غير صحيحة' : 'Current password is incorrect');
      return false;
    }
    return true;
  };

  const handleActionExecute = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!verifyCurrentPassword()) return;

    const updated = { ...user };

    if (activeAction === 'change_password') {
      if (!newPasswordInput || newPasswordInput.length < 4) {
        setErrorMsg(
          isAr
            ? 'يجب أن تتكون كلمة المرور الجديدة من 4 خانات على الأقل'
            : 'New password must be at least 4 characters'
        );
        return;
      }
      if (newPasswordInput !== newPasswordConfirmInput) {
        setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
        return;
      }
      updated.password = newPasswordInput;
      updated.hasPassword = true;
      saveUser(updated);
      onUserUpdated(updated);
      setSuccessMsg(isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully');
      setTimeout(() => {
        setActiveAction('none');
        setConfirmPasswordInput('');
        setNewPasswordInput('');
        setNewPasswordConfirmInput('');
      }, 1000);
    } else if (activeAction === 'remove_password') {
      updated.password = '';
      updated.hasPassword = false;
      saveUser(updated);
      onUserUpdated(updated);
      setSuccessMsg(isAr ? 'تم حذف كلمة المرور' : 'Password removed');
      setTimeout(() => {
        setActiveAction('none');
        setConfirmPasswordInput('');
      }, 1000);
    } else if (activeAction === 'change_fingerprint') {
      setFingerprintEnrolling(true);
      setTimeout(() => {
        setFingerprintEnrolling(false);
        updated.hasFingerprint = true;
        saveUser(updated);
        onUserUpdated(updated);
        setSuccessMsg(isAr ? 'تم تحديث وتسجيل البصمة بنجاح' : 'Fingerprint updated successfully');
        setTimeout(() => {
          setActiveAction('none');
          setConfirmPasswordInput('');
        }, 1000);
      }, 1200);
    } else if (activeAction === 'remove_fingerprint') {
      updated.hasFingerprint = false;
      saveUser(updated);
      onUserUpdated(updated);
      setSuccessMsg(isAr ? 'تم حذف البصمة بنجاح' : 'Fingerprint removed');
      setTimeout(() => {
        setActiveAction('none');
        setConfirmPasswordInput('');
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-md rounded-2xl border border-[#3e3b4d] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{ backgroundColor: '#1c1b25' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-[#2e2b3e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-10 h-10 rounded-full object-cover border border-amber-500/50"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-bold text-white text-base">{user.username}</h3>
              <p className="text-[11px] text-slate-400 font-mono-numbers">
                {isAr ? 'إدارة الأمان والبيانات الشخصية' : 'Security & Profile Management'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#292734] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeAction === 'none' ? (
            /* Action Buttons List */
            <div className="space-y-2.5">
              <p className="text-xs text-slate-300 font-semibold mb-2">
                {isAr ? 'خيارات الحماية والحساب:' : 'Account & Security Options:'}
              </p>

              {/* تغيير كلمة المرور */}
              <button
                type="button"
                onClick={() => {
                  setActiveAction('change_password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full p-3 rounded-xl bg-[#292734] hover:bg-[#343142] border border-[#3e3b4d] text-white text-xs sm:text-sm font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {user.hasPassword ? (isAr ? 'مفعلة' : 'Set') : (isAr ? 'غير مفعلة' : 'Not set')}
                </span>
              </button>

              {/* حذف كلمة المرور */}
              <button
                type="button"
                disabled={!user.hasPassword}
                onClick={() => {
                  setActiveAction('remove_password');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full p-3 rounded-xl bg-[#292734] hover:bg-[#343142] disabled:opacity-40 disabled:cursor-not-allowed border border-[#3e3b4d] text-white text-xs sm:text-sm font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'حذف كلمة المرور' : 'Remove Password'}</span>
                </div>
                <span className="text-[11px] text-slate-400">{isAr ? 'إلغاء القفل' : 'Disable'}</span>
              </button>

              {/* تغيير البصمة */}
              <button
                type="button"
                onClick={() => {
                  setActiveAction('change_fingerprint');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full p-3 rounded-xl bg-[#292734] hover:bg-[#343142] border border-[#3e3b4d] text-white text-xs sm:text-sm font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'تغيير البصمة' : 'Change Fingerprint'}</span>
                </div>
                <span className="text-[11px] text-slate-400">
                  {user.hasFingerprint ? (isAr ? 'مفعلة' : 'Enrolled') : (isAr ? 'غير مسجلة' : 'Not set')}
                </span>
              </button>

              {/* حذف البصمة */}
              <button
                type="button"
                disabled={!user.hasFingerprint}
                onClick={() => {
                  setActiveAction('remove_fingerprint');
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full p-3 rounded-xl bg-[#292734] hover:bg-[#343142] disabled:opacity-40 disabled:cursor-not-allowed border border-[#3e3b4d] text-white text-xs sm:text-sm font-medium flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  <span>{isAr ? 'حذف البصمة' : 'Remove Fingerprint'}</span>
                </div>
                <span className="text-[11px] text-slate-400">{isAr ? 'إلغاء التفعيل' : 'Disable'}</span>
              </button>
            </div>
          ) : (
            /* Confirmation and Execution Form */
            <form onSubmit={handleActionExecute} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {activeAction === 'change_password' && (isAr ? 'تغيير كلمة المرور' : 'Change Password')}
                  {activeAction === 'remove_password' && (isAr ? 'تأكيد حذف كلمة المرور' : 'Confirm Remove Password')}
                  {activeAction === 'change_fingerprint' && (isAr ? 'تحديث وتعيين البصمة' : 'Update Fingerprint')}
                  {activeAction === 'remove_fingerprint' && (isAr ? 'تأكيد حذف البصمة' : 'Confirm Remove Fingerprint')}
                </span>
              </div>

              {/* Password Confirmation Prompt (Requirement: عند الضغط على تغيير او حذف كلمة المرور او البصمة تضهر نافذة تأكيد كلمة مرور المستخدم) */}
              {user.hasPassword && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {isAr ? 'أدخل كلمة مرورك الحالية للتأكيد:' : 'Enter current password to confirm:'}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder={isAr ? 'كلمة المرور الحالية' : 'Current password'}
                      className="w-full pr-4 pl-10 py-2.5 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* New Password Fields for change_password */}
              {activeAction === 'change_password' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'كلمة المرور الجديدة:' : 'New password:'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder={isAr ? 'كلمة المرور الجديدة' : 'New password'}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      {isAr ? 'تأكيد كلمة المرور الجديدة:' : 'Confirm new password:'}
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordConfirmInput}
                      onChange={(e) => setNewPasswordConfirmInput(e.target.value)}
                      placeholder={isAr ? 'تأكيد كلمة المرور' : 'Confirm password'}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-xs sm:text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </>
              )}

              {/* Biometric Scanning visual for change_fingerprint */}
              {activeAction === 'change_fingerprint' && (
                <div className="p-4 rounded-xl bg-[#292734] border border-amber-500/30 flex flex-col items-center justify-center text-center">
                  <Fingerprint
                    className={`w-10 h-10 ${
                      fingerprintEnrolling ? 'text-amber-400 animate-pulse' : 'text-slate-400'
                    } mb-2`}
                  />
                  <span className="text-xs text-slate-300">
                    {fingerprintEnrolling
                      ? isAr
                        ? 'جاري حفظ وقراءة البصمة...'
                        : 'Enrolling fingerprint...'
                      : isAr
                      ? 'سيتم تسجيل البصمة الجديدة عند الضغط على تأكيد'
                      : 'New fingerprint will be stored on confirm'}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={fingerprintEnrolling}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition cursor-pointer"
                >
                  {isAr ? 'تأكيد وتنفيذ' : 'Confirm & Apply'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction('none');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="py-2.5 px-4 rounded-xl bg-[#292734] hover:bg-[#383547] text-slate-300 text-xs sm:text-sm font-semibold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

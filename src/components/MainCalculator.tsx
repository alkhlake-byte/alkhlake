import React, { useState, useMemo } from 'react';
import {
  UserAccount,
  Language,
  InterpolationResult,
} from '../types';
import {
  getUserMortars,
  getUserAmmunition,
  getUserChargeEntries,
} from '../utils/storage';
import { calculateMortarSolution } from '../utils/ballistics';
import {
  Target,
  Layers,
  ChevronDown,
  Database,
  ArrowRight,
  Info,
} from 'lucide-react';

interface MainCalculatorProps {
  user: UserAccount;
  lang: Language;
  onNavigateToDatabase: () => void;
}

export const MainCalculator: React.FC<MainCalculatorProps> = ({
  user,
  lang,
  onNavigateToDatabase,
}) => {
  const isAr = lang === 'ar';

  // Mortars & Ammo from local storage for this user
  const mortars = useMemo(() => getUserMortars(user.id), [user.id]);

  // Selected State
  const [selectedMortarId, setSelectedMortarId] = useState<string>('');
  const [selectedAmmoId, setSelectedAmmoId] = useState<string>('');
  const [selectedChargeNumber, setSelectedChargeNumber] = useState<number>(1);
  const [distanceMetersInput, setDistanceMetersInput] = useState<string>('');
  const [elevationDiffMilsInput, setElevationDiffMilsInput] = useState<string>('0');

  // Auto select first mortar if available and none selected
  const activeMortar = useMemo(() => {
    if (!mortars.length) return null;
    return mortars.find((m) => m.id === selectedMortarId) || mortars[0];
  }, [mortars, selectedMortarId]);

  // Available Ammo for active mortar
  const availableAmmoList = useMemo(() => {
    if (!activeMortar) return [];
    return getUserAmmunition(user.id, activeMortar.id);
  }, [user.id, activeMortar]);

  // Active Ammo
  const activeAmmo = useMemo(() => {
    if (!availableAmmoList.length) return null;
    return availableAmmoList.find((a) => a.id === selectedAmmoId) || availableAmmoList[0];
  }, [availableAmmoList, selectedAmmoId]);

  // Available Charges for active ammo (array like [1, 2, 3])
  const configuredCharges = useMemo(() => {
    return activeAmmo?.availableCharges || [1];
  }, [activeAmmo]);

  // Ensure selected charge is valid among configured charges
  const activeChargeNumber = useMemo(() => {
    if (configuredCharges.includes(selectedChargeNumber)) {
      return selectedChargeNumber;
    }
    return configuredCharges[0] || 1;
  }, [configuredCharges, selectedChargeNumber]);

  // Charge distance-elevation entries
  const chargeEntries = useMemo(() => {
    if (!activeAmmo) return [];
    return getUserChargeEntries(user.id, activeAmmo.id, activeChargeNumber);
  }, [user.id, activeAmmo, activeChargeNumber]);

  // Parse inputs
  const targetDistanceMeters = parseFloat(distanceMetersInput) || 0;
  const elevationDiffMils = parseFloat(elevationDiffMilsInput) || 0;

  // Ballistics Solution calculation
  const solution: InterpolationResult = useMemo(() => {
    return calculateMortarSolution(chargeEntries, targetDistanceMeters, elevationDiffMils);
  }, [chargeEntries, targetDistanceMeters, elevationDiffMils]);

  return (
    <div className="w-full max-w-3xl mx-auto p-3 sm:p-6 pb-24 space-y-4 sm:space-y-6">
      {/* If No Mortars exist in DB yet */}
      {mortars.length === 0 ? (
        <div
          className="rounded-2xl p-6 sm:p-8 border border-amber-500/30 text-center space-y-4 shadow-xl"
          style={{ backgroundColor: '#1c1b25' }}
        >
          <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
            <Database className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white font-tactical">
              {isAr ? 'قاعدة البيانات فارغة' : 'Database is Empty'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              {isAr
                ? 'لم تقم بإضافة أي هاونات بعد. انتقل إلى شاشة "قاعدة البيانات" لإضافة الهاون والذخائر وجداول الحشوات والمسافات.'
                : 'No mortars added yet. Go to the "Database" tab to add mortars, ammunition, and charge distance tables.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToDatabase}
            className="py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>{isAr ? 'الانتقال إلى قاعدة البيانات لإضافة هاون' : 'Go to Database to Add Mortar'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </button>
        </div>
      ) : (
        <>
          {/* Main Calculation Control Deck */}
          <div
            className="rounded-2xl p-4 sm:p-6 border border-[#3e3b4d] shadow-xl space-y-5"
            style={{ backgroundColor: '#1c1b25' }}
          >
            {/* Row 1: Mortar & Ammo Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* إختيار نوع الهاون */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إختيار نوع الهاون' : 'Select Mortar Type'}</span>
                </label>
                <div className="relative">
                  <select
                    value={activeMortar?.id || ''}
                    onChange={(e) => {
                      setSelectedMortarId(e.target.value);
                      setSelectedAmmoId('');
                    }}
                    className="w-full appearance-none pr-4 pl-10 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm font-semibold focus:outline-none focus:border-amber-400 transition cursor-pointer"
                  >
                    {mortars.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.caliber})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* إختيار نوع الذخيرة */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{isAr ? 'إختيار نوع الذخيرة' : 'Select Ammunition Type'}</span>
                </label>
                <div className="relative">
                  {availableAmmoList.length > 0 ? (
                    <select
                      value={activeAmmo?.id || ''}
                      onChange={(e) => setSelectedAmmoId(e.target.value)}
                      className="w-full appearance-none pr-4 pl-10 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm font-semibold focus:outline-none focus:border-amber-400 transition cursor-pointer"
                    >
                      {availableAmmoList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full py-3 px-4 rounded-xl bg-[#292734] border border-dashed border-[#3e3b4d] text-xs text-slate-400 flex items-center justify-between">
                      <span>{isAr ? 'لا توجد ذخائر مضافة لهذا الهاون' : 'No ammo added for this mortar'}</span>
                      <button
                        type="button"
                        onClick={onNavigateToDatabase}
                        className="text-amber-400 underline font-bold"
                      >
                        {isAr ? 'إضافة ذخيرة' : 'Add Ammo'}
                      </button>
                    </div>
                  )}
                  {availableAmmoList.length > 0 && (
                    <ChevronDown className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  )}
                </div>
              </div>
            </div>

            {/* إختيار الحشوة */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                  <span>{isAr ? 'إختيار الحشوة' : 'Select Charge'}</span>
                </label>
                <span className="text-[11px] text-amber-400/90 font-mono-numbers">
                  {isAr
                    ? `الحشوة المختارة: [ ${activeChargeNumber} ]`
                    : `Active Charge: [ ${activeChargeNumber} ]`}
                </span>
              </div>

              {/* 8 Small Boxes in a Single Horizontal Row */}
              <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((chargeNum) => {
                  const isConfigured = configuredCharges.includes(chargeNum);
                  const isSelected = activeChargeNumber === chargeNum;

                  return (
                    <button
                      key={chargeNum}
                      type="button"
                      disabled={!isConfigured}
                      onClick={() => setSelectedChargeNumber(chargeNum)}
                      className={`h-11 sm:h-12 rounded-xl flex flex-col items-center justify-center font-tactical font-black text-sm sm:text-base transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300 ring-offset-2 ring-offset-[#1c1b25] shadow-lg shadow-amber-500/30 scale-[1.03]'
                          : isConfigured
                          ? 'bg-[#292734] border border-amber-500/40 text-white hover:bg-[#383547] hover:border-amber-400'
                          : 'bg-[#211f2c]/60 border border-[#2d2a3d] text-slate-600 opacity-40 cursor-not-allowed'
                      }`}
                      title={
                        isConfigured
                          ? isAr
                            ? `حشوة ${chargeNum}`
                            : `Charge ${chargeNum}`
                          : isAr
                          ? `حشوة ${chargeNum} غير متوفرة في هذه الذخيرة`
                          : `Charge ${chargeNum} not configured`
                      }
                    >
                      <span className="leading-none">{chargeNum}</span>
                      <span className="text-[8px] font-mono-numbers opacity-80 mt-0.5">
                        {isAr ? 'حشوة' : 'CH'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Notice if active charge has no table records */}
              {chargeEntries.length === 0 && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center justify-between">
                  <span>
                    {isAr
                      ? `الحشوة (${activeChargeNumber}) لا تحتوي على جدول مسافات بعد.`
                      : `Charge (${activeChargeNumber}) has no distance table yet.`}
                  </span>
                  <button
                    type="button"
                    onClick={onNavigateToDatabase}
                    className="font-bold underline text-white hover:text-amber-300"
                  >
                    {isAr ? 'إضافة مسافات للحشوة' : 'Add table entries'}
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Target Distance & Elevation Diff */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2 border-t border-[#2d2a3d]">
              {/* كتابة المسافة بين مربض الهاون والهدف بالمتر */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>{isAr ? 'المسافة بين مربض الهاون والهدف (متر)' : 'Target Distance (meters)'}</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={distanceMetersInput}
                    onChange={(e) => setDistanceMetersInput(e.target.value)}
                    placeholder={isAr ? 'أدخل المسافة، مثال: 2450' : 'e.g. 2450'}
                    className="w-full rtl:pr-4 rtl:pl-12 ltr:pl-4 ltr:pr-12 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-base sm:text-lg font-mono-numbers font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <span className="absolute rtl:left-3.5 ltr:right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono-numbers text-amber-400 font-bold">
                    {isAr ? 'متر' : 'M'}
                  </span>
                </div>
              </div>

              {/* فارق الارتفاع بالمليم */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'فارق الارتفاع بين المربض والهدف (مليم)' : 'Height Diff (mils)'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={elevationDiffMilsInput}
                    onChange={(e) => setElevationDiffMilsInput(e.target.value)}
                    placeholder="0"
                    className="w-full rtl:pr-4 rtl:pl-12 ltr:pl-4 ltr:pr-12 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-base sm:text-lg font-mono-numbers font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                  />
                  <span className="absolute rtl:left-3.5 ltr:right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono-numbers text-amber-400 font-bold">
                    {isAr ? 'مليم' : 'Mils'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* عرض النتيجة النهائية بالمليم */}
          <div
            className="rounded-2xl p-5 sm:p-7 border-2 border-amber-500/50 shadow-2xl relative overflow-hidden"
            style={{ backgroundColor: '#1c1b25' }}
          >
            {/* Background Tactical Reticle glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d2a3d] pb-4 mb-4">
              <div>
                <span className="text-[11px] font-mono-numbers uppercase tracking-wider text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {isAr ? 'النتيجة النهائية للتوجيه والرماية' : 'Final Ballistic Fire Solution'}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                  {isAr ? 'القيمة الكلية للارتفاع بالمليم (التسديد):' : 'Total Firing Elevation in Mils:'}
                </h3>
              </div>

              {/* Status Badge */}
              <div className="shrink-0">
                {solution.status === 'exact' && (
                  <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold font-mono-numbers">
                    {isAr ? '✓ مطابقة دقيقة من الجدول' : '✓ Exact Table Match'}
                  </span>
                )}
                {solution.status === 'interpolated' && (
                  <span className="text-xs px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold font-mono-numbers">
                    {isAr ? '⚡ تحليل دقيق بين القوسين' : '⚡ Linear Interpolation'}
                  </span>
                )}
                {(solution.status === 'below_min' || solution.status === 'above_max') && (
                  <span className="text-xs px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 font-bold font-mono-numbers">
                    {isAr ? 'استقراء خارج حدود الجدول' : 'Extrapolated'}
                  </span>
                )}
                {solution.status === 'no_data' && (
                  <span className="text-xs px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold">
                    {isAr ? 'لا توجد بيانات' : 'No Data'}
                  </span>
                )}
              </div>
            </div>

            {/* Prominent High-Contrast Mils Display */}
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-[#292734] border border-amber-500/30 shadow-inner">
              <div className="text-xs sm:text-sm text-slate-300 font-semibold mb-1">
                {isAr ? 'زاوية الارتفاع الكلية المضبوطة للهاون:' : 'Total Calculated Mortar Elevation:'}
              </div>

              <div className="flex items-baseline gap-3 my-2">
                <span className="text-5xl sm:text-6xl font-black font-mono-numbers text-amber-400 tracking-tight drop-shadow-[0_4px_12px_rgba(245,158,11,0.3)]">
                  {solution.totalElevationMils !== null ? solution.totalElevationMils : '---'}
                </span>
                <span className="text-lg sm:text-2xl font-tactical font-black text-white">
                  {isAr ? 'مليم' : 'MILS'}
                </span>
              </div>

              {/* Formula & Breakdown Equation */}
              <div className="w-full max-w-lg mt-4 pt-3 border-t border-[#3e3b4d] text-center">
                <div className="text-[11px] sm:text-xs text-slate-300 font-mono-numbers space-y-1">
                  <div className="text-amber-300/90 font-bold">
                    {isAr
                      ? 'حاصل جمع: (ارتفاع جدول المسافات) + (فارق الارتفاع)'
                      : 'Sum: (Table Elevation) + (Height Diff Mils)'}
                  </div>
                  <div className="text-xs font-semibold text-white bg-[#1c1b25] py-2 px-3 rounded-xl border border-[#3e3b4d] flex items-center justify-center gap-2">
                    <span className="text-amber-400 font-bold">
                      {solution.interpolatedElevation !== null ? solution.interpolatedElevation : 0} مليم
                    </span>
                    <span>+</span>
                    <span className="text-sky-400 font-bold">
                      {elevationDiffMils} مليم
                    </span>
                    <span>=</span>
                    <span className="text-emerald-400 font-extrabold text-sm">
                      {solution.totalElevationMils !== null ? solution.totalElevationMils : 0} مليم
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Linear Interpolation Analysis Details (صفي القوسين) */}
            {solution.messageAr && (
              <div className="mt-4 p-3 rounded-xl bg-[#292734]/80 border border-[#3e3b4d] text-xs text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-white">
                    {isAr ? solution.messageAr : solution.messageEn}
                  </span>
                  {solution.lowerEntry && solution.upperEntry && (
                    <div className="text-[11px] font-mono-numbers text-slate-400">
                      {isAr
                        ? `القوس الأدنى: ${solution.lowerEntry.distance}م (${solution.lowerEntry.elevation}مليم) ⟵ الهدف: ${targetDistanceMeters}م ⟶ القوس الأعلى: ${solution.upperEntry.distance}م (${solution.upperEntry.elevation}مليم)`
                        : `Lower Bracket: ${solution.lowerEntry.distance}m (${solution.lowerEntry.elevation}mil) ⟵ Target: ${targetDistanceMeters}m ⟶ Upper: ${solution.upperEntry.distance}m (${solution.upperEntry.elevation}mil)`}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import {
  UserAccount,
  Language,
  Mortar,
  Ammunition,
  ChargeDistanceEntry,
} from '../types';
import {
  getUserMortars,
  saveUserMortar,
  deleteUserMortar,
  getUserAmmunition,
  saveUserAmmunition,
  deleteUserAmmunition,
  getUserChargeEntries,
  saveUserChargeEntry,
  deleteUserChargeEntry,
} from '../utils/storage';
import {
  Plus,
  Trash2,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Database,
  Target,
  Layers,
  Check,
  X,
  AlertTriangle,
  FileSpreadsheet,
  ListPlus,
  ArrowUpDown,
} from 'lucide-react';

interface DatabaseManagerProps {
  user: UserAccount;
  lang: Language;
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({ user, lang }) => {
  const isAr = lang === 'ar';

  // Force re-render on data change
  const [dataVersion, setDataVersion] = useState(0);
  const refreshData = () => setDataVersion((v) => v + 1);

  // Navigation depth
  const [selectedMortar, setSelectedMortar] = useState<Mortar | null>(null);
  const [selectedAmmo, setSelectedAmmo] = useState<Ammunition | null>(null);
  const [selectedChargeNum, setSelectedChargeNum] = useState<number | null>(null);

  // Modals state
  const [showAddMortarModal, setShowAddMortarModal] = useState(false);
  const [editingMortar, setEditingMortar] = useState<Mortar | null>(null);
  const [mortarNameInput, setMortarNameInput] = useState('');
  const [mortarCaliberInput, setMortarCaliberInput] = useState('');

  const [showAddAmmoModal, setShowAddAmmoModal] = useState(false);
  const [editingAmmo, setEditingAmmo] = useState<Ammunition | null>(null);
  const [ammoNameInput, setAmmoNameInput] = useState('');
  const [selectedChargesArray, setSelectedChargesArray] = useState<number[]>([1, 2, 3]);

  const [showAddEntryModal, setShowAddEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ChargeDistanceEntry | null>(null);
  const [entryDistanceInput, setEntryDistanceInput] = useState('');
  const [entryElevationInput, setEntryElevationInput] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'mortar' | 'ammo' | 'entry';
    id: string;
    name: string;
  } | null>(null);

  // Query Data
  const mortars = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = dataVersion;
    return getUserMortars(user.id);
  }, [user.id, dataVersion]);

  const ammunitions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = dataVersion;
    if (!selectedMortar) return [];
    return getUserAmmunition(user.id, selectedMortar.id);
  }, [user.id, selectedMortar, dataVersion]);

  const chargeEntries = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = dataVersion;
    if (!selectedAmmo || selectedChargeNum === null) return [];
    return getUserChargeEntries(user.id, selectedAmmo.id, selectedChargeNum);
  }, [user.id, selectedAmmo, selectedChargeNum, dataVersion]);

  /* ================= MORTAR ACTIONS ================= */
  const handleOpenAddMortar = () => {
    setEditingMortar(null);
    setMortarNameInput('');
    setMortarCaliberInput('');
    setShowAddMortarModal(true);
  };

  const handleOpenEditMortar = (mortar: Mortar, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingMortar(mortar);
    setMortarNameInput(mortar.name);
    setMortarCaliberInput(mortar.caliber);
    setShowAddMortarModal(true);
  };

  const handleSaveMortar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mortarNameInput.trim()) return;

    const mortar: Mortar = {
      id: editingMortar ? editingMortar.id : `mor_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      name: mortarNameInput.trim(),
      caliber: mortarCaliberInput.trim() || (isAr ? '120 مم' : '120mm'),
      createdAt: editingMortar ? editingMortar.createdAt : Date.now(),
    };

    saveUserMortar(user.id, mortar);
    setShowAddMortarModal(false);
    if (selectedMortar && selectedMortar.id === mortar.id) {
      setSelectedMortar(mortar);
    }
    refreshData();
  };

  /* ================= AMMUNITION ACTIONS ================= */
  const handleOpenAddAmmo = () => {
    setEditingAmmo(null);
    setAmmoNameInput('');
    setSelectedChargesArray([1, 2, 3, 4]);
    setShowAddAmmoModal(true);
  };

  const handleOpenEditAmmo = (ammo: Ammunition, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAmmo(ammo);
    setAmmoNameInput(ammo.name);
    setSelectedChargesArray([...ammo.availableCharges]);
    setShowAddAmmoModal(true);
  };

  const toggleChargeInArray = (num: number) => {
    if (selectedChargesArray.includes(num)) {
      if (selectedChargesArray.length === 1) return; // Keep at least one
      setSelectedChargesArray(selectedChargesArray.filter((c) => c !== num));
    } else {
      setSelectedChargesArray([...selectedChargesArray, num].sort((a, b) => a - b));
    }
  };

  const handleSaveAmmo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMortar || !ammoNameInput.trim() || selectedChargesArray.length === 0) return;

    const ammo: Ammunition = {
      id: editingAmmo ? editingAmmo.id : `ammo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      mortarId: selectedMortar.id,
      name: ammoNameInput.trim(),
      availableCharges: selectedChargesArray,
      createdAt: editingAmmo ? editingAmmo.createdAt : Date.now(),
    };

    saveUserAmmunition(user.id, ammo);
    setShowAddAmmoModal(false);
    if (selectedAmmo && selectedAmmo.id === ammo.id) {
      setSelectedAmmo(ammo);
    }
    refreshData();
  };

  /* ================= CHARGE DISTANCE-ELEVATION ENTRIES ================= */
  const handleOpenAddEntry = () => {
    setEditingEntry(null);
    setEntryDistanceInput('');
    setEntryElevationInput('');
    setShowAddEntryModal(true);
  };

  const handleOpenEditEntry = (entry: ChargeDistanceEntry) => {
    setEditingEntry(entry);
    setEntryDistanceInput(entry.distanceMeters.toString());
    setEntryElevationInput(entry.elevationMils.toString());
    setShowAddEntryModal(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMortar || !selectedAmmo || selectedChargeNum === null) return;

    const dist = parseFloat(entryDistanceInput);
    const elev = parseFloat(entryElevationInput);
    if (isNaN(dist) || isNaN(elev)) return;

    const entry: ChargeDistanceEntry = {
      id: editingEntry ? editingEntry.id : `entry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      mortarId: selectedMortar.id,
      ammoId: selectedAmmo.id,
      chargeNumber: selectedChargeNum,
      distanceMeters: dist,
      elevationMils: elev,
      createdAt: editingEntry ? editingEntry.createdAt : Date.now(),
    };

    saveUserChargeEntry(user.id, entry);
    setShowAddEntryModal(false);
    refreshData();
  };

  /* ================= DELETE HANDLER ================= */
  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'mortar') {
      deleteUserMortar(user.id, deleteConfirmTarget.id);
      if (selectedMortar?.id === deleteConfirmTarget.id) {
        setSelectedMortar(null);
        setSelectedAmmo(null);
        setSelectedChargeNum(null);
      }
    } else if (deleteConfirmTarget.type === 'ammo') {
      deleteUserAmmunition(user.id, deleteConfirmTarget.id);
      if (selectedAmmo?.id === deleteConfirmTarget.id) {
        setSelectedAmmo(null);
        setSelectedChargeNum(null);
      }
    } else if (deleteConfirmTarget.type === 'entry') {
      deleteUserChargeEntry(user.id, deleteConfirmTarget.id);
    }

    setDeleteConfirmTarget(null);
    refreshData();
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-3 sm:p-6 pb-24 space-y-5">
      {/* Breadcrumb Navigation Hierarchy */}
      <div
        className="rounded-2xl p-3 sm:p-4 border border-[#3e3b4d] flex items-center gap-2 text-xs sm:text-sm font-semibold overflow-x-auto shadow-md"
        style={{ backgroundColor: '#1c1b25' }}
      >
        <button
          type="button"
          onClick={() => {
            setSelectedMortar(null);
            setSelectedAmmo(null);
            setSelectedChargeNum(null);
          }}
          className={`flex items-center gap-1.5 transition ${
            !selectedMortar ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>{isAr ? 'قاعدة البيانات' : 'Database'}</span>
        </button>

        {selectedMortar && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180 shrink-0" />
            <button
              type="button"
              onClick={() => {
                setSelectedAmmo(null);
                setSelectedChargeNum(null);
              }}
              className={`flex items-center gap-1.5 transition ${
                !selectedAmmo ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{selectedMortar.name}</span>
            </button>
          </>
        )}

        {selectedAmmo && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180 shrink-0" />
            <button
              type="button"
              onClick={() => setSelectedChargeNum(null)}
              className={`flex items-center gap-1.5 transition ${
                selectedChargeNum === null ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{selectedAmmo.name}</span>
            </button>
          </>
        )}

        {selectedChargeNum !== null && (
          <>
            <ChevronRight className="w-4 h-4 text-slate-500 rtl:rotate-180 shrink-0" />
            <span className="text-amber-400 font-bold">
              {isAr ? `حشوة رقم (${selectedChargeNum})` : `Charge (#${selectedChargeNum})`}
            </span>
          </>
        )}
      </div>

      {/* ================= LEVEL 1: MORTARS LIST ================= */}
      {!selectedMortar && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-tactical text-white">
                {isAr ? 'إدارة مدافع الهاون' : 'Mortars Management'}
              </h2>
              <p className="text-xs text-slate-400 font-mono-numbers">
                {isAr ? 'أضف الهاونات وعياراتها لإدخال الذخائر والجداول' : 'Add mortars and calibers'}
              </p>
            </div>

            {/* زر إضافة هاون */}
            <button
              type="button"
              onClick={handleOpenAddMortar}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة هاون' : 'Add Mortar'}</span>
            </button>
          </div>

          {mortars.length === 0 ? (
            <div
              className="p-8 rounded-2xl border border-dashed border-[#3e3b4d] text-center space-y-3"
              style={{ backgroundColor: '#1c1b25' }}
            >
              <Target className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {isAr ? 'لا يوجد هاونات مسجلة في قاعدة بياناتك' : 'No mortars registered in your database'}
                </p>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'اضغط على زر (إضافة هاون) لإضافة الهاون الأول وعياره.'
                    : 'Click "Add Mortar" to create your first mortar profile.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddMortar}
                className="py-2 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] border border-amber-500/40 text-amber-300 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة هاون جديد الآن' : 'Add New Mortar Now'}</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {mortars.map((mortar) => (
                <div
                  key={mortar.id}
                  onClick={() => setSelectedMortar(mortar)}
                  className="p-5 rounded-2xl border border-[#3e3b4d] hover:border-amber-400/60 bg-[#1c1b25] hover:bg-[#22202e] shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold">
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base group-hover:text-amber-300 transition">
                          {mortar.name}
                        </h3>
                        <span className="text-xs font-mono-numbers text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 inline-block mt-0.5">
                          {mortar.caliber}
                        </span>
                      </div>
                    </div>

                    {/* Actions: Edit / Delete */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditMortar(mortar, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#292734] transition"
                        title={isAr ? 'تعديل الهاون' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmTarget({
                            type: 'mortar',
                            id: mortar.id,
                            name: mortar.name,
                          });
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title={isAr ? 'حذف الهاون' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#2d2a3d] flex items-center justify-between text-xs text-slate-400 font-mono-numbers">
                    <span>
                      {getUserAmmunition(user.id, mortar.id).length}{' '}
                      {isAr ? 'أنواع ذخائر' : 'ammo types'}
                    </span>
                    <span className="text-amber-400 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition flex items-center gap-1 font-semibold">
                      <span>{isAr ? 'عرض الذخائر' : 'Open'}</span>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= LEVEL 2: AMMUNITION LIST (داخل الهاون) ================= */}
      {selectedMortar && !selectedAmmo && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-tactical text-white flex items-center gap-2">
                <span>{selectedMortar.name}</span>
                <span className="text-xs font-mono-numbers text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedMortar.caliber}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-numbers">
                {isAr ? 'قائمة الذخائر والحشوات المخصصة لهذا الهاون' : 'Ammunition and charge profiles'}
              </p>
            </div>

            {/* زر إضافة ذخيرة */}
            <button
              type="button"
              onClick={handleOpenAddAmmo}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة ذخيرة' : 'Add Ammunition'}</span>
            </button>
          </div>

          {ammunitions.length === 0 ? (
            <div
              className="p-8 rounded-2xl border border-dashed border-[#3e3b4d] text-center space-y-3"
              style={{ backgroundColor: '#1c1b25' }}
            >
              <Layers className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {isAr ? 'لا توجد ذخائر مضافة لهذا الهاون بعد' : 'No ammunition added for this mortar yet'}
                </p>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'اضغط على زر (إضافة ذخيرة) لتحديد اسم الذخيرة والحشوات المتوفرة (من ١ إلى ٨).'
                    : 'Click "Add Ammunition" to specify ammo name and available charges (1 to 8).'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddAmmo}
                className="py-2 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] border border-amber-500/40 text-amber-300 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة ذخيرة جديدة' : 'Add Ammo Now'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {ammunitions.map((ammo) => (
                <div
                  key={ammo.id}
                  className="p-5 rounded-2xl border border-[#3e3b4d] bg-[#1c1b25] shadow-lg space-y-4"
                >
                  {/* Ammo Header: اسم الذخيرة */}
                  <div className="flex items-center justify-between border-b border-[#2d2a3d] pb-3">
                    <div className="flex items-center gap-2.5">
                      <Layers className="w-5 h-5 text-amber-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono-numbers">
                          {isAr ? 'اسم الذخيرة:' : 'Ammunition Name:'}
                        </span>
                        <h3 className="font-bold text-white text-base">{ammo.name}</h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => handleOpenEditAmmo(ammo, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#292734] transition"
                        title={isAr ? 'تعديل الذخيرة' : 'Edit'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteConfirmTarget({
                            type: 'ammo',
                            id: ammo.id,
                            name: ammo.name,
                          });
                        }}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                        title={isAr ? 'حذف الذخيرة' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* الحشوات المتوفرة - Prompt 3 Requirement */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300">
                        {isAr ? 'الحشوات المتوفرة (انقر على أي حشوة لإدخال جدول المسافات والارتفاع):' : 'Available Charges (Click charge to open distance table):'}
                      </span>
                    </div>

                    {/* 8 Charge boxes row */}
                    <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((chargeNum) => {
                        const isAvailable = ammo.availableCharges.includes(chargeNum);
                        const entriesCount = getUserChargeEntries(user.id, ammo.id, chargeNum).length;

                        return (
                          <button
                            key={chargeNum}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              setSelectedAmmo(ammo);
                              setSelectedChargeNum(chargeNum);
                            }}
                            className={`h-14 rounded-xl flex flex-col items-center justify-center font-tactical transition-all cursor-pointer ${
                              isAvailable
                                ? 'bg-[#292734] hover:bg-[#393549] border border-amber-500/50 text-white hover:border-amber-400 shadow-md active:scale-95'
                                : 'bg-[#1e1d28]/40 border border-[#2d2a3d] text-slate-600 opacity-30 cursor-not-allowed'
                            }`}
                            title={
                              isAvailable
                                ? isAr
                                  ? `فتح جدول حشوة ${chargeNum} (${entriesCount} سجل)`
                                  : `Open charge ${chargeNum} table`
                                : isAr
                                ? 'غير مفعلة'
                                : 'Disabled'
                            }
                          >
                            <span className="text-base font-black leading-none">{chargeNum}</span>
                            <span className="text-[8px] font-mono-numbers text-amber-400 mt-1">
                              {isAvailable ? `${entriesCount} ${isAr ? 'سجل' : 'pts'}` : '-'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= LEVEL 3: CHARGE DISTANCE & ELEVATION TABLE ================= */}
      {selectedMortar && selectedAmmo && selectedChargeNum !== null && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold font-tactical text-white flex items-center gap-2">
                <span>{selectedAmmo.name}</span>
                <span className="text-amber-400 text-sm font-mono-numbers px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30">
                  {isAr ? `حشوة رقم ${selectedChargeNum}` : `Charge #${selectedChargeNum}`}
                </span>
              </h2>
              <p className="text-xs text-slate-400 font-mono-numbers">
                {isAr ? 'جدول المسافات والارتفاع بالمليم للحشوة' : 'Distance & Elevation (Mils) Table'}
              </p>
            </div>

            {/* إضافة مسافة جديدة للحشوة */}
            <button
              type="button"
              onClick={handleOpenAddEntry}
              className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة مسافة وارتفاع' : 'Add Distance Entry'}</span>
            </button>
          </div>

          {chargeEntries.length === 0 ? (
            <div
              className="p-8 rounded-2xl border border-dashed border-[#3e3b4d] text-center space-y-3"
              style={{ backgroundColor: '#1c1b25' }}
            >
              <FileSpreadsheet className="w-12 h-12 text-slate-500 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">
                  {isAr
                    ? `لا توجد بيانات مسافات مضافة للحشوة رقم (${selectedChargeNum})`
                    : `No distance entries for charge #${selectedChargeNum}`}
                </p>
                <p className="text-xs text-slate-400">
                  {isAr
                    ? 'أدخل المسافة بالمتر وقيمة الارتفاع بالمليم المقابلة لها لبناء جدول الرماية.'
                    : 'Add distance in meters and corresponding elevation in mils.'}
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddEntry}
                className="py-2 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] border border-amber-500/40 text-amber-300 text-xs font-semibold inline-flex items-center gap-2 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isAr ? 'إضافة أول مسافة للحشوة' : 'Add First Entry'}</span>
              </button>
            </div>
          ) : (
            <div
              className="rounded-2xl border border-[#3e3b4d] overflow-hidden shadow-xl"
              style={{ backgroundColor: '#1c1b25' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-right rtl:text-right ltr:text-left text-xs sm:text-sm">
                  <thead className="bg-[#292734] border-b border-[#3e3b4d] text-slate-300 font-bold">
                    <tr>
                      <th className="p-3 sm:p-4">{isAr ? 'رقم الحشوة' : 'Charge #'}</th>
                      <th className="p-3 sm:p-4">{isAr ? 'المسافة بالمتر' : 'Distance (m)'}</th>
                      <th className="p-3 sm:p-4">{isAr ? 'الارتفاع بالمليم' : 'Elevation (mils)'}</th>
                      <th className="p-3 sm:p-4 text-center">{isAr ? 'إجراءات' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2d2a3d] font-mono-numbers">
                    {chargeEntries.map((entry) => (
                      <tr
                        key={entry.id}
                        className="hover:bg-[#22202e] transition"
                      >
                        <td className="p-3 sm:p-4 text-amber-400 font-bold">
                          {entry.chargeNumber}
                        </td>
                        <td className="p-3 sm:p-4 text-white font-bold text-sm sm:text-base">
                          {entry.distanceMeters} {isAr ? 'م' : 'm'}
                        </td>
                        <td className="p-3 sm:p-4 text-amber-300 font-bold text-sm sm:text-base">
                          {entry.elevationMils} {isAr ? 'مليم' : 'mils'}
                        </td>
                        <td className="p-3 sm:p-4 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditEntry(entry)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#292734] transition"
                              title={isAr ? 'تعديل السجل' : 'Edit'}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirmTarget({
                                  type: 'entry',
                                  id: entry.id,
                                  name: `${entry.distanceMeters}م = ${entry.elevationMils}مليم`,
                                });
                              }}
                              className="p-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition"
                              title={isAr ? 'حذف السجل' : 'Delete'}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT MORTAR ================= */}
      {showAddMortarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border border-[#3e3b4d] shadow-2xl p-5 sm:p-6"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2a3d] mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                <span>
                  {editingMortar
                    ? isAr
                      ? 'تعديل بيانات الهاون'
                      : 'Edit Mortar'
                    : isAr
                    ? 'إضافة هاون جديد'
                    : 'Add New Mortar'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddMortarModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMortar} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'اسم الهاون:' : 'Mortar Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={mortarNameInput}
                  onChange={(e) => setMortarNameInput(e.target.value)}
                  placeholder={isAr ? 'مثال: هاون عيار 120 ملم، هاون 82' : 'e.g. 120mm Mortar'}
                  className="w-full px-4 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'عيار الهاون:' : 'Mortar Caliber:'}
                </label>
                <input
                  type="text"
                  required
                  value={mortarCaliberInput}
                  onChange={(e) => setMortarCaliberInput(e.target.value)}
                  placeholder={isAr ? 'مثال: 120 مم، 82 مم، 60 مم' : 'e.g. 120mm, 82mm'}
                  className="w-full px-4 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  {isAr ? 'حفظ الهاون' : 'Save Mortar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMortarModal(false)}
                  className="py-3 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] text-slate-300 text-xs sm:text-sm font-semibold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT AMMUNITION ================= */}
      {showAddAmmoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border border-[#3e3b4d] shadow-2xl p-5 sm:p-6"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2a3d] mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-400" />
                <span>
                  {editingAmmo
                    ? isAr
                      ? 'تعديل الذخيرة والحشوات'
                      : 'Edit Ammunition'
                    : isAr
                    ? 'إضافة ذخيرة'
                    : 'Add Ammunition'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAmmoModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAmmo} className="space-y-4">
              {/* اسم الذخيرة */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {isAr ? 'اسم الذخيرة:' : 'Ammunition Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={ammoNameInput}
                  onChange={(e) => setAmmoNameInput(e.target.value)}
                  placeholder={isAr ? 'مثال: ذخيرة شديدة الانفجار HE، دخانية SMOKE' : 'e.g. High Explosive (HE)'}
                  className="w-full px-4 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* الحشوات المتوفرة - 8 خانات على شكل مربعات صغيرة على صف واحد افقي بعلامة ✓ */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-300">
                    {isAr ? 'الحشوات المتوفرة (اختر من ١ إلى ٨ بعلامة ✓):' : 'Available Charges (Select 1 to 8 with ✓):'}
                  </label>
                  <span className="text-[11px] font-mono-numbers text-amber-400">
                    {selectedChargesArray.length} {isAr ? 'حشوة محددة' : 'selected'}
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                    const isChecked = selectedChargesArray.includes(num);

                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => toggleChargeInArray(num)}
                        className={`h-12 rounded-xl flex flex-col items-center justify-center font-tactical text-sm transition cursor-pointer relative ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                            : 'bg-[#292734] border border-[#3e3b4d] text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        <span className="leading-none">{num}</span>
                        {isChecked && (
                          <Check className="w-3.5 h-3.5 mt-0.5 text-slate-950 stroke-[3]" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  {isAr ? 'حفظ الذخيرة' : 'Save Ammunition'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAmmoModal(false)}
                  className="py-3 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] text-slate-300 text-xs sm:text-sm font-semibold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT DISTANCE & ELEVATION ENTRY ================= */}
      {showAddEntryModal && selectedChargeNum !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-md rounded-2xl border border-[#3e3b4d] shadow-2xl p-5 sm:p-6"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#2d2a3d] mb-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <span>
                  {editingEntry
                    ? isAr
                      ? 'تعديل المسافة والارتفاع'
                      : 'Edit Distance Entry'
                    : isAr
                    ? 'إضافة مسافة وارتفاع للحشوة'
                    : 'Add Distance & Elevation Entry'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEntryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="space-y-4">
              {/* رقم الحشوة */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'رقم الحشوة:' : 'Charge Number:'}
                </label>
                <input
                  type="text"
                  disabled
                  value={`${isAr ? 'حشوة رقم' : 'Charge #'} ${selectedChargeNum}`}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#292734]/60 border border-[#3e3b4d] text-amber-400 font-bold font-mono-numbers text-sm opacity-90"
                />
              </div>

              {/* المسافة بالمتر */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'المسافة بالمتر:' : 'Distance in Meters:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={entryDistanceInput}
                    onChange={(e) => setEntryDistanceInput(e.target.value)}
                    placeholder={isAr ? 'أدخل المسافة، مثال: 2000' : 'e.g. 2000'}
                    className="w-full rtl:pr-4 rtl:pl-12 ltr:pl-4 ltr:pr-12 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-base font-mono-numbers font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute rtl:left-3.5 ltr:right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold font-mono-numbers">
                    {isAr ? 'متر' : 'M'}
                  </span>
                </div>
              </div>

              {/* الارتفاع بالمليم */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {isAr ? 'الارتفاع بالمليم:' : 'Elevation in Mils:'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={entryElevationInput}
                    onChange={(e) => setEntryElevationInput(e.target.value)}
                    placeholder={isAr ? 'أدخل الارتفاع بالمليم، مثال: 1045' : 'e.g. 1045'}
                    className="w-full rtl:pr-4 rtl:pl-12 ltr:pl-4 ltr:pr-12 py-3 rounded-xl bg-[#292734] border border-[#3e3b4d] text-white text-base font-mono-numbers font-bold focus:outline-none focus:border-amber-400"
                  />
                  <span className="absolute rtl:left-3.5 ltr:right-3.5 top-1/2 -translate-y-1/2 text-xs text-amber-400 font-bold font-mono-numbers">
                    {isAr ? 'مليم' : 'Mils'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 active:scale-95 transition cursor-pointer"
                >
                  {isAr ? 'حفظ السجل' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddEntryModal(false)}
                  className="py-3 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] text-slate-300 text-xs sm:text-sm font-semibold transition"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full max-w-sm rounded-2xl border border-rose-500/40 shadow-2xl p-6 text-center"
            style={{ backgroundColor: '#1c1b25' }}
          >
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-white text-base mb-1">
              {isAr ? 'تأكيد الحذف' : 'Confirm Delete'}
            </h3>
            <p className="text-xs text-slate-300 mb-5 leading-relaxed">
              {isAr
                ? `هل أنت متأكد من رغبتك في حذف (${deleteConfirmTarget.name})؟ سيتم حذف جميع الجداول والسجلات المرتبطة بها نهائياً.`
                : `Are you sure you want to delete (${deleteConfirmTarget.name}) and all its associated data?`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                {isAr ? 'نعم، حذف' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="py-2.5 px-4 rounded-xl bg-[#292734] hover:bg-[#343144] text-slate-300 text-xs sm:text-sm font-semibold transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

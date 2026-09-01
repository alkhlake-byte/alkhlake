import { UserAccount, Mortar, Ammunition, ChargeDistanceEntry } from '../types';

const STORAGE_KEYS = {
  USERS: 'mortar_app_users_v1',
  ACTIVE_USER_ID: 'mortar_app_active_user_id_v1',
  USER_DATA_PREFIX: 'mortar_app_userdata_',
  APP_LANGUAGE: 'mortar_app_lang_v1',
};

// Users CRUD
export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUser(user: UserAccount): void {
  const users = getAllUsers();
  const existingIdx = users.findIndex((u) => u.id === user.id);
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
}

export function getUserByUsername(username: string): UserAccount | undefined {
  const users = getAllUsers();
  return users.find(
    (u) => u.username.trim().toLowerCase() === username.trim().toLowerCase()
  );
}

export function getActiveUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER_ID);
}

export function setActiveUserId(userId: string | null): void {
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER_ID, userId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER_ID);
  }
}

export function getActiveUser(): UserAccount | null {
  const activeId = getActiveUserId();
  if (!activeId) return null;
  const users = getAllUsers();
  return users.find((u) => u.id === activeId) || null;
}

// User-isolated data structure
interface UserDataPackage {
  mortars: Mortar[];
  ammunition: Ammunition[];
  chargeEntries: ChargeDistanceEntry[];
}

function getUserDataKey(userId: string): string {
  return `${STORAGE_KEYS.USER_DATA_PREFIX}${userId}`;
}

function getUserData(userId: string): UserDataPackage {
  try {
    const raw = localStorage.getItem(getUserDataKey(userId));
    if (!raw) {
      return { mortars: [], ammunition: [], chargeEntries: [] };
    }
    return JSON.parse(raw);
  } catch {
    return { mortars: [], ammunition: [], chargeEntries: [] };
  }
}

function saveUserData(userId: string, data: UserDataPackage): void {
  localStorage.setItem(getUserDataKey(userId), JSON.stringify(data));
}

// Mortars Operations
export function getUserMortars(userId: string): Mortar[] {
  return getUserData(userId).mortars || [];
}

export function saveUserMortar(userId: string, mortar: Mortar): void {
  const data = getUserData(userId);
  const existingIdx = data.mortars.findIndex((m) => m.id === mortar.id);
  if (existingIdx >= 0) {
    data.mortars[existingIdx] = mortar;
  } else {
    data.mortars.push(mortar);
  }
  saveUserData(userId, data);
}

export function deleteUserMortar(userId: string, mortarId: string): void {
  const data = getUserData(userId);
  data.mortars = data.mortars.filter((m) => m.id !== mortarId);
  data.ammunition = data.ammunition.filter((a) => a.mortarId !== mortarId);
  data.chargeEntries = data.chargeEntries.filter((c) => c.mortarId !== mortarId);
  saveUserData(userId, data);
}

// Ammunition Operations
export function getUserAmmunition(userId: string, mortarId?: string): Ammunition[] {
  const ammo = getUserData(userId).ammunition || [];
  if (mortarId) {
    return ammo.filter((a) => a.mortarId === mortarId);
  }
  return ammo;
}

export function saveUserAmmunition(userId: string, ammo: Ammunition): void {
  const data = getUserData(userId);
  const existingIdx = data.ammunition.findIndex((a) => a.id === ammo.id);
  if (existingIdx >= 0) {
    data.ammunition[existingIdx] = ammo;
  } else {
    data.ammunition.push(ammo);
  }
  saveUserData(userId, data);
}

export function deleteUserAmmunition(userId: string, ammoId: string): void {
  const data = getUserData(userId);
  data.ammunition = data.ammunition.filter((a) => a.id !== ammoId);
  data.chargeEntries = data.chargeEntries.filter((c) => c.ammoId !== ammoId);
  saveUserData(userId, data);
}

// Charge Entries Operations
export function getUserChargeEntries(
  userId: string,
  ammoId?: string,
  chargeNumber?: number
): ChargeDistanceEntry[] {
  let entries = getUserData(userId).chargeEntries || [];
  if (ammoId) {
    entries = entries.filter((e) => e.ammoId === ammoId);
  }
  if (chargeNumber !== undefined) {
    entries = entries.filter((e) => e.chargeNumber === chargeNumber);
  }
  // Sort ascending by distance for predictable ballistic interpolation
  return entries.sort((a, b) => a.distanceMeters - b.distanceMeters);
}

export function saveUserChargeEntry(userId: string, entry: ChargeDistanceEntry): void {
  const data = getUserData(userId);
  const existingIdx = data.chargeEntries.findIndex((e) => e.id === entry.id);
  if (existingIdx >= 0) {
    data.chargeEntries[existingIdx] = entry;
  } else {
    data.chargeEntries.push(entry);
  }
  saveUserData(userId, data);
}

export function deleteUserChargeEntry(userId: string, entryId: string): void {
  const data = getUserData(userId);
  data.chargeEntries = data.chargeEntries.filter((e) => e.id !== entryId);
  saveUserData(userId, data);
}

// Language setting
export function getSavedLanguage(): 'ar' | 'en' {
  const lang = localStorage.getItem(STORAGE_KEYS.APP_LANGUAGE);
  return lang === 'en' ? 'en' : 'ar';
}

export function saveLanguage(lang: 'ar' | 'en'): void {
  localStorage.setItem(STORAGE_KEYS.APP_LANGUAGE, lang);
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  hasPassword: boolean;
  avatarUrl?: string;
  hasFingerprint: boolean;
  createdAt: number;
}

export interface Mortar {
  id: string;
  userId: string;
  name: string;
  caliber: string;
  notes?: string;
  createdAt: number;
}

export interface Ammunition {
  id: string;
  userId: string;
  mortarId: string;
  name: string;
  availableCharges: number[]; // e.g. [1, 2, 3, 4, 5, 6, 7, 8]
  createdAt: number;
}

export interface ChargeDistanceEntry {
  id: string;
  userId: string;
  mortarId: string;
  ammoId: string;
  chargeNumber: number; // 1 to 8
  distanceMeters: number;
  elevationMils: number;
  createdAt: number;
}

export type Language = 'ar' | 'en';
export type AppTab = 'main' | 'database';

export interface InterpolationResult {
  status: 'exact' | 'interpolated' | 'below_min' | 'above_max' | 'no_data' | 'no_selection';
  interpolatedElevation: number | null;
  elevationDiffMils: number;
  totalElevationMils: number | null;
  lowerEntry?: { distance: number; elevation: number };
  upperEntry?: { distance: number; elevation: number };
  exactEntry?: { distance: number; elevation: number };
  messageAr: string;
  messageEn: string;
}

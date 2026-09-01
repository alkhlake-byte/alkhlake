import { ChargeDistanceEntry, InterpolationResult } from '../types';

/**
 * Mortar Artillery Constants:
 * Full Circle = 360 degrees = 6000 mils (مليم)
 * 1 degree = 6000 / 360 = 16.666666... mils
 * 1 mil = 360 / 6000 = 0.06 degrees
 */
export const MILS_PER_CIRCLE = 6000;
export const DEGREES_PER_CIRCLE = 360;
export const MILS_PER_DEGREE = MILS_PER_CIRCLE / DEGREES_PER_CIRCLE; // 16.6667

export function degreesToMils(degrees: number): number {
  return degrees * MILS_PER_DEGREE;
}

export function milsToDegrees(mils: number): number {
  return mils / MILS_PER_DEGREE;
}

/**
 * Calculates the interpolated mortar elevation in mils from the charge table
 * and adds the height difference in mils.
 */
export function calculateMortarSolution(
  entries: ChargeDistanceEntry[],
  targetDistanceMeters: number,
  elevationDiffMils: number = 0
): InterpolationResult {
  if (!entries || entries.length === 0) {
    return {
      status: 'no_data',
      interpolatedElevation: null,
      elevationDiffMils,
      totalElevationMils: null,
      messageAr: 'لا توجد بيانات مسافات مضافة لهذه الحشوة في قاعدة البيانات',
      messageEn: 'No distance entries found for this charge in database',
    };
  }

  if (targetDistanceMeters <= 0) {
    return {
      status: 'no_selection',
      interpolatedElevation: null,
      elevationDiffMils,
      totalElevationMils: null,
      messageAr: 'يرجى إدخال مسافة الهدف بالمتر',
      messageEn: 'Please enter target distance in meters',
    };
  }

  // Ensure entries are sorted by distance ascending
  const sorted = [...entries].sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Check exact match
  const exact = sorted.find((e) => Math.abs(e.distanceMeters - targetDistanceMeters) < 0.001);
  if (exact) {
    const interpolatedElevation = exact.elevationMils;
    const totalElevationMils = Math.round((interpolatedElevation + elevationDiffMils) * 10) / 10;
    return {
      status: 'exact',
      interpolatedElevation,
      elevationDiffMils,
      totalElevationMils,
      exactEntry: { distance: exact.distanceMeters, elevation: exact.elevationMils },
      messageAr: `تم العثور على مطابقة تامة للمسافة (${exact.distanceMeters} م)`,
      messageEn: `Exact distance match found (${exact.distanceMeters} m)`,
    };
  }

  const minEntry = sorted[0];
  const maxEntry = sorted[sorted.length - 1];

  // If below minimum recorded distance
  if (targetDistanceMeters < minEntry.distanceMeters) {
    // If only 1 entry or user wants strict table bound
    if (sorted.length === 1) {
      const interpolatedElevation = minEntry.elevationMils;
      const total = Math.round((interpolatedElevation + elevationDiffMils) * 10) / 10;
      return {
        status: 'below_min',
        interpolatedElevation,
        elevationDiffMils,
        totalElevationMils: total,
        lowerEntry: { distance: minEntry.distanceMeters, elevation: minEntry.elevationMils },
        messageAr: `المسافة (${targetDistanceMeters} م) أقل من أدنى مسافة مسجلة (${minEntry.distanceMeters} م)`,
        messageEn: `Target distance (${targetDistanceMeters} m) is below minimum recorded (${minEntry.distanceMeters} m)`,
      };
    }
    // Extrapolate linearly using first two points or bounded
    const p1 = sorted[0];
    const p2 = sorted[1];
    const slope = (p2.elevationMils - p1.elevationMils) / (p2.distanceMeters - p1.distanceMeters);
    const extrapolated = p1.elevationMils + slope * (targetDistanceMeters - p1.distanceMeters);
    const roundedExtrapolated = Math.round(extrapolated * 10) / 10;
    return {
      status: 'below_min',
      interpolatedElevation: roundedExtrapolated,
      elevationDiffMils,
      totalElevationMils: Math.round((roundedExtrapolated + elevationDiffMils) * 10) / 10,
      lowerEntry: { distance: p1.distanceMeters, elevation: p1.elevationMils },
      upperEntry: { distance: p2.distanceMeters, elevation: p2.elevationMils },
      messageAr: `المسافة أقل من الحد الأدنى للجدول - تم التحليل الاستقرائي على أساس أول صفي قوسين`,
      messageEn: `Distance below minimum - extrapolated from first two entries`,
    };
  }

  // If above maximum recorded distance
  if (targetDistanceMeters > maxEntry.distanceMeters) {
    if (sorted.length === 1) {
      const interpolatedElevation = maxEntry.elevationMils;
      const total = Math.round((interpolatedElevation + elevationDiffMils) * 10) / 10;
      return {
        status: 'above_max',
        interpolatedElevation,
        elevationDiffMils,
        totalElevationMils: total,
        upperEntry: { distance: maxEntry.distanceMeters, elevation: maxEntry.elevationMils },
        messageAr: `المسافة (${targetDistanceMeters} م) أكبر من أقصى مسافة مسجلة (${maxEntry.distanceMeters} م)`,
        messageEn: `Target distance (${targetDistanceMeters} m) exceeds maximum recorded (${maxEntry.distanceMeters} m)`,
      };
    }
    const p1 = sorted[sorted.length - 2];
    const p2 = sorted[sorted.length - 1];
    const slope = (p2.elevationMils - p1.elevationMils) / (p2.distanceMeters - p1.distanceMeters);
    const extrapolated = p2.elevationMils + slope * (targetDistanceMeters - p2.distanceMeters);
    const roundedExtrapolated = Math.round(extrapolated * 10) / 10;
    return {
      status: 'above_max',
      interpolatedElevation: roundedExtrapolated,
      elevationDiffMils,
      totalElevationMils: Math.round((roundedExtrapolated + elevationDiffMils) * 10) / 10,
      lowerEntry: { distance: p1.distanceMeters, elevation: p1.elevationMils },
      upperEntry: { distance: p2.distanceMeters, elevation: p2.elevationMils },
      messageAr: `المسافة تتجاوز الحد الأقصى للجدول - تم التحليل الاستقرائي على أساس آخر صفي قوسين`,
      messageEn: `Distance exceeds table maximum - extrapolated from last two entries`,
    };
  }

  // In-range Linear Interpolation between two bounding points (صفي القوسين)
  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];

  for (let i = 0; i < sorted.length - 1; i++) {
    if (
      sorted[i].distanceMeters <= targetDistanceMeters &&
      targetDistanceMeters <= sorted[i + 1].distanceMeters
    ) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const d1 = lower.distanceMeters;
  const e1 = lower.elevationMils;
  const d2 = upper.distanceMeters;
  const e2 = upper.elevationMils;

  // Exact bounds guard
  let interpolatedElevation = e1;
  if (d2 !== d1) {
    const fraction = (targetDistanceMeters - d1) / (d2 - d1);
    interpolatedElevation = e1 + fraction * (e2 - e1);
  }

  const roundedInterpolated = Math.round(interpolatedElevation * 10) / 10;
  const totalElevationMils = Math.round((roundedInterpolated + elevationDiffMils) * 10) / 10;

  return {
    status: 'interpolated',
    interpolatedElevation: roundedInterpolated,
    elevationDiffMils,
    totalElevationMils,
    lowerEntry: { distance: d1, elevation: e1 },
    upperEntry: { distance: d2, elevation: e2 },
    messageAr: `تم تحليل الارتفاع بدقة بين قوس (${d1}م = ${e1}مليم) وقوس (${d2}م = ${e2}مليم)`,
    messageEn: `Interpolated elevation between bracket (${d1}m = ${e1}mil) and (${d2}m = ${e2}mil)`,
  };
}

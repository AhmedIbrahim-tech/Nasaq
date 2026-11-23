import type { WorkShift, WorkSchedule, WorkScheduleDay } from '../types';

/**
 * Returns the localized display name for a work shift with silent fallback.
 * If Arabic is active, prefers nameAr, then nameEn, then name.
 * If English is active, prefers nameEn, then name, then nameAr.
 */
export function getShiftDisplayName(
  shift: { name?: string | null; nameAr?: string | null; nameEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!shift) return '';
  if (isAr) {
    return shift.nameAr?.trim() || shift.nameEn?.trim() || shift.name?.trim() || '';
  }
  return shift.nameEn?.trim() || shift.name?.trim() || shift.nameAr?.trim() || '';
}

/**
 * Returns the localized display name for a work schedule with silent fallback.
 * If Arabic is active, prefers nameAr, then nameEn, then name.
 * If English is active, prefers nameEn, then name, then nameAr.
 */
export function getScheduleDisplayName(
  schedule: { name?: string | null; nameAr?: string | null; nameEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!schedule) return '';
  if (isAr) {
    return schedule.nameAr?.trim() || schedule.nameEn?.trim() || schedule.name?.trim() || '';
  }
  return schedule.nameEn?.trim() || schedule.name?.trim() || schedule.nameAr?.trim() || '';
}

/**
 * Returns the localized display description for a work schedule with silent fallback.
 * If Arabic is active, prefers descriptionAr, then descriptionEn, then description.
 * If English is active, prefers descriptionEn, then description, then descriptionAr.
 */
export function getScheduleDisplayDescription(
  schedule: { description?: string | null; descriptionAr?: string | null; descriptionEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!schedule) return '';
  if (isAr) {
    return schedule.descriptionAr?.trim() || schedule.descriptionEn?.trim() || schedule.description?.trim() || '';
  }
  return schedule.descriptionEn?.trim() || schedule.description?.trim() || schedule.descriptionAr?.trim() || '';
}

/**
 * Returns the localized display shift name for a schedule day with silent fallback.
 */
export function getScheduleDayShiftName(
  day: { shiftName?: string | null; shiftNameAr?: string | null; shiftNameEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!day) return '';
  if (isAr) {
    return day.shiftNameAr?.trim() || day.shiftNameEn?.trim() || day.shiftName?.trim() || '';
  }
  return day.shiftNameEn?.trim() || day.shiftName?.trim() || day.shiftNameAr?.trim() || '';
}

import type { WorkLocation } from '../types';

/**
 * Returns the localized display name for a work location with silent fallback.
 * If Arabic is active, prefers nameAr, then nameEn, then name.
 * If English is active, prefers nameEn, then name, then nameAr.
 */
export function getLocationDisplayName(
  location: { name?: string | null; nameAr?: string | null; nameEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!location) return '';
  if (isAr) {
    return location.nameAr?.trim() || location.nameEn?.trim() || location.name?.trim() || '';
  }
  return location.nameEn?.trim() || location.name?.trim() || location.nameAr?.trim() || '';
}

/**
 * Returns the localized display address for a work location with silent fallback.
 * If Arabic is active, prefers addressAr, then addressEn, then address.
 * If English is active, prefers addressEn, then address, then addressAr.
 */
export function getLocationDisplayAddress(
  location: { address?: string | null; addressAr?: string | null; addressEn?: string | null } | null | undefined,
  isAr: boolean
): string {
  if (!location) return '';
  if (isAr) {
    return location.addressAr?.trim() || location.addressEn?.trim() || location.address?.trim() || '';
  }
  return location.addressEn?.trim() || location.address?.trim() || location.addressAr?.trim() || '';
}

/**
 * Centralized, locale-aware formatting and pluralization utilities for NASAQ.
 * Guarantees proper grammatical handling for Arabic (zero, singular, dual, few, many)
 * and English (singular, plural), eliminating naive concatenation bugs.
 */

export interface PluralForms {
  zero: string;
  one: string;
  two: string;
  few: string; // 3 to 10
  many: string; // 11+
}

/**
 * Returns the grammatically correct Arabic count string.
 */
export function formatArabicPlural(count: number, forms: PluralForms): string {
  const n = Math.abs(count);
  if (n === 0) return forms.zero;
  if (n === 1) return forms.one;
  if (n === 2) return forms.two;

  const remainder100 = n % 100;
  if (remainder100 >= 3 && remainder100 <= 10) {
    return forms.few.replace('{count}', String(n));
  }
  return forms.many.replace('{count}', String(n));
}

/**
 * Formats employee count with full Arabic and English pluralization.
 * Examples (AR): 0 موظف / موظف واحد / موظفان / 5 موظفين / 12 موظفاً
 * Examples (EN): 0 employees / 1 employee / 5 employees
 */
export function formatEmployeesCount(count: number | null | undefined, isRtl: boolean): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;

  if (isRtl) {
    return formatArabicPlural(safeCount, {
      zero: '0 موظف',
      one: 'موظف واحد',
      two: 'موظفان',
      few: '{count} موظفين',
      many: '{count} موظفاً',
    });
  }

  if (safeCount === 1) return '1 employee';
  return `${safeCount} employees`;
}

/**
 * Formats location count with full Arabic and English pluralization.
 */
export function formatLocationsCount(count: number | null | undefined, isRtl: boolean): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;

  if (isRtl) {
    return formatArabicPlural(safeCount, {
      zero: '0 موقع',
      one: 'موقع واحد',
      two: 'موقعان',
      few: '{count} مواقع',
      many: '{count} موقعاً',
    });
  }

  if (safeCount === 1) return '1 location';
  return `${safeCount} locations`;
}

/**
 * Formats selected items count for table toolbars and bulk selection badges.
 */
export function formatSelectedCount(count: number, isRtl: boolean): string {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;

  if (isRtl) {
    return formatArabicPlural(safeCount, {
      zero: 'لا عناصر محددة',
      one: 'عنصر واحد محدد',
      two: 'عنصران محددان',
      few: '{count} عناصر محددة',
      many: '{count} عنصراً محدداً',
    });
  }

  if (safeCount === 1) return '1 item selected';
  return `${safeCount} items selected`;
}

/**
 * Formats bulk delete confirmation message dynamically and accurately.
 */
export function formatBulkDeleteConfirmation(
  count: number,
  entityType: 'employee' | 'location',
  isRtl: boolean
): { title: string; message: string } {
  const safeCount = typeof count === 'number' && !isNaN(count) ? count : 0;

  if (entityType === 'employee') {
    if (isRtl) {
      const msg = formatArabicPlural(safeCount, {
        zero: 'هل أنت متأكد من رغبتك في حذف الموظفين المحددين؟',
        one: 'هل تريد حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.',
        two: 'هل تريد حذف هذين الموظفين؟ لا يمكن التراجع عن هذا الإجراء.',
        few: 'هل تريد حذف الموظفين الـ {count} المحددين؟ لا يمكن التراجع عن هذا الإجراء.',
        many: 'هل تريد حذف الـ {count} موظفاً المحددين؟ لا يمكن التراجع عن هذا الإجراء.',
      });
      return {
        title: 'حذف الموظفين المحددين؟',
        message: msg,
      };
    }

    return {
      title: 'Delete selected employees?',
      message: `Are you sure you want to delete ${
        safeCount === 1 ? 'this employee' : `these ${safeCount} employees`
      }? This action cannot be undone.`,
    };
  }

  // Location entity
  if (isRtl) {
    const msg = formatArabicPlural(safeCount, {
      zero: 'هل أنت متأكد من رغبتك في حذف مواقع العمل المحددة؟',
      one: 'هل تريد حذف موقع العمل هذا؟ لا يمكن التراجع عن هذا الإجراء.',
      two: 'هل تريد حذف موقعي العمل هذين؟ لا يمكن التراجع عن هذا الإجراء.',
      few: 'هل تريد حذف مواقع العمل الـ {count} المحددة؟ لا يمكن التراجع عن هذا الإجراء.',
      many: 'هل تريد حذف مواقع العمل الـ {count} المحددة؟ لا يمكن التراجع عن هذا الإجراء.',
    });
    return {
      title: 'حذف مواقع العمل المحددة؟',
      message: msg,
    };
  }

  return {
    title: 'Delete selected work locations?',
    message: `Are you sure you want to delete ${
      safeCount === 1 ? 'this work location' : `these ${safeCount} work locations`
    }? This action cannot be undone.`,
  };
}

/**
 * Formats a calendar date-only field (e.g. HireDate) consistently in UTC.
 * Extracts the calendar year, month, and day to completely prevent unintended
 * timezone shifts (such as a date displaying one day earlier in negative UTC offsets).
 */
export function formatDateOnly(dateString: string | null | undefined, isRtl?: boolean): string {
  if (!dateString) return '-';
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, y, m, d] = match;
    const utcDate = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
    return utcDate.toLocaleDateString(isRtl ? 'ar-SA-u-nu-latn' : 'en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString(isRtl ? 'ar-SA-u-nu-latn' : 'en-US');
}

/**
 * Extracts the ISO date string (YYYY-MM-DD) for HTML date inputs (<input type="date">)
 * directly from a date string without local timezone conversion.
 */
export function toDateInputValue(dateString: string | null | undefined): string {
  if (!dateString) return '';
  const match = String(dateString).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
}

/**
 * Formats a timestamp (e.g. CreatedDate) in a locale-aware manner,
 * ensuring Arabic time indicators (ص / م) are used instead of raw English AM / PM.
 */
export function formatDateTime(dateString: string | null | undefined, isRtl?: boolean): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(isRtl ? 'ar-SA-u-nu-latn' : 'en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Formats GPS coordinates into an isolated, direction-safe string.
 */
export function formatCoordinates(lat: number | null | undefined, lng: number | null | undefined): string {
  if (lat === null || lat === undefined || lng === null || lng === undefined) return '-';
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

/**
 * Formats a time string (e.g. CheckInTime) in a locale-aware manner.
 */
export function formatTimeOnly(dateString: string | null | undefined, isRtl?: boolean): string {
  if (!dateString) return '-';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return '-';

  return new Intl.DateTimeFormat(isRtl ? 'ar-SA-u-nu-latn' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(d);
}

/**
 * Formats distance in meters into human-readable metric string (meters or kilometers).
 */
export function formatDistance(meters: number | null | undefined, isRtl?: boolean): string {
  if (meters === null || meters === undefined || isNaN(meters)) return '-';
  const m = Math.round(meters);
  if (m < 1000) {
    return isRtl ? `${m} م` : `${m}m`;
  }
  const km = (m / 1000).toLocaleString(isRtl ? 'ar-SA-u-nu-latn' : 'en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return isRtl ? `${km} كم` : `${km} km`;
}

/**
 * Formats a geofence/GPS failure reason code into a clean bilingual localized message.
 */
export function formatGeofenceFailureReason(reason: string | null | undefined, isRtl?: boolean): string {
  if (!reason) return '-';

  if (reason.includes('low_accuracy')) {
    const accMatch = reason.match(/(?:reported|accuracy:?)\s*(\d+)m?/i) || reason.match(/(\d+)m/);
    const threshMatch = reason.match(/(?:threshold\s*(?:is)?:?)\s*(\d+)m?/i);
    const acc = accMatch ? accMatch[1] : '';
    const thresh = threshMatch ? threshMatch[1] : '';
    if (isRtl) {
      return `دقة إشارة GPS منخفضة: دقة الجهاز ${acc}م (الحد الأقصى المسموح ${thresh}م)`;
    }
    return `Low GPS accuracy: device reported ${acc}m (threshold is ${thresh}m)`;
  }

  if (reason.includes('outside_geofence')) {
    const isCheckOut = reason.includes('checkout');
    const distMatch = reason.match(/(?:outside_geofence(?:_checkout)?:\s*)?(\d+)m/i) || reason.match(/(\d+)m/);
    const radMatch = reason.match(/(?:radius:?\s*)(\d+)m/i);
    const dist = distMatch ? distMatch[1] : '';
    const rad = radMatch ? radMatch[1] : '';
    if (isRtl) {
      const eventText = isCheckOut ? 'عند الانصراف: ' : ': ';
      return `خارج النطاق الجغرافي ${eventText}المسافة ${dist}م (نطاق الموقع المسموح ${rad}م)`;
    }
    const eventText = isCheckOut ? ' on check-out: ' : ': ';
    return `Outside geofence${eventText}distance ${dist}m (allowed radius is ${rad}m)`;
  }

  if (reason.includes('gps_unavailable')) {
    const isCheckOut = reason.includes('checkout');
    if (isRtl) {
      return isCheckOut
        ? 'إحداثيات الموقع غير متوفرة عند تسجيل الانصراف أو غير صالحة بالجهاز'
        : 'إحداثيات الموقع غير متوفرة أو غير صالحة بالجهاز';
    }
    return isCheckOut
      ? 'GPS coordinates unavailable or invalid upon check-out'
      : 'GPS coordinates unavailable or invalid on device';
  }

  if (reason.includes('unassigned_worksite')) {
    return isRtl ? 'لا يوجد موقع عمل مسند للموظف' : 'No worksite assigned to employee';
  }

  if (reason.includes('inactive_worksite')) {
    return isRtl ? 'موقع العمل المسند غير نشط حالياً' : 'Assigned worksite is currently inactive';
  }

  return reason;
}

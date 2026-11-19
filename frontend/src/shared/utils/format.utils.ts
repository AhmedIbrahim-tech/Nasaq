import React from 'react';

export function formatCurrency(
  amount: number | null | undefined,
  locale: string = 'ar',
  currency: string = 'EGP',
  fractionDigits: number = 2
): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
  const formattedNumber = formatNumber(num, locale, fractionDigits);
  const isolatedNumber = `\u2066${formattedNumber}\u2069`;

  const normalized = (currency || 'EGP')
    .toUpperCase()
    .replace('CURRENCY', '')
    .trim();

  if (locale.startsWith('ar')) {
    const currencyLabel =
      normalized === 'EGP'
        ? 'ج.م'
        : normalized === 'SAR'
        ? 'ر.س'
        : normalized === 'USD'
        ? '$'
        : normalized === 'EUR'
        ? '€'
        : normalized;
    return `${isolatedNumber} ${currencyLabel}`;
  }

  return `${normalized} ${isolatedNumber}`;
}

export function formatNumber(
  val: number | null | undefined,
  _locale: string = 'ar',
  fractionDigits: number = 0
): string {
  const num = typeof val === 'number' && !isNaN(val) ? val : 0;
  // Use clean ASCII Latin numerals and minus sign without CLDR ALM control characters
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(num);
}

export function formatDate(
  date: string | Date | null | undefined,
  locale: string = 'ar',
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const intlLocale = locale.startsWith('ar') ? 'ar-EG-u-nu-latn' : 'en-US';
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return new Intl.DateTimeFormat(intlLocale, defaultOptions).format(d);
}

export function formatPaymentTerms(terms: string | number | undefined | null, t: any): string {
  if (terms === undefined || terms === null) return '—';
  const normalized = String(terms).toLowerCase();

  if (normalized === '1' || normalized === 'cash') {
    return t.has('PaymentTermsCash') ? t('PaymentTermsCash') : 'Cash';
  }
  if (normalized === '2' || normalized === 'credit') {
    return t.has('PaymentTermsCredit') ? t('PaymentTermsCredit') : 'Credit';
  }
  if (normalized === '3' || normalized === 'net15') {
    return t.has('PaymentTermNet15') ? t('PaymentTermNet15') : (t.has('PaymentTermsNet15') ? t('PaymentTermsNet15') : 'Net 15');
  }
  if (normalized === '4' || normalized === 'net30') {
    return t.has('PaymentTermNet30') ? t('PaymentTermNet30') : (t.has('PaymentTermsNet30') ? t('PaymentTermsNet30') : 'Net 30');
  }
  if (normalized === '5' || normalized === 'net60') {
    return t.has('PaymentTermNet60') ? t('PaymentTermNet60') : (t.has('PaymentTermsNet60') ? t('PaymentTermsNet60') : 'Net 60');
  }
  if (normalized === '6' || normalized === 'endofmonth') {
    return t.has('PaymentTermsEndOfMonth') ? t('PaymentTermsEndOfMonth') : 'End of Month';
  }

  return String(terms);
}

export function formatUserRole(role: string | undefined | null, t: any): string {
  if (!role) return '—';

  const roleMap: Record<string, string> = {
    PlatformSuperAdmin: 'Platform Super Admin',
    PlatformStaff: 'Platform Staff',
    TenantAdmin: 'Tenant Admin',
    TenantUser: 'Tenant User',
    TenantMember: 'Tenant Member',
  };

  const key = roleMap[role] || role;

  if (t.has(key)) return t(key);
  if (t.has(role)) return t(role);

  if (role === 'TenantAdmin') return t.has('Tenant Admin') ? t('Tenant Admin') : 'Tenant Admin';
  if (role === 'TenantUser') return t.has('Tenant User') ? t('Tenant User') : 'Tenant User';
  if (role === 'PlatformSuperAdmin') return t.has('Platform Admin') ? t('Platform Admin') : 'Platform Super Admin';
  if (role === 'PlatformStaff') return t.has('PlatformStaff') ? t('PlatformStaff') : 'Platform Staff';

  return role;
}

export const bidiLtrStyle = {
  direction: 'ltr' as const,
  unicodeBidi: 'isolate' as const,
  display: 'inline-block',
};

export function bidiLtr(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  return `\u200E${val}\u200E`;
}

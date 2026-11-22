/**
 * NASAQ Centralized Locale-Aware Resolver for Dynamic Business Data
 * Strictly follows RULE BIL-005 (Locale-Aware Display) & RULE BIL-006 (Silent Fallback).
 */

export function getLocalizedValue(
  arValue: string | null | undefined,
  enValue: string | null | undefined,
  isRtl: boolean,
  fallback = ""
): string {
  const ar = (arValue || "").trim();
  const en = (enValue || "").trim();

  if (isRtl) {
    return ar || en || fallback;
  }
  return en || ar || fallback;
}

export interface LocalizableNameEntity {
  nameAr?: string | null;
  nameEn?: string | null;
  name?: string | null;
}

export function getLocalizedName(
  entity: LocalizableNameEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!entity) return fallback;
  const en = entity.nameEn || entity.name;
  return getLocalizedValue(entity.nameAr, en, isRtl, fallback);
}

export interface LocalizableDescriptionEntity {
  descriptionAr?: string | null;
  descriptionEn?: string | null;
  description?: string | null;
}

export function getLocalizedDescription(
  entity: LocalizableDescriptionEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!entity) return fallback;
  const en = entity.descriptionEn || entity.description;
  return getLocalizedValue(entity.descriptionAr, en, isRtl, fallback);
}

export interface LocalizableEmployeeEntity {
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  fullNameAr?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  employeeNameAr?: string | null;
  employeeName?: string | null;
  departmentAr?: string | null;
  department?: string | null;
  jobTitleAr?: string | null;
  jobTitle?: string | null;
}

const KNOWN_NAME_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  "System SuperAdmin": { ar: "سوبر أدمن النظام", en: "System SuperAdmin" },
  "SuperAdmin": { ar: "سوبر أدمن", en: "SuperAdmin" },
  "Super Admin": { ar: "سوبر أدمن", en: "Super Admin" },
  "Operations Administrator": { ar: "مسؤول العمليات الإدارية", en: "Operations Administrator" },
  "System Administrator": { ar: "مسؤول النظام", en: "System Administrator" },
  "Administrator": { ar: "مسؤول النظام", en: "Administrator" },
};

export function getLocalizedEmployeeName(
  emp: LocalizableEmployeeEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!emp) return fallback;

  // 1. Construct Arabic Full Name
  let ar = (emp.fullNameAr || emp.employeeNameAr || "").trim();
  if (!ar && (emp.firstNameAr || emp.lastNameAr)) {
    ar = `${emp.firstNameAr || ""} ${emp.lastNameAr || ""}`.trim();
  }

  // 2. Construct English Full Name
  let en = (emp.fullName || emp.employeeName || "").trim();
  if (!en && (emp.firstName || emp.lastName)) {
    en = `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
  }

  // If in RTL mode and no Arabic name is provided or matches English, check known translations
  if (isRtl && (!ar || ar.toLowerCase() === en.toLowerCase()) && en) {
    const match = Object.entries(KNOWN_NAME_TRANSLATIONS).find(
      ([key]) => key.toLowerCase() === en.toLowerCase()
    );
    if (match) {
      ar = match[1].ar;
    }
  }

  return getLocalizedValue(ar, en, isRtl, fallback);
}

export interface LocalizableLeaveTypeEntity {
  leaveTypeName?: string | null;
  leaveTypeNameAr?: string | null;
  name?: string | null;
  nameAr?: string | null;
}

const KNOWN_LEAVE_TYPE_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  "Emergency Leave": { ar: "إجازة اضطرارية", en: "Emergency Leave" },
  EmergencyLeave: { ar: "إجازة اضطرارية", en: "Emergency Leave" },
  "Annual Leave": { ar: "إجازة سنوية", en: "Annual Leave" },
  AnnualLeave: { ar: "إجازة سنوية", en: "Annual Leave" },
  "Sick Leave": { ar: "إجازة مرضية", en: "Sick Leave" },
  SickLeave: { ar: "إجازة مرضية", en: "Sick Leave" },
  "Unpaid Leave": { ar: "إجازة بدون راتب", en: "Unpaid Leave" },
  UnpaidLeave: { ar: "إجازة بدون راتب", en: "Unpaid Leave" },
  "Maternity Leave": { ar: "إجازة أمومة", en: "Maternity Leave" },
  MaternityLeave: { ar: "إجازة أمومة", en: "Maternity Leave" },
  "Paternity Leave": { ar: "إجازة أبوة", en: "Paternity Leave" },
  PaternityLeave: { ar: "إجازة أبوة", en: "Paternity Leave" },
  "Casual Leave": { ar: "إجازة عارضة", en: "Casual Leave" },
  CasualLeave: { ar: "إجازة عارضة", en: "Casual Leave" },
  "Compassionate Leave": { ar: "إجازة عزاء", en: "Compassionate Leave" },
  CompassionateLeave: { ar: "إجازة عزاء", en: "Compassionate Leave" },
  "Study Leave": { ar: "إجازة دراسية", en: "Study Leave" },
  StudyLeave: { ar: "إجازة دراسية", en: "Study Leave" },
  "Hajj Leave": { ar: "إجازة حج", en: "Hajj Leave" },
  HajjLeave: { ar: "إجازة حج", en: "Hajj Leave" },
};

export function getLocalizedLeaveTypeName(
  entity: LocalizableLeaveTypeEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!entity) return fallback;
  const en = (entity.leaveTypeName || entity.name || "").trim();
  let ar = (entity.leaveTypeNameAr || entity.nameAr || "").trim();

  if (isRtl) {
    if (ar && ar.toLowerCase() !== en.toLowerCase()) return ar;
    const match = Object.entries(KNOWN_LEAVE_TYPE_TRANSLATIONS).find(
      ([key]) => key.toLowerCase() === (en || ar).toLowerCase()
    );
    if (match) {
      return match[1].ar;
    }
    return ar || en || (fallback === "—" ? "إجازة" : fallback);
  } else {
    if (en && (!ar || en.toLowerCase() !== ar.toLowerCase())) return en;
    const match = Object.entries(KNOWN_LEAVE_TYPE_TRANSLATIONS).find(
      ([key]) => key.toLowerCase() === (ar || en).toLowerCase()
    );
    if (match) {
      return match[1].en;
    }
    return en || ar || (fallback === "—" ? "Leave" : fallback);
  }
}

export function getLocalizedDepartment(
  emp: LocalizableEmployeeEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!emp) return fallback;
  return getLocalizedValue(emp.departmentAr, emp.department, isRtl, fallback);
}

export function getLocalizedJobTitle(
  emp: LocalizableEmployeeEntity | null | undefined,
  isRtl: boolean,
  fallback = "—"
): string {
  if (!emp) return fallback;
  return getLocalizedValue(emp.jobTitleAr, emp.jobTitle, isRtl, fallback);
}

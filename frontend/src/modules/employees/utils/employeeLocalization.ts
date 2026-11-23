import type { Employee } from '../types';

export function getEmployeeDisplayName(emp: Employee | null | undefined, isAr: boolean): string {
  if (!emp) return '';
  if (isAr) {
    if (emp.fullNameAr && emp.fullNameAr.trim()) return emp.fullNameAr.trim();
    if (emp.firstNameAr || emp.lastNameAr) {
      return `${emp.firstNameAr || ''} ${emp.lastNameAr || ''}`.trim();
    }
    if (emp.fullName && emp.fullName.trim()) return emp.fullName.trim();
    return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
  }
  if (emp.fullNameEn && emp.fullNameEn.trim()) return emp.fullNameEn.trim();
  if (emp.firstNameEn || emp.lastNameEn) {
    return `${emp.firstNameEn || ''} ${emp.lastNameEn || ''}`.trim();
  }
  if (emp.fullName && emp.fullName.trim()) return emp.fullName.trim();
  return `${emp.firstName || ''} ${emp.lastName || ''}`.trim();
}

export function getEmployeeDepartment(emp: Employee | null | undefined, isAr: boolean): string {
  if (!emp) return '';
  if (isAr) {
    return emp.departmentAr?.trim() || emp.department?.trim() || '';
  }
  return emp.department?.trim() || emp.departmentAr?.trim() || '';
}

export function getEmployeeJobTitle(emp: Employee | null | undefined, isAr: boolean): string {
  if (!emp) return '';
  if (isAr) {
    return emp.jobTitleAr?.trim() || emp.jobTitle?.trim() || '';
  }
  return emp.jobTitle?.trim() || emp.jobTitleAr?.trim() || '';
}

export function getEmployeeSupervisorName(emp: Employee | null | undefined, isAr: boolean): string {
  if (!emp) return '';
  if (isAr) {
    return emp.supervisorNameAr?.trim() || emp.supervisorName?.trim() || emp.supervisorNameEn?.trim() || '';
  }
  return emp.supervisorNameEn?.trim() || emp.supervisorName?.trim() || emp.supervisorNameAr?.trim() || '';
}

export function getEmployeeWorkLocationName(emp: Employee | null | undefined, isAr: boolean): string {
  if (!emp) return '';
  if (isAr) {
    return emp.workLocationNameAr?.trim() || emp.workLocationName?.trim() || emp.workLocationNameEn?.trim() || '';
  }
  return emp.workLocationNameEn?.trim() || emp.workLocationName?.trim() || emp.workLocationNameAr?.trim() || '';
}

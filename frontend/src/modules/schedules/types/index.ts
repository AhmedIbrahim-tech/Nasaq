export interface WorkShift {
  id: string;
  name: string;
  nameAr?: string | null;
  startTime: string; // "HH:mm" or "HH:mm:ss"
  endTime: string;
  isOvernight: boolean;
  durationHours: number;
  earlyStartTime?: string | null;
  onTimeStartTime?: string | null;
  lateStartTime?: string | null;
  cutoffTime?: string | null;
  notes?: string | null;
  isActive: boolean;
  created_Utc: string;
  created_By?: string | null;
  updated_Utc?: string | null;
  updated_By?: string | null;
}

export interface CreateShiftRequest {
  name: string;
  startTime: string;
  endTime: string;
  isOvernight?: boolean;
  earlyStartTime?: string | null;
  onTimeStartTime?: string | null;
  lateStartTime?: string | null;
  cutoffTime?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export interface UpdateShiftRequest extends CreateShiftRequest {
  id: string;
}

export interface ShiftsSummary {
  totalShifts: number;
  activeShifts: number;
  inactiveShifts: number;
  overnightShiftsCount: number;
  dayShiftsCount: number;
}

export interface WorkScheduleDay {
  id: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isWorkingDay: boolean;
  workShiftId?: string | null;
  shiftName?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isOvernight?: boolean | null;
  durationHours?: number | null;
}

export interface ScheduleDayInput {
  dayOfWeek: number;
  isWorkingDay: boolean;
  workShiftId?: string | null;
}

export interface WorkSchedule {
  id: string;
  name: string;
  nameAr?: string | null;
  description?: string | null;
  descriptionAr?: string | null;
  isActive: boolean;
  isDefault: boolean;
  days: WorkScheduleDay[];
  assignedEmployeesCount: number;
  created_Utc: string;
  created_By?: string | null;
  updated_Utc?: string | null;
  updated_By?: string | null;
}

export interface CreateScheduleRequest {
  name: string;
  description?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  days?: ScheduleDayInput[];
}

export interface UpdateScheduleRequest extends CreateScheduleRequest {
  id: string;
}

export interface SchedulesSummary {
  totalSchedules: number;
  activeSchedules: number;
  inactiveSchedules: number;
  defaultScheduleName?: string | null;
  assignedEmployeesTotal: number;
}

export interface EmployeeScheduleAssignment {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  employeeNameAr?: string | null;
  department?: string | null;
  workScheduleId: string;
  scheduleName: string;
  scheduleNameAr?: string | null;
  effectiveFrom: string; // "YYYY-MM-DD"
  effectiveTo?: string | null;
  isActive: boolean;
  notes?: string | null;
  created_Utc: string;
  created_By?: string | null;
}

export interface AssignEmployeeScheduleRequest {
  employeeId: string;
  workScheduleId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  notes?: string | null;
}

export interface ScheduleFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface AssignmentFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  workScheduleId?: string;
  employeeId?: string;
  isActive?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

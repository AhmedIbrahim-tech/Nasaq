export type AttendanceStatus = "Present" | "Completed" | "PendingReview" | "Incomplete" | "Rejected";
export type VerificationStatus = "NotRecorded" | "Verified" | "PendingReview" | "Rejected";
export type ArrivalClassification = "Standard" | "Early" | "OnTime" | "Late" | "AfterCutoff";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeNameAr?: string | null;
  employeeCode: string;
  department?: string | null;
  departmentAr?: string | null;
  date: string;
  workLocationId?: string | null;
  workLocationName?: string | null;
  workLocationNameAr?: string | null;
  workShiftId?: string | null;
  workShiftName?: string | null;
  workShiftNameAr?: string | null;

  checkInTimeUtc: string;
  checkInLatitude?: number | null;
  checkInLongitude?: number | null;
  checkInAccuracyMeters?: number | null;
  checkInDistanceMeters?: number | null;
  checkInStatus: VerificationStatus;
  checkInFailureReason?: string | null;
  arrivalClassification: ArrivalClassification;

  checkOutTimeUtc?: string | null;
  checkOutLatitude?: number | null;
  checkOutLongitude?: number | null;
  checkOutAccuracyMeters?: number | null;
  checkOutDistanceMeters?: number | null;
  checkOutStatus: VerificationStatus;
  checkOutFailureReason?: string | null;

  status: AttendanceStatus;
  durationMinutes?: number | null;
  durationHours: number;
  notes?: string | null;
  isManuallyAdjusted: boolean;
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAtUtc?: string | null;
  created_Utc: string;
}

export interface CurrentAttendanceStatus {
  isCheckedIn: boolean;
  activeAttendance?: AttendanceRecord | null;

  hasAssignedLocation: boolean;
  assignedLocationId?: string | null;
  assignedLocationName?: string | null;
  assignedLocationNameAr?: string | null;
  assignedLatitude?: number | null;
  assignedLongitude?: number | null;
  assignedRadiusMeters?: number | null;
  assignedAccuracyThresholdMeters?: number | null;

  hasScheduledShift: boolean;
  todayShift?: {
    id: string;
    name: string;
    nameAr?: string | null;
    startTime: string;
    endTime: string;
    isOvernight: boolean;
    durationHours: number;
  } | null;
  isScheduledWorkDay: boolean;
  shiftNotice?: string | null;

  isOnApprovedLeave?: boolean;
  approvedLeaveTypeName?: string | null;
  approvedLeaveTypeNameAr?: string | null;
  approvedLeaveStartDate?: string | null;
  approvedLeaveEndDate?: string | null;

  totalSessionsToday: number;
  totalHoursToday: number;
}

export interface CheckInRequest {
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  notes?: string | null;
  deviceInfo?: string | null;
}

export interface CheckOutRequest {
  latitude?: number | null;
  longitude?: number | null;
  accuracyMeters?: number | null;
  notes?: string | null;
  deviceInfo?: string | null;
}

export interface AttendanceRecordsParams {
  employeeId?: string;
  workLocationId?: string;
  startDate?: string;
  endDate?: string;
  status?: AttendanceStatus;
  page?: number;
  pageSize?: number;
}

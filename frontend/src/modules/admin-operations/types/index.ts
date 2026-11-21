import type { AttendanceRecord, AttendanceStatus, VerificationStatus } from "@/modules/attendance/types";
import type { PointCategory, PointTransaction } from "@/modules/points/types";

export interface AdminOperationsSummary {
  pendingGpsExceptionsCount: number;
  incompleteAttendanceCount: number;
  todayTotalAttendance: number;
  todayVerifiedAttendance: number;
  todayPendingAttendance: number;
  todayRejectedAttendance: number;
}

export interface DailyAttendanceParams {
  date?: string;
  search?: string;
  workLocationId?: string;
  workShiftId?: string;
  status?: AttendanceStatus;
  missingCheckOutOnly?: boolean;
  pendingReviewOnly?: boolean;
  page?: number;
  pageSize?: number;
}

export interface GpsExceptionsParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface IncompleteAttendanceParams {
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ApproveGpsRequest {
  reviewNotes?: string;
}

export interface RejectGpsRequest {
  reason: string;
}

export interface CorrectIncompleteRequest {
  manualCheckOutTimeUtc: string;
  reason: string;
}

export interface ManualPointAdjustmentRequest {
  employeeId: string;
  category: PointCategory;
  points: number;
  reason: string;
}

export type { AttendanceRecord, AttendanceStatus, VerificationStatus, PointCategory, PointTransaction };

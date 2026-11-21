export type LeaveRequestStatus = "Pending" | "Approved" | "Rejected" | "Cancelled";
export type LeaveApprovalAction = "Submitted" | "Approved" | "Rejected" | "Cancelled";

export interface LeaveType {
  id: string;
  name: string;
  nameAr: string;
  code: string;
  description?: string | null;
  isPaid: boolean;
  requiresAttachment: boolean;
  defaultDaysPerYear?: number | null;
  isActive: boolean;
  createdAt?: string;
}

export interface LeaveApprovalHistory {
  id: string;
  leaveRequestId: string;
  actorId: string;
  actorName: string;
  action: LeaveApprovalAction;
  comments?: string | null;
  actionDateUtc: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department?: string | null;
  leaveTypeId: string;
  leaveTypeName: string;
  leaveTypeNameAr: string;
  leaveTypeCode: string;
  isPaid: boolean;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  daysCount: number;
  reason?: string | null;
  attachmentFileId?: string | null;
  status: LeaveRequestStatus;
  submittedAtUtc: string;
  reviewedAtUtc?: string | null;
  reviewedBy?: string | null;
  reviewNotes?: string | null;
  canCancel: boolean;
  canReview: boolean;
  approvalHistory: LeaveApprovalHistory[];
}

export interface LeaveSummary {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  totalCancelled: number;
  myPendingCount: number;
  myApprovedDaysThisYear: number;
}

export interface CreateLeaveTypeRequest {
  name: string;
  nameAr: string;
  code: string;
  description?: string | null;
  isPaid: boolean;
  requiresAttachment: boolean;
  defaultDaysPerYear?: number | null;
}

export interface UpdateLeaveTypeRequest {
  name: string;
  nameAr: string;
  description?: string | null;
  isPaid: boolean;
  requiresAttachment: boolean;
  defaultDaysPerYear?: number | null;
}

export interface SubmitLeaveRequestData {
  leaveTypeId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason?: string;
  attachment?: File | null;
}

export interface LeaveRequestsFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
  employeeId?: string;
  leaveTypeId?: string;
  startDate?: string;
  endDate?: string;
}

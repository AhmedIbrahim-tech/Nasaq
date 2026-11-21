import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse, PaginatedResult } from "@/shared/types/api.types";
import type {
  AdminOperationsSummary,
  DailyAttendanceParams,
  GpsExceptionsParams,
  IncompleteAttendanceParams,
  ApproveGpsRequest,
  RejectGpsRequest,
  CorrectIncompleteRequest,
  ManualPointAdjustmentRequest,
  AttendanceRecord,
  PointTransaction,
} from "../types";

export const adminOperationsService = {
  async getSummary(): Promise<AdminOperationsSummary> {
    const response = await api.get<GenericBaseResponse<AdminOperationsSummary>>(
      Router.AdminOperations.Summary
    );
    return response.data.data!;
  },

  async getDailyAttendance(params: DailyAttendanceParams = {}): Promise<PaginatedResult<AttendanceRecord>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<AttendanceRecord>>>(
      Router.AdminOperations.DailyAttendance,
      { params }
    );
    return response.data.data!;
  },

  async getGpsExceptions(params: GpsExceptionsParams = {}): Promise<PaginatedResult<AttendanceRecord>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<AttendanceRecord>>>(
      Router.AdminOperations.GpsExceptions,
      { params }
    );
    return response.data.data!;
  },

  async approveGpsException(id: string, data: ApproveGpsRequest = {}): Promise<AttendanceRecord> {
    const response = await api.post<GenericBaseResponse<AttendanceRecord>>(
      Router.AdminOperations.ApproveGps(id),
      data
    );
    return response.data.data!;
  },

  async rejectGpsException(id: string, data: RejectGpsRequest): Promise<AttendanceRecord> {
    const response = await api.post<GenericBaseResponse<AttendanceRecord>>(
      Router.AdminOperations.RejectGps(id),
      data
    );
    return response.data.data!;
  },

  async getIncompleteAttendance(params: IncompleteAttendanceParams = {}): Promise<PaginatedResult<AttendanceRecord>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<AttendanceRecord>>>(
      Router.AdminOperations.IncompleteAttendance,
      { params }
    );
    return response.data.data!;
  },

  async correctIncompleteAttendance(id: string, data: CorrectIncompleteRequest): Promise<AttendanceRecord> {
    const response = await api.post<GenericBaseResponse<AttendanceRecord>>(
      Router.AdminOperations.CorrectIncomplete(id),
      data
    );
    return response.data.data!;
  },

  async manualPointAdjustment(data: ManualPointAdjustmentRequest): Promise<PointTransaction> {
    const response = await api.post<GenericBaseResponse<PointTransaction>>(
      Router.AdminOperations.ManualPointAdjustment,
      data
    );
    return response.data.data!;
  },
};

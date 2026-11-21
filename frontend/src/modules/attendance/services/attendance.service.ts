import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse, PaginatedResult } from "@/shared/types/api.types";
import type {
  AttendanceRecord,
  CurrentAttendanceStatus,
  CheckInRequest,
  CheckOutRequest,
  AttendanceRecordsParams,
} from "../types";

export const attendanceService = {
  async getStatus(): Promise<CurrentAttendanceStatus> {
    const response = await api.get<GenericBaseResponse<CurrentAttendanceStatus>>(
      Router.Attendance.Status
    );
    return response.data.data!;
  },

  async checkIn(data: CheckInRequest): Promise<AttendanceRecord> {
    const response = await api.post<GenericBaseResponse<AttendanceRecord>>(
      Router.Attendance.CheckIn,
      data
    );
    return response.data.data!;
  },

  async checkOut(data: CheckOutRequest): Promise<AttendanceRecord> {
    const response = await api.post<GenericBaseResponse<AttendanceRecord>>(
      Router.Attendance.CheckOut,
      data
    );
    return response.data.data!;
  },

  async getMyHistory(params: { startDate?: string; endDate?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedResult<AttendanceRecord>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<AttendanceRecord>>>(
      Router.Attendance.MyHistory,
      { params }
    );
    return response.data.data!;
  },

  async getRecords(params: AttendanceRecordsParams = {}): Promise<PaginatedResult<AttendanceRecord>> {
    const response = await api.get<GenericBaseResponse<PaginatedResult<AttendanceRecord>>>(
      Router.Attendance.List,
      { params }
    );
    return response.data.data!;
  },

  async getRecordById(id: string): Promise<AttendanceRecord> {
    const response = await api.get<GenericBaseResponse<AttendanceRecord>>(
      Router.Attendance.GetById(id)
    );
    return response.data.data!;
  },
};

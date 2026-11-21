import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import type {
  WorkShift,
  CreateShiftRequest,
  UpdateShiftRequest,
  ShiftsSummary,
  WorkSchedule,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  SchedulesSummary,
  EmployeeScheduleAssignment,
  AssignEmployeeScheduleRequest,
  ScheduleFilterParams,
  AssignmentFilterParams,
  PaginatedResult,
} from "../types";

export const scheduleService = {
  // --- SHIFTS ---
  async getShifts(params: ScheduleFilterParams = {}): Promise<PaginatedResult<WorkShift>> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDescending !== undefined) queryParams.sortDescending = params.sortDescending;

    const response = await api.get<GenericBaseResponse<PaginatedResult<WorkShift>>>(
      Router.Shifts.List,
      { params: queryParams }
    );

    return response.data.data ?? {
      data: [],
      currentPage: params.page || 1,
      pageSize: params.pageSize || 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  async getShiftById(id: string): Promise<WorkShift> {
    const response = await api.get<GenericBaseResponse<WorkShift>>(Router.Shifts.GetById(id));
    if (!response.data.data) {
      throw new Error(response.data.message || "Shift not found.");
    }
    return response.data.data;
  },

  async getShiftsSummary(): Promise<ShiftsSummary> {
    const response = await api.get<GenericBaseResponse<ShiftsSummary>>(Router.Shifts.Summary);
    return response.data.data ?? {
      totalShifts: 0,
      activeShifts: 0,
      inactiveShifts: 0,
      overnightShiftsCount: 0,
      dayShiftsCount: 0,
    };
  },

  async createShift(data: CreateShiftRequest): Promise<WorkShift> {
    const response = await api.post<GenericBaseResponse<WorkShift>>(Router.Shifts.Create, data);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create shift.");
    }
    return response.data.data;
  },

  async updateShift(id: string, data: UpdateShiftRequest): Promise<WorkShift> {
    const response = await api.put<GenericBaseResponse<WorkShift>>(Router.Shifts.Update(id), data);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update shift.");
    }
    return response.data.data;
  },

  async toggleShiftStatus(id: string, isActive?: boolean): Promise<WorkShift> {
    const response = await api.patch<GenericBaseResponse<WorkShift>>(
      Router.Shifts.ToggleStatus(id),
      isActive !== undefined ? { isActive } : {}
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to toggle shift status.");
    }
    return response.data.data;
  },

  async deleteShift(id: string): Promise<void> {
    const response = await api.delete<GenericBaseResponse<object>>(Router.Shifts.Delete(id));
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to delete shift.");
    }
  },

  // --- SCHEDULES ---
  async getSchedules(params: ScheduleFilterParams = {}): Promise<PaginatedResult<WorkSchedule>> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDescending !== undefined) queryParams.sortDescending = params.sortDescending;

    const response = await api.get<GenericBaseResponse<PaginatedResult<WorkSchedule>>>(
      Router.Schedules.List,
      { params: queryParams }
    );

    return response.data.data ?? {
      data: [],
      currentPage: params.page || 1,
      pageSize: params.pageSize || 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  async getScheduleById(id: string): Promise<WorkSchedule> {
    const response = await api.get<GenericBaseResponse<WorkSchedule>>(Router.Schedules.GetById(id));
    if (!response.data.data) {
      throw new Error(response.data.message || "Schedule not found.");
    }
    return response.data.data;
  },

  async getSchedulesSummary(): Promise<SchedulesSummary> {
    const response = await api.get<GenericBaseResponse<SchedulesSummary>>(Router.Schedules.Summary);
    return response.data.data ?? {
      totalSchedules: 0,
      activeSchedules: 0,
      inactiveSchedules: 0,
      defaultScheduleName: null,
      assignedEmployeesTotal: 0,
    };
  },

  async createSchedule(data: CreateScheduleRequest): Promise<WorkSchedule> {
    const response = await api.post<GenericBaseResponse<WorkSchedule>>(Router.Schedules.Create, data);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create schedule.");
    }
    return response.data.data;
  },

  async updateSchedule(id: string, data: UpdateScheduleRequest): Promise<WorkSchedule> {
    const response = await api.put<GenericBaseResponse<WorkSchedule>>(Router.Schedules.Update(id), data);
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update schedule.");
    }
    return response.data.data;
  },

  async toggleScheduleStatus(id: string, isActive?: boolean): Promise<WorkSchedule> {
    const response = await api.patch<GenericBaseResponse<WorkSchedule>>(
      Router.Schedules.ToggleStatus(id),
      isActive !== undefined ? { isActive } : {}
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to toggle schedule status.");
    }
    return response.data.data;
  },

  async deleteSchedule(id: string): Promise<void> {
    const response = await api.delete<GenericBaseResponse<object>>(Router.Schedules.Delete(id));
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to delete schedule.");
    }
  },

  // --- ASSIGNMENTS ---
  async getAssignments(params: AssignmentFilterParams = {}): Promise<PaginatedResult<EmployeeScheduleAssignment>> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.workScheduleId) queryParams.workScheduleId = params.workScheduleId;
    if (params.employeeId) queryParams.employeeId = params.employeeId;
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;

    const response = await api.get<GenericBaseResponse<PaginatedResult<EmployeeScheduleAssignment>>>(
      Router.Schedules.Assignments,
      { params: queryParams }
    );

    return response.data.data ?? {
      data: [],
      currentPage: params.page || 1,
      pageSize: params.pageSize || 10,
      totalCount: 0,
      totalPages: 0,
      hasPreviousPage: false,
      hasNextPage: false,
    };
  },

  async assignSchedule(data: AssignEmployeeScheduleRequest): Promise<EmployeeScheduleAssignment> {
    const response = await api.post<GenericBaseResponse<EmployeeScheduleAssignment>>(
      Router.Schedules.Assignments,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to assign schedule.");
    }
    return response.data.data;
  },

  async deleteAssignment(id: string): Promise<void> {
    const response = await api.delete<GenericBaseResponse<object>>(Router.Schedules.AssignmentById(id));
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to delete assignment.");
    }
  },
};

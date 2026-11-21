import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse, PaginatedResult } from "@/shared/types/api.types";
import type {
  LeaveType,
  LeaveRequest,
  LeaveSummary,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
  SubmitLeaveRequestData,
  LeaveRequestsFilterParams,
} from "../types";

export const leavesService = {
  // Types
  async getLeaveTypes(activeOnly: boolean = false): Promise<LeaveType[]> {
    const response = await api.get<GenericBaseResponse<LeaveType[]>>(Router.Leaves.Types, {
      params: { activeOnly },
    });
    return response.data.data || [];
  },

  async getLeaveTypeById(id: string): Promise<LeaveType> {
    const response = await api.get<GenericBaseResponse<LeaveType>>(Router.Leaves.TypeById(id));
    return response.data.data!;
  },

  async createLeaveType(data: CreateLeaveTypeRequest): Promise<LeaveType> {
    const response = await api.post<GenericBaseResponse<LeaveType>>(Router.Leaves.Types, data);
    return response.data.data!;
  },

  async updateLeaveType(id: string, data: UpdateLeaveTypeRequest): Promise<LeaveType> {
    const response = await api.put<GenericBaseResponse<LeaveType>>(Router.Leaves.TypeById(id), data);
    return response.data.data!;
  },

  async toggleLeaveTypeStatus(id: string): Promise<LeaveType> {
    const response = await api.patch<GenericBaseResponse<LeaveType>>(
      Router.Leaves.TypeToggleStatus(id)
    );
    return response.data.data!;
  },

  // Requests
  async getMyRequests(
    params: LeaveRequestsFilterParams = {}
  ): Promise<PaginatedResult<LeaveRequest>> {
    const response = await api.get<GenericBaseResponse<any>>(
      Router.Leaves.MyRequests,
      { params }
    );
    const paginated = response.data.data;
    const items = paginated?.data || paginated?.items || [];
    return {
      items,
      data: items,
      totalCount: paginated?.totalCount ?? 0,
      totalPages: paginated?.totalPages ?? 0,
      pageSize: paginated?.pageSize ?? 10,
      currentPage: paginated?.currentPage ?? 1,
    };
  },

  async getRequests(
    params: LeaveRequestsFilterParams = {}
  ): Promise<PaginatedResult<LeaveRequest>> {
    const response = await api.get<GenericBaseResponse<any>>(
      Router.Leaves.Requests,
      { params }
    );
    const paginated = response.data.data;
    const items = paginated?.data || paginated?.items || [];
    return {
      items,
      data: items,
      totalCount: paginated?.totalCount ?? 0,
      totalPages: paginated?.totalPages ?? 0,
      pageSize: paginated?.pageSize ?? 10,
      currentPage: paginated?.currentPage ?? 1,
    };
  },

  async getRequestById(id: string): Promise<LeaveRequest> {
    const response = await api.get<GenericBaseResponse<LeaveRequest>>(Router.Leaves.RequestById(id));
    return response.data.data!;
  },

  async submitRequest(data: SubmitLeaveRequestData): Promise<LeaveRequest> {
    const formData = new FormData();
    formData.append("LeaveTypeId", data.leaveTypeId);
    formData.append("StartDate", data.startDate);
    formData.append("EndDate", data.endDate);
    if (data.reason?.trim()) {
      formData.append("Reason", data.reason.trim());
    }
    if (data.attachment) {
      formData.append("Attachment", data.attachment);
    }

    const response = await api.post<GenericBaseResponse<LeaveRequest>>(
      Router.Leaves.Requests,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data!;
  },

  async cancelRequest(id: string, reason?: string): Promise<LeaveRequest> {
    const response = await api.post<GenericBaseResponse<LeaveRequest>>(
      Router.Leaves.CancelRequest(id),
      { reason }
    );
    return response.data.data!;
  },

  async approveRequest(id: string, reviewNotes?: string): Promise<LeaveRequest> {
    const response = await api.post<GenericBaseResponse<LeaveRequest>>(
      Router.Leaves.Approve(id),
      { reviewNotes }
    );
    return response.data.data!;
  },

  async rejectRequest(id: string, reason: string): Promise<LeaveRequest> {
    const response = await api.post<GenericBaseResponse<LeaveRequest>>(
      Router.Leaves.Reject(id),
      { reason }
    );
    return response.data.data!;
  },

  // Summary
  async getSummary(): Promise<LeaveSummary> {
    const response = await api.get<GenericBaseResponse<LeaveSummary>>(Router.Leaves.Summary);
    return response.data.data!;
  },
};

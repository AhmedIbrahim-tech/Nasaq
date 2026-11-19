import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import type {
  Employee,
  EmployeeFilterParams,
  PaginatedEmployeesResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ToggleEmployeeStatusRequest,
  SupervisorLookup,
} from "../types";

export const employeeService = {
  async getEmployees(
    params: EmployeeFilterParams = {}
  ): Promise<PaginatedEmployeesResponse> {
    const queryParams: Record<string, any> = {};
    if (params.page !== undefined) queryParams.page = params.page;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.department && params.department.trim()) queryParams.department = params.department.trim();
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;
    if (params.sortBy) queryParams.sortBy = params.sortBy;
    if (params.sortDescending !== undefined) queryParams.sortDescending = params.sortDescending;

    const response = await api.get<GenericBaseResponse<PaginatedEmployeesResponse>>(
      Router.Employees.List,
      { params: queryParams }
    );

    if (!response.data.data) {
      return {
        data: [],
        currentPage: params.page || 1,
        pageSize: params.pageSize || 10,
        totalCount: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      };
    }

    return response.data.data;
  },

  async getEmployeeById(id: string): Promise<Employee> {
    const response = await api.get<GenericBaseResponse<Employee>>(
      Router.Employees.GetById(id)
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Employee not found.");
    }
    return response.data.data;
  },

  async getMyProfile(): Promise<Employee> {
    const response = await api.get<GenericBaseResponse<Employee>>(
      Router.Employees.MyProfile
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Employee profile not found.");
    }
    return response.data.data;
  },

  async getSupervisors(): Promise<SupervisorLookup[]> {
    const response = await api.get<GenericBaseResponse<SupervisorLookup[]>>(
      Router.Employees.Supervisors
    );
    return response.data.data ?? [];
  },

  async createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
    const response = await api.post<GenericBaseResponse<Employee>>(
      Router.Employees.Create,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create employee.");
    }
    return response.data.data;
  },

  async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const response = await api.put<GenericBaseResponse<Employee>>(
      Router.Employees.Update(id),
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update employee.");
    }
    return response.data.data;
  },

  async toggleStatus(id: string, request?: ToggleEmployeeStatusRequest): Promise<Employee> {
    const response = await api.patch<GenericBaseResponse<Employee>>(
      Router.Employees.ToggleStatus(id),
      request || {}
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to toggle status.");
    }
    return response.data.data;
  },
};

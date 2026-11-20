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
    const formData = new FormData();
    formData.append("employeeCode", data.employeeCode);
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.department) formData.append("department", data.department);
    if (data.jobTitle) formData.append("jobTitle", data.jobTitle);
    formData.append("hireDate", data.hireDate);
    if (data.supervisorId) formData.append("supervisorId", data.supervisorId);
    if (data.createUserAccount !== undefined) {
      formData.append("createUserAccount", String(data.createUserAccount));
    }
    if (data.userRole) formData.append("userRole", data.userRole);
    if (data.password) formData.append("password", data.password);
    if (data.userId) formData.append("userId", data.userId);
    if (data.photo) formData.append("profilePhoto", data.photo);

    const response = await api.post<GenericBaseResponse<Employee>>(
      Router.Employees.Create,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create employee.");
    }
    return response.data.data;
  },

  async updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
    const formData = new FormData();
    formData.append("firstName", data.firstName);
    formData.append("lastName", data.lastName);
    formData.append("email", data.email);
    if (data.phoneNumber) formData.append("phoneNumber", data.phoneNumber);
    if (data.department) formData.append("department", data.department);
    if (data.jobTitle) formData.append("jobTitle", data.jobTitle);
    formData.append("hireDate", data.hireDate);
    if (data.supervisorId) formData.append("supervisorId", data.supervisorId);
    if (data.userRole) formData.append("userRole", data.userRole);
    if (data.userId) formData.append("userId", data.userId);
    if (data.removeProfilePhoto !== undefined) {
      formData.append("removeProfilePhoto", String(data.removeProfilePhoto));
    }
    if (data.photo) {
      formData.append("profilePhoto", data.photo);
    }

    const response = await api.put<GenericBaseResponse<Employee>>(
      Router.Employees.Update(id),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
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

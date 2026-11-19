export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  hireDate: string;
  isActive: boolean;
  userId?: string | null;
  userRole?: string | null;
  supervisorId?: string | null;
  supervisorName?: string | null;
  supervisorCode?: string | null;
  created_Utc: string;
  created_By?: string | null;
  updated_Utc?: string | null;
  updated_By?: string | null;
}

export interface EmployeeFilterParams {
  page?: number;
  pageSize?: number;
  search?: string;
  department?: string;
  isActive?: boolean;
  sortBy?: string;
  sortDescending?: boolean;
}

export interface CreateEmployeeRequest {
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  hireDate: string;
  createUserAccount?: boolean;
  userRole?: string;
  password?: string;
  userId?: string;
  supervisorId?: string | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  jobTitle?: string;
  hireDate: string;
  userRole?: string;
  userId?: string;
  supervisorId?: string | null;
}

export interface SupervisorLookup {
  id: string;
  employeeCode: string;
  fullName: string;
  department?: string | null;
  jobTitle?: string | null;
  role?: string | null;
}

export interface ToggleEmployeeStatusRequest {
  isActive?: boolean;
}

export interface PaginatedEmployeesResponse {
  data: Employee[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

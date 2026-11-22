export interface Employee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  firstNameEn?: string | null;
  lastNameEn?: string | null;
  fullName: string;
  fullNameAr?: string | null;
  fullNameEn?: string | null;
  email: string;
  phoneNumber?: string | null;
  department?: string | null;
  departmentAr?: string | null;
  jobTitle?: string | null;
  jobTitleAr?: string | null;
  hireDate: string;
  isActive: boolean;
  userId?: string | null;
  userRole?: string | null;
  supervisorId?: string | null;
  supervisorName?: string | null;
  supervisorNameAr?: string | null;
  supervisorNameEn?: string | null;
  supervisorCode?: string | null;
  workLocationId?: string | null;
  workLocationName?: string | null;
  workLocationNameAr?: string | null;
  workLocationNameEn?: string | null;
  profilePhoto?: string | null;
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
  firstNameAr?: string;
  lastNameAr?: string;
  firstNameEn?: string;
  lastNameEn?: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  departmentAr?: string;
  jobTitle?: string;
  jobTitleAr?: string;
  hireDate: string;
  createUserAccount?: boolean;
  userRole?: string;
  password?: string;
  userId?: string;
  supervisorId?: string | null;
  workLocationId?: string | null;
  photo?: File | null;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  firstNameAr?: string | null;
  lastNameAr?: string | null;
  firstNameEn?: string;
  lastNameEn?: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  departmentAr?: string | null;
  jobTitle?: string;
  jobTitleAr?: string | null;
  hireDate: string;
  userRole?: string;
  userId?: string;
  supervisorId?: string | null;
  workLocationId?: string | null;
  photo?: File | null;
  removeProfilePhoto?: boolean;
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

export interface EmployeesSummary {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  assignedLocationCount: number;
  unassignedLocationCount: number;
  supervisorCount: number;
}

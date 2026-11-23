export interface WorkLocation {
  id: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  address?: string | null;
  addressAr?: string | null;
  addressEn?: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  accuracyThresholdMeters: number;
  isActive: boolean;
  assignedEmployeesCount: number;
  employeeCount: number;
  created_Utc: string;
  created_By?: string | null;
  updated_Utc?: string | null;
  updated_By?: string | null;
}

export interface LocationFilterParams {
  search?: string;
  isActive?: boolean;
}

export interface CreateLocationRequest {
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  address?: string | null;
  addressAr?: string | null;
  addressEn?: string | null;
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  accuracyThresholdMeters?: number;
  isActive?: boolean;
}

export interface UpdateLocationRequest {
  id?: string;
  name: string;
  nameAr?: string | null;
  nameEn?: string | null;
  address?: string | null;
  addressAr?: string | null;
  addressEn?: string | null;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  accuracyThresholdMeters: number;
  isActive?: boolean;
}

export interface ToggleLocationStatusRequest {
  isActive?: boolean;
}

export interface LocationsSummary {
  totalLocations: number;
  activeLocations: number;
  inactiveLocations: number;
  assignedEmployeesTotal: number;
  avgGeofenceRadiusMeters: number;
}

export interface EmployeePersonalLocation {
  id: string;
  employeeId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  addressDescription?: string | null;
  isApproved: boolean;
  approvedAtUtc?: string | null;
  approvedBy?: string | null;
  isActive: boolean;
  source?: string | null;
  created_Utc: string;
}

export interface EmployeeLocationRequest {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  employeeNameAr?: string | null;
  employeeCode?: string | null;
  requestType: number;
  latitude: number;
  longitude: number;
  accuracyMeters?: number | null;
  addressDescription?: string | null;
  status: number;
  rejectionReason?: string | null;
  reviewedAtUtc?: string | null;
  reviewedBy?: string | null;
  adminNotes?: string | null;
  created_Utc: string;
}

export interface MyLocationStatus {
  approvedLocation?: EmployeePersonalLocation | null;
  pendingRequest?: EmployeeLocationRequest | null;
  lastRejectedRequest?: EmployeeLocationRequest | null;
  hasApprovedLocation: boolean;
  hasPendingRequest: boolean;
}

export interface GlobalGeofenceRadius {
  radiusMeters: number;
  lastUpdatedUtc?: string | null;
  updatedBy?: string | null;
}

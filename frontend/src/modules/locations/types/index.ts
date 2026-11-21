export interface WorkLocation {
  id: string;
  name: string;
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
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  accuracyThresholdMeters?: number;
  isActive?: boolean;
}

export interface UpdateLocationRequest {
  name: string;
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

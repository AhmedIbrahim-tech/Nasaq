import { api } from "@/lib/api/api";
import { Router } from "@/lib/api/router";
import type { GenericBaseResponse } from "@/shared/types/api.types";
import type {
  WorkLocation,
  LocationFilterParams,
  CreateLocationRequest,
  UpdateLocationRequest,
  ToggleLocationStatusRequest,
  LocationsSummary,
  GlobalGeofenceRadius,
  MyLocationStatus,
  EmployeeLocationRequest,
  EmployeePersonalLocation,
} from "../types";

/**
 * Normalizes location properties so assignedEmployeesCount and employeeCount are always valid numbers.
 */
function normalizeLocation(loc: any): WorkLocation {
  const count = typeof loc.assignedEmployeesCount === 'number'
    ? loc.assignedEmployeesCount
    : typeof loc.employeeCount === 'number'
    ? loc.employeeCount
    : 0;

  return {
    ...loc,
    assignedEmployeesCount: count,
    employeeCount: count,
  };
}

export const locationsService = {
  async getLocations(params: LocationFilterParams = {}): Promise<WorkLocation[]> {
    const queryParams: Record<string, any> = {};
    if (params.search && params.search.trim()) queryParams.search = params.search.trim();
    if (params.isActive !== undefined) queryParams.isActive = params.isActive;

    const response = await api.get<GenericBaseResponse<WorkLocation[]>>(
      Router.Locations.List,
      { params: queryParams }
    );

    const items = response.data.data ?? [];
    return items.map(normalizeLocation);
  },

  async getLocationById(id: string): Promise<WorkLocation> {
    const response = await api.get<GenericBaseResponse<WorkLocation>>(
      Router.Locations.GetById(id)
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Location not found.");
    }
    return normalizeLocation(response.data.data);
  },

  async createLocation(data: CreateLocationRequest): Promise<WorkLocation> {
    const response = await api.post<GenericBaseResponse<WorkLocation>>(
      Router.Locations.Create,
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to create location.");
    }
    return normalizeLocation(response.data.data);
  },

  async updateLocation(id: string, data: UpdateLocationRequest): Promise<WorkLocation> {
    const response = await api.put<GenericBaseResponse<WorkLocation>>(
      Router.Locations.Update(id),
      data
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to update location.");
    }
    return normalizeLocation(response.data.data);
  },

  async toggleStatus(id: string, request?: ToggleLocationStatusRequest): Promise<WorkLocation> {
    const response = await api.patch<GenericBaseResponse<WorkLocation>>(
      Router.Locations.ToggleStatus(id),
      request || {}
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to toggle location status.");
    }
    return normalizeLocation(response.data.data);
  },

  async deleteLocation(id: string): Promise<void> {
    const response = await api.delete<GenericBaseResponse<object>>(
      Router.Locations.Delete(id)
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to delete work location.");
    }
  },

  async bulkDeleteLocations(ids: string[]): Promise<number> {
    const response = await api.delete<GenericBaseResponse<number>>(
      Router.Locations.BulkDelete,
      { data: { ids } }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to bulk delete work locations.");
    }
    return response.data.data ?? 0;
  },

  async getSummary(): Promise<LocationsSummary> {
    const response = await api.get<GenericBaseResponse<LocationsSummary>>(
      Router.Locations.Summary
    );
    if (!response.data.data) {
      throw new Error(response.data.message || "Failed to fetch locations summary.");
    }
    return response.data.data;
  },

  async getGlobalRadius(): Promise<GlobalGeofenceRadius> {
    const response = await api.get<GenericBaseResponse<GlobalGeofenceRadius>>(
      Router.Locations.GlobalRadius
    );
    return response.data.data ?? { radiusMeters: 50.0 };
  },

  async updateGlobalRadius(radiusMeters: number): Promise<GlobalGeofenceRadius> {
    const response = await api.put<GenericBaseResponse<GlobalGeofenceRadius>>(
      Router.Locations.GlobalRadius,
      { radiusMeters }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to update global radius.");
    }
    return response.data.data!;
  },

  async updateCoordinates(id: string, latitude: number, longitude: number): Promise<void> {
    const response = await api.put<GenericBaseResponse<boolean>>(
      Router.Locations.UpdateCoordinates(id),
      { latitude, longitude }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to update coordinates.");
    }
  },

  async getMyPersonalLocation(): Promise<MyLocationStatus> {
    const response = await api.get<GenericBaseResponse<MyLocationStatus>>(
      Router.Locations.MyPersonalLocation
    );
    return response.data.data ?? { hasApprovedLocation: false, hasPendingRequest: false };
  },

  async registerPersonalLocation(
    latitude: number,
    longitude: number,
    accuracyMeters?: number,
    addressDescription?: string
  ): Promise<MyLocationStatus> {
    const response = await api.post<GenericBaseResponse<MyLocationStatus>>(
      Router.Locations.RegisterPersonalLocation,
      { latitude, longitude, accuracyMeters, addressDescription }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to register personal location.");
    }
    return response.data.data!;
  },

  async requestLocationChange(
    latitude: number,
    longitude: number,
    accuracyMeters?: number,
    addressDescription?: string
  ): Promise<EmployeeLocationRequest> {
    const response = await api.post<GenericBaseResponse<EmployeeLocationRequest>>(
      Router.Locations.RequestLocationChange,
      { latitude, longitude, accuracyMeters, addressDescription }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to submit location change request.");
    }
    return response.data.data!;
  },

  async cancelLocationRequest(id: string): Promise<void> {
    const response = await api.post<GenericBaseResponse<boolean>>(
      Router.Locations.CancelLocationRequest(id)
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to cancel location request.");
    }
  },

  async getPendingLocationRequests(): Promise<EmployeeLocationRequest[]> {
    const response = await api.get<GenericBaseResponse<EmployeeLocationRequest[]>>(
      Router.Locations.PendingLocationRequests
    );
    return response.data.data ?? [];
  },

  async approveLocationRequest(id: string, adminNotes?: string): Promise<void> {
    const response = await api.post<GenericBaseResponse<boolean>>(
      Router.Locations.ApproveLocationRequest(id),
      { adminNotes }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to approve location request.");
    }
  },

  async rejectLocationRequest(id: string, rejectionReason: string): Promise<void> {
    const response = await api.post<GenericBaseResponse<boolean>>(
      Router.Locations.RejectLocationRequest(id),
      { rejectionReason }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to reject location request.");
    }
  },

  async adminChangeEmployeeLocation(
    employeeId: string,
    latitude: number,
    longitude: number,
    accuracyMeters?: number,
    addressDescription?: string,
    adminNotes?: string
  ): Promise<EmployeePersonalLocation> {
    const response = await api.post<GenericBaseResponse<EmployeePersonalLocation>>(
      Router.Locations.AdminChangeEmployeeLocation(employeeId),
      { latitude, longitude, accuracyMeters, addressDescription, adminNotes }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to directly update employee location.");
    }
    return response.data.data!;
  },

  async resetEmployeeLocation(employeeId: string, reason?: string): Promise<void> {
    const response = await api.post<GenericBaseResponse<boolean>>(
      Router.Locations.ResetEmployeeLocation(employeeId),
      { reason }
    );
    if (!response.data.succeeded) {
      throw new Error(response.data.message || "Failed to reset employee location.");
    }
  },
};

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
};

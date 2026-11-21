import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { locationsService } from "../services/locations.service";
import type {
  WorkLocation,
  LocationFilterParams,
  CreateLocationRequest,
  UpdateLocationRequest,
  ToggleLocationStatusRequest,
  LocationsSummary,
} from "../types";

export interface LocationsState {
  items: WorkLocation[];
  selectedLocation: WorkLocation | null;
  summary: LocationsSummary | null;
  summaryLoading: boolean;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  filterParams: LocationFilterParams;
}

const initialState: LocationsState = {
  items: [],
  selectedLocation: null,
  summary: null,
  summaryLoading: false,
  loading: false,
  actionLoading: false,
  error: null,
  filterParams: {
    search: "",
    isActive: undefined,
  },
};

export const fetchLocationsThunk = createAsyncThunk<
  WorkLocation[],
  LocationFilterParams | undefined
>("locations/fetchLocations", async (params, { rejectWithValue }) => {
  try {
    return await locationsService.getLocations(params);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to load work locations."
    );
  }
});

export const fetchLocationByIdThunk = createAsyncThunk<WorkLocation, string>(
  "locations/fetchLocationById",
  async (id, { rejectWithValue }) => {
    try {
      return await locationsService.getLocationById(id);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load location details."
      );
    }
  }
);

export const createLocationThunk = createAsyncThunk<WorkLocation, CreateLocationRequest>(
  "locations/createLocation",
  async (data, { rejectWithValue }) => {
    try {
      return await locationsService.createLocation(data);
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to create work location."
      );
    }
  }
);

export const updateLocationThunk = createAsyncThunk<
  WorkLocation,
  { id: string; data: UpdateLocationRequest }
>("locations/updateLocation", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await locationsService.updateLocation(id, data);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to update work location."
    );
  }
});

export const toggleLocationStatusThunk = createAsyncThunk<
  WorkLocation,
  { id: string; request?: ToggleLocationStatusRequest }
>("locations/toggleLocationStatus", async ({ id, request }, { rejectWithValue }) => {
  try {
    return await locationsService.toggleStatus(id, request);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || error.message || "Failed to update location status."
    );
  }
});

export const deleteLocationThunk = createAsyncThunk<string, string>(
  "locations/deleteLocation",
  async (id, { rejectWithValue }) => {
    try {
      await locationsService.deleteLocation(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete work location."
      );
    }
  }
);

export const bulkDeleteLocationsThunk = createAsyncThunk<string[], string[]>(
  "locations/bulkDeleteLocations",
  async (ids, { rejectWithValue }) => {
    try {
      await locationsService.bulkDeleteLocations(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete selected work locations."
      );
    }
  }
);

export const fetchLocationsSummaryThunk = createAsyncThunk<LocationsSummary, void>(
  "locations/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await locationsService.getSummary();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load locations summary."
      );
    }
  }
);

const locationsSlice = createSlice({
  name: "locations",
  initialState,
  reducers: {
    setFilterParams(state, action: PayloadAction<LocationFilterParams>) {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    resetFilters(state) {
      state.filterParams = { search: "", isActive: undefined };
    },
    setSelectedLocation(state, action: PayloadAction<WorkLocation | null>) {
      state.selectedLocation = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchLocations
    builder
      .addCase(fetchLocationsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationsThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLocationsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchLocationById
    builder
      .addCase(fetchLocationByIdThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLocationByIdThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLocation = action.payload;
      })
      .addCase(fetchLocationByIdThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createLocation
    builder
      .addCase(createLocationThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createLocationThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items.unshift(action.payload);
      })
      .addCase(createLocationThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // updateLocation
    builder
      .addCase(updateLocationThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateLocationThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedLocation?.id === action.payload.id) {
          state.selectedLocation = action.payload;
        }
      })
      .addCase(updateLocationThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // toggleLocationStatus
    builder
      .addCase(toggleLocationStatusThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(toggleLocationStatusThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.selectedLocation?.id === action.payload.id) {
          state.selectedLocation = action.payload;
        }
      })
      .addCase(toggleLocationStatusThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // fetchLocationsSummary
    builder
      .addCase(fetchLocationsSummaryThunk.pending, (state) => {
        state.summaryLoading = true;
      })
      .addCase(fetchLocationsSummaryThunk.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchLocationsSummaryThunk.rejected, (state) => {
        state.summaryLoading = false;
      });

    // deleteLocation
    builder
      .addCase(deleteLocationThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteLocationThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.items = state.items.filter((loc) => loc.id !== action.payload);
      })
      .addCase(deleteLocationThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });

    // bulkDeleteLocations
    builder
      .addCase(bulkDeleteLocationsThunk.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(bulkDeleteLocationsThunk.fulfilled, (state, action) => {
        state.actionLoading = false;
        const deletedSet = new Set(action.payload);
        state.items = state.items.filter((loc) => !deletedSet.has(loc.id));
      })
      .addCase(bulkDeleteLocationsThunk.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setFilterParams, resetFilters, setSelectedLocation } = locationsSlice.actions;
export default locationsSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { employeeService } from "../services/employee.service";
import type {
  Employee,
  EmployeeFilterParams,
  PaginatedEmployeesResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  ToggleEmployeeStatusRequest,
  SupervisorLookup,
  EmployeesSummary,
} from "../types";

export interface EmployeesState {
  items: Employee[];
  supervisors: SupervisorLookup[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  selectedEmployee: Employee | null;
  currentProfile: Employee | null;
  summary: EmployeesSummary | null;
  summaryLoading: boolean;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  filterParams: EmployeeFilterParams;
}

const initialState: EmployeesState = {
  items: [],
  supervisors: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 0,
  pageSize: 10,
  selectedEmployee: null,
  currentProfile: null,
  summary: null,
  summaryLoading: false,
  loading: false,
  actionLoading: false,
  error: null,
  filterParams: {
    page: 1,
    pageSize: 10,
    search: "",
    department: "",
    isActive: undefined,
  },
};

export const fetchEmployeesThunk = createAsyncThunk<
  PaginatedEmployeesResponse,
  EmployeeFilterParams | undefined
>("employees/fetchEmployees", async (params, { rejectWithValue }) => {
  try {
    return await employeeService.getEmployees(params);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to load employees.");
  }
});

export const fetchEmployeeByIdThunk = createAsyncThunk<Employee, string>(
  "employees/fetchEmployeeById",
  async (id, { rejectWithValue }) => {
    try {
      return await employeeService.getEmployeeById(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load employee details.");
    }
  }
);

export const fetchCurrentProfileThunk = createAsyncThunk<Employee, void>(
  "employees/fetchCurrentProfile",
  async (_, { rejectWithValue }) => {
    try {
      return await employeeService.getMyProfile();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load current employee profile.");
    }
  }
);

export const fetchSupervisorsThunk = createAsyncThunk<SupervisorLookup[], void>(
  "employees/fetchSupervisors",
  async (_, { rejectWithValue }) => {
    try {
      return await employeeService.getSupervisors();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to load supervisors.");
    }
  }
);

export const fetchEmployeesSummaryThunk = createAsyncThunk<EmployeesSummary, void>(
  "employees/fetchSummary",
  async (_, { rejectWithValue }) => {
    try {
      return await employeeService.getSummary();
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to load employees summary."
      );
    }
  }
);

export const createEmployeeThunk = createAsyncThunk<Employee, CreateEmployeeRequest>(
  "employees/createEmployee",
  async (data, { rejectWithValue }) => {
    try {
      return await employeeService.createEmployee(data);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || "Failed to create employee.");
    }
  }
);

export const updateEmployeeThunk = createAsyncThunk<
  Employee,
  { id: string; data: UpdateEmployeeRequest }
>("employees/updateEmployee", async ({ id, data }, { rejectWithValue }) => {
  try {
    return await employeeService.updateEmployee(id, data);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to update employee.");
  }
});

export const toggleEmployeeStatusThunk = createAsyncThunk<
  Employee,
  { id: string; request?: ToggleEmployeeStatusRequest }
>("employees/toggleEmployeeStatus", async ({ id, request }, { rejectWithValue }) => {
  try {
    return await employeeService.toggleStatus(id, request);
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || error.message || "Failed to update employee status.");
  }
});

export const deleteEmployeeThunk = createAsyncThunk<string, string>(
  "employees/deleteEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await employeeService.deleteEmployee(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete employee."
      );
    }
  }
);

export const bulkDeleteEmployeesThunk = createAsyncThunk<string[], string[]>(
  "employees/bulkDeleteEmployees",
  async (ids, { rejectWithValue }) => {
    try {
      await employeeService.bulkDeleteEmployees(ids);
      return ids;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || error.message || "Failed to delete selected employees."
      );
    }
  }
);

export const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setFilterParams: (state, action: PayloadAction<Partial<EmployeeFilterParams>>) => {
      state.filterParams = { ...state.filterParams, ...action.payload };
    },
    resetFilters: (state) => {
      state.filterParams = {
        page: 1,
        pageSize: 10,
        search: "",
        department: "",
        isActive: undefined,
      };
    },
    setSelectedEmployee: (state, action: PayloadAction<Employee | null>) => {
      state.selectedEmployee = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Employees
    builder.addCase(fetchEmployeesThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeesThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.items = action.payload.data;
      state.totalCount = action.payload.totalCount;
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
      state.pageSize = action.payload.pageSize;
    });
    builder.addCase(fetchEmployeesThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Employee By Id
    builder.addCase(fetchEmployeeByIdThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchEmployeeByIdThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.selectedEmployee = action.payload;
    });
    builder.addCase(fetchEmployeeByIdThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Current Profile
    builder.addCase(fetchCurrentProfileThunk.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCurrentProfileThunk.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProfile = action.payload;
    });
    builder.addCase(fetchCurrentProfileThunk.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Fetch Supervisors
    builder.addCase(fetchSupervisorsThunk.fulfilled, (state, action) => {
      state.supervisors = action.payload;
    });

    // Fetch Employees Summary
    builder.addCase(fetchEmployeesSummaryThunk.pending, (state) => {
      state.summaryLoading = true;
    });
    builder.addCase(fetchEmployeesSummaryThunk.fulfilled, (state, action) => {
      state.summaryLoading = false;
      state.summary = action.payload;
    });
    builder.addCase(fetchEmployeesSummaryThunk.rejected, (state) => {
      state.summaryLoading = false;
    });

    // Create Employee
    builder.addCase(createEmployeeThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(createEmployeeThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.items = [action.payload, ...state.items];
      state.totalCount += 1;
    });
    builder.addCase(createEmployeeThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // Update Employee
    builder.addCase(updateEmployeeThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(updateEmployeeThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      const index = state.items.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEmployee?.id === action.payload.id) {
        state.selectedEmployee = action.payload;
      }
    });
    builder.addCase(updateEmployeeThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // Toggle Status
    builder.addCase(toggleEmployeeStatusThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(toggleEmployeeStatusThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      const index = state.items.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
      }
      if (state.selectedEmployee?.id === action.payload.id) {
        state.selectedEmployee = action.payload;
      }
    });
    builder.addCase(toggleEmployeeStatusThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // Delete Employee
    builder.addCase(deleteEmployeeThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(deleteEmployeeThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      state.items = state.items.filter((e) => e.id !== action.payload);
      state.totalCount = Math.max(0, state.totalCount - 1);
    });
    builder.addCase(deleteEmployeeThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });

    // Bulk Delete Employees
    builder.addCase(bulkDeleteEmployeesThunk.pending, (state) => {
      state.actionLoading = true;
      state.error = null;
    });
    builder.addCase(bulkDeleteEmployeesThunk.fulfilled, (state, action) => {
      state.actionLoading = false;
      const deletedSet = new Set(action.payload);
      state.items = state.items.filter((e) => !deletedSet.has(e.id));
      state.totalCount = Math.max(0, state.totalCount - action.payload.length);
    });
    builder.addCase(bulkDeleteEmployeesThunk.rejected, (state, action) => {
      state.actionLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setFilterParams,
  resetFilters,
  setSelectedEmployee,
  clearError,
} = employeesSlice.actions;

export default employeesSlice.reducer;

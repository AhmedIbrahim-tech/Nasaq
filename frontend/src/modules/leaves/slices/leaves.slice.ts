import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LeaveRequest, LeaveType, LeaveSummary } from "../types";

export interface LeavesState {
  myRequests: LeaveRequest[];
  myTotalCount: number;
  approvals: LeaveRequest[];
  approvalsTotalCount: number;
  leaveTypes: LeaveType[];
  summary: LeaveSummary | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
}

const initialState: LeavesState = {
  myRequests: [],
  myTotalCount: 0,
  approvals: [],
  approvalsTotalCount: 0,
  leaveTypes: [],
  summary: null,
  loading: false,
  actionLoading: false,
  error: null,
};

export const leavesSlice = createSlice({
  name: "leaves",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setActionLoading: (state, action: PayloadAction<boolean>) => {
      state.actionLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setMyRequests: (
      state,
      action: PayloadAction<{ items: LeaveRequest[]; totalCount: number }>
    ) => {
      state.myRequests = action.payload.items || [];
      state.myTotalCount = action.payload.totalCount || 0;
    },
    setApprovals: (
      state,
      action: PayloadAction<{ items: LeaveRequest[]; totalCount: number }>
    ) => {
      state.approvals = action.payload.items || [];
      state.approvalsTotalCount = action.payload.totalCount || 0;
    },
    setLeaveTypes: (state, action: PayloadAction<LeaveType[]>) => {
      state.leaveTypes = action.payload || [];
    },
    setSummary: (state, action: PayloadAction<LeaveSummary>) => {
      state.summary = action.payload;
    },
    addMyRequest: (state, action: PayloadAction<LeaveRequest>) => {
      state.myRequests.unshift(action.payload);
      state.myTotalCount += 1;
      if (state.summary) {
        state.summary.myPendingCount += 1;
        state.summary.totalPending += 1;
      }
    },
    updateRequestInState: (state, action: PayloadAction<LeaveRequest>) => {
      const updated = action.payload;
      // Update in myRequests
      const myIdx = state.myRequests.findIndex((r) => r.id === updated.id);
      if (myIdx !== -1) {
        state.myRequests[myIdx] = updated;
      }
      // Update in approvals
      const appIdx = state.approvals.findIndex((r) => r.id === updated.id);
      if (appIdx !== -1) {
        state.approvals[appIdx] = updated;
      }
    },
    upsertLeaveType: (state, action: PayloadAction<LeaveType>) => {
      const idx = state.leaveTypes.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.leaveTypes[idx] = action.payload;
      } else {
        state.leaveTypes.unshift(action.payload);
      }
    },
    toggleLeaveTypeStatus: (state, action: PayloadAction<string>) => {
      const type = state.leaveTypes.find((t) => t.id === action.payload);
      if (type) {
        type.isActive = !type.isActive;
      }
    },
  },
});

export const {
  setLoading,
  setActionLoading,
  setError,
  setMyRequests,
  setApprovals,
  setLeaveTypes,
  setSummary,
  addMyRequest,
  updateRequestInState,
  upsertLeaveType,
  toggleLeaveTypeStatus,
} = leavesSlice.actions;

export default leavesSlice.reducer;

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Switch from "@mui/material/Switch";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/shared/components/container/PageContainer";
import {
  IconCalendarOff,
  IconClock,
  IconChecklist,
  IconSettings,
  IconPlus,
  IconEye,
  IconX,
  IconCheck,
  IconEdit,
  IconCircleCheck,
  IconCircleX,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RoleNames } from "@/shared/constants/roles";
import {
  ModernizeDataTable,
  ModernizeColumnDef,
  ModernizeRowAction,
} from "@/shared/components/tables/modernize/ModernizeDataTable";
import { ConfirmActionDialog } from "@/shared/components/dialogs/ConfirmActionDialog";
import { formatDateOnly } from "@/shared/utils/i18nFormatters";
import {
  getLocalizedEmployeeName,
  getLocalizedLeaveTypeName,
} from "@/shared/utils/localization";
import { leavesService } from "../services/leaves.service";
import {
  setMyRequests,
  setApprovals,
  setLeaveTypes,
  setSummary,
  addMyRequest,
  updateRequestInState,
  upsertLeaveType,
  toggleLeaveTypeStatus as toggleLeaveTypeStatusAction,
  setActionLoading,
} from "../slices/leaves.slice";
import { LeaveStatsCards } from "../components/LeaveStatsCards";
import { LeaveRequestFormDialog } from "../components/LeaveRequestFormDialog";
import { LeaveRequestDetailsDialog } from "../components/LeaveRequestDetailsDialog";
import { LeaveReviewDialog } from "../components/LeaveReviewDialog";
import { LeaveTypeFormDialog } from "../components/LeaveTypeFormDialog";
import type {
  LeaveRequest,
  LeaveType,
  SubmitLeaveRequestData,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from "../types";

export const LeavesView: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");
  const isRtl = isAr;
  const dispatch = useAppDispatch();

  const roles = useAppSelector((state) => state.auth.roles) || [];
  const authUser = useAppSelector((state) => state.auth.user);
  const currentEmployeeId = authUser?.employeeId;
  const isPrivileged = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor].includes(r as any)
  );
  const isAdmin = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin].includes(r as any)
  );

  const {
    myRequests,
    myTotalCount,
    approvals,
    approvalsTotalCount,
    leaveTypes,
    summary,
    actionLoading,
  } = useAppSelector((state) => state.leaves);

  const isMyRequest = (row: LeaveRequest): boolean => {
    if (!row) return false;
    if (row.canReview === false && row.canCancel === true) {
      return true;
    }
    if (currentEmployeeId && row.employeeId) {
      if (row.employeeId.toLowerCase() === currentEmployeeId.toLowerCase()) return true;
    }
    if (authUser?.employeeCode && row.employeeCode) {
      if (row.employeeCode.toLowerCase() === authUser.employeeCode.toLowerCase()) return true;
    }
    if (authUser?.fullName && row.employeeName) {
      if (row.employeeName.toLowerCase() === authUser.fullName.toLowerCase()) return true;
    }
    if (authUser?.fullNameAr && row.employeeNameAr) {
      if (row.employeeNameAr.toLowerCase() === authUser.fullNameAr.toLowerCase()) return true;
    }
    if (authUser?.fullName && row.employeeNameAr) {
      if (row.employeeNameAr.toLowerCase() === authUser.fullName.toLowerCase()) return true;
    }
    if (authUser?.fullNameAr && row.employeeName) {
      if (row.employeeName.toLowerCase() === authUser.fullNameAr.toLowerCase()) return true;
    }
    if (authUser?.email && row.employeeName) {
      const emailPrefix = authUser.email.split("@")[0].toLowerCase();
      const normEmpName = row.employeeName.toLowerCase();
      if (normEmpName.includes(emailPrefix) || emailPrefix.includes(normEmpName)) return true;
    }
    if (myRequests && myRequests.some((m) => m.id === row.id)) {
      return true;
    }
    if (
      row.employeeCode === "EMP-SUPER01" &&
      roles.some((r) => r.toLowerCase().includes("superadmin"))
    ) {
      return true;
    }
    return false;
  };

  const [activeTab, setActiveTab] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(true);
  const [loadingMyRequests, setLoadingMyRequests] = useState<boolean>(false);
  const [loadingApprovals, setLoadingApprovals] = useState<boolean>(false);
  const [loadingTypes, setLoadingTypes] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Pagination
  const [myPage, setMyPage] = useState<number>(1);
  const [approvalsPage, setApprovalsPage] = useState<number>(1);
  const pageSize = 10;

  // Dialogs state
  const [requestFormOpen, setRequestFormOpen] = useState<boolean>(false);
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);

  // Review Dialog (Approve / Reject)
  const [reviewDialogOpen, setReviewDialogOpen] = useState<boolean>(false);
  const [reviewMode, setReviewMode] = useState<"approve" | "reject">("approve");
  const [requestToReview, setRequestToReview] = useState<LeaveRequest | null>(null);

  // Cancel Dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState<boolean>(false);
  const [requestToCancel, setRequestToCancel] = useState<LeaveRequest | null>(null);

  // Leave Type Dialog
  const [typeFormOpen, setTypeFormOpen] = useState<boolean>(false);
  const [typeFormMode, setTypeFormMode] = useState<"create" | "edit">("create");
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);

  // Load Initial Data
  const loadSummaryData = useCallback(async () => {
    try {
      const data = await leavesService.getSummary();
      dispatch(setSummary(data));
    } catch {
      // Non-blocking
    } finally {
      setLoadingSummary(false);
    }
  }, [dispatch]);

  const loadLeaveTypesData = useCallback(async () => {
    setLoadingTypes(true);
    try {
      const types = await leavesService.getLeaveTypes(false);
      dispatch(setLeaveTypes(types));
    } catch {
      // Non-blocking
    } finally {
      setLoadingTypes(false);
    }
  }, [dispatch]);

  const loadMyRequestsData = useCallback(async (page: number) => {
    setLoadingMyRequests(true);
    try {
      const result = await leavesService.getMyRequests({ page, pageSize });
      const items = result?.data || result?.items || [];
      dispatch(setMyRequests({ items, totalCount: result?.totalCount || 0 }));
    } catch {
      // Handled
    } finally {
      setLoadingMyRequests(false);
    }
  }, [dispatch, pageSize]);

  const loadApprovalsData = useCallback(async (page: number) => {
    if (!isPrivileged) return;
    setLoadingApprovals(true);
    try {
      const result = await leavesService.getRequests({ page, pageSize });
      const items = result?.data || result?.items || [];
      dispatch(setApprovals({ items, totalCount: result?.totalCount || 0 }));
    } catch {
      // Handled
    } finally {
      setLoadingApprovals(false);
    }
  }, [dispatch, isPrivileged, pageSize]);

  useEffect(() => {
    loadSummaryData();
    loadLeaveTypesData();
    loadMyRequestsData(myPage);
    if (isPrivileged) {
      loadApprovalsData(approvalsPage);
    }
  }, [loadSummaryData, loadLeaveTypesData, loadMyRequestsData, loadApprovalsData, myPage, approvalsPage, isPrivileged]);

  // Handlers for My Requests
  const handleSubmitRequest = async (data: SubmitLeaveRequestData) => {
    dispatch(setActionLoading(true));
    try {
      const newRequest = await leavesService.submitRequest(data);
      dispatch(addMyRequest(newRequest));
      setFeedback({ type: "success", message: t("LeaveRequestSubmittedSuccess") });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  const handleConfirmCancel = async () => {
    if (!requestToCancel) return;
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.cancelRequest(requestToCancel.id);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: "success", message: t("LeaveRequestCancelledSuccess") });
      loadSummaryData();
      setCancelDialogOpen(false);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || err.message || t("ErrorCancellingLeaveRequest"),
      });
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  // Handlers for Reviews (Supervisor / Admin)
  const handleApprove = async (id: string, notes?: string) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.approveRequest(id, notes);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: "success", message: t("LeaveRequestApprovedSuccess") });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  const handleReject = async (id: string, reason: string) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.rejectRequest(id, reason);
      dispatch(updateRequestInState(updated));
      setFeedback({ type: "success", message: t("LeaveRequestRejectedSuccess") });
      loadSummaryData();
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  // Handlers for Leave Types (Admin)
  const handleCreateType = async (data: CreateLeaveTypeRequest) => {
    dispatch(setActionLoading(true));
    try {
      const created = await leavesService.createLeaveType(data);
      dispatch(upsertLeaveType(created));
      setFeedback({ type: "success", message: t("LeaveTypeCreatedSuccess") });
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  const handleUpdateType = async (id: string, data: UpdateLeaveTypeRequest) => {
    dispatch(setActionLoading(true));
    try {
      const updated = await leavesService.updateLeaveType(id, data);
      dispatch(upsertLeaveType(updated));
      setFeedback({ type: "success", message: t("LeaveTypeUpdatedSuccess") });
    } finally {
      dispatch(setActionLoading(false));
    }
  };

  const handleToggleTypeStatus = async (type: LeaveType) => {
    try {
      const updated = await leavesService.toggleLeaveTypeStatus(type.id);
      dispatch(upsertLeaveType(updated));
      setFeedback({ type: "success", message: t("LeaveTypeStatusUpdatedSuccess") });
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.response?.data?.message || err.message || t("ErrorUpdatingLeaveTypeStatus"),
      });
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "Approved":
        return <Chip label={t("Approved")} color="success" size="small" icon={<IconCircleCheck size={16} />} />;
      case "Rejected":
        return <Chip label={t("Rejected")} color="error" size="small" icon={<IconCircleX size={16} />} />;
      case "Cancelled":
        return <Chip label={t("Cancelled")} color="default" size="small" icon={<IconCalendarOff size={16} />} />;
      case "Pending":
      default:
        return <Chip label={t("Pending")} color="warning" size="small" icon={<IconClock size={16} />} />;
    }
  };

  // Columns for "My Leaves" Table
  const myColumns: ModernizeColumnDef<LeaveRequest>[] = [
    {
      id: "leaveType",
      header: t("LeaveType"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {getLocalizedLeaveTypeName(
              {
                leaveTypeName: row.leaveTypeName,
                leaveTypeNameAr: row.leaveTypeNameAr,
              },
              isAr,
              isAr ? "إجازة" : "Leave"
            )}
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
            <Chip
              label={row.isPaid ? t("PaidLeave") : t("Unpaid")}
              size="small"
              color={row.isPaid ? "success" : "default"}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          </Stack>
        </Box>
      ),
    },
    {
      id: "duration",
      header: t("EffectiveDates"),
      cell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
              {formatDateOnly(row.startDate, isRtl)} → {formatDateOnly(row.endDate, isRtl)}
            </span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.daysCount} {t("Days")}
          </Typography>
        </Box>
      ),
    },
    {
      id: "reason",
      header: t("LeaveReason"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260, wordBreak: "break-word" }}>
          {row.reason || "—"}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => getStatusChip(row.status),
    },
  ];

  const myActions: ModernizeRowAction<LeaveRequest>[] = [
    {
      label: t("ViewDetails"),
      icon: <IconEye size={18} color="#5D87FF" />,
      onClick: (row: LeaveRequest) => {
        setSelectedRequest(row);
        setDetailsOpen(true);
      },
    },
    {
      label: t("CancelRequest"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => row.status === "Pending",
      onClick: (row: LeaveRequest) => {
        setRequestToCancel(row);
        setCancelDialogOpen(true);
      },
    },
  ];

  // Columns for "Approvals" Table
  const approvalsColumns: ModernizeColumnDef<LeaveRequest>[] = [
    {
      id: "employee",
      header: t("Employee"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {getLocalizedEmployeeName(
              {
                employeeName: row.employeeName,
                employeeNameAr: row.employeeNameAr,
              },
              isAr,
              row.employeeName
            )}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
              {row.employeeCode}
            </span>{" "}
            {(isAr ? row.departmentAr || row.department : row.department)
              ? `• ${isAr ? row.departmentAr || row.department : row.department}`
              : ""}
          </Typography>
        </Box>
      ),
    },
    {
      id: "leaveType",
      header: t("LeaveType"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={500}>
            {getLocalizedLeaveTypeName(
              {
                leaveTypeName: row.leaveTypeName,
                leaveTypeNameAr: row.leaveTypeNameAr,
              },
              isAr,
              isAr ? "إجازة" : "Leave"
            )}
          </Typography>
          <Chip
            label={row.isPaid ? t("PaidLeave") : t("Unpaid")}
            size="small"
            color={row.isPaid ? "success" : "default"}
            variant="outlined"
            sx={{ height: 18, fontSize: "0.65rem" }}
          />
        </Box>
      ),
    },
    {
      id: "duration",
      header: t("EffectiveDates"),
      cell: (row) => (
        <Box>
          <Typography variant="body2" fontWeight={500}>
            <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
              {formatDateOnly(row.startDate, isRtl)} → {formatDateOnly(row.endDate, isRtl)}
            </span>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.daysCount} {t("Days")}
          </Typography>
        </Box>
      ),
    },
    {
      id: "reason",
      header: t("LeaveReason"),
      cell: (row) => (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 220, wordBreak: "break-word" }}>
          {row.reason || "—"}
        </Typography>
      ),
    },
    {
      id: "status",
      header: t("Status"),
      cell: (row) => getStatusChip(row.status),
    },
  ];

  const approvalsActions: ModernizeRowAction<LeaveRequest>[] = [
    {
      label: t("Approve"),
      icon: <IconCheck size={18} color="#13DEB9" />,
      show: (row: LeaveRequest) => (row.canReview ?? false) && row.status === "Pending" && !isMyRequest(row),
      onClick: (row: LeaveRequest) => {
        setRequestToReview(row);
        setReviewMode("approve");
        setReviewDialogOpen(true);
      },
    },
    {
      label: t("Reject"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => (row.canReview ?? false) && row.status === "Pending" && !isMyRequest(row),
      onClick: (row: LeaveRequest) => {
        setRequestToReview(row);
        setReviewMode("reject");
        setReviewDialogOpen(true);
      },
    },
    {
      label: t("CancelRequest"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => ((row.canCancel ?? false) || isMyRequest(row)) && row.status === "Pending",
      onClick: (row: LeaveRequest) => {
        setRequestToCancel(row);
        setCancelDialogOpen(true);
      },
    },
    {
      label: t("ViewDetails"),
      icon: <IconEye size={18} color="#5D87FF" />,
      onClick: (row: LeaveRequest) => {
        setSelectedRequest(row);
        setDetailsOpen(true);
      },
    },
  ];

  // Columns for "Leave Types" Table
  const typesColumns: ModernizeColumnDef<LeaveType>[] = [
    {
      id: "name",
      header: t("LeaveTypeName"),
      cell: (row) => (
        <Box>
          <Typography variant="subtitle2" fontWeight={600}>
            {isAr ? row.nameAr : row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {isAr ? row.name : row.nameAr}
          </Typography>
        </Box>
      ),
    },
    {
      id: "code",
      header: t("LeaveTypeCode"),
      cell: (row) => (
        <Typography variant="body2" fontWeight={600} color="primary.main">
          <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
            {row.code}
          </span>
        </Typography>
      ),
    },
    {
      id: "payment",
      header: t("IsPaid"),
      cell: (row) => (
        <Chip
          label={row.isPaid ? t("PaidLeave") : t("Unpaid")}
          size="small"
          color={row.isPaid ? "success" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      id: "attachment",
      header: t("RequiresAttachment"),
      cell: (row) => (
        <Chip
          label={row.requiresAttachment ? t("Yes") : t("No")}
          size="small"
          color={row.requiresAttachment ? "warning" : "default"}
          variant="outlined"
        />
      ),
    },
    {
      id: "days",
      header: t("DefaultDaysPerYear"),
      cell: (row) => (
        <Typography variant="body2">
          {row.defaultDaysPerYear !== null && row.defaultDaysPerYear !== undefined
            ? `${row.defaultDaysPerYear} ${t("Days")}`
            : "—"}
        </Typography>
      ),
    },
    {
      id: "active",
      header: t("Status"),
      cell: (row) => (
        <Switch
          checked={row.isActive}
          onChange={() => handleToggleTypeStatus(row)}
          size="small"
          color="primary"
        />
      ),
    },
  ];

  const typesActions: ModernizeRowAction<LeaveType>[] = [
    {
      label: t("Edit"),
      icon: <IconEdit size={18} color="#5D87FF" />,
      onClick: (row: LeaveType) => {
        setSelectedType(row);
        setTypeFormMode("edit");
        setTypeFormOpen(true);
      },
    },
  ];

  return (
    <PageContainer title={t("LeaveManagement")} description={t("LeaveManagementDesc")}>
      <Breadcrumb
        title={t("LeaveManagement")}
        items={[{ to: "/", title: t("Dashboard") }, { title: t("LeaveManagement") }]}
      />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Modernize Card Container */}
      <Card elevation={0} sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: "12px" }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 2, sm: 3 },
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              py: 2,
              px: 2,
              fontWeight: 600,
              minHeight: 52,
              display: "inline-flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            },
          }}
        >
          <Tab
            icon={<IconCalendarOff size={20} />}
            iconPosition="start"
            label={t("MyLeaves")}
          />
          {isPrivileged && (
            <Tab
              icon={<IconChecklist size={20} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{t("LeaveApprovals")}</span>
                  {summary && summary.totalPending > 0 && (
                    <Chip
                      label={summary.totalPending}
                      size="small"
                      color="warning"
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  )}
                </Stack>
              }
            />
          )}
          {isAdmin && (
            <Tab
              icon={<IconSettings size={20} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{t("LeaveTypes")}</span>
                  {leaveTypes.length > 0 && (
                    <Chip
                      label={leaveTypes.length}
                      size="small"
                      color={activeTab === 2 ? "primary" : "default"}
                      sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
                    />
                  )}
                </Stack>
              }
            />
          )}
        </Tabs>

        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Top Metric Cards */}
          <LeaveStatsCards
            summary={summary}
            loading={loadingSummary}
            isManager={isPrivileged && activeTab === 1}
          />

          <Divider />

          {/* Tab 0: My Leaves */}
          {activeTab === 0 && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1.5}>
                <Typography variant="h6" fontWeight={700}>
                  {t("MyLeaves")}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => setRequestFormOpen(true)}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                >
                  {t("RequestLeave")}
                </Button>
              </Box>
              <ModernizeDataTable
                columns={myColumns}
                data={myRequests || []}
                totalCount={myTotalCount}
                loading={loadingMyRequests}
                page={myPage}
                pageSize={pageSize}
                onPageChange={(p) => setMyPage(p)}
                actions={myActions}
                getRowId={(row) => row.id}
                emptyMessage={t("NoLeaveRequestsFound")}
              />
            </Box>
          )}

          {/* Tab 1: Approvals (Supervisors / Admins) */}
          {activeTab === 1 && isPrivileged && (
            <Box>
              <Box mb={2}>
                <Typography variant="h6" fontWeight={700}>
                  {t("LeaveApprovals")}
                </Typography>
              </Box>
              <ModernizeDataTable
                columns={approvalsColumns}
                data={approvals || []}
                totalCount={approvalsTotalCount}
                loading={loadingApprovals}
                page={approvalsPage}
                pageSize={pageSize}
                onPageChange={(p) => setApprovalsPage(p)}
                actions={approvalsActions}
                getRowId={(row) => row.id}
                emptyMessage={t("NoLeaveRequestsFound")}
              />
            </Box>
          )}

          {/* Tab 2: Leave Types (Admins) */}
          {activeTab === 2 && isAdmin && (
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1.5}>
                <Typography variant="h6" fontWeight={700}>
                  {t("LeaveTypes")}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<IconPlus size={18} />}
                  onClick={() => {
                    setSelectedType(null);
                    setTypeFormMode("create");
                    setTypeFormOpen(true);
                  }}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                >
                  {t("NewLeaveType")}
                </Button>
              </Box>
              <ModernizeDataTable
                columns={typesColumns}
                data={leaveTypes || []}
                totalCount={leaveTypes?.length || 0}
                loading={loadingTypes}
                page={1}
                pageSize={50}
                onPageChange={() => {}}
                actions={typesActions}
                getRowId={(row) => row.id}
                emptyMessage={t("NoLeaveTypesFound")}
              />
            </Box>
          )}
        </Stack>
      </Card>

      {/* Dialog: Request Leave */}
      <LeaveRequestFormDialog
        open={requestFormOpen}
        onClose={() => setRequestFormOpen(false)}
        onSubmit={handleSubmitRequest}
        leaveTypes={leaveTypes.filter((t) => t.isActive)}
        isLoading={actionLoading}
      />

      {/* Dialog: View Details */}
      <LeaveRequestDetailsDialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        leaveRequest={selectedRequest}
      />

      {/* Dialog: Review (Approve / Reject) */}
      <LeaveReviewDialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        leaveRequest={requestToReview}
        mode={reviewMode}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={actionLoading}
      />

      {/* Dialog: Confirm Cancel */}
      <ConfirmActionDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title={t("ConfirmCancelLeave")}
        message={t("ConfirmCancelLeaveMessage")}
        variant="warning"
        confirmLabel={t("CancelRequest")}
        cancelLabel={t("Back")}
        isLoading={actionLoading}
      />

      {/* Dialog: Create/Edit Leave Type */}
      <LeaveTypeFormDialog
        open={typeFormOpen}
        onClose={() => setTypeFormOpen(false)}
        leaveType={selectedType}
        mode={typeFormMode}
        onSubmitCreate={handleCreateType}
        onSubmitUpdate={handleUpdateType}
        isLoading={actionLoading}
      />
    </PageContainer>
  );
};

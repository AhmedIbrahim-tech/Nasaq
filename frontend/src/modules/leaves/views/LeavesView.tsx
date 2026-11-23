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
import { useLeaves } from "../hooks";
import { LeaveStatsCards } from "../components/LeaveStatsCards";
import { LeaveRequestFormDialog } from "../components/LeaveRequestFormDialog";
import { LeaveRequestDetailsDialog } from "../components/LeaveRequestDetailsDialog";
import { LeaveReviewDialog } from "../components/LeaveReviewDialog";
import { LeaveTypeFormDialog } from "../components/LeaveTypeFormDialog";
import type {
  LeaveRequest,
  LeaveType,
} from "../types";

export const LeavesView: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");
  const isRtl = isAr;

  const {
    isPrivileged,
    isAdmin,
    isMyRequest,
    activeTab,
    setActiveTab,
    myRequests,
    myTotalCount,
    approvals,
    approvalsTotalCount,
    leaveTypes,
    summary,
    actionLoading,
    loadingSummary,
    loadingMyRequests,
    loadingApprovals,
    loadingTypes,
    feedback,
    setFeedback,
    myPage,
    setMyPage,
    approvalsPage,
    setApprovalsPage,
    pageSize,
    requestFormOpen,
    detailsOpen,
    selectedRequest,
    reviewDialogOpen,
    reviewMode,
    requestToReview,
    cancelDialogOpen,
    requestToCancel,
    typeFormOpen,
    typeFormMode,
    selectedType,
    openRequestForm,
    closeRequestForm,
    openDetails,
    closeDetails,
    openApprove,
    openReject,
    closeReview,
    openCancel,
    closeCancel,
    openCreateType,
    openEditType,
    closeTypeForm,
    submitRequest: handleSubmitRequest,
    confirmCancel: handleConfirmCancel,
    approveRequest: handleApprove,
    rejectRequest: handleReject,
    createType: handleCreateType,
    updateType: handleUpdateType,
    toggleTypeStatus: handleToggleTypeStatus,
  } = useLeaves();

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
      onClick: (row: LeaveRequest) => openDetails(row),
    },
    {
      label: t("CancelRequest"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => row.status === "Pending",
      onClick: (row: LeaveRequest) => openCancel(row),
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
      onClick: (row: LeaveRequest) => openApprove(row),
    },
    {
      label: t("Reject"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => (row.canReview ?? false) && row.status === "Pending" && !isMyRequest(row),
      onClick: (row: LeaveRequest) => openReject(row),
    },
    {
      label: t("CancelRequest"),
      icon: <IconX size={18} color="#FA896B" />,
      show: (row: LeaveRequest) => ((row.canCancel ?? false) || isMyRequest(row)) && row.status === "Pending",
      onClick: (row: LeaveRequest) => openCancel(row),
    },
    {
      label: t("ViewDetails"),
      icon: <IconEye size={18} color="#5D87FF" />,
      onClick: (row: LeaveRequest) => openDetails(row),
    },
  ];

  // Columns for "Leave Types" Table
  const typesColumns: ModernizeColumnDef<LeaveType>[] = [
    {
      id: "name",
      header: t("LeaveTypeName"),
      cell: (row) => {
        const primary = getLocalizedLeaveTypeName(row, isAr);
        const secondary = isAr ? (row.nameEn || row.name) : row.nameAr;
        return (
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {primary}
            </Typography>
            {secondary && secondary !== primary && (
              <Typography variant="caption" color="text.secondary">
                {secondary}
              </Typography>
            )}
          </Box>
        );
      },
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
      onClick: (row: LeaveType) => openEditType(row),
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
                  onClick={openRequestForm}
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
                  onClick={openCreateType}
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
        onClose={closeRequestForm}
        onSubmit={handleSubmitRequest}
        leaveTypes={leaveTypes.filter((t) => t.isActive)}
        isLoading={actionLoading}
      />

      {/* Dialog: View Details */}
      <LeaveRequestDetailsDialog
        open={detailsOpen}
        onClose={closeDetails}
        leaveRequest={selectedRequest}
      />

      {/* Dialog: Review (Approve / Reject) */}
      <LeaveReviewDialog
        open={reviewDialogOpen}
        onClose={closeReview}
        leaveRequest={requestToReview}
        mode={reviewMode}
        onApprove={handleApprove}
        onReject={handleReject}
        isLoading={actionLoading}
      />

      {/* Dialog: Confirm Cancel */}
      <ConfirmActionDialog
        open={cancelDialogOpen}
        onClose={closeCancel}
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
        onClose={closeTypeForm}
        leaveType={selectedType}
        mode={typeFormMode}
        onSubmitCreate={handleCreateType}
        onSubmitUpdate={handleUpdateType}
        isLoading={actionLoading}
      />
    </PageContainer>
  );
};

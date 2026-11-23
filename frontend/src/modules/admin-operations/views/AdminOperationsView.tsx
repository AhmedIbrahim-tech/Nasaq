"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import {
  IconCalendarEvent,
  IconAlertTriangle,
  IconClockExclamation,
  IconAward,
  IconPlus,
  IconMapPin,
  IconKey,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { AdminOperationsStatsCards } from "../components/AdminOperationsStatsCards";
import { DailyAttendanceTable } from "../components/DailyAttendanceTable";
import { GpsExceptionQueueTable } from "../components/GpsExceptionQueueTable";
import { IncompleteAttendanceTable } from "../components/IncompleteAttendanceTable";
import { LocationRequestsQueueTable } from "../components/LocationRequestsQueueTable";
import { PasswordRecoveryQueueTable } from "../components/PasswordRecoveryQueueTable";
import { ApproveGpsDialog } from "../components/ApproveGpsDialog";
import { RejectGpsDialog } from "../components/RejectGpsDialog";
import { CorrectIncompleteDialog } from "../components/CorrectIncompleteDialog";
import { ManualPointAdjustmentDialog } from "../components/ManualPointAdjustmentDialog";
import { useAdminOperations } from "../hooks";

export const AdminOperationsView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();

  const {
    activeTab,
    setActiveTab,
    summary,
    summaryLoading,
    dailyRecords,
    dailyTotal,
    dailyLoading,
    dailyParams,
    setDailyParams,
    gpsRecords,
    gpsTotal,
    gpsLoading,
    gpsParams,
    setGpsParams,
    incompleteRecords,
    incompleteTotal,
    incompleteLoading,
    incompleteParams,
    setIncompleteParams,
    locationRequests,
    locationRequestsLoading,
    passwordRequests,
    passwordRequestsLoading,
    locations,
    shifts,
    employees,
    approveDialogOpen,
    setApproveDialogOpen,
    rejectDialogOpen,
    setRejectDialogOpen,
    correctDialogOpen,
    setCorrectDialogOpen,
    adjustPointsDialogOpen,
    setAdjustPointsDialogOpen,
    selectedRecord,
    setSelectedRecord,
    actionLoading,
    loadDailyAttendance,
    loadGpsExceptions,
    loadIncompleteAttendance,
    loadLocationRequests,
    loadPasswordRequests,
    handleApproveGps,
    handleRejectGps,
    handleCorrectIncomplete,
    handleManualPointAdjustment,
  } = useAdminOperations();

  const breadcrumbItems = [
    { title: t("Dashboard"), to: "/" },
    { title: t("Workforce"), to: "/employees" },
    { title: t("AdminOperations") },
  ];

  return (
    <PageContainer title={t("AdminOperations")}>
      <Breadcrumb title={t("AdminOperations")} items={breadcrumbItems} />

      {/* Modernize Card Container */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* Tabs Header */}
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
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
            icon={<IconCalendarEvent size={20} />}
            iconPosition="start"
            label={t("DailyOperations")}
          />
          <Tab
            icon={<IconAlertTriangle size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("GpsExceptionsQueue")}</span>
                {(summary?.pendingGpsExceptionsCount || 0) > 0 && (
                  <Chip
                    size="small"
                    label={summary?.pendingGpsExceptionsCount}
                    color="warning"
                    sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            icon={<IconClockExclamation size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("IncompleteAttendance")}</span>
                {(summary?.incompleteAttendanceCount || 0) > 0 && (
                  <Chip
                    size="small"
                    label={summary?.incompleteAttendanceCount}
                    color="secondary"
                    sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            icon={<IconAward size={20} />}
            iconPosition="start"
            label={t("ManualPointAdjustments")}
          />
          <Tab
            icon={<IconMapPin size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t.has("LocationRequests") ? t("LocationRequests") : "طلبات المواقع"}</span>
                {locationRequests.length > 0 && (
                  <Chip
                    size="small"
                    label={locationRequests.length}
                    color="primary"
                    sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
          <Tab
            icon={<IconKey size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t.has("PasswordRecoveryRequests") ? t("PasswordRecoveryRequests") : "استعادة كلمات المرور"}</span>
                {passwordRequests.length > 0 && (
                  <Chip
                    size="small"
                    label={passwordRequests.length}
                    color="error"
                    sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
        </Tabs>

        {/* Unified Card Body */}
        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Top Summary Stats Cards */}
          <AdminOperationsStatsCards summary={summary} loading={summaryLoading} />

          <Divider />

          {/* Tab Panels */}
          {activeTab === 0 && (
            <DailyAttendanceTable
              records={dailyRecords}
              totalCount={dailyTotal}
              loading={dailyLoading}
              params={dailyParams}
              locations={locations}
              shifts={shifts}
              onParamsChange={(p) => setDailyParams((prev) => ({ ...prev, ...p }))}
              onRefresh={loadDailyAttendance}
              onApproveGps={(rec) => {
                setSelectedRecord(rec);
                setApproveDialogOpen(true);
              }}
              onRejectGps={(rec) => {
                setSelectedRecord(rec);
                setRejectDialogOpen(true);
              }}
              onCorrectIncomplete={(rec) => {
                setSelectedRecord(rec);
                setCorrectDialogOpen(true);
              }}
            />
          )}

          {activeTab === 1 && (
            <GpsExceptionQueueTable
              records={gpsRecords}
              totalCount={gpsTotal}
              loading={gpsLoading}
              params={gpsParams}
              onParamsChange={(p) => setGpsParams((prev) => ({ ...prev, ...p }))}
              onRefresh={loadGpsExceptions}
              onApprove={(rec) => {
                setSelectedRecord(rec);
                setApproveDialogOpen(true);
              }}
              onReject={(rec) => {
                setSelectedRecord(rec);
                setRejectDialogOpen(true);
              }}
            />
          )}

          {activeTab === 2 && (
            <IncompleteAttendanceTable
              records={incompleteRecords}
              totalCount={incompleteTotal}
              loading={incompleteLoading}
              params={incompleteParams}
              onParamsChange={(p) => setIncompleteParams((prev) => ({ ...prev, ...p }))}
              onRefresh={loadIncompleteAttendance}
              onCorrect={(rec) => {
                setSelectedRecord(rec);
                setCorrectDialogOpen(true);
              }}
            />
          )}

          {activeTab === 3 && (
            <Box textAlign="center" py={5}>
              <IconAward size={48} color={theme.palette.primary.main} />
              <Typography variant="h6" fontWeight={700} mt={2}>
                {t("ManualPointAdjustments")}
              </Typography>
              <Typography variant="body2" color="text.secondary" maxWidth={500} mx="auto" mt={1}>
                {t("PositiveForRewardNegativeForPenalty")}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconPlus size={18} />}
                onClick={() => setAdjustPointsDialogOpen(true)}
                sx={{ borderRadius: "8px", textTransform: "none", mt: 3, fontWeight: 600 }}
              >
                {t("AdjustPoints")}
              </Button>
            </Box>
          )}

          {activeTab === 4 && (
            <LocationRequestsQueueTable
              records={locationRequests}
              loading={locationRequestsLoading}
              onRefresh={loadLocationRequests}
            />
          )}

          {activeTab === 5 && (
            <PasswordRecoveryQueueTable
              records={passwordRequests}
              loading={passwordRequestsLoading}
              onRefresh={loadPasswordRequests}
            />
          )}
        </Stack>
      </Card>

      {/* Dialogs */}
      <ApproveGpsDialog
        open={approveDialogOpen}
        record={selectedRecord}
        loading={actionLoading}
        onClose={() => {
          setApproveDialogOpen(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleApproveGps}
      />

      <RejectGpsDialog
        open={rejectDialogOpen}
        record={selectedRecord}
        loading={actionLoading}
        onClose={() => {
          setRejectDialogOpen(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleRejectGps}
      />

      <CorrectIncompleteDialog
        open={correctDialogOpen}
        record={selectedRecord}
        loading={actionLoading}
        onClose={() => {
          setCorrectDialogOpen(false);
          setSelectedRecord(null);
        }}
        onConfirm={handleCorrectIncomplete}
      />

      <ManualPointAdjustmentDialog
        open={adjustPointsDialogOpen}
        employees={employees}
        loading={actionLoading}
        onClose={() => setAdjustPointsDialogOpen(false)}
        onConfirm={handleManualPointAdjustment}
      />
    </PageContainer>
  );
};

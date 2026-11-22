"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { notify } from "@/shared/services/notification.service";
import { adminOperationsService } from "../services/admin-operations.service";
import { locationsService } from "@/modules/locations/services/locations.service";
import { scheduleService } from "@/modules/schedules/services/schedule.service";
import { employeeService } from "@/modules/employees/services/employee.service";
import { pointsService } from "@/modules/points/services/points.service";
import { getPendingPasswordRequests } from "@/modules/auth/services/auth.service";
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
import type {
  AdminOperationsSummary,
  AttendanceRecord,
  DailyAttendanceParams,
  GpsExceptionsParams,
  IncompleteAttendanceParams,
  ManualPointAdjustmentRequest,
  PointTransaction,
} from "../types";
import type { EmployeeLocationRequest } from "@/modules/locations/types";
import type { ForgotPasswordRequestDto } from "@/modules/auth/types";

export const AdminOperationsView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();

  // Active Tab: 0 = Daily Operations, 1 = GPS Exceptions, 2 = Incomplete Attendance, 3 = Manual Adjustments
  const [activeTab, setActiveTab] = useState(0);

  // Summary State
  const [summary, setSummary] = useState<AdminOperationsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Daily Attendance State
  const [dailyRecords, setDailyRecords] = useState<AttendanceRecord[]>([]);
  const [dailyTotal, setDailyTotal] = useState(0);
  const [dailyLoading, setDailyLoading] = useState(false);
  const [dailyParams, setDailyParams] = useState<DailyAttendanceParams>({
    page: 1,
    pageSize: 10,
  });

  // GPS Exceptions State
  const [gpsRecords, setGpsRecords] = useState<AttendanceRecord[]>([]);
  const [gpsTotal, setGpsTotal] = useState(0);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsParams, setGpsParams] = useState<GpsExceptionsParams>({
    page: 1,
    pageSize: 10,
  });

  // Incomplete Attendance State
  const [incompleteRecords, setIncompleteRecords] = useState<AttendanceRecord[]>([]);
  const [incompleteTotal, setIncompleteTotal] = useState(0);
  const [incompleteLoading, setIncompleteLoading] = useState(false);
  const [incompleteParams, setIncompleteParams] = useState<IncompleteAttendanceParams>({
    page: 1,
    pageSize: 10,
  });

  // Location Requests State
  const [locationRequests, setLocationRequests] = useState<EmployeeLocationRequest[]>([]);
  const [locationRequestsLoading, setLocationRequestsLoading] = useState(false);

  // Password Recovery Requests State
  const [passwordRequests, setPasswordRequests] = useState<ForgotPasswordRequestDto[]>([]);
  const [passwordRequestsLoading, setPasswordRequestsLoading] = useState(false);

  // Supporting Data
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [shifts, setShifts] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; fullName: string; code: string }[]>([]);

  // Dialog States
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [correctDialogOpen, setCorrectDialogOpen] = useState(false);
  const [adjustPointsDialogOpen, setAdjustPointsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // 1. Load Summary
  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await adminOperationsService.getSummary();
      setSummary(res);
    } catch {
      // quiet fail
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // 2. Load Daily Attendance
  const loadDailyAttendance = useCallback(async () => {
    try {
      setDailyLoading(true);
      const res = await adminOperationsService.getDailyAttendance(dailyParams);
      setDailyRecords(res.data || res.items || []);
      setDailyTotal(res.totalCount || 0);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setDailyLoading(false);
    }
  }, [dailyParams, t]);

  // 3. Load GPS Exceptions
  const loadGpsExceptions = useCallback(async () => {
    try {
      setGpsLoading(true);
      const res = await adminOperationsService.getGpsExceptions(gpsParams);
      setGpsRecords(res.data || res.items || []);
      setGpsTotal(res.totalCount || 0);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setGpsLoading(false);
    }
  }, [gpsParams, t]);

  // 4. Load Incomplete Attendance
  const loadIncompleteAttendance = useCallback(async () => {
    try {
      setIncompleteLoading(true);
      const res = await adminOperationsService.getIncompleteAttendance(incompleteParams);
      setIncompleteRecords(res.data || res.items || []);
      setIncompleteTotal(res.totalCount || 0);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setIncompleteLoading(false);
    }
  }, [incompleteParams, t]);

  // 5. Load Location Requests
  const loadLocationRequests = useCallback(async () => {
    try {
      setLocationRequestsLoading(true);
      const data = await locationsService.getPendingLocationRequests();
      setLocationRequests(data);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setLocationRequestsLoading(false);
    }
  }, [t]);

  // 6. Load Password Recovery Requests
  const loadPasswordRequests = useCallback(async () => {
    try {
      setPasswordRequestsLoading(true);
      const data = await getPendingPasswordRequests();
      setPasswordRequests(data);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setPasswordRequestsLoading(false);
    }
  }, [t]);

  // 7. Load Lookup Data
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [locsRes, shiftsRes, empsRes] = await Promise.all([
          locationsService.getLocations({}),
          scheduleService.getShifts({ pageSize: 100 }),
          employeeService.getEmployees({ pageSize: 200 }),
        ]);

        const locsItems = (locsRes as any)?.data || (locsRes as any)?.items || [];
        const shiftsItems = (shiftsRes as any)?.data || (shiftsRes as any)?.items || [];
        const empsItems = (empsRes as any)?.data || (empsRes as any)?.items || [];

        if (locsItems.length > 0) {
          setLocations(locsItems.map((l: any) => ({ id: l.id, name: l.name })));
        }
        if (shiftsItems.length > 0) {
          setShifts(shiftsItems.map((s: any) => ({ id: s.id, name: s.name })));
        }
        if (empsItems.length > 0) {
          setEmployees(
            empsItems.map((e: any) => ({
              id: e.id,
              fullName: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
              code: e.employeeCode || "",
            }))
          );
        }
      } catch {
        // quiet lookup error
      }
    };

    fetchLookups();
    loadSummary();
    loadLocationRequests();
    loadPasswordRequests();
  }, [loadSummary, loadLocationRequests, loadPasswordRequests]);

  // Sync data on tab change or filter change
  useEffect(() => {
    if (activeTab === 0) {
      loadDailyAttendance();
    } else if (activeTab === 1) {
      loadGpsExceptions();
    } else if (activeTab === 2) {
      loadIncompleteAttendance();
    } else if (activeTab === 4) {
      loadLocationRequests();
    } else if (activeTab === 5) {
      loadPasswordRequests();
    }
  }, [activeTab, loadDailyAttendance, loadGpsExceptions, loadIncompleteAttendance, loadLocationRequests, loadPasswordRequests]);

  // Action: Approve GPS Exception
  const handleApproveGps = async (id: string, reviewNotes?: string) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.approveGpsException(id, { reviewNotes });
      notify.success(t("GpsApprovalSuccess"));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setGpsRecords((prev) => prev.filter((r) => r.id !== id));
      setApproveDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch {
      notify.error(t("ErrorUpdatingRecord"));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Reject GPS Exception
  const handleRejectGps = async (id: string, reason: string) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.rejectGpsException(id, { reason });
      notify.success(t("GpsRejectionSuccess"));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setGpsRecords((prev) => prev.filter((r) => r.id !== id));
      setRejectDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch {
      notify.error(t("ErrorUpdatingRecord"));
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Correct Incomplete Attendance
  const handleCorrectIncomplete = async (
    id: string,
    manualCheckOutTimeUtc: string,
    reason: string
  ) => {
    try {
      setActionLoading(true);
      const updated = await adminOperationsService.correctIncompleteAttendance(id, {
        manualCheckOutTimeUtc,
        reason,
      });
      notify.success(t("IncompleteCorrectionSuccess"));

      // Update in-place
      setDailyRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));
      setIncompleteRecords((prev) => prev.filter((r) => r.id !== id));
      setCorrectDialogOpen(false);
      setSelectedRecord(null);

      // Refresh counters
      loadSummary();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      const formattedErrors = Array.isArray(serverErrors)
        ? serverErrors
            .map((e: any) =>
              typeof e === "string" ? e : e?.description || e?.errorMessage || JSON.stringify(e)
            )
            .join(", ")
        : null;
      const msg =
        formattedErrors ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        t("ErrorUpdatingRecord");
      notify.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  // Action: Manual Point Adjustment
  const handleManualPointAdjustment = async (data: ManualPointAdjustmentRequest) => {
    try {
      setActionLoading(true);
      await adminOperationsService.manualPointAdjustment(data);
      notify.success(t("PointAdjustmentSuccess"));
      setAdjustPointsDialogOpen(false);
      loadSummary();
    } catch (err: any) {
      const serverErrors = err.response?.data?.errors;
      const formattedErrors = Array.isArray(serverErrors)
        ? serverErrors
            .map((e: any) =>
              typeof e === "string" ? e : e?.description || e?.errorMessage || JSON.stringify(e)
            )
            .join(", ")
        : null;
      const msg =
        formattedErrors ||
        err.response?.data?.message ||
        err.response?.data?.detail ||
        err.response?.data?.title ||
        err.message ||
        t("ErrorUpdatingRecord");
      notify.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/shared/components/container/PageContainer";
import { IconClockCheck, IconUsers, IconCalendarTime } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { RoleNames } from "@/shared/constants/roles";
import { attendanceService } from "../services/attendance.service";
import { CheckInCard } from "../components/CheckInCard";
import { AttendanceStatusCard } from "../components/AttendanceStatusCard";
import { AttendanceHistoryTable } from "../components/AttendanceHistoryTable";
import type { CurrentAttendanceStatus, AttendanceRecord, CheckInRequest, CheckOutRequest } from "../types";

export const AttendanceView: React.FC = () => {
  const t = useTranslations();
  const roles = useAppSelector((state) => state.auth.roles) || [];
  const isPrivileged = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor].includes(r as any)
  );

  const [activeTab, setActiveTab] = useState<number>(0);
  const [status, setStatus] = useState<CurrentAttendanceStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState<boolean>(true);

  // My History state
  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
  const [myTotalCount, setMyTotalCount] = useState<number>(0);
  const [myPage, setMyPage] = useState<number>(1);
  const [myPageSize] = useState<number>(10);
  const [myLoading, setMyLoading] = useState<boolean>(false);

  // Org/Team Records state
  const [orgRecords, setOrgRecords] = useState<AttendanceRecord[]>([]);
  const [orgTotalCount, setOrgTotalCount] = useState<number>(0);
  const [orgPage, setOrgPage] = useState<number>(1);
  const [orgPageSize] = useState<number>(10);
  const [orgLoading, setOrgLoading] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadStatus = useCallback(async () => {
    setStatusLoading(true);
    try {
      const res = await attendanceService.getStatus();
      setStatus(res);
    } catch {
      // Ignore initial error
    } finally {
      setStatusLoading(false);
    }
  }, []);

  const loadMyHistory = useCallback(async (p: number) => {
    setMyLoading(true);
    try {
      const res = await attendanceService.getMyHistory({ page: p, pageSize: myPageSize });
      setMyRecords(res.data ?? []);
      setMyTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorLoadingAttendanceHistory") });
    } finally {
      setMyLoading(false);
    }
  }, [myPageSize, t]);

  const loadOrgRecords = useCallback(async (p: number) => {
    setOrgLoading(true);
    try {
      const res = await attendanceService.getRecords({ page: p, pageSize: orgPageSize });
      setOrgRecords(res.data ?? []);
      setOrgTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorLoadingAttendanceRecords") });
    } finally {
      setOrgLoading(false);
    }
  }, [orgPageSize, t]);

  useEffect(() => {
    loadStatus();
    loadMyHistory(1);
    if (isPrivileged) {
      loadOrgRecords(1);
    }
  }, [loadStatus, loadMyHistory, loadOrgRecords, isPrivileged]);

  const handleCheckIn = async (req: CheckInRequest) => {
    setFeedback(null);
    const rec = await attendanceService.checkIn(req);
    setFeedback({
      type: "success",
      message: rec.checkInStatus === "Verified"
        ? t("CheckInSuccessVerified")
        : t("CheckInSuccessPendingReview"),
    });
    await loadStatus();
    await loadMyHistory(1);
    if (isPrivileged) await loadOrgRecords(1);
  };

  const handleCheckOut = async (req: CheckOutRequest) => {
    setFeedback(null);
    const rec = await attendanceService.checkOut(req);
    setFeedback({
      type: "success",
      message: `${t("CheckOutSuccess")}${rec?.durationHours != null ? ` (${rec.durationHours.toFixed(1)} ${t("HoursAbbr")})` : ""}`,
    });
    await loadStatus();
    await loadMyHistory(1);
    if (isPrivileged) await loadOrgRecords(1);
  };

  const BCrumb = [
    { to: "/", title: t("Home") },
    { title: t("AttendanceEngine") },
  ];

  return (
    <PageContainer title={t("AttendanceManagement")} description={t("AttendanceManagementDesc")}>
      <Breadcrumb title={t("AttendanceEngine")} items={BCrumb} />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Top Section: Check-In Terminal & Today's Shift/Location Context */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <CheckInCard
            status={status}
            isLoading={statusLoading}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <AttendanceStatusCard status={status} />
        </Grid>
      </Grid>

      {/* Navigation Tabs for My History vs Team Records */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab
            icon={<IconCalendarTime size={18} />}
            iconPosition="start"
            label={t("MyAttendanceHistory")}
          />
          {isPrivileged && (
            <Tab
              icon={<IconUsers size={18} />}
              iconPosition="start"
              label={t("TeamAttendanceRecords")}
            />
          )}
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <AttendanceHistoryTable
          records={myRecords}
          totalCount={myTotalCount}
          loading={myLoading}
          page={myPage}
          pageSize={myPageSize}
          onPageChange={(p) => {
            setMyPage(p);
            loadMyHistory(p);
          }}
          showEmployeeColumn={false}
        />
      )}

      {activeTab === 1 && isPrivileged && (
        <AttendanceHistoryTable
          records={orgRecords}
          totalCount={orgTotalCount}
          loading={orgLoading}
          page={orgPage}
          pageSize={orgPageSize}
          onPageChange={(p) => {
            setOrgPage(p);
            loadOrgRecords(p);
          }}
          showEmployeeColumn={true}
        />
      )}
    </PageContainer>
  );
};

export default AttendanceView;

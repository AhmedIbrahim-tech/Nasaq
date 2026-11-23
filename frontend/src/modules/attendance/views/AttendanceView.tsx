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
import { useAttendance } from "../hooks";
import { CheckInCard } from "../components/CheckInCard";
import { AttendanceStatusCard } from "../components/AttendanceStatusCard";
import { AttendanceHistoryTable } from "../components/AttendanceHistoryTable";

export const AttendanceView: React.FC = () => {
  const t = useTranslations();

  const {
    isPrivileged,
    activeTab,
    setActiveTab,
    status,
    statusLoading,
    myRecords,
    myTotalCount,
    myPage,
    myPageSize,
    myLoading,
    orgRecords,
    orgTotalCount,
    orgPage,
    orgPageSize,
    orgLoading,
    feedback,
    setFeedback,
    loadMyHistory,
    loadOrgRecords,
    handleCheckIn,
    handleCheckOut,
  } = useAttendance();

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

      {/* Top Section: Dominant Attendance Action Panel + Secondary Work Info Panel */}
      <Grid container spacing={3} sx={{ mb: 4 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 7, lg: 7.5 }}>
          <CheckInCard
            status={status}
            isLoading={statusLoading}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4.5 }}>
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
          sx={{
            minHeight: 52,
            "& .MuiTab-root": {
              minHeight: 52,
              fontWeight: 600,
              gap: 1,
            },
          }}
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
          onPageChange={loadMyHistory}
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
          onPageChange={loadOrgRecords}
          showEmployeeColumn={true}
        />
      )}
    </PageContainer>
  );
};

export default AttendanceView;

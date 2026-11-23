"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import PageContainer from "@/shared/components/container/PageContainer";
import {
  IconAward,
  IconListDetails,
  IconAdjustments,
  IconPlus,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import { RoleNames } from "@/shared/constants/roles";
import { usePoints } from "../hooks";
import { PointsSummaryCards } from "../components/PointsSummaryCards";
import { PointsLedgerTable } from "../components/PointsLedgerTable";
import { PointRulesTable } from "../components/PointRulesTable";
import { PointRuleFormDialog } from "../components/PointRuleFormDialog";
import { ReverseTransactionDialog } from "../components/ReverseTransactionDialog";
import type { PointRule, PointTransaction } from "../types";

export const PointsView: React.FC = () => {
  const t = useTranslations();

  const {
    isPrivileged,
    isAdmin,
    activeTab,
    setActiveTab,
    summary,
    summaryLoading,
    myTransactions,
    myTotalCount,
    myPage,
    myLoading,
    orgTransactions,
    orgTotalCount,
    orgPage,
    orgLoading,
    rules,
    rulesTotalCount,
    rulesPage,
    rulesLoading,
    ruleDialogOpen,
    ruleDialogMode,
    selectedRule,
    isSubmittingRule,
    reverseDialogOpen,
    selectedTx,
    isReversing,
    feedback,
    setFeedback,
    loadMyTransactions,
    refreshMyTransactions,
    loadOrgTransactions,
    refreshOrgTransactions,
    loadRules,
    refreshRules,
    openCreateRule,
    openEditRule,
    closeRuleDialog,
    createRule,
    updateRule,
    toggleRuleStatus,
    openReverseDialog,
    closeReverseDialog,
    confirmReversal,
  } = usePoints();

  const BCrumb = [
    { to: "/", title: t("Home") },
    { title: t("PointsAndPenalties") },
  ];

  return (
    <PageContainer title={t("PointsEngine")} description={t("PointsEngineDesc")}>
      <Breadcrumb title={t("PointsAndPenalties")} items={BCrumb} />

      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 3, borderRadius: 2 }}
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
            icon={<IconAward size={20} />}
            iconPosition="start"
            label={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>{t("MyPointsLedger")}</span>
                {myTotalCount > 0 && (
                  <Chip
                    size="small"
                    label={myTotalCount}
                    color={activeTab === 0 ? "primary" : "default"}
                    sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                  />
                )}
              </Stack>
            }
          />
          {isPrivileged && (
            <Tab
              icon={<IconListDetails size={20} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{t("AllPointTransactions")}</span>
                  {orgTotalCount > 0 && (
                    <Chip
                      size="small"
                      label={orgTotalCount}
                      color={activeTab === 1 ? "primary" : "default"}
                      sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                    />
                  )}
                </Stack>
              }
            />
          )}
          {isAdmin && (
            <Tab
              icon={<IconAdjustments size={20} />}
              iconPosition="start"
              label={
                <Stack direction="row" spacing={1} alignItems="center">
                  <span>{t("ConfiguredPointRules")}</span>
                  {rulesTotalCount > 0 && (
                    <Chip
                      size="small"
                      label={rulesTotalCount}
                      color={activeTab === 2 ? "primary" : "default"}
                      sx={{ height: 20, fontSize: "0.75rem", fontWeight: 700 }}
                    />
                  )}
                </Stack>
              }
            />
          )}
        </Tabs>

        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* KPI Balance Summary Cards */}
          <PointsSummaryCards summary={summary} loading={summaryLoading} />

          <Divider />

          {/* Tab 0: My Points Ledger */}
          {activeTab === 0 && (
            <PointsLedgerTable
              transactions={myTransactions}
              totalCount={myTotalCount}
              loading={myLoading}
              page={myPage}
              pageSize={10}
              onPageChange={loadMyTransactions}
              onRefresh={refreshMyTransactions}
              showEmployeeColumn={false}
              canReverse={false}
            />
          )}

          {/* Tab 1: Organization Transactions (Supervisors / Admins) */}
          {activeTab === 1 && isPrivileged && (
            <PointsLedgerTable
              transactions={orgTransactions}
              totalCount={orgTotalCount}
              loading={orgLoading}
              page={orgPage}
              pageSize={10}
              onPageChange={loadOrgTransactions}
              onRefresh={refreshOrgTransactions}
              showEmployeeColumn={true}
              canReverse={isAdmin}
              onReverse={openReverseDialog}
            />
          )}

          {/* Tab 2: Point Rules Management (Admins) */}
          {activeTab === 2 && isAdmin && (
            <PointRulesTable
              rules={rules}
              totalCount={rulesTotalCount}
              loading={rulesLoading}
              page={rulesPage}
              pageSize={10}
              onPageChange={loadRules}
              onAddNew={openCreateRule}
              onRefresh={refreshRules}
              onEdit={openEditRule}
              onToggleStatus={toggleRuleStatus}
            />
          )}
        </Stack>
      </Card>

      {/* Rule Form Dialog */}
      <PointRuleFormDialog
        open={ruleDialogOpen}
        rule={selectedRule}
        mode={ruleDialogMode}
        isSubmitting={isSubmittingRule}
        onClose={closeRuleDialog}
        onSubmit={ruleDialogMode === "create" ? createRule : updateRule}
      />

      {/* Reverse Transaction Dialog */}
      <ReverseTransactionDialog
        open={reverseDialogOpen}
        transaction={selectedTx}
        isSubmitting={isReversing}
        onClose={closeReverseDialog}
        onConfirm={confirmReversal}
      />
    </PageContainer>
  );
};

export default PointsView;

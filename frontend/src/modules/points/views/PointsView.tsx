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
import { pointsService } from "../services/points.service";
import { PointsSummaryCards } from "../components/PointsSummaryCards";
import { PointsLedgerTable } from "../components/PointsLedgerTable";
import { PointRulesTable } from "../components/PointRulesTable";
import { PointRuleFormDialog } from "../components/PointRuleFormDialog";
import { ReverseTransactionDialog } from "../components/ReverseTransactionDialog";
import type {
  EmployeePointsSummary,
  PointTransaction,
  PointRule,
  CreatePointRuleRequest,
  UpdatePointRuleRequest,
} from "../types";

export const PointsView: React.FC = () => {
  const t = useTranslations();
  const roles = useAppSelector((state) => state.auth.roles) || [];
  const isPrivileged = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor].includes(r as any)
  );
  const isAdmin = roles.some((r) =>
    [RoleNames.SuperAdmin, RoleNames.Admin].includes(r as any)
  );

  const [activeTab, setActiveTab] = useState<number>(0);
  const [summary, setSummary] = useState<EmployeePointsSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);

  // My Transactions
  const [myTransactions, setMyTransactions] = useState<PointTransaction[]>([]);
  const [myTotalCount, setMyTotalCount] = useState<number>(0);
  const [myPage, setMyPage] = useState<number>(1);
  const [myLoading, setMyLoading] = useState<boolean>(false);

  // Org Transactions
  const [orgTransactions, setOrgTransactions] = useState<PointTransaction[]>([]);
  const [orgTotalCount, setOrgTotalCount] = useState<number>(0);
  const [orgPage, setOrgPage] = useState<number>(1);
  const [orgLoading, setOrgLoading] = useState<boolean>(false);

  // Rules
  const [rules, setRules] = useState<PointRule[]>([]);
  const [rulesTotalCount, setRulesTotalCount] = useState<number>(0);
  const [rulesPage, setRulesPage] = useState<number>(1);
  const [rulesLoading, setRulesLoading] = useState<boolean>(false);

  // Dialogs
  const [ruleDialogOpen, setRuleDialogOpen] = useState<boolean>(false);
  const [ruleDialogMode, setRuleDialogMode] = useState<"create" | "edit">("create");
  const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);
  const [isSubmittingRule, setIsSubmittingRule] = useState<boolean>(false);

  const [reverseDialogOpen, setReverseDialogOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<PointTransaction | null>(null);
  const [isReversing, setIsReversing] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await pointsService.getMySummary();
      setSummary(res);
    } catch {
      // Ignore initial error
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadMyTransactions = useCallback(async (p: number) => {
    setMyLoading(true);
    try {
      const res = await pointsService.getMyTransactions({ page: p, pageSize: 10 });
      setMyTransactions(res.data ?? []);
      setMyTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorLoadingPointTransactions") });
    } finally {
      setMyLoading(false);
    }
  }, [t]);

  const loadOrgTransactions = useCallback(async (p: number) => {
    setOrgLoading(true);
    try {
      const res = await pointsService.getTransactions({ page: p, pageSize: 10 });
      setOrgTransactions(res.data ?? []);
      setOrgTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorLoadingPointTransactions") });
    } finally {
      setOrgLoading(false);
    }
  }, [t]);

  const loadRules = useCallback(async (p: number) => {
    setRulesLoading(true);
    try {
      const res = await pointsService.getRules({ page: p, pageSize: 10 });
      setRules(res.data ?? []);
      setRulesTotalCount(res.totalCount ?? 0);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorLoadingPointRules") });
    } finally {
      setRulesLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadSummary();
    loadMyTransactions(1);
    if (isPrivileged) loadOrgTransactions(1);
    if (isAdmin) loadRules(1);
  }, [loadSummary, loadMyTransactions, loadOrgTransactions, loadRules, isPrivileged, isAdmin]);

  const handleCreateRule = async (data: CreatePointRuleRequest | UpdatePointRuleRequest) => {
    setIsSubmittingRule(true);
    try {
      await pointsService.createRule(data as CreatePointRuleRequest);
      setFeedback({ type: "success", message: t("PointRuleCreatedSuccess") });
      setRuleDialogOpen(false);
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorCreatingPointRule") });
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleUpdateRule = async (data: CreatePointRuleRequest | UpdatePointRuleRequest) => {
    setIsSubmittingRule(true);
    try {
      const req = data as UpdatePointRuleRequest;
      await pointsService.updateRule(req.id, req);
      setFeedback({ type: "success", message: t("PointRuleUpdatedSuccess") });
      setRuleDialogOpen(false);
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorUpdatingPointRule") });
    } finally {
      setIsSubmittingRule(false);
    }
  };

  const handleToggleRuleStatus = async (rule: PointRule) => {
    try {
      await pointsService.toggleRuleStatus(rule.id);
      setFeedback({ type: "success", message: t("PointRuleStatusUpdatedSuccess") });
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorUpdatingPointRuleStatus") });
    }
  };

  const handleConfirmReversal = async (transactionId: string, reason: string) => {
    setIsReversing(true);
    try {
      await pointsService.reverseTransaction(transactionId, reason);
      setFeedback({ type: "success", message: t("PointTransactionReversedSuccess") });
      setReverseDialogOpen(false);
      await loadSummary();
      await loadMyTransactions(myPage);
      if (isPrivileged) await loadOrgTransactions(orgPage);
    } catch (err: any) {
      setFeedback({ type: "error", message: err.message || t("ErrorReversingPointTransaction") });
    } finally {
      setIsReversing(false);
    }
  };

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
              onPageChange={(p) => {
                setMyPage(p);
                loadMyTransactions(p);
              }}
              onRefresh={() => loadMyTransactions(myPage)}
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
              onPageChange={(p) => {
                setOrgPage(p);
                loadOrgTransactions(p);
              }}
              onRefresh={() => loadOrgTransactions(orgPage)}
              showEmployeeColumn={true}
              canReverse={isAdmin}
              onReverse={(tx) => {
                setSelectedTx(tx);
                setReverseDialogOpen(true);
              }}
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
              onPageChange={(p) => {
                setRulesPage(p);
                loadRules(p);
              }}
              onAddNew={() => {
                setSelectedRule(null);
                setRuleDialogMode("create");
                setRuleDialogOpen(true);
              }}
              onRefresh={() => loadRules(rulesPage)}
              onEdit={(r) => {
                setSelectedRule(r);
                setRuleDialogMode("edit");
                setRuleDialogOpen(true);
              }}
              onToggleStatus={handleToggleRuleStatus}
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
        onClose={() => setRuleDialogOpen(false)}
        onSubmit={ruleDialogMode === "create" ? handleCreateRule : handleUpdateRule}
      />

      {/* Reverse Transaction Dialog */}
      <ReverseTransactionDialog
        open={reverseDialogOpen}
        transaction={selectedTx}
        isSubmitting={isReversing}
        onClose={() => setReverseDialogOpen(false)}
        onConfirm={handleConfirmReversal}
      />
    </PageContainer>
  );
};

export default PointsView;

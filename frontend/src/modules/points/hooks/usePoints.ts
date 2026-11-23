'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppSelector } from '@/store/hooks';
import { RoleNames } from '@/shared/constants/roles';
import { pointsService } from '../services/points.service';
import type {
  EmployeePointsSummary,
  PointTransaction,
  PointRule,
  CreatePointRuleRequest,
  UpdatePointRuleRequest,
} from '../types';

export function usePoints() {
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
  const [ruleDialogMode, setRuleDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedRule, setSelectedRule] = useState<PointRule | null>(null);
  const [isSubmittingRule, setIsSubmittingRule] = useState<boolean>(false);

  const [reverseDialogOpen, setReverseDialogOpen] = useState<boolean>(false);
  const [selectedTx, setSelectedTx] = useState<PointTransaction | null>(null);
  const [isReversing, setIsReversing] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
      setFeedback({ type: 'error', message: err.message || t('ErrorLoadingPointTransactions') });
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
      setFeedback({ type: 'error', message: err.message || t('ErrorLoadingPointTransactions') });
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
      setFeedback({ type: 'error', message: err.message || t('ErrorLoadingPointRules') });
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

  const handlePageChangeMy = useCallback((p: number) => {
    setMyPage(p);
    loadMyTransactions(p);
  }, [loadMyTransactions]);

  const handlePageChangeOrg = useCallback((p: number) => {
    setOrgPage(p);
    loadOrgTransactions(p);
  }, [loadOrgTransactions]);

  const handlePageChangeRules = useCallback((p: number) => {
    setRulesPage(p);
    loadRules(p);
  }, [loadRules]);

  // Rule Dialog Handlers
  const handleOpenCreateRule = useCallback(() => {
    setSelectedRule(null);
    setRuleDialogMode('create');
    setRuleDialogOpen(true);
  }, []);

  const handleOpenEditRule = useCallback((rule: PointRule) => {
    setSelectedRule(rule);
    setRuleDialogMode('edit');
    setRuleDialogOpen(true);
  }, []);

  const handleCloseRuleDialog = useCallback(() => {
    setRuleDialogOpen(false);
    setSelectedRule(null);
  }, []);

  const handleCreateRule = useCallback(async (data: CreatePointRuleRequest | UpdatePointRuleRequest) => {
    setIsSubmittingRule(true);
    try {
      await pointsService.createRule(data as CreatePointRuleRequest);
      setFeedback({ type: 'success', message: t('PointRuleCreatedSuccess') });
      setRuleDialogOpen(false);
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorCreatingPointRule') });
      throw err;
    } finally {
      setIsSubmittingRule(false);
    }
  }, [t, loadRules, rulesPage]);

  const handleUpdateRule = useCallback(async (data: CreatePointRuleRequest | UpdatePointRuleRequest) => {
    setIsSubmittingRule(true);
    try {
      const req = data as UpdatePointRuleRequest;
      await pointsService.updateRule(req.id, req);
      setFeedback({ type: 'success', message: t('PointRuleUpdatedSuccess') });
      setRuleDialogOpen(false);
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorUpdatingPointRule') });
      throw err;
    } finally {
      setIsSubmittingRule(false);
    }
  }, [t, loadRules, rulesPage]);

  const handleToggleRuleStatus = useCallback(async (rule: PointRule) => {
    try {
      await pointsService.toggleRuleStatus(rule.id);
      setFeedback({ type: 'success', message: t('PointRuleStatusUpdatedSuccess') });
      await loadRules(rulesPage);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorUpdatingPointRuleStatus') });
    }
  }, [t, loadRules, rulesPage]);

  // Reversal Dialog Handlers
  const handleOpenReverseDialog = useCallback((tx: PointTransaction) => {
    setSelectedTx(tx);
    setReverseDialogOpen(true);
  }, []);

  const handleCloseReverseDialog = useCallback(() => {
    setReverseDialogOpen(false);
    setSelectedTx(null);
  }, []);

  const handleConfirmReversal = useCallback(async (transactionId: string, reason: string) => {
    setIsReversing(true);
    try {
      await pointsService.reverseTransaction(transactionId, reason);
      setFeedback({ type: 'success', message: t('PointTransactionReversedSuccess') });
      setReverseDialogOpen(false);
      await loadSummary();
      await loadMyTransactions(myPage);
      if (isPrivileged) await loadOrgTransactions(orgPage);
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || t('ErrorReversingPointTransaction') });
      throw err;
    } finally {
      setIsReversing(false);
    }
  }, [t, loadSummary, loadMyTransactions, myPage, isPrivileged, loadOrgTransactions, orgPage]);

  return {
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
    loadSummary,
    loadMyTransactions: handlePageChangeMy,
    refreshMyTransactions: () => loadMyTransactions(myPage),
    loadOrgTransactions: handlePageChangeOrg,
    refreshOrgTransactions: () => loadOrgTransactions(orgPage),
    loadRules: handlePageChangeRules,
    refreshRules: () => loadRules(rulesPage),
    openCreateRule: handleOpenCreateRule,
    openEditRule: handleOpenEditRule,
    closeRuleDialog: handleCloseRuleDialog,
    createRule: handleCreateRule,
    updateRule: handleUpdateRule,
    toggleRuleStatus: handleToggleRuleStatus,
    openReverseDialog: handleOpenReverseDialog,
    closeReverseDialog: handleCloseReverseDialog,
    confirmReversal: handleConfirmReversal,
  };
}

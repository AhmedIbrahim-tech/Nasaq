"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import { useLocale, useTranslations } from "next-intl";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { notify } from "@/shared/services/notification.service";
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import { locationsService } from "@/modules/locations/services/locations.service";
import { scheduleService } from "@/modules/schedules/services/schedule.service";
import { employeeService } from "@/modules/employees/services/employee.service";
import { reportsService } from "../services/reports.service";
import { ReportKpisSummary } from "../components/ReportKpisSummary";
import { ReportExportMenu } from "../components/ReportExportMenu";
import { ReportFiltersBar } from "../components/ReportFiltersBar";
import { ReportDataTable } from "../components/ReportDataTable";
import type {
  ReportCatalogItem,
  ReportFilterRequest,
  ReportResult,
} from "../types";

export const ReportsView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  // Catalog & Active Report
  const [catalog, setCatalog] = useState<ReportCatalogItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>("daily-attendance");
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Report Execution Result
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<ReportFilterRequest>({
    reportId: "daily-attendance",
    pageNumber: 1,
    pageSize: 20,
    language: isAr ? "ar" : "en",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Lookups for filters
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [shifts, setShifts] = useState<{ id: string; name: string }[]>([]);
  const [employees, setEmployees] = useState<{ id: string; fullName: string; code: string }[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // 1. Fetch Catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const items = await reportsService.getCatalog();
        setCatalog(items);
        if (items.length > 0 && !selectedReportId) {
          setSelectedReportId(items[0].id);
        }
      } catch {
        notify.error(t("ErrorLoadingData"));
      } finally {
        setCatalogLoading(false);
      }
    };

    fetchCatalog();
  }, [t, selectedReportId]);

  // 2. Fetch Supporting Lookups
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
          const depts = Array.from(
            new Set(empsItems.map((e: any) => e.department).filter(Boolean))
          ) as string[];
          setDepartments(depts);
        }
      } catch {
        // quiet lookup error
      }
    };

    fetchLookups();
  }, []);

  // 3. Execute Active Report
  const loadReport = useCallback(async () => {
    if (!selectedReportId) return;

    try {
      setReportLoading(true);
      const req: ReportFilterRequest = {
        ...filters,
        reportId: selectedReportId,
        language: isAr ? "ar" : "en",
      };
      const res = await reportsService.executeReport(req);
      setReportResult(res);
    } catch {
      notify.error(t("ErrorLoadingData"));
    } finally {
      setReportLoading(false);
    }
  }, [filters, selectedReportId, isAr, t]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Active Report Details
  const activeReport = useMemo(
    () => catalog.find((c) => c.id === selectedReportId),
    [catalog, selectedReportId]
  );

  const supportedFilters = activeReport?.supportedFilters || [];

  const handleSelectReport = (newReportId: string) => {
    setSelectedReportId(newReportId);
    setFilters({
      reportId: newReportId,
      pageNumber: 1,
      pageSize: 20,
      language: isAr ? "ar" : "en",
    });
  };

  const handleFilterChange = (newFilters: Partial<ReportFilterRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      reportId: selectedReportId,
      pageNumber: 1,
      pageSize: 20,
      language: isAr ? "ar" : "en",
    });
  };

  // Export Action
  const handleExport = async (format: "csv" | "xlsx" | "pdf", scope: "all" | "current_page") => {
    try {
      const exportReq: ReportFilterRequest = {
        ...filters,
        reportId: selectedReportId,
        exportFormat: format,
        exportScope: scope,
        language: isAr ? "ar" : "en",
      };
      await reportsService.exportReport(exportReq);
    } catch {
      notify.error(t("ErrorLoadingData"));
    }
  };

  const hasActiveFilters = Boolean(
    filters.searchTerm ||
      filters.fromDate ||
      filters.toDate ||
      (filters.workLocationId && filters.workLocationId !== "all") ||
      (filters.workShiftId && filters.workShiftId !== "all") ||
      (filters.employeeId && filters.employeeId !== "all") ||
      (filters.department && filters.department !== "all") ||
      (filters.status && filters.status !== "all") ||
      (filters.pointCategory && filters.pointCategory !== "all")
  );

  const breadcrumbItems = [
    { title: t("Dashboard"), to: "/" },
    { title: t("Workforce"), to: "/employees" },
    { title: t("ReportsAndExports") },
  ];

  return (
    <PageContainer title={t("ReportingCenter")}>
      <Breadcrumb title={t("ReportingCenter")} items={breadcrumbItems} />

      <Stack spacing={3}>
        {/* Main Reporting Center Card */}
        <Card
          elevation={0}
          sx={{
            borderRadius: "12px",
            border: `1px solid ${theme.palette.divider}`,
            p: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={2.5}>
            {/* Header: Report Selector + Export Actions */}
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              flexWrap="wrap"
              gap={2}
            >
              <Box minWidth={{ xs: "100%", sm: 320 }} maxWidth={{ sm: 420 }}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={t("SelectReport")}
                  value={selectedReportId}
                  onChange={(e) => handleSelectReport(e.target.value)}
                  disabled={catalogLoading}
                  SelectProps={{
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 320,
                          maxWidth: { xs: "90vw", sm: 420 },
                        },
                      },
                    },
                    renderValue: (val: any) => {
                      const found = catalog.find((c) => c.id === val);
                      return found ? (isAr ? found.nameAr : found.nameEn) : val;
                    },
                  }}
                >
                  {catalog.map((rep) => (
                    <MenuItem key={rep.id} value={rep.id}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {isAr ? rep.nameAr : rep.nameEn}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {isAr ? rep.descriptionAr : rep.descriptionEn}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <ReportExportMenu
                onExport={handleExport}
                disabled={reportLoading || !reportResult || reportResult.rows.length === 0}
              />
            </Box>

            {/* Compliance Notice for Disciplinary Summary (DEC-011 and DEC-012) */}
            {selectedReportId === "disciplinary-summary" && (
              <Alert severity="info" sx={{ borderRadius: "8px" }}>
                {t("FinancialDeductionsPendingNotice")}
              </Alert>
            )}

            {/* Top KPI Metrics Summary Cards */}
            <ReportKpisSummary
              kpis={reportResult?.summaryKpis || []}
              loading={reportLoading}
            />

            <Divider />

            {/* Toolbar: Search Always First, Filters Toggle, Reset Filters Icon, Refresh */}
            <ModernizeTableToolbar
              title={
                activeReport
                  ? isAr
                    ? activeReport.nameAr
                    : activeReport.nameEn
                  : t("ReportingCenter")
              }
              search={filters.searchTerm || ""}
              onSearchChange={(search) => handleFilterChange({ searchTerm: search, pageNumber: 1 })}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters((prev) => !prev)}
              onRefresh={loadReport}
              isRefreshing={reportLoading}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
              filterContent={
                <ReportFiltersBar
                  supportedFilters={supportedFilters}
                  filters={filters}
                  locations={locations}
                  shifts={shifts}
                  employees={employees}
                  departments={departments}
                  onFilterChange={handleFilterChange}
                />
              }
            />

            {/* Dynamic Report Data Table */}
            <ReportDataTable
              columns={reportResult?.columns || []}
              rows={reportResult?.rows || []}
              totalRecords={reportResult?.totalRecords || 0}
              loading={reportLoading}
              page={filters.pageNumber || 1}
              pageSize={filters.pageSize || 20}
              onPageChange={(page) => handleFilterChange({ pageNumber: page })}
              onPageSizeChange={(pageSize) => handleFilterChange({ pageSize, pageNumber: 1 })}
            />
          </Stack>
        </Card>
      </Stack>
    </PageContainer>
  );
};

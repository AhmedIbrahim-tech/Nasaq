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
import { alpha, useTheme } from "@mui/material/styles";
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
import { ReportFiltersBar, FilterLocationOption, FilterShiftOption, FilterEmployeeOption } from "../components/ReportFiltersBar";
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

  // Lookups for filters (with bilingual support)
  const [locations, setLocations] = useState<FilterLocationOption[]>([]);
  const [shifts, setShifts] = useState<FilterShiftOption[]>([]);
  const [employees, setEmployees] = useState<FilterEmployeeOption[]>([]);
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

  // 2. Fetch Supporting Lookups with Bilingual Names
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
          setLocations(
            locsItems.map((l: any) => ({
              id: l.id,
              name: l.name,
              nameAr: l.nameAr,
            }))
          );
        }
        if (shiftsItems.length > 0) {
          setShifts(
            shiftsItems.map((s: any) => ({
              id: s.id,
              name: s.name,
              nameAr: s.nameAr,
            }))
          );
        }
        if (empsItems.length > 0) {
          setEmployees(
            empsItems.map((e: any) => ({
              id: e.id,
              fullName: `${e.firstName || ""} ${e.lastName || ""}`.trim(),
              fullNameAr: e.fullNameAr || (e.firstNameAr ? `${e.firstNameAr} ${e.lastNameAr || ""}`.trim() : undefined),
              code: e.employeeCode || "",
            }))
          );
          const depts = Array.from(
            new Set(
              empsItems
                .map((e: any) => (isAr && e.departmentAr ? e.departmentAr : e.department))
                .filter(Boolean)
            )
          ) as string[];
          setDepartments(depts);
        }
      } catch {
        // quiet lookup error
      }
    };

    fetchLookups();
  }, [isAr]);

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

      {/* Main Modernize Card Container */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "12px",
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden",
        }}
      >
        <Stack spacing={3} p={{ xs: 2, sm: 2.5, md: 3 }}>
          {/* Section 1: Report Selector + Export Action Controls */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            {/* Report Selector Dropdown */}
            <Box sx={{ minWidth: { xs: "100%", sm: 320, md: 360 }, maxWidth: { sm: 460 } }}>
              <TextField
                select
                fullWidth
                size="small"
                label={t("SelectReport")}
                value={selectedReportId}
                onChange={(e) => handleSelectReport(e.target.value)}
                disabled={catalogLoading}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (val: any) => {
                    const found = catalog.find((c) => c.id === val);
                    if (!found) return <span style={{ opacity: 0.6 }}>{t("SelectReport")}</span>;
                    return (
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        sx={{
                          textAlign: isAr ? "right" : "left",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {isAr ? found.nameAr : found.nameEn}
                      </Typography>
                    );
                  },
                  MenuProps: {
                    anchorOrigin: {
                      vertical: "bottom",
                      horizontal: isAr ? "right" : "left",
                    },
                    transformOrigin: {
                      vertical: "top",
                      horizontal: isAr ? "right" : "left",
                    },
                    PaperProps: {
                      sx: {
                        width: { xs: "92vw", sm: 440, md: 480 },
                        maxWidth: "96vw",
                        maxHeight: 400,
                        borderRadius: "10px",
                        border: `1px solid ${theme.palette.divider}`,
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 10px 30px rgba(0,0,0,0.6)"
                            : "0 10px 30px rgba(0,0,0,0.1)",
                        overflowX: "hidden",
                        overflowY: "auto",
                        p: 0.5,
                      },
                    },
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    height: 40,
                  },
                }}
              >
                {catalog.map((rep) => {
                  const isSelected = rep.id === selectedReportId;
                  return (
                    <MenuItem
                      key={rep.id}
                      value={rep.id}
                      sx={{
                        py: 1.25,
                        px: 1.75,
                        my: 0.25,
                        borderRadius: "8px",
                        whiteSpace: "normal",
                        alignItems: "flex-start",
                        bgcolor: isSelected
                          ? alpha(theme.palette.primary.main, 0.08)
                          : "transparent",
                        "&:hover": {
                          bgcolor: isSelected
                            ? alpha(theme.palette.primary.main, 0.14)
                            : theme.palette.action.hover,
                        },
                        "&.Mui-selected": {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.14),
                          },
                        },
                      }}
                    >
                      <Box sx={{ width: "100%", textAlign: isAr ? "right" : "left" }}>
                        <Typography
                          variant="subtitle2"
                          fontWeight={700}
                          color={isSelected ? "primary.main" : "text.primary"}
                          sx={{ mb: 0.35, fontSize: "0.875rem", lineHeight: 1.3 }}
                        >
                          {isAr ? rep.nameAr : rep.nameEn}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            lineHeight: 1.45,
                            fontSize: "0.775rem",
                            wordBreak: "break-word",
                          }}
                        >
                          {isAr ? rep.descriptionAr : rep.descriptionEn}
                        </Typography>
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Box>

            {/* Standard Export Dropdown Menu */}
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

          {/* Section 2: Top KPI Summary Cards in ONE Balanced Row */}
          <ReportKpisSummary
            kpis={reportResult?.summaryKpis || []}
            loading={reportLoading}
          />

          <Divider />

          {/* Section 3: Modernize Table Toolbar with Search First, Filter Toggle, Reset, Refresh */}
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

          {/* Section 4: Dynamic Report Data Table */}
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
    </PageContainer>
  );
};

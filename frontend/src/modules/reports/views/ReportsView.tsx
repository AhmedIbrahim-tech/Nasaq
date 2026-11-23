"use client";

import React from "react";
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
import { ModernizeTableToolbar } from "@/shared/components/tables/modernize/ModernizeTableToolbar";
import { ReportKpisSummary } from "../components/ReportKpisSummary";
import { ReportExportMenu } from "../components/ReportExportMenu";
import { ReportFiltersBar } from "../components/ReportFiltersBar";
import { ReportDataTable } from "../components/ReportDataTable";
import { useReports } from "../hooks";

export const ReportsView: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const {
    catalog,
    selectedReportId,
    catalogLoading,
    reportResult,
    reportLoading,
    filters,
    showFilters,
    setShowFilters,
    locations,
    shifts,
    employees,
    departments,
    activeReport,
    supportedFilters,
    hasActiveFilters,
    handleSelectReport,
    handleFilterChange,
    handleResetFilters,
    handleExport,
    loadReport,
  } = useReports();

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

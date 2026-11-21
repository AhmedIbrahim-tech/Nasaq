"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useLocale, useTranslations } from "next-intl";
import type { ReportFilterRequest } from "../types";

export interface FilterLocationOption {
  id: string;
  name: string;
  nameAr?: string;
}

export interface FilterShiftOption {
  id: string;
  name: string;
  nameAr?: string;
}

export interface FilterEmployeeOption {
  id: string;
  fullName: string;
  fullNameAr?: string;
  code: string;
}

interface ReportFiltersBarProps {
  supportedFilters: string[];
  filters: ReportFilterRequest;
  locations: FilterLocationOption[];
  shifts: FilterShiftOption[];
  employees: FilterEmployeeOption[];
  departments: string[];
  onFilterChange: (newFilters: Partial<ReportFilterRequest>) => void;
}

export const ReportFiltersBar: React.FC<ReportFiltersBarProps> = ({
  supportedFilters,
  filters,
  locations,
  shifts,
  employees,
  departments,
  onFilterChange,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const hasDate = supportedFilters.includes("Date");
  const hasDateRange = supportedFilters.includes("DateRange");
  const hasLocation = supportedFilters.includes("WorkLocation");
  const hasShift = supportedFilters.includes("WorkShift");
  const hasEmployee = supportedFilters.includes("Employee");
  const hasDepartment = supportedFilters.includes("Department");
  const hasStatus = supportedFilters.includes("Status");
  const hasPointCategory = supportedFilters.includes("PointCategory");

  return (
    <Grid container spacing={2} alignItems="center">
      {/* 1. Date Single */}
      {hasDate && !hasDateRange && (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={t("Date")}
            value={filters.fromDate || ""}
            onChange={(e) => onFilterChange({ fromDate: e.target.value || undefined, pageNumber: 1 })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      {/* 2. Date Range: FromDate */}
      {hasDateRange && (
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={t("FromDate")}
            value={filters.fromDate || ""}
            onChange={(e) => onFilterChange({ fromDate: e.target.value || undefined, pageNumber: 1 })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      {/* 3. Date Range: ToDate */}
      {hasDateRange && (
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            type="date"
            label={t("ToDate")}
            value={filters.toDate || ""}
            onChange={(e) => onFilterChange({ toDate: e.target.value || undefined, pageNumber: 1 })}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      )}

      {/* 4. Work Location */}
      {hasLocation && (
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("WorkLocations")}
            value={filters.workLocationId || "all"}
            onChange={(e) =>
              onFilterChange({
                workLocationId: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) => {
                if (!selected || selected === "all") return t("AllLocations");
                const found = locations.find((l) => l.id === selected);
                return found ? (isAr && found.nameAr ? found.nameAr : found.name) : selected;
              },
            }}
          >
            <MenuItem value="all">{t("AllLocations")}</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {isAr && loc.nameAr ? loc.nameAr : loc.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* 5. Work Shift */}
      {hasShift && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("WorkShift")}
            value={filters.workShiftId || "all"}
            onChange={(e) =>
              onFilterChange({
                workShiftId: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) => {
                if (!selected || selected === "all") return t("AllShifts");
                const found = shifts.find((s) => s.id === selected);
                return found ? (isAr && found.nameAr ? found.nameAr : found.name) : selected;
              },
            }}
          >
            <MenuItem value="all">{t("AllShifts")}</MenuItem>
            {shifts.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {isAr && s.nameAr ? s.nameAr : s.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* 6. Employee */}
      {hasEmployee && (
        <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("Employee")}
            value={filters.employeeId || "all"}
            onChange={(e) =>
              onFilterChange({
                employeeId: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) => {
                if (!selected || selected === "all") return t("AllEmployees");
                const found = employees.find((emp) => emp.id === selected);
                if (!found) return selected;
                const name = isAr && found.fullNameAr ? found.fullNameAr : found.fullName;
                return `${name} (${found.code})`;
              },
            }}
          >
            <MenuItem value="all">{t("AllEmployees")}</MenuItem>
            {employees.map((emp) => {
              const name = isAr && emp.fullNameAr ? emp.fullNameAr : emp.fullName;
              return (
                <MenuItem key={emp.id} value={emp.id}>
                  {name} ({emp.code})
                </MenuItem>
              );
            })}
          </TextField>
        </Grid>
      )}

      {/* 7. Department */}
      {hasDepartment && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("FilterByDepartment")}
            value={filters.department || "all"}
            onChange={(e) =>
              onFilterChange({
                department: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) =>
                !selected || selected === "all" ? t("AllDepartments") : selected,
            }}
          >
            <MenuItem value="all">{t("AllDepartments")}</MenuItem>
            {departments.map((dept) => (
              <MenuItem key={dept} value={dept}>
                {dept}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      )}

      {/* 8. Status */}
      {hasStatus && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("Status")}
            value={filters.status || "all"}
            onChange={(e) =>
              onFilterChange({
                status: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) =>
                !selected || selected === "all" ? t("AllStatuses") : t.has(selected) ? t(selected) : selected,
            }}
          >
            <MenuItem value="all">{t("AllStatuses")}</MenuItem>
            <MenuItem value="Completed">{t("Completed")}</MenuItem>
            <MenuItem value="Present">{t("Present")}</MenuItem>
            <MenuItem value="PendingReview">{t("PendingReview")}</MenuItem>
            <MenuItem value="Rejected">{t("Rejected")}</MenuItem>
            <MenuItem value="Submitted">{t("Submitted")}</MenuItem>
            <MenuItem value="Approved">{t("Approved")}</MenuItem>
          </TextField>
        </Grid>
      )}

      {/* 9. Point Category */}
      {hasPointCategory && (
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <TextField
            select
            fullWidth
            size="small"
            label={t("PointsCategory")}
            value={filters.pointCategory || "all"}
            onChange={(e) =>
              onFilterChange({
                pointCategory: e.target.value === "all" ? undefined : e.target.value,
                pageNumber: 1,
              })
            }
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) =>
                !selected || selected === "all"
                  ? t("All")
                  : selected === "Green"
                  ? t("GreenPoints")
                  : selected === "Red"
                  ? t("RedPoints")
                  : t("BlackPoints"),
            }}
          >
            <MenuItem value="all">{t("All")}</MenuItem>
            <MenuItem value="Green">{t("GreenPoints")}</MenuItem>
            <MenuItem value="Red">{t("RedPoints")}</MenuItem>
            <MenuItem value="Black">{t("BlackPoints")}</MenuItem>
          </TextField>
        </Grid>
      )}
    </Grid>
  );
};

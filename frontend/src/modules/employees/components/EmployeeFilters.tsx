"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import InputAdornment from "@mui/material/InputAdornment";
import { IconSearch, IconRotateDot } from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  department: string;
  onDepartmentChange: (value: string) => void;
  isActive: boolean | undefined;
  onIsActiveChange: (value: boolean | undefined) => void;
  departments: string[];
  onReset: () => void;
}

export const EmployeeFilters: React.FC<EmployeeFiltersProps> = ({
  search,
  onSearchChange,
  department,
  onDepartmentChange,
  isActive,
  onIsActiveChange,
  departments,
  onReset,
}) => {
  const t = useTranslations();

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: "12px",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
        <Grid container spacing={2} alignItems="center">
          {/* Search field */}
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t("SearchEmployees")}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Department Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("FilterByDepartment")}
              value={department}
              onChange={(e) => onDepartmentChange(e.target.value)}
            >
              <MenuItem value="">{t("AllDepartments")}</MenuItem>
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Active Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label={t("StatusFilter")}
              value={isActive === undefined ? "all" : isActive ? "active" : "inactive"}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "active") onIsActiveChange(true);
                else if (val === "inactive") onIsActiveChange(false);
                else onIsActiveChange(undefined);
              }}
            >
              <MenuItem value="all">{t("AllEmployees")}</MenuItem>
              <MenuItem value="active">{t("ActiveOnly")}</MenuItem>
              <MenuItem value="inactive">{t("InactiveOnly")}</MenuItem>
            </TextField>
          </Grid>

          {/* Reset Action */}
          <Grid size={{ xs: 12, sm: 6, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              color="inherit"
              startIcon={<IconRotateDot size={18} />}
              onClick={onReset}
              sx={{ height: 40 }}
            >
              {t("Reset")}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

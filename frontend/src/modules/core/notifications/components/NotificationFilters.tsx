'use client';

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import {
  IconSearch,
  IconChecks,
  IconRefresh,
  IconRotateDot,
} from "@tabler/icons-react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import { useTranslations } from "next-intl";

interface NotificationFiltersProps {
  unreadOnly: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  unreadCount: number;
  onSetUnreadOnly: (unreadOnly: boolean) => void;
  onSetCategory: (category: string | null) => void;
  onSetSearch: (query: string) => void;
  onMarkAllAsRead: () => Promise<void>;
  onRefresh: () => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

const CATEGORIES = [
  { value: "Attendance", labelKey: "CategoryAttendance" },
  { value: "Leaves", labelKey: "CategoryLeaves" },
  { value: "Points", labelKey: "CategoryPoints" },
  { value: "Schedules", labelKey: "CategorySchedules" },
  { value: "System", labelKey: "CategorySystem" },
  { value: "Info", labelKey: "CategoryInfo" },
  { value: "Success", labelKey: "CategorySuccess" },
  { value: "Warning", labelKey: "CategoryWarning" },
  { value: "Error", labelKey: "CategoryError" },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  unreadOnly,
  selectedCategory,
  searchQuery,
  unreadCount,
  onSetUnreadOnly,
  onSetCategory,
  onSetSearch,
  onMarkAllAsRead,
  onRefresh,
  onReset,
  hasActiveFilters = false,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSetSearch(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSetSearch]);

  return (
    <Box sx={{ mb: 3, width: "100%" }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        {/* Search & Category Filter (Start Side) */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder={t("SearchNotifications")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 260 },
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: "8px",
              },
            }}
          />

          <TextField
            size="small"
            select
            value={selectedCategory || "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              onSetCategory(val === "ALL" ? null : val);
            }}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) => {
                if (!selected || selected === "ALL") return t("CategoryAll");
                const found = CATEGORIES.find((c) => c.value === selected);
                return found ? t(found.labelKey) : selected;
              },
              MenuProps: {
                PaperProps: {
                  sx: {
                    borderRadius: "10px",
                    boxShadow: (th) => `0 4px 20px ${alpha(th.palette.common.black, 0.08)}`,
                    maxHeight: 360,
                    minWidth: 200,
                    p: 0.5,
                  },
                },
                anchorOrigin: { vertical: "bottom", horizontal: isRtl ? "right" : "left" },
                transformOrigin: { vertical: "top", horizontal: isRtl ? "right" : "left" },
              },
            }}
            sx={{
              minWidth: { xs: "100%", sm: 180 },
              "& .MuiOutlinedInput-root": {
                height: 40,
                borderRadius: "8px",
              },
            }}
          >
            <MenuItem
              value="ALL"
              sx={{
                borderRadius: "6px",
                mx: 0.5,
                my: 0.25,
                px: 1.5,
                py: 0.85,
                fontSize: "0.875rem",
                justifyContent: isRtl ? "flex-start" : "flex-start",
                textAlign: isRtl ? "right" : "left",
                fontWeight: !selectedCategory || selectedCategory === "ALL" ? 700 : 500,
              }}
            >
              {t("CategoryAll")}
            </MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem
                key={c.value}
                value={c.value}
                sx={{
                  borderRadius: "6px",
                  mx: 0.5,
                  my: 0.25,
                  px: 1.5,
                  py: 0.85,
                  fontSize: "0.875rem",
                  justifyContent: isRtl ? "flex-start" : "flex-start",
                  textAlign: isRtl ? "right" : "left",
                  fontWeight: selectedCategory === c.value ? 700 : 500,
                }}
              >
                {t(c.labelKey)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Read/Unread Toggle & Action Buttons (End Side) */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          {/* Modernize Styled Segmented Toggle */}
          <ToggleButtonGroup
            size="small"
            value={unreadOnly ? "UNREAD" : "ALL"}
            exclusive
            onChange={(_, val) => {
              if (val !== null) {
                onSetUnreadOnly(val === "UNREAD");
              }
            }}
            sx={{
              height: 40,
              p: "3px",
              borderRadius: "8px",
              bgcolor: (th) => alpha(th.palette.text.primary, 0.04),
              border: (th) => `1px solid ${th.palette.divider}`,
              gap: "4px",
              "& .MuiToggleButtonGroup-grouped": {
                border: "none !important",
                borderRadius: "6px !important",
                px: 2,
                py: 0,
                height: "100%",
                fontWeight: 600,
                fontSize: "0.85rem",
                transition: "all 0.2s ease-in-out",
                "&.Mui-selected": {
                  bgcolor: "primary.main !important",
                  color: "primary.contrastText !important",
                  boxShadow: (th) => `0 2px 6px ${alpha(th.palette.primary.main, 0.35)}`,
                },
                "&:not(.Mui-selected)": {
                  color: "text.secondary",
                  bgcolor: "transparent",
                  "&:hover": {
                    bgcolor: "action.hover",
                    color: "text.primary",
                  },
                },
              },
            }}
          >
            <ToggleButton value="ALL">
              {t("AllNotifications")}
            </ToggleButton>
            <ToggleButton value="UNREAD">
              <Stack direction="row" spacing={0.75} alignItems="center">
                <span>{t("UnreadOnly")}</span>
                {unreadCount > 0 && (
                  <Chip
                    label={unreadCount}
                    size="small"
                    sx={{
                      height: 20,
                      minWidth: 20,
                      px: 0.5,
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      bgcolor: unreadOnly ? "common.white" : "primary.main",
                      color: unreadOnly ? "primary.main" : "common.white",
                      pointerEvents: "none",
                    }}
                  />
                )}
              </Stack>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Mark All As Read Button (when unread items exist) */}
          {unreadCount > 0 && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<IconChecks size={18} />}
              onClick={onMarkAllAsRead}
              sx={{
                height: 40,
                borderRadius: "8px",
                fontWeight: 600,
                px: 2,
                gap: 1,
              }}
            >
              {t("MarkAllAsRead")}
            </Button>
          )}

          {/* Reset Filters Icon Button (ONLY rendered when filters are active) */}
          {hasActiveFilters && onReset && (
            <Tooltip title={t("ResetFilters")}>
              <IconButton
                onClick={onReset}
                size="small"
                aria-label={t("ResetFilters")}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "8px",
                  border: (th) => `1px solid ${th.palette.warning.main}`,
                  color: "warning.main",
                  bgcolor: (th) => alpha(th.palette.warning.main, 0.08),
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: (th) => alpha(th.palette.warning.main, 0.16),
                  },
                }}
              >
                <IconRotateDot size={18} />
              </IconButton>
            </Tooltip>
          )}

          {/* Refresh Action Button */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<IconRefresh size={18} />}
            onClick={onRefresh}
            sx={{
              height: 40,
              borderRadius: "8px",
              borderColor: "divider",
              fontWeight: 600,
              color: "text.secondary",
              px: 2,
              gap: 1,
              "&:hover": {
                borderColor: "primary.main",
                color: "primary.main",
                bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
              },
            }}
          >
            {t("Refresh")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

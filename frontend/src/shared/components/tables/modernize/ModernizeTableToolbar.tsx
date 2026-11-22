"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Tooltip from "@mui/material/Tooltip";
import Collapse from "@mui/material/Collapse";
import Badge from "@mui/material/Badge";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconSearch,
  IconFilter,
  IconX,
  IconSettings,
  IconDownload,
  IconTrash,
  IconRefresh,
  IconRotateDot,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { formatSelectedCount } from "@/shared/utils/i18nFormatters";

export interface ModernizeColumnConfig {
  id: string;
  label: string;
  visible: boolean;
}

export interface ModernizeTableToolbarProps {
  title: string;
  search?: string;
  onSearchChange?: (value: string) => void;
  showFilters?: boolean;
  onToggleFilters?: () => void;
  filterContent?: React.ReactNode;
  columns?: ModernizeColumnConfig[];
  onToggleColumn?: (columnId: string) => void;
  onExportCsv?: () => void;
  selectedCount?: number;
  onBulkAction?: () => void;
  bulkActionTooltip?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  extraActions?: React.ReactNode;
  action?: React.ReactNode;
  onResetFilters?: () => void;
  hasActiveFilters?: boolean;
}

export const ModernizeTableToolbar: React.FC<ModernizeTableToolbarProps> = ({
  title,
  search = "",
  onSearchChange,
  showFilters = false,
  onToggleFilters,
  filterContent,
  columns = [],
  onToggleColumn,
  onExportCsv,
  selectedCount = 0,
  onBulkAction,
  bulkActionTooltip,
  onRefresh,
  isRefreshing = false,
  extraActions,
  action,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [showSearch, setShowSearch] = useState(Boolean(search));
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);

  React.useEffect(() => {
    if (search) {
      setShowSearch(true);
    }
  }, [search]);

  const handleReset = () => {
    onSearchChange?.("");
    setShowSearch(false);
    onResetFilters?.();
  };

  const handleOpenColumnMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setColumnMenuAnchorEl(e.currentTarget);
  };

  const handleCloseColumnMenu = () => {
    setColumnMenuAnchorEl(null);
  };

  const toolbarButtonSx = {
    width: 38,
    height: 38,
    borderRadius: "8px",
    border: `1px solid ${theme.palette.divider}`,
    color: "text.secondary",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "primary.main",
      color: "primary.main",
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        width="100%"
        flexWrap="wrap"
        gap={1.5}
      >
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        <Box display="flex" alignItems="center" gap={1.5} flexWrap="wrap">
          {/* 1. Search Toggle / Input — ALWAYS FIRST (When onSearchChange provided) */}
          {onSearchChange &&
            (!showSearch ? (
              <Tooltip title={t.has("Search") ? t("Search") : "Search"}>
                <IconButton
                  onClick={() => setShowSearch(true)}
                  size="small"
                  aria-label={t.has("Search") ? t("Search") : "Search"}
                  sx={toolbarButtonSx}
                >
                  <IconSearch size={18} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "primary.main",
                  px: 1.25,
                  py: 0.25,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderRadius: "8px",
                }}
              >
                <InputBase
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  placeholder={`${t.has("Search") ? t("Search") : "Search"}...`}
                  sx={{ fontSize: 14, minWidth: 160 }}
                />
                <IconButton
                  size="small"
                  aria-label={t.has("Close") ? t("Close") : "Close"}
                  onClick={() => {
                    onSearchChange("");
                    setShowSearch(false);
                  }}
                >
                  <IconX size={15} />
                </IconButton>
              </Box>
            ))}

          {/* 2. Filter toggle button */}
          {filterContent && (
            <Tooltip
              title={
                showFilters
                  ? t.has("HideFilters")
                    ? t("HideFilters")
                    : "Hide Filters"
                  : t.has("Filter")
                  ? t("Filter")
                  : "Filter"
              }
            >
              <Badge
                color="primary"
                variant="dot"
                invisible={!hasActiveFilters}
                overlap="circular"
                anchorOrigin={{ vertical: "top", horizontal: isRtl ? "left" : "right" }}
                sx={{
                  "& .MuiBadge-badge": {
                    right: isRtl ? "auto" : 4,
                    left: isRtl ? 4 : "auto",
                    top: 4,
                    width: 8,
                    height: 8,
                  },
                }}
              >
                <IconButton
                  onClick={onToggleFilters}
                  size="small"
                  aria-label={t.has("Filter") ? t("Filter") : "Filter"}
                  sx={{
                    ...toolbarButtonSx,
                    ...(showFilters && {
                      borderColor: "primary.main",
                      color: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                    }),
                  }}
                >
                  {showFilters ? <IconX size={18} /> : <IconFilter size={18} />}
                </IconButton>
              </Badge>
            </Tooltip>
          )}

          {/* 3. Reset Filters Icon Button — In the icon group */}
          {onResetFilters && (
            <Tooltip
              title={
                hasActiveFilters
                  ? t.has("ResetFilters")
                    ? t("ResetFilters")
                    : "Reset Filters"
                  : t.has("NoActiveFilters")
                  ? t("NoActiveFilters")
                  : isRtl
                  ? "لا توجد فلاتر نشطة"
                  : "No active filters"
              }
            >
              <Box component="span" sx={{ display: "inline-flex" }}>
                <IconButton
                  onClick={handleReset}
                  disabled={hasActiveFilters !== undefined && !hasActiveFilters}
                  size="small"
                  aria-label={t.has("ResetFilters") ? t("ResetFilters") : "Reset Filters"}
                  sx={{
                    ...toolbarButtonSx,
                    ...(hasActiveFilters && {
                      borderColor: "warning.main",
                      color: "warning.main",
                      bgcolor: alpha(theme.palette.warning.main, 0.08),
                    }),
                    "&.Mui-disabled": {
                      opacity: 0.4,
                    },
                  }}
                >
                  <IconRotateDot size={18} />
                </IconButton>
              </Box>
            </Tooltip>
          )}

          {/* 4. Refresh Toggle (Icon Only) */}
          {onRefresh && (
            <Tooltip title={t.has("Refresh") ? t("Refresh") : "Refresh"}>
              <Box component="span" sx={{ display: "inline-flex" }}>
                <IconButton
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  size="small"
                  aria-label={t.has("Refresh") ? t("Refresh") : "Refresh"}
                  sx={{
                    ...toolbarButtonSx,
                    "&.Mui-disabled": {
                      opacity: 0.6,
                    },
                  }}
                >
                  <IconRefresh
                    size={18}
                    style={{
                      transition: "transform 0.5s ease",
                      animation: isRefreshing ? "spin 1s linear infinite" : "none",
                    }}
                  />
                </IconButton>
              </Box>
            </Tooltip>
          )}

          {/* 5. Column visibility toggle */}
          {columns.length > 0 && onToggleColumn && (
            <Tooltip title={t.has("ToggleColumns") ? t("ToggleColumns") : "Toggle Columns"}>
              <IconButton
                onClick={handleOpenColumnMenu}
                size="small"
                aria-label={t.has("ToggleColumns") ? t("ToggleColumns") : "Toggle Columns"}
                sx={toolbarButtonSx}
              >
                <IconSettings size={18} />
              </IconButton>
            </Tooltip>
          )}

          {/* 6. Download/Export CSV */}
          {onExportCsv && (
            <Tooltip title={t.has("ExportCsv") ? t("ExportCsv") : "Export CSV"}>
              <IconButton
                onClick={onExportCsv}
                size="small"
                aria-label={t.has("ExportCsv") ? t("ExportCsv") : "Export CSV"}
                sx={toolbarButtonSx}
              >
                <IconDownload size={18} />
              </IconButton>
            </Tooltip>
          )}

          {/* 7. Bulk Selection Delete Action */}
          {onBulkAction && (
            <Tooltip
              title={
                selectedCount > 0
                  ? bulkActionTooltip ||
                    `${t.has("DeleteSelected") ? t("DeleteSelected") : "Delete Selected"} (${formatSelectedCount(
                      selectedCount,
                      isRtl
                    )})`
                  : t.has("NoSelection")
                  ? t("NoSelection")
                  : isRtl
                  ? "حدد عناصر للحذف"
                  : "Select items to delete"
              }
            >
              <Box component="span" sx={{ display: "inline-flex" }}>
                <Badge badgeContent={selectedCount} color="error" max={999}>
                  <IconButton
                    color="error"
                    size="small"
                    disabled={selectedCount === 0}
                    onClick={onBulkAction}
                    aria-label={`${t.has("DeleteSelected") ? t("DeleteSelected") : "Delete Selected"} (${selectedCount})`}
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: "8px",
                      border: `1px solid ${
                        selectedCount > 0
                          ? alpha(theme.palette.error.main, 0.4)
                          : theme.palette.divider
                      }`,
                      color: selectedCount > 0 ? "error.main" : "text.disabled",
                      bgcolor:
                        selectedCount > 0
                          ? alpha(theme.palette.error.main, 0.08)
                          : "transparent",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "error.main",
                        bgcolor: alpha(theme.palette.error.main, 0.16),
                      },
                      "&.Mui-disabled": {
                        opacity: 0.5,
                      },
                    }}
                  >
                    <IconTrash size={18} />
                  </IconButton>
                </Badge>
              </Box>
            </Tooltip>
          )}

          {/* 8. Extra Actions */}
          {extraActions || action}
        </Box>
      </Box>

      {/* Collapsible Filter Section */}
      {filterContent && (
        <Collapse in={showFilters}>
          <Box sx={{ mt: 2.5, pt: 1 }}>{filterContent}</Box>
        </Collapse>
      )}

      {/* Column Visibility Menu — Direction-aware Anchor */}
      {columns.length > 0 && onToggleColumn && (
        <Menu
          anchorEl={columnMenuAnchorEl}
          open={Boolean(columnMenuAnchorEl)}
          onClose={handleCloseColumnMenu}
          anchorOrigin={{ vertical: "bottom", horizontal: isRtl ? "left" : "right" }}
          transformOrigin={{ vertical: "top", horizontal: isRtl ? "left" : "right" }}
          PaperProps={{
            sx: {
              borderRadius: "10px",
              boxShadow: (th) =>
                th.palette.mode === "dark"
                  ? "0 12px 28px rgba(0,0,0,0.6)"
                  : "0 12px 28px rgba(15,23,42,0.12)",
              border: (th) => `1px solid ${th.palette.divider}`,
              minWidth: 210,
              p: 1.5,
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              gutterBottom
              sx={{
                fontSize: 12.5,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "text.secondary",
                px: 1,
                mb: 1,
              }}
            >
              {t.has("ToggleColumns") ? t("ToggleColumns") : "Toggle Columns"}
            </Typography>
            {columns.map((col) => (
              <FormControlLabel
                key={col.id}
                control={
                  <Checkbox
                    checked={col.visible}
                    onChange={() => onToggleColumn(col.id)}
                    size="small"
                  />
                }
                label={
                  <Typography sx={{ fontSize: 13.5, fontWeight: 500 }}>
                    {col.label}
                  </Typography>
                }
                sx={{
                  mx: 0,
                  px: 1,
                  py: 0.25,
                  borderRadius: "6px",
                  "&:hover": {
                    bgcolor: (th) => alpha(th.palette.primary.main, 0.06),
                  },
                }}
              />
            ))}
          </Box>
        </Menu>
      )}
    </Box>
  );
};

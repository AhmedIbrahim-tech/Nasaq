"use client";

import React, { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import { useTheme, alpha } from "@mui/material/styles";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  IconArrowUp,
  IconArrowDown,
  IconArrowsSort,
  IconInbox,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import CustomCheckbox from "@/shared/components/forms/theme-elements/CustomCheckbox";

export interface ModernizeColumnDef<T> {
  id: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  isSortable?: boolean;
  sortKey?: string;
  align?: "left" | "right" | "center";
  width?: string | number;
  visible?: boolean;
}

export interface ModernizeRowAction<T> {
  label: string;
  icon: React.ReactNode;
  onClick: (item: T) => void;
  show?: (item: T) => boolean;
  disabled?: (item: T) => boolean;
  isDanger?: boolean;
}

export interface ModernizeDataTableProps<T> {
  data: T[];
  columns: ModernizeColumnDef<T>[];
  loading?: boolean;
  totalCount: number;
  page: number; // 1-indexed (NASAQ standard)
  pageSize: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  sortColumn?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (column: string, order: "asc" | "desc") => void;
  enableSelection?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (selectedIds: string[]) => void;
  getRowId?: (item: T) => string;
  renderExpandedRow?: (item: T) => React.ReactNode;
  actions?: ModernizeRowAction<T>[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
}

export function ModernizeDataTable<T>({
  data = [],
  columns,
  loading = false,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  sortColumn,
  sortOrder,
  onSortChange,
  enableSelection = false,
  selectedIds = [],
  onSelectionChange,
  getRowId = (item: any) => item.id || String(item),
  renderExpandedRow,
  actions = [],
  emptyMessage,
  emptyIcon,
}: ModernizeDataTableProps<T>) {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const isDark = theme.palette.mode === "dark";

  const safeData = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  // Expanded row state (set of row IDs)
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  // Row action menu state
  const [menuAnchor, setMenuAnchor] = useState<null | {
    el: HTMLElement;
    item: T;
  }>(null);

  const toggleRowExpansion = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectionChange) return;
    if (e.target.checked) {
      const allIds = safeData.map((item) => getRowId(item));
      onSelectionChange(Array.from(new Set([...selectedIds, ...allIds])));
    } else {
      const currentIds = new Set(safeData.map((item) => getRowId(item)));
      onSelectionChange(selectedIds.filter((id) => !currentIds.has(id)));
    }
  };

  const handleSelectRow = (rowId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== rowId));
    }
  };

  const handleSortClick = (col: ModernizeColumnDef<T>) => {
    if (!col.isSortable || !onSortChange) return;
    const key = col.sortKey || col.id;
    if (sortColumn === key) {
      onSortChange(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, "asc");
    }
  };

  const visibleColumns = columns.filter((c) => c.visible !== false);
  const isAllSelected =
    safeData.length > 0 && safeData.every((item) => selectedIds.includes(getRowId(item)));
  const hasActions = actions.length > 0;
  const hasExpansion = Boolean(renderExpandedRow);

  const totalColSpan =
    visibleColumns.length +
    (enableSelection ? 1 : 0) +
    (hasExpansion ? 1 : 0) +
    (hasActions ? 1 : 0);

  return (
    <Box sx={{ position: "relative" }}>
      <TableContainer
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          overflowX: "auto",
          position: "relative",
        }}
      >
        {loading && data.length > 0 && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 3,
              zIndex: 2,
            }}
          />
        )}
        <Table>
          <TableHead>
            <TableRow
              sx={{
                height: 52,
                bgcolor: isDark
                  ? alpha(theme.palette.background.default, 0.6)
                  : alpha(theme.palette.divider, 0.5),
              }}
            >
              {/* Checkbox column */}
              {enableSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    py: 1.85,
                    px: 1.75,
                    width: 52,
                    textAlign: "center",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CustomCheckbox
                    checked={isAllSelected}
                    indeterminate={
                      selectedIds.length > 0 &&
                      !isAllSelected &&
                      safeData.some((item) => selectedIds.includes(getRowId(item)))
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}

              {/* Expansion column */}
              {hasExpansion && (
                <TableCell
                  sx={{
                    py: 1.85,
                    px: 1.25,
                    width: 48,
                    textAlign: "center",
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                />
              )}

              {/* Data column headers */}
              {visibleColumns.map((col) => {
                const isSortable = Boolean(col.isSortable);
                const colKey = col.sortKey || col.id;
                const isSorted = sortColumn === colKey;

                return (
                  <TableCell
                    key={col.id}
                    align={col.align || (isRtl ? "right" : "left")}
                    onClick={() => handleSortClick(col)}
                    sx={{
                      py: 1.85,
                      px: 2.25,
                      cursor: isSortable ? "pointer" : "default",
                      fontWeight: 700,
                      fontSize: "13.5px",
                      whiteSpace: "nowrap",
                      userSelect: "none",
                      width: col.width,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent={
                        col.align === "right"
                          ? isRtl ? "flex-start" : "flex-end"
                          : col.align === "center"
                          ? "center"
                          : isRtl ? "flex-start" : "flex-start"
                      }
                      gap={0.75}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        sx={{
                          fontSize: "13.5px",
                          letterSpacing: isRtl ? 0 : "0.02em",
                          color: "text.primary",
                        }}
                      >
                        {col.header}
                      </Typography>

                      {isSortable && (
                        <Box
                          component="span"
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            color: isSorted ? "primary.main" : "text.secondary",
                          }}
                        >
                          {isSorted ? (
                            sortOrder === "asc" ? (
                              <IconArrowUp size={15} />
                            ) : (
                              <IconArrowDown size={15} />
                            )
                          ) : (
                            <IconArrowsSort size={13} style={{ opacity: 0.6 }} />
                          )}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                );
              })}

              {/* Actions column */}
              {hasActions && (
                <TableCell
                  align={isRtl ? "left" : "right"}
                  sx={{
                    py: 1.85,
                    px: 2.25,
                    fontWeight: 700,
                    fontSize: "13.5px",
                    width: 72,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ fontSize: "13.5px", textAlign: isRtl ? "left" : "right" }}
                  >
                    {t.has("Actions") ? t("Actions") : "Actions"}
                  </Typography>
                </TableCell>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && data.length === 0 ? (
              // Initial loading skeletons only when no data has been loaded yet
              [...Array(pageSize > 10 ? 10 : pageSize || 5)].map((_, idx) => (
                <TableRow key={idx} sx={{ height: 62 }}>
                  <TableCell colSpan={totalColSpan} sx={{ py: 2.1, px: 2.25 }}>
                    <Skeleton height={38} sx={{ borderRadius: "8px" }} />
                  </TableCell>
                </TableRow>
              ))
            ) : safeData.length === 0 ? (
              // Empty state
              <TableRow>
                <TableCell colSpan={totalColSpan} sx={{ py: 9, textAlign: "center" }}>
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    color="text.secondary"
                  >
                    {emptyIcon || <IconInbox size={48} stroke={1.5} style={{ opacity: 0.4 }} />}
                    <Typography variant="h6" color="text.secondary" sx={{ mt: 1.5 }}>
                      {emptyMessage || (t.has("NoRecordsFound") ? t("NoRecordsFound") : "No records found.")}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              // Data rows (Comfortable density: height ~62px, vertical-align middle, clean padding)
              safeData.map((item, rowIndex) => {
                const rowId = getRowId(item);
                const isSelected = selectedIds.includes(rowId);
                const isExpanded = expandedRowIds.has(rowId);

                return (
                  <React.Fragment key={rowId}>
                    <TableRow
                      hover
                      selected={isSelected}
                      sx={{
                        height: 62,
                        transition: "background-color 0.15s ease",
                        ...(isSelected && {
                          bgcolor: isDark
                            ? `${alpha(theme.palette.primary.main, 0.12)} !important`
                            : `${alpha(theme.palette.primary.main, 0.06)} !important`,
                          borderInlineStart: `3px solid ${theme.palette.primary.main}`,
                        }),
                      }}
                    >
                      {/* Checkbox */}
                      {enableSelection && (
                        <TableCell padding="checkbox" sx={{ py: 2.1, px: 1.75, textAlign: "center" }}>
                          <CustomCheckbox
                            checked={isSelected}
                            onChange={(e) => handleSelectRow(rowId, e.target.checked)}
                          />
                        </TableCell>
                      )}

                      {/* Expand/Collapse Icon */}
                      {hasExpansion && (
                        <TableCell sx={{ py: 2.1, px: 1.25, textAlign: "center" }}>
                          <IconButton
                            size="small"
                            onClick={() => toggleRowExpansion(rowId)}
                            title={
                              isExpanded
                                ? t.has("Collapse")
                                  ? t("Collapse")
                                  : "Collapse"
                                : t.has("Expand")
                                ? t("Expand")
                                : "Expand"
                            }
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "8px",
                              color: isExpanded ? "primary.main" : "text.secondary",
                              bgcolor: isExpanded
                                ? alpha(theme.palette.primary.main, 0.08)
                                : "transparent",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.12),
                              },
                            }}
                          >
                            {isExpanded ? (
                              <KeyboardArrowUpIcon fontSize="small" />
                            ) : (
                              <KeyboardArrowDown fontSize="small" />
                            )}
                          </IconButton>
                        </TableCell>
                      )}

                      {/* Visible Cells */}
                      {visibleColumns.map((col) => (
                        <TableCell
                          key={col.id}
                          align={col.align || (isRtl ? "right" : "left")}
                          sx={{
                            py: 2.1,
                            px: 2.25,
                            fontSize: "14px",
                            fontWeight: 500,
                            verticalAlign: "middle",
                            lineHeight: 1.5,
                          }}
                        >
                          {col.cell(item, rowIndex)}
                        </TableCell>
                      ))}

                      {/* Action Menu button */}
                      {hasActions && (
                        <TableCell align={isRtl ? "left" : "right"} sx={{ py: 2.1, px: 2.25, whiteSpace: "nowrap" }}>
                          <IconButton
                            size="small"
                            sx={{
                              width: 34,
                              height: 34,
                              borderRadius: "8px",
                              color: "text.secondary",
                              "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                color: "primary.main",
                              },
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuAnchor({ el: e.currentTarget, item });
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>

                    {/* Expandable Row Content — Clean boundaries and generous padding */}
                    {hasExpansion && isExpanded && renderExpandedRow && (
                      <TableRow
                        sx={{
                          bgcolor: isDark
                            ? alpha(theme.palette.background.default, 0.7)
                            : alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <TableCell colSpan={totalColSpan} sx={{ p: 0, borderBottom: `1px solid ${theme.palette.divider}` }}>
                          <Box sx={{ p: { xs: 2, sm: 2.75 } }}>{renderExpandedRow(item)}</Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modernize Table Pagination — Bilingual RTL/LTR Parity & Bidirectional Text Isolation */}
      <TablePagination
        component="div"
        count={totalCount}
        page={Math.max(0, page - 1)} // MUI TablePagination is 0-indexed
        rowsPerPage={pageSize}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => {
          if (onPageSizeChange) {
            onPageSizeChange(parseInt(e.target.value, 10));
          }
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage={
          t.has("RowsPerPage")
            ? t("RowsPerPage")
            : isRtl
            ? "الصفوف لكل صفحة:"
            : "Rows per page:"
        }
        labelDisplayedRows={({ from, to, count }) => {
          if (isRtl) {
            return (
              <span style={{ direction: "rtl", unicodeBidi: "isolate" }}>
                <span style={{ direction: "ltr", display: "inline-block" }}>
                  {from}–{to}
                </span>
                {" "}من{" "}
                <span style={{ direction: "ltr", display: "inline-block" }}>
                  {count !== -1 ? count : `أكثر من ${to}`}
                </span>
              </span>
            );
          }
          return `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
        }}
        getItemAriaLabel={(type) => {
          if (type === "first") return isRtl ? "الصفحة الأولى" : "Go to first page";
          if (type === "last") return isRtl ? "الصفحة الأخيرة" : "Go to last page";
          if (type === "next") return isRtl ? "الصفحة التالية" : "Go to next page";
          if (type === "previous") return isRtl ? "الصفحة السابقة" : "Go to previous page";
          return "";
        }}
        sx={{
          borderTop: `1px solid ${theme.palette.divider}`,
          minHeight: 52,
          px: 2,
          "& .MuiTablePagination-toolbar": {
            minHeight: 52,
            px: { xs: 1, sm: 2 },
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.85rem",
            fontWeight: 500,
          },
        }}
      />

      {/* Row Actions Menu — Direction-aware Anchor */}
      {hasActions && (
        <Menu
          anchorEl={menuAnchor?.el}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: isRtl ? "left" : "right" }}
          transformOrigin={{ vertical: "top", horizontal: isRtl ? "left" : "right" }}
          PaperProps={{
            sx: {
              borderRadius: "10px",
              boxShadow: isDark
                ? "0 12px 28px rgba(0,0,0,0.6)"
                : "0 12px 28px rgba(15,23,42,0.12)",
              border: `1px solid ${theme.palette.divider}`,
              minWidth: 160,
              py: 0.5,
            },
          }}
        >
          {actions
            .filter((act) => !menuAnchor || !act.show || act.show(menuAnchor.item))
            .map((act, idx) => (
              <MenuItem
                key={idx}
                disabled={Boolean(menuAnchor && act.disabled && act.disabled(menuAnchor.item))}
                onClick={() => {
                  if (menuAnchor) {
                    act.onClick(menuAnchor.item);
                  }
                  setMenuAnchor(null);
                }}
                sx={{
                  py: 1,
                  px: 2,
                  fontSize: "13.5px",
                  fontWeight: 500,
                  color: (act.isDanger || act.label === t("Delete")) ? theme.palette.error.main : "text.primary",
                  "&:hover": {
                    bgcolor: (act.isDanger || act.label === t("Delete"))
                      ? alpha(theme.palette.error.main, 0.08)
                      : alpha(theme.palette.primary.main, 0.08),
                    color: (act.isDanger || act.label === t("Delete"))
                      ? theme.palette.error.dark
                      : "primary.main",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 30,
                    color: (act.isDanger || act.label === t("Delete")) ? theme.palette.error.main : "inherit",
                  }}
                >
                  {act.icon}
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    fontSize: "13.5px",
                    fontWeight: 500,
                    color: (act.isDanger || act.label === t("Delete")) ? theme.palette.error.main : "inherit",
                  }}
                >
                  {act.label}
                </ListItemText>
              </MenuItem>
            ))}
        </Menu>
      )}
    </Box>
  );
}

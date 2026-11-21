'use client';

import React, { useState, useEffect, useMemo, useContext } from 'react';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { CustomizerContext } from '@/theme/customizerContext';
import Table from '@mui/material/Table';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslations, useLocale } from 'next-intl';
import { IconTrash, IconX, IconAlertTriangle } from '@tabler/icons-react';
import { DataTableProps, TableColumn } from '@/shared/components/tables/types';
import { DataTableToolbar } from '@/shared/components/tables/DataTableToolbar';
import { DataTableHead } from '@/shared/components/tables/DataTableHead';
import { DataTableBody } from '@/shared/components/tables/DataTableBody';
import { DataTableMobileCards } from '@/shared/components/tables/DataTableMobileCards';
import { DataTableEmptyState } from '@/shared/components/tables/DataTableStates';
import { DataTableKpiCards } from '@/shared/components/tables/DataTableKpiCards';
import { DataTableTabs } from '@/shared/components/tables/DataTableTabs';

export function DataTable<T>({
  title,
  kpiCards,
  kpiTitle,
  kpiLoading = false,
  headerSlot,
  tabs,
  primaryAction,
  data,
  columns,
  getRowId,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage,
  toolbar,
  selection,
  sorting,
  pagination,
  rowActions,
  inlineEditing,
  renderExpandedRow,
  onRowDoubleClick,
  dense = false,
  elevation,
  variant,
  sx,
}: DataTableProps<T>) {
  const t = useTranslations();
  const locale = useLocale();
  const theme = useTheme();
  const isRtl = locale === 'ar' || theme.direction === 'rtl';
  const { isCardShadow } = useContext(CustomizerContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDark = theme.palette.mode === 'dark';
  const resolveRowId = useMemo(() => {
    return (row: T, idx: number): string | number => {
      if (getRowId) {
        const id = getRowId(row, idx);
        if (id !== undefined && id !== null && id !== '' && id !== '-' && id !== '—') {
          return id;
        }
        return `row-${idx}`;
      }
      if (selection?.getRowId) return selection.getRowId(row, idx);
      const rawId = (row as any).id ?? (row as any)._id;
      if (rawId !== undefined && rawId !== null && rawId !== '' && rawId !== '-' && rawId !== '—') {
        return rawId;
      }
      return idx;
    };
  }, [getRowId, selection?.getRowId]);
  // Column Visibility State
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(() =>
    columns.filter((c) => c.defaultVisible !== false).map((c) => c.id)
  );

  // Sync visibleColumnIds whenever columns change dynamically (e.g. dynamic reports or changing datasets)
  useEffect(() => {
    setVisibleColumnIds((prev) => {
      const defaultIds = columns.filter((c) => c.defaultVisible !== false).map((c) => c.id);
      if (prev.length === 0) {
        return defaultIds;
      }
      const currentIdsSet = new Set(columns.map((c) => c.id));
      const validPrev = prev.filter((id) => currentIdsSet.has(id));
      if (validPrev.length === 0) {
        return defaultIds;
      }
      return validPrev;
    });
  }, [columns]);

  // Safe effective visible column IDs: guaranteed to be non-empty whenever columns has items
  const effectiveVisibleColumnIds = useMemo<string[]>(() => {
    if (columns.length === 0) return [];
    if (visibleColumnIds.length === 0) {
      return columns.filter((c) => c.defaultVisible !== false).map((c) => c.id);
    }
    const currentIdsSet = new Set(columns.map((c) => c.id));
    const valid = visibleColumnIds.filter((id) => currentIdsSet.has(id));
    if (valid.length === 0) {
      return columns.filter((c) => c.defaultVisible !== false).map((c) => c.id);
    }
    return valid;
  }, [columns, visibleColumnIds]);

  // Filter Toggle State
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(Boolean(toolbar?.isFilterOpen));

  const toggleColumnVisibility = (columnId: string) => {
    setVisibleColumnIds((prev) => {
      const currentList = prev.length > 0 ? prev : effectiveVisibleColumnIds;
      return currentList.includes(columnId)
        ? currentList.filter((id) => id !== columnId)
        : [...currentList, columnId];
    });
  };

  const handleToggleFilter = () => {
    if (toolbar?.onToggleFilter) {
      toolbar.onToggleFilter();
    } else {
      setIsFilterOpen((prev) => !prev);
    }
  };

  // Filter visible columns for head, body, and mobile cards
  const activeColumns = useMemo<TableColumn<T>[]>(() => {
    return columns.filter((col) => effectiveVisibleColumnIds.includes(col.id));
  }, [columns, effectiveVisibleColumnIds]);

  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // Master selection helpers
  const selectableData = useMemo(() => {
    if (!selection) return [];
    if (selection.isSelectable) {
      return data.filter((row) => selection.isSelectable!(row));
    }
    return data;
  }, [data, selection]);

  const isAllSelected = useMemo(() => {
    if (!selection || selectableData.length === 0) return false;
    return selectableData.every((row, i) => selection.selectedIds.includes(resolveRowId(row, i)));
  }, [selectableData, selection, resolveRowId]);

  const isIndeterminate = useMemo(() => {
    if (!selection || selectableData.length === 0) return false;
    const selectedInPage = selectableData.filter((row, i) =>
      selection.selectedIds.includes(resolveRowId(row, i))
    );
    return selectedInPage.length > 0 && selectedInPage.length < selectableData.length;
  }, [selectableData, selection, resolveRowId]);

  const handleToggleSelectAll = () => {
    if (!selection) return;
    const pageSelectableIds = selectableData.map((r, i) => resolveRowId(r, i));
    if (isAllSelected) {
      const remainingIds = selection.selectedIds.filter((id) => !pageSelectableIds.includes(id));
      const remainingRows = data.filter((r, i) => remainingIds.includes(resolveRowId(r, i)));
      selection.onSelectionChange(remainingIds, remainingRows);
    } else {
      const newSelectedIds = Array.from(new Set([...selection.selectedIds, ...pageSelectableIds]));
      const newSelectedRows = data.filter((r, i) => newSelectedIds.includes(resolveRowId(r, i)));
      selection.onSelectionChange(newSelectedIds, newSelectedRows);
    }
  };

  const handleClearSelection = () => {
    if (!selection) return;
    selection.onSelectionChange([], []);
  };

  const handleOpenBulkDelete = () => {
    if (!selection?.onBulkDelete) return;
    if (selection.confirmDelete === false) {
      selection.onBulkDelete(selection.selectedIds);
      return;
    }
    setBulkDeleteError(null);
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (!selection?.onBulkDelete) return;
    setBulkDeleteLoading(true);
    setBulkDeleteError(null);
    try {
      await selection.onBulkDelete(selection.selectedIds);
      setBulkDeleteDialogOpen(false);
      selection.onSelectionChange([], []);
    } catch (err: any) {
      setBulkDeleteError(err?.message || (typeof err === 'string' ? err : 'Failed to delete selected records.'));
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  return (
    <Card
      elevation={elevation ?? (isCardShadow ? 9 : 0)}
      variant={variant ?? (!isCardShadow ? 'outlined' : undefined)}
      sx={{
        borderRadius: '12px',
        padding: '0 !important',
        border: !isCardShadow
          ? `1px solid ${theme.palette.divider}`
          : isDark
          ? `1px solid ${theme.palette.divider}`
          : '1px solid rgba(0, 0, 0, 0.05)',
        backgroundColor: 'background.paper',
        boxShadow: isCardShadow ? theme.shadows[9] : 'none',
        overflow: 'hidden',
        position: 'relative',
        ...sx,
      }}
    >
      <Stack spacing={{ xs: 2, sm: 2.25 }} p={{ xs: 2, sm: 2.5 }}>
        {/* KPI / Progress Cards Row (Orders History Style) */}
        {kpiCards && kpiCards.length > 0 && (
          <Box width="100%">
            <DataTableKpiCards
              title={kpiTitle}
              action={primaryAction}
              cards={kpiCards}
              isLoading={kpiLoading}
            />
          </Box>
        )}

        {/* Standalone Card Heading with Primary Action when KPI cards are not present */}
        {(!kpiCards || kpiCards.length === 0) && (title || (!tabs && primaryAction)) && (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1.5}
            width="100%"
          >
            {title ? (
              <Box sx={{ minWidth: 0 }}>
                {typeof title === 'string' ? (
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{
                      fontSize: '1.125rem',
                      color: 'text.primary',
                      letterSpacing: '-0.2px',
                    }}
                  >
                    {title}
                  </Typography>
                ) : (
                  title
                )}
              </Box>
            ) : (
              <Box />
            )}
            {!tabs && primaryAction && (
              <Box
                sx={{
                  marginInlineStart: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px !important',
                  flexWrap: 'wrap',
                  '& > :not(style)': { m: '0 !important' },
                }}
              >
                {primaryAction}
              </Box>
            )}
          </Box>
        )}

        {/* Top Header Slot (Optional additional header content) */}
        {headerSlot && <Box width="100%">{headerSlot}</Box>}

        {/* Table Toolbar (Icon-only compact toolbar) */}
        {toolbar && (
          <DataTableToolbar
            title={toolbar?.title}
            columns={columns}
            visibleColumnIds={effectiveVisibleColumnIds}
            onToggleColumnVisibility={toggleColumnVisibility}
            showSearch={toolbar?.showSearch}
            searchPlaceholder={toolbar?.searchPlaceholder}
            searchValue={toolbar?.searchValue}
            onSearchChange={toolbar?.onSearchChange}
            showFilterToggle={toolbar?.showFilterToggle}
            isFilterOpen={toolbar?.isFilterOpen !== undefined ? toolbar.isFilterOpen : isFilterOpen}
            onToggleFilter={handleToggleFilter}
            hasActiveFilters={toolbar?.hasActiveFilters}
            onResetFilters={toolbar?.onResetFilters}
            activeFiltersCount={toolbar?.activeFiltersCount}
            filtersContent={toolbar?.filtersContent}
            showColumnVisibility={toolbar?.showColumnVisibility}
            onDownloadCsv={toolbar?.onDownloadCsv}
            selectedCount={selection?.selectedIds.length || 0}
            onBulkDelete={selection?.onBulkDelete ? handleOpenBulkDelete : undefined}
            onClearSelection={selection ? handleClearSelection : undefined}
            actions={toolbar?.actions}
          />
        )}

        {/* Horizontal Role / Category Filter Tabs */}
        {tabs && (
          <Box width="100%">
            <DataTableTabs {...tabs} action={tabs.action || primaryAction} />
          </Box>
        )}

        {/* Empty State (Unified responsive container) */}
        {!isLoading && !error && data.length === 0 ? (
          <Box
            sx={{
              py: 4,
              px: 2,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {emptyMessage || (
              <DataTableEmptyState
                message={t.has('NoRecordsFound') ? t('NoRecordsFound') : 'No records found'}
              />
            )}
          </Box>
        ) : isMobile ? (
          /* Mobile Adaptive Cards View (phone screens < 600px) */
          <Box sx={{ width: '100%' }}>
            <DataTableMobileCards
              data={data}
              columns={activeColumns}
              getRowId={resolveRowId}
              isLoading={isLoading}
              error={error}
              onRetry={onRetry}
              emptyMessage={emptyMessage}
              selection={selection}
              rowActions={rowActions}
              inlineEditing={inlineEditing}
              renderExpandedRow={renderExpandedRow}
            />
          </Box>
        ) : (
          /* Desktop / Tablet Full Data Table (tablet and up >= 600px) */
          <TableContainer
            className="responsive-table-container"
            sx={{
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.12)'
                  : 'rgba(0, 0, 0, 0.08)',
              borderRadius: '8px',
              overflowX: 'auto',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <Table size={dense ? 'small' : 'medium'}>
              <DataTableHead
                columns={activeColumns}
                sorting={sorting}
                hasSelection={Boolean(selection)}
                isAllSelected={isAllSelected}
                isIndeterminate={isIndeterminate}
                onToggleSelectAll={handleToggleSelectAll}
                hasExpandableRows={Boolean(renderExpandedRow)}
                hasRowActions={Boolean(rowActions) || Boolean(inlineEditing)}
              />
              <DataTableBody
                data={data}
                columns={activeColumns}
                getRowId={resolveRowId}
                isLoading={isLoading}
                error={error}
                onRetry={onRetry}
                emptyMessage={emptyMessage}
                selection={selection}
                rowActions={rowActions}
                inlineEditing={inlineEditing}
                renderExpandedRow={renderExpandedRow}
                onRowDoubleClick={onRowDoubleClick}
              />
            </Table>
          </TableContainer>
        )}

        {/* Pagination Footer */}
        {pagination && (
          <Box
            display="flex"
            justifyContent={{ xs: 'center', sm: 'flex-end' }}
            alignItems="center"
            width="100%"
            sx={{
              overflowX: 'hidden',
              pt: 0.5,
            }}
          >
            <TablePagination
              component="div"
              count={pagination.totalCount}
              page={Math.max(
                0,
                Math.min(
                  pagination.page,
                  Math.max(0, Math.ceil(pagination.totalCount / (pagination.rowsPerPage || 10)) - 1)
                )
              )}
              onPageChange={(_, newPage) => pagination.onPageChange(newPage)}
              rowsPerPage={pagination.rowsPerPage || 10}
              onRowsPerPageChange={(e) =>
                pagination.onRowsPerPageChange(parseInt(e.target.value, 10))
              }
              rowsPerPageOptions={pagination.rowsPerPageOptions || [5, 10, 25, 50]}
              labelRowsPerPage={
                t.has('RowsPerPage')
                  ? t('RowsPerPage')
                  : isRtl
                  ? 'عدد الصفوف في الصفحة:'
                  : 'Rows per page:'
              }
              labelDisplayedRows={({ from, to, count }) => {
                if (count === 0) {
                  return isRtl ? 'لا توجد سجلات' : '0 records';
                }
                return isRtl
                  ? `عرض ${from}–${to} من أصل ${count !== -1 ? count : `أكثر من ${to}`}`
                  : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`;
              }}
              sx={{
                border: 'none',
                '& .MuiTablePagination-input': {
                  marginRight: '28px !important',
                  marginLeft: '8px !important',
                  minHeight: 'auto !important',
                  '[dir="rtl"] &': {
                    marginLeft: '28px !important',
                    marginRight: '8px !important',
                  },
                },
                '& .MuiTablePagination-select': {
                  fontSize: '0.875rem',
                  paddingLeft: '6px !important',
                  paddingRight: '24px !important',
                  paddingTop: '0 !important',
                  paddingBottom: '0 !important',
                  minHeight: 'auto !important',
                  display: 'inline-flex !important',
                  alignItems: 'center !important',
                  lineHeight: 'inherit !important',
                  boxSizing: 'content-box !important',
                  border: 'none !important',
                  backgroundColor: 'transparent !important',
                  cursor: 'pointer',
                  '[dir="rtl"] &': {
                    paddingRight: '6px !important',
                    paddingLeft: '24px !important',
                    textAlign: 'left !important',
                  },
                },
                '& .MuiTablePagination-selectIcon': {
                  right: '0 !important',
                  left: 'auto !important',
                  top: 'calc(50% - 11px) !important',
                  position: 'absolute !important',
                  fontSize: '20px !important',
                  color: 'text.secondary',
                  '[dir="rtl"] &': {
                    left: '0 !important',
                    right: 'auto !important',
                  },
                },
                '& .MuiTablePagination-displayedRows': {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  my: 0,
                },
                '& .MuiTablePagination-selectLabel': {
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  my: 0,
                },
              }}
            />
          </Box>
        )}
      </Stack>

      {/* Standardized Bulk Delete Confirmation Dialog */}
      {selection?.onBulkDelete && selection.confirmDelete !== false && (
        <Dialog
          open={bulkDeleteDialogOpen}
          onClose={bulkDeleteLoading ? undefined : () => setBulkDeleteDialogOpen(false)}
          maxWidth={selection.bulkDeleteMaxWidth || 'md'}
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: '16px',
                width: '100%',
                maxWidth: { xs: 'calc(100% - 32px)', sm: 600, md: 720 },
                p: { xs: 2.5, sm: 3 },
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 16px 48px rgba(0, 0, 0, 0.7)'
                    : '0 16px 48px rgba(0, 0, 0, 0.12)',
                border: (theme) =>
                  `1px solid ${theme.palette.divider}`,
                position: 'relative',
              },
            },
          }}
        >
          {/* Dismiss button */}
          <IconButton
            aria-label={t.has('Close') ? t('Close') : 'Close'}
            onClick={() => setBulkDeleteDialogOpen(false)}
            disabled={bulkDeleteLoading}
            size="small"
            sx={{
              position: 'absolute',
              top: 16,
              insetInlineEnd: 16,
              color: 'text.secondary',
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                color: 'text.primary',
              },
            }}
          >
            <IconX size={18} />
          </IconButton>

          <DialogTitle component="div" sx={{ p: 0, pb: 2.5 }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: '14px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(250, 137, 107, 0.2)'
                      : 'rgba(250, 137, 107, 0.12)',
                  color: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconTrash size={26} stroke={1.8} />
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography component="div" variant="h5" fontWeight={700}>
                  {selection.bulkDeleteTitle ||
                    (t.has('DeleteSelectedRecords')
                      ? t('DeleteSelectedRecords')
                      : 'Delete Selected Records')}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.75} mb={0.25}>
                  <Chip
                    size="small"
                    color="error"
                    variant="outlined"
                    label={
                      t.has('SelectedCount')
                        ? t('SelectedCount', { count: selection.selectedIds.length })
                        : `${selection.selectedIds.length} selected`
                    }
                    sx={{
                      height: 22,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      borderRadius: '6px',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {t.has('IrreversibleAction')
                      ? t('IrreversibleAction')
                      : 'Permanent action'}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ p: 0, pt: 3, pb: 1 }}>
            {bulkDeleteError && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                {bulkDeleteError}
              </Alert>
            )}

            <Typography
              variant="body1"
              sx={{
                color: 'text.primary',
                mb: 2.5,
                fontSize: '1rem',
                lineHeight: 1.6,
              }}
            >
              {selection.bulkDeleteMessage
                ? selection.bulkDeleteMessage(selection.selectedIds.length)
                : t.has('DeleteSelectedConfirmPrompt')
                ? t('DeleteSelectedConfirmPrompt', { count: selection.selectedIds.length })
                : `Are you sure you want to permanently delete the ${selection.selectedIds.length} selected record(s)?`}
            </Typography>

            {/* Warning Callout Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: '12px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(250, 137, 107, 0.1)'
                    : 'rgba(250, 137, 107, 0.06)',
                border: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '1px solid rgba(250, 137, 107, 0.25)'
                    : '1px solid rgba(250, 137, 107, 0.18)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <IconAlertTriangle
                size={22}
                style={{ color: '#FA896B', flexShrink: 0, marginTop: 2 }}
              />
              <Box>
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  sx={{ color: 'text.primary', mb: 0.25 }}
                >
                  {t.has('Warning') ? t('Warning') : 'Warning: This action cannot be undone'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  {t.has('IrreversibleActionNotice')
                    ? t('IrreversibleActionNotice')
                    : 'All selected items and their associated data will be permanently removed from the system.'}
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions
            sx={{
              p: 0,
              pt: 2.5,
              gap: 1.5,
              justifyContent: 'flex-end',
            }}
          >
            <Button
              onClick={() => setBulkDeleteDialogOpen(false)}
              disabled={bulkDeleteLoading}
              variant="outlined"
              color="inherit"
              sx={{
                fontWeight: 600,
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1,
                minWidth: 105,
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.2)'
                    : 'rgba(0, 0, 0, 0.15)',
                '&:hover': {
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.35)'
                      : 'rgba(0, 0, 0, 0.3)',
                },
              }}
            >
              {t.has('Cancel') ? t('Cancel') : 'Cancel'}
            </Button>
            <Button
              onClick={handleConfirmBulkDelete}
              color="error"
              variant="contained"
              disabled={bulkDeleteLoading}
              startIcon={
                bulkDeleteLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <IconTrash size={18} />
                )
              }
              sx={{
                fontWeight: 700,
                borderRadius: '8px',
                textTransform: 'none',
                px: 3.5,
                py: 1,
                minWidth: 140,
                bgcolor: 'error.main',
                boxShadow: '0 4px 14px 0 rgba(250, 137, 107, 0.4)',
                '&:hover': {
                  bgcolor: 'error.dark',
                  boxShadow: '0 6px 20px 0 rgba(250, 137, 107, 0.5)',
                },
              }}
            >
              {bulkDeleteLoading
                ? t.has('Deleting')
                  ? t('Deleting')
                  : 'Deleting...'
                : t.has('Delete')
                ? `${t('Delete')} (${selection.selectedIds.length})`
                : `Delete (${selection.selectedIds.length})`}
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Card>
  );
}

export default DataTable;

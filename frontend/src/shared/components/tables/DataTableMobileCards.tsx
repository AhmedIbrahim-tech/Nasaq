'use client';

import React, { useState, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconAlertCircle, IconInbox, IconRefresh } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import CustomCheckbox from '@/shared/components/forms/theme-elements/CustomCheckbox';
import { TableColumn, TableRowAction, TableRowActionHelpers, SelectionConfig, InlineEditingConfig } from './types';

interface DataTableMobileCardsProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  getRowId: (row: T, index: number) => string | number;
  isLoading?: boolean;
  error?: ReactNode | null;
  onRetry?: () => void;
  emptyMessage?: ReactNode;
  selection?: SelectionConfig<T>;
  rowActions?: TableRowAction<T>[] | ((row: T, helpers?: TableRowActionHelpers) => TableRowAction<T>[]);
  renderExpandedRow?: (row: T) => ReactNode;
  inlineEditing?: InlineEditingConfig<T>;
}

function getNestedValue(obj: any, path?: string | number | symbol) {
  if (!obj || !path) return undefined;
  if (typeof path !== 'string') return obj[path];
  const parts = path.split('.');
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined) return undefined;
    curr = curr[part];
  }
  return curr;
}

export function DataTableMobileCards<T>({
  data,
  columns,
  getRowId,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage,
  selection,
  rowActions,
  renderExpandedRow,
}: DataTableMobileCardsProps<T>) {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | number | null>(null);

  const toggleRowExpanded = (id: string | number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleOpenRowMenu = (event: React.MouseEvent<HTMLElement>, row: T, rowId: string | number) => {
    event.stopPropagation();
    setActionAnchorEl(event.currentTarget);
    setActiveRow(row);
    setActiveRowId(rowId);
  };

  const handleCloseRowMenu = () => {
    setActionAnchorEl(null);
    setActiveRow(null);
    setActiveRowId(null);
  };

  if (isLoading) {
    return (
      <Stack spacing={1.5} width="100%">
        {[1, 2, 3].map((idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              borderColor: 'divider',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" mb={1.5}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="40%" height={14} />
              </Box>
            </Stack>
            <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
          </Card>
        ))}
      </Stack>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        icon={<IconAlertCircle size={20} />}
        action={
          onRetry ? (
            <Button color="inherit" size="small" onClick={onRetry} startIcon={<IconRefresh size={14} />}>
              {t.has('Retry') ? t('Retry') : 'Retry'}
            </Button>
          ) : undefined
        }
        sx={{ borderRadius: 2 }}
      >
        {typeof error === 'string' ? error : t.has('Error') ? t('Error') : 'Failed to load records.'}
      </Alert>
    );
  }

  if (data.length === 0) {
    return (
      <Card
        variant="outlined"
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 2.5,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" justifyContent="center" mb={1} color="text.secondary">
          <IconInbox size={32} />
        </Box>
        <Typography variant="body2" color="text.secondary">
          {emptyMessage || (t.has('No records found') ? t('No records found') : 'No records found')}
        </Typography>
      </Card>
    );
  }

  // The first column is usually the primary record identity (Avatar + Name)
  const primaryColumn = columns[0];
  const secondaryColumns = columns.slice(1);

  return (
    <Stack spacing={1.5} width="100%">
      {data.map((row, index) => {
        const rowId = getRowId(row, index);
        const isSelected = selection ? selection.selectedIds.includes(rowId) : false;
        const isExpanded = Boolean(expandedRows[rowId]);

        const computedActions =
          typeof rowActions === 'function'
            ? rowActions(row, {
                toggleExpand: () => toggleRowExpanded(rowId),
                isExpanded,
              })
            : rowActions || [];

        const visibleActions = computedActions.filter((act) => {
          if (typeof act.hidden === 'function') return !act.hidden(row);
          return !act.hidden;
        });

        // Resolve primary column value
        let primaryValue: any = undefined;
        if (primaryColumn?.accessorFn) {
          primaryValue = primaryColumn.accessorFn(row);
        } else if (primaryColumn?.accessorKey) {
          primaryValue = getNestedValue(row, primaryColumn.accessorKey);
        }

        return (
          <Card
            key={String(rowId)}
            variant="outlined"
            sx={{
              borderRadius: 2.5,
              borderColor: isSelected ? 'primary.main' : 'divider',
              bgcolor: isSelected
                ? theme.palette.mode === 'dark'
                  ? 'rgba(93, 135, 255, 0.08)'
                  : '#f5f8ff'
                : 'background.paper',
              p: 2,
              transition: 'all 0.15s ease',
              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Card Header: Checkbox (optional), Primary Column, and 3-dot Row Actions */}
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flex: 1 }}>
                {selection && (
                  <CustomCheckbox
                    checked={isSelected}
                    disabled={selection?.isSelectable ? !selection.isSelectable(row) : false}
                    onChange={() => {
                      const newSelectedIds = isSelected
                        ? selection.selectedIds.filter((id) => id !== rowId)
                        : [...selection.selectedIds, rowId];
                      const newSelectedRows = data.filter((r, i) =>
                        newSelectedIds.includes(getRowId(r, i))
                      );
                      selection.onSelectionChange(newSelectedIds, newSelectedRows);
                    }}
                    sx={{ p: 0.5 }}
                    inputProps={{ 'aria-label': `Select row ${rowId}` }}
                  />
                )}

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  {primaryColumn ? (
                    primaryColumn.cell ? (
                      primaryColumn.cell({
                        row,
                        value: primaryValue,
                        index,
                        isSelected,
                        isExpanded,
                        toggleExpand: () => toggleRowExpanded(rowId),
                      })
                    ) : (
                      <Typography variant="subtitle2" fontWeight={700} noWrap>
                        {primaryValue !== undefined ? String(primaryValue) : '-'}
                      </Typography>
                    )
                  ) : null}
                </Box>
              </Stack>

              {/* Action Menu Button */}
              {visibleActions.length > 0 && (
                <IconButton
                  size="small"
                  onClick={(e) => handleOpenRowMenu(e, row, rowId)}
                  aria-label="row actions"
                  sx={{
                    color: 'text.secondary',
                    flexShrink: 0,
                    p: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1.5,
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              )}
            </Stack>

            {/* Secondary Columns Grid */}
            {secondaryColumns.length > 0 && (
              <Box
                sx={{
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: '1px solid',
                  borderColor: 'divider',
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.25,
                }}
              >
                {secondaryColumns.map((col) => {
                  let cellVal: any = undefined;
                  if (col.accessorFn) {
                    cellVal = col.accessorFn(row);
                  } else if (col.accessorKey) {
                    cellVal = getNestedValue(row, col.accessorKey);
                  }

                  const headerText = typeof col.header === 'string' ? col.header : col.id;

                  return (
                    <Box key={col.id} sx={{ minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ fontSize: '0.72rem', display: 'block', mb: 0.25 }}
                      >
                        {headerText}
                      </Typography>
                      <Box sx={{ fontSize: '0.85rem' }}>
                        {col.cell ? (
                          col.cell({
                            row,
                            value: cellVal,
                            index,
                            isSelected,
                            isExpanded,
                            toggleExpand: () => toggleRowExpanded(rowId),
                          })
                        ) : (
                          <Typography variant="body2" sx={{ fontSize: '0.825rem' }}>
                            {cellVal !== undefined && cellVal !== null ? String(cellVal) : '—'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}

            {/* Expandable Details Button & Section */}
            {renderExpandedRow && (
              <Box sx={{ mt: 1.5, pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                <Button
                  size="small"
                  variant="text"
                  color="primary"
                  onClick={() => toggleRowExpanded(rowId)}
                  endIcon={
                    isExpanded ? (
                      <KeyboardArrowUpIcon fontSize="small" />
                    ) : (
                      <KeyboardArrowDownIcon fontSize="small" />
                    )
                  }
                  sx={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    p: 0,
                    minWidth: 0,
                  }}
                >
                  {isExpanded
                    ? t.has('Hide Details')
                      ? t('Hide Details')
                      : 'Hide Details'
                    : t.has('View Details')
                    ? t('View Details')
                    : 'View Details'}
                </Button>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box sx={{ pt: 1.5 }}>
                    {renderExpandedRow(row)}
                  </Box>
                </Collapse>
              </Box>
            )}
          </Card>
        );
      })}

      {/* Shared Actions Popover Menu */}
      <Menu
        anchorEl={actionAnchorEl}
        open={Boolean(actionAnchorEl)}
        onClose={handleCloseRowMenu}
        transformOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 160,
              boxShadow: theme.shadows[4],
              borderRadius: 2,
              p: 0.5,
            },
          },
        }}
      >
        {activeRow &&
          (typeof rowActions === 'function'
            ? rowActions(activeRow, {
                toggleExpand: () => {
                  if (activeRowId !== null) toggleRowExpanded(activeRowId);
                },
                isExpanded: activeRowId !== null ? Boolean(expandedRows[activeRowId]) : false,
              })
            : rowActions || []
          )
            .filter((act) => {
              if (typeof act.hidden === 'function') return !act.hidden(activeRow);
              return !act.hidden;
            })
            .map((act) => (
              <React.Fragment key={act.id}>
                {act.divider && <Divider sx={{ my: 0.5 }} />}
                <MenuItem
                  onClick={() => {
                    handleCloseRowMenu();
                    act.onClick(activeRow, {
                      toggleExpand: () => {
                        if (activeRowId !== null) toggleRowExpanded(activeRowId);
                      },
                      isExpanded: activeRowId !== null ? Boolean(expandedRows[activeRowId]) : false,
                    });
                  }}
                  disabled={
                    typeof act.disabled === 'function' ? act.disabled(activeRow) : act.disabled
                  }
                  dense
                  sx={{
                    borderRadius: 1,
                    fontSize: '0.85rem',
                    color: act.color ? `${act.color}.main` : 'text.primary',
                  }}
                >
                  {act.icon && (
                    <ListItemIcon
                      sx={{
                        color: act.color ? `${act.color}.main` : 'inherit',
                        minWidth: 28,
                      }}
                    >
                      {act.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={act.label}
                    primaryTypographyProps={{ fontSize: '0.825rem', fontWeight: 500 }}
                  />
                </MenuItem>
              </React.Fragment>
            ))}
      </Menu>
    </Stack>
  );
}

export default DataTableMobileCards;

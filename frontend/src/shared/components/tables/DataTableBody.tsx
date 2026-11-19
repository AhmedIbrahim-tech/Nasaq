'use client';

import React, { useState, ReactNode } from 'react';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { alpha, useTheme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { IconCheck, IconX } from '@tabler/icons-react';
import CustomCheckbox from '@/shared/components/forms/theme-elements/CustomCheckbox';
import { TableColumn, TableRowAction, TableRowActionHelpers, SelectionConfig, InlineEditingConfig, resolveTableColumnAlignment } from '@/shared/components/tables/types';
import { LoadingSkeletonRows, EmptyStateRow, ErrorStateRow } from '@/shared/components/tables/DataTableStates';

interface DataTableBodyProps<T> {
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
  onRowDoubleClick?: (row: T) => void;
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

export function DataTableBody<T>({
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
  inlineEditing,
  onRowDoubleClick,
}: DataTableBodyProps<T>) {
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';

  const [expandedRows, setExpandedRows] = useState<Record<string | number, boolean>>({});
  const [actionAnchorEl, setActionAnchorEl] = useState<null | HTMLElement>(null);
  const [activeRow, setActiveRow] = useState<T | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | number | null>(null);

  const hasSelection = Boolean(selection);
  const hasExpandable = Boolean(renderExpandedRow);
  const hasActions = Boolean(rowActions) || Boolean(inlineEditing);
  const totalColumnsCount = columns.length + (hasSelection ? 1 : 0) + (hasExpandable || hasActions ? 1 : 0);

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
      <TableBody>
        <LoadingSkeletonRows columnsCount={totalColumnsCount} />
      </TableBody>
    );
  }

  if (error) {
    return (
      <TableBody>
        <ErrorStateRow columnsCount={totalColumnsCount} error={error} onRetry={onRetry} />
      </TableBody>
    );
  }

  if (data.length === 0) {
    return (
      <TableBody>
        <EmptyStateRow columnsCount={totalColumnsCount} message={emptyMessage} />
      </TableBody>
    );
  }

  return (
    <TableBody>
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

        return (
          <React.Fragment key={String(rowId)}>
            <TableRow
              hover
              selected={isSelected}
              onDoubleClick={(e) => {
                if (!onRowDoubleClick) return;
                const target = e.target as HTMLElement | null;
                if (
                  target?.closest(
                    'button, a, input, select, textarea, [role="checkbox"], [role="button"], [role="menuitem"], .MuiCheckbox-root, .MuiIconButton-root, .MuiButton-root, .MuiInputBase-root, [data-interactive="true"]'
                  )
                ) {
                  return;
                }
                onRowDoubleClick(row);
              }}
              sx={{
                cursor: onRowDoubleClick ? 'pointer' : undefined,
                '&:last-child td, &:last-child th': { borderBottom: isExpanded ? 0 : undefined },
              }}
            >
              {/* Row Checkbox */}
              {hasSelection && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    width: 48,
                    minWidth: 48,
                    maxWidth: 48,
                    paddingInlineStart: 2,
                    paddingInlineEnd: 1,
                  }}
                >
                  <CustomCheckbox
                    checked={isSelected}
                    disabled={selection?.isSelectable ? !selection.isSelectable(row) : false}
                    onChange={() => {
                      if (!selection) return;
                      const newSelectedIds = isSelected
                        ? selection.selectedIds.filter((id) => id !== rowId)
                        : [...selection.selectedIds, rowId];
                      const newSelectedRows = data.filter((r, i) =>
                        newSelectedIds.includes(getRowId(r, i))
                      );
                      selection.onSelectionChange(newSelectedIds, newSelectedRows);
                    }}
                    inputProps={{ 'aria-label': `Select row ${rowId}` }}
                  />
                </TableCell>
              )}

              {/* Dynamic Cells */}
              {columns.map((column) => {
                let cellValue: any = undefined;
                if (column.accessorFn) {
                  cellValue = column.accessorFn(row);
                } else if (column.accessorKey) {
                  cellValue = getNestedValue(row, column.accessorKey);
                }
                const resolvedAlign = resolveTableColumnAlignment(column.align);

                return (
                  <TableCell
                    key={column.id}
                    sx={{
                      fontSize: '14px',
                      fontWeight: 500,
                      py: 1.5,
                      minWidth: column.minWidth,
                      width: column.width,
                      textAlign: resolvedAlign.textAlign,
                    }}
                  >
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent={resolvedAlign.justifyContent}
                      sx={{ width: '100%', minWidth: 0, textAlign: resolvedAlign.textAlign }}
                    >
                      {column.cell ? (
                        column.cell({
                          row,
                          value: cellValue,
                          index,
                          isSelected,
                          isExpanded,
                          toggleExpand: () => toggleRowExpanded(rowId),
                        })
                      ) : (
                        cellValue !== undefined && cellValue !== null ? String(cellValue) : '-'
                      )}
                    </Box>
                  </TableCell>
                );
              })}

              {/* Actions & Expand Toggle Cell */}
              {(hasExpandable || hasActions) && (
                <TableCell
                  align="inherit"
                  sx={{
                    minWidth: 120,
                    width: 140,
                    paddingInlineEnd: 2,
                    paddingInlineStart: 1,
                    py: 1,
                  }}
                >
                  <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.75} sx={{ width: '100%' }}>
                    {hasExpandable && (
                      <IconButton
                        size="small"
                        onClick={() => toggleRowExpanded(rowId)}
                        aria-label="expand row"
                      >
                        {isExpanded ? (
                          <KeyboardArrowUpIcon fontSize="small" />
                        ) : (
                          <KeyboardArrowDownIcon fontSize="small" />
                        )}
                      </IconButton>
                    )}

                    {inlineEditing && inlineEditing.editingRowId === rowId ? (
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => inlineEditing.onSaveEdit?.(row, {})}
                          aria-label="save changes"
                        >
                          <IconCheck size={18} />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => inlineEditing.onCancelEdit?.()}
                          aria-label="cancel edit"
                        >
                          <IconX size={18} />
                        </IconButton>
                      </Box>
                    ) : (
                      hasActions && visibleActions.length > 0 && (
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenRowMenu(e, row, rowId)}
                          aria-label="row actions"
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      )
                    )}
                  </Box>
                </TableCell>
              )}
            </TableRow>

            {/* Expandable Details Row */}
            {hasExpandable && (
              <TableRow
                sx={{
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'grey.50',
                }}
              >
                <TableCell
                  colSpan={totalColumnsCount}
                  sx={{
                    py: 0,
                    px: 3,
                    borderBottom: isExpanded ? undefined : 0,
                  }}
                >
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <Box py={2}>{renderExpandedRow?.(row)}</Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            )}
          </React.Fragment>
        );
      })}

      {/* Shared Row Actions Menu (Modernized Enterprise Design) */}
      {hasActions && activeRow && activeRowId !== null && (
        <Menu
          anchorEl={actionAnchorEl}
          open={Boolean(actionAnchorEl)}
          onClose={handleCloseRowMenu}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          slotProps={{
            paper: {
              elevation: 8,
              sx: {
                minWidth: 190,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                py: 0.5,
                px: 0.5,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 10px 30px rgba(0,0,0,0.5)'
                    : '0 10px 30px rgba(0,0,0,0.08)',
              },
            },
          }}
        >
          {(() => {
            const isRowExpanded = Boolean(expandedRows[activeRowId]);
            const actionsList =
              typeof rowActions === 'function'
                ? rowActions(activeRow, {
                    toggleExpand: () => toggleRowExpanded(activeRowId),
                    isExpanded: isRowExpanded,
                  })
                : rowActions || [];

            const visibleActions = actionsList.filter((act) => {
              if (typeof act.hidden === 'function') return !act.hidden(activeRow);
              return !act.hidden;
            });

            return visibleActions.flatMap((act, idx) => {
              const isDisabled =
                typeof act.disabled === 'function' ? act.disabled(activeRow) : act.disabled;
              const isDestructive = act.color === 'error';

              const items: React.ReactNode[] = [];
              if (act.divider && idx > 0) {
                items.push(<Divider key={`${act.id}-divider`} sx={{ my: 0.5 }} />);
              }

              items.push(
                <MenuItem
                  key={act.id}
                  disabled={isDisabled}
                  onClick={() => {
                    act.onClick(activeRow, {
                      toggleExpand: () => toggleRowExpanded(activeRowId),
                      isExpanded: isRowExpanded,
                    });
                    handleCloseRowMenu();
                  }}
                  dense
                  sx={{
                    borderRadius: '6px',
                    py: 0.85,
                    px: 1.5,
                    my: 0.2,
                    fontSize: '0.84rem',
                    fontWeight: 500,
                    transition: 'background-color 150ms ease, color 150ms ease',
                    ...(isDestructive
                      ? {
                          color: 'error.main',
                          '&:hover': {
                            bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'error.main',
                          },
                        }
                      : {
                          color: 'text.primary',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'text.secondary',
                          },
                        }),
                  }}
                >
                  {act.icon && (
                    <ListItemIcon
                      sx={{
                        minWidth: 'auto',
                        marginInlineEnd: 1.25,
                        '& svg': { width: 17, height: 17 },
                      }}
                    >
                      {act.icon}
                    </ListItemIcon>
                  )}
                  <ListItemText
                    primary={act.label}
                    primaryTypographyProps={{
                      fontSize: '0.84rem',
                      fontWeight: 500,
                    }}
                  />
                </MenuItem>
              );

              return items;
            });
          })()}
        </Menu>
      )}
    </TableBody>
  );
}

'use client';

import React from 'react';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CustomCheckbox from '@/shared/components/forms/theme-elements/CustomCheckbox';
import { IconArrowUp, IconArrowDown, IconArrowsSort } from '@tabler/icons-react';
import { TableColumn, SortingConfig, resolveTableColumnAlignment } from '@/shared/components/tables/types';

import { useTheme } from '@mui/material/styles';
import { useTranslations } from 'next-intl';

interface DataTableHeadProps<T> {
  columns: TableColumn<T>[];
  sorting?: SortingConfig;
  hasSelection?: boolean;
  isAllSelected?: boolean;
  isIndeterminate?: boolean;
  onToggleSelectAll?: () => void;
  hasExpandableRows?: boolean;
  hasRowActions?: boolean;
}

export function DataTableHead<T>({
  columns,
  sorting,
  hasSelection = false,
  isAllSelected = false,
  isIndeterminate = false,
  onToggleSelectAll,
  hasExpandableRows = false,
  hasRowActions = false,
}: DataTableHeadProps<T>) {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';

  return (
    <TableHead>
      <TableRow>
        {/* Selection Checkbox */}
        {hasSelection && (
          <TableCell
            padding="checkbox"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F4F6F9',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              width: 48,
              minWidth: 48,
              maxWidth: 48,
              paddingInlineStart: 2,
              paddingInlineEnd: 1,
            }}
          >
            <CustomCheckbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={onToggleSelectAll}
              inputProps={{ 'aria-label': 'Select all rows on current page' }}
            />
          </TableCell>
        )}

        {/* Dynamic Column Headers */}
        {columns.map((column) => {
          const isSorted = sorting?.orderBy === column.id;
          const sortDirection = isSorted ? sorting?.order : undefined;
          const isSortable = Boolean(column.sortable && sorting?.onSortChange);
          const resolvedAlign = resolveTableColumnAlignment(column.align);

          return (
            <TableCell
              key={column.id}
              onClick={isSortable ? () => sorting?.onSortChange(column.id) : undefined}
              sx={{
                cursor: isSortable ? 'pointer' : 'default',
                fontWeight: 600,
                fontSize: '0.75rem',
                letterSpacing: '0.5px',
                color: 'text.secondary',
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F4F6F9',
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                minWidth: column.minWidth,
                width: column.width,
                userSelect: isSortable ? 'none' : 'auto',
                py: 1.5,
                textAlign: resolvedAlign.textAlign,
              }}
            >
              <Box
                display="flex"
                alignItems="center"
                justifyContent={resolvedAlign.justifyContent}
                sx={{ width: '100%', minWidth: 0, textAlign: resolvedAlign.textAlign }}
              >
                {typeof column.header === 'function' ? (
                  column.header({
                    isAllSelected,
                    isIndeterminate,
                    onToggleAll: onToggleSelectAll || (() => {}),
                  })
                ) : (
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      color: 'text.secondary',
                      textAlign: resolvedAlign.textAlign,
                    }}
                  >
                    {column.header}
                  </Typography>
                )}

                {isSortable && (
                  <Box sx={{ marginInlineStart: 0.75, display: 'flex', alignItems: 'center' }}>
                    {sortDirection === 'asc' ? (
                      <IconArrowUp size={14} />
                    ) : sortDirection === 'desc' ? (
                      <IconArrowDown size={14} />
                    ) : (
                      <IconArrowsSort size={12} style={{ opacity: 0.5 }} />
                    )}
                  </Box>
                )}
              </Box>
            </TableCell>
          );
        })}

        {/* Actions Header (if expand or rowActions exist and not defined as column) */}
        {(hasExpandableRows || hasRowActions) && (
          <TableCell
            align="inherit"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : '#F4F6F9',
              borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
              fontWeight: 600,
              fontSize: '0.75rem',
              letterSpacing: '0.5px',
              color: 'text.secondary',
              minWidth: 120,
              width: 140,
              paddingInlineEnd: 2,
              paddingInlineStart: 1,
              py: 1.5,
            }}
          >
            <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ width: '100%' }}>
              <Typography
                variant="caption"
                fontWeight={600}
                sx={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.5px',
                  color: 'text.secondary',
                }}
              >
                {t.has('Actions') ? t('Actions') : 'Actions'}
              </Typography>
            </Box>
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

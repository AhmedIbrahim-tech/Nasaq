'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import Badge from '@mui/material/Badge';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { alpha, useTheme } from '@mui/material/styles';
import {
  IconSearch,
  IconFilter,
  IconX,
  IconSettings,
  IconDownload,
  IconTrash,
  IconRotateClockwise,
} from '@tabler/icons-react';
import { useTranslations } from 'next-intl';
import { TableColumn, TableToolbarAction } from '@/shared/components/tables/types';

interface DataTableToolbarProps<T> {
  title?: ReactNode;
  columns: TableColumn<T>[];
  visibleColumnIds: string[];
  onToggleColumnVisibility: (columnId: string) => void;
  showSearch?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  showFilterToggle?: boolean;
  isFilterOpen?: boolean;
  onToggleFilter?: () => void;
  hasActiveFilters?: boolean;
  onResetFilters?: () => void;
  activeFiltersCount?: number;
  filtersContent?: ReactNode;
  showColumnVisibility?: boolean;
  onDownloadCsv?: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onClearSelection?: () => void;
  actions?: TableToolbarAction[];
  primaryAction?: ReactNode;
}

export function DataTableToolbar<T>({
  title,
  columns,
  visibleColumnIds,
  onToggleColumnVisibility,
  showSearch = true,
  searchPlaceholder = 'Search...',
  searchValue = '',
  onSearchChange,
  showFilterToggle = true,
  isFilterOpen = false,
  onToggleFilter,
  hasActiveFilters = false,
  onResetFilters,
  activeFiltersCount = 0,
  filtersContent,
  showColumnVisibility = true,
  onDownloadCsv,
  selectedCount = 0,
  onBulkDelete,
  onClearSelection,
  actions = [],
  primaryAction,
}: DataTableToolbarProps<T>) {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(Boolean(searchValue));

  useEffect(() => {
    if (searchValue) {
      setIsSearchOpen(true);
    }
  }, [searchValue]);

  const defaultSearchPlaceholder =
    searchPlaceholder !== 'Search...'
      ? searchPlaceholder
      : t.has('Search')
      ? `${t('Search')}...`
      : 'Search...';

  const handleOpenColumnMenu = (event: React.MouseEvent<HTMLElement>) => {
    setColumnMenuAnchorEl(event.currentTarget);
  };

  const handleCloseColumnMenu = () => {
    setColumnMenuAnchorEl(null);
  };

  const borderlessButtonSx = (active = false, disabled = false) => ({
    width: 36,
    height: 36,
    borderRadius: '7px',
    border: '1px solid',
    borderColor: active
      ? 'primary.main'
      : (theme: any) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.12)'
            : 'rgba(0, 0, 0, 0.08)',
    color: active
      ? 'primary.main'
      : disabled
      ? 'text.disabled'
      : 'text.secondary',
    backgroundColor: active
      ? (theme: any) =>
          theme.palette.mode === 'dark'
            ? 'rgba(93, 135, 255, 0.15)'
            : 'rgba(93, 135, 255, 0.08)'
      : 'transparent',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      borderColor: 'primary.main',
      backgroundColor: (theme: any) =>
        theme.palette.mode === 'dark'
          ? 'rgba(93, 135, 255, 0.18)'
          : 'rgba(93, 135, 255, 0.08)',
      color: 'primary.main',
    },
    '&.Mui-disabled': {
      color: (theme: any) => theme.palette.text.disabled,
      borderColor: 'divider',
      backgroundColor: 'transparent',
    },
  });

  const iconActions = actions.filter((act) => act.variant !== 'button');
  const buttonActions = actions.filter((act) => act.variant === 'button');

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        display="flex"
        alignItems="center"
        justifyContent={title ? 'space-between' : 'flex-end'}
        flexWrap="wrap"
        gap={1.5}
        width="100%"
        py={0.5}
      >
        {/* Start side: Title (if present) */}
        {title && (
          <Box sx={{ minWidth: 0 }}>
            {typeof title === 'string' ? (
              <Typography variant="h6" fontWeight={600} noWrap>
                {title}
              </Typography>
            ) : (
              title
            )}
          </Box>
        )}

        {/* Toolbar Controls in exact Modernize sequence: */}
        {/* Search | Filter | Reset Filters | Settings | Export / Refresh | Module Actions */}
        <Box
          display="flex"
          alignItems="center"
          gap={1.25}
          flexWrap="wrap"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
          }}
        >
          {/* 1. Compact Modernize Search Toggle / Input */}
          {showSearch && (
            !isSearchOpen && !searchValue ? (
              <Tooltip title={t.has('Search') ? t('Search') : 'Search'}>
                <IconButton
                  size="small"
                  onClick={() => setIsSearchOpen(true)}
                  aria-label={t.has('Search') ? t('Search') : 'Search'}
                  sx={borderlessButtonSx(false)}
                >
                  <IconSearch size={18} stroke={1.75} />
                </IconButton>
              </Tooltip>
            ) : (
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  px: 0.75,
                  py: 0.35,
                  transition: 'all 0.2s ease',
                }}
              >
                <IconSearch
                  size={16}
                  stroke={1.75}
                  style={{ opacity: 0.7, marginInlineEnd: 8, flexShrink: 0 }}
                />
                <InputBase
                  value={searchValue}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  autoFocus
                  placeholder={defaultSearchPlaceholder}
                  onBlur={() => {
                    if (!searchValue) setIsSearchOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      onSearchChange?.('');
                      setIsSearchOpen(false);
                    }
                  }}
                  sx={{
                    fontSize: 14,
                    width: { xs: 180, sm: 280, md: 340, lg: 380 },
                    '& input': {
                      py: 0.35,
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => {
                    onSearchChange?.('');
                    setIsSearchOpen(false);
                  }}
                  aria-label={
                    searchValue
                      ? t.has('ClearSearch')
                        ? t('ClearSearch')
                        : 'Clear search'
                      : t.has('Close')
                      ? t('Close')
                      : 'Close'
                  }
                  sx={{
                    p: 0.25,
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' },
                  }}
                >
                  <IconX size={15} />
                </IconButton>
              </Box>
            )
          )}

          {/* 2. Filter Toggle Icon Button */}
          {showFilterToggle && filtersContent && (
            <Tooltip
              title={
                isFilterOpen
                  ? t.has('HideFilters')
                    ? t('HideFilters')
                    : 'Hide Filters'
                  : hasActiveFilters
                  ? `${t.has('Filter') ? t('Filter') : 'Filter'} (${activeFiltersCount})`
                  : t.has('Filter')
                  ? t('Filter')
                  : 'Filter'
              }
            >
              <Badge
                color="primary"
                variant="dot"
                invisible={!hasActiveFilters}
                overlap="circular"
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                sx={{
                  '& .MuiBadge-badge': {
                    right: 4,
                    top: 4,
                    width: 8,
                    height: 8,
                  },
                }}
              >
                <IconButton
                  size="small"
                  onClick={onToggleFilter}
                  aria-label={t.has('Filter') ? t('Filter') : 'Filter'}
                  aria-expanded={isFilterOpen}
                  sx={borderlessButtonSx(isFilterOpen || hasActiveFilters)}
                >
                  <IconFilter size={18} stroke={1.75} />
                </IconButton>
              </Badge>
            </Tooltip>
          )}

          {/* 3. Reset Filters Icon Button (Always visible next to Filter, disabled when no filters active) */}
          {showFilterToggle && filtersContent && (
            <Tooltip
              title={
                hasActiveFilters
                  ? t.has('ResetFilter')
                    ? t('ResetFilter')
                    : 'Reset Filters'
                  : t.has('NoActiveFilters')
                  ? t('NoActiveFilters')
                  : 'No active filters'
              }
            >
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={onResetFilters}
                  disabled={!hasActiveFilters || !onResetFilters}
                  aria-label={t.has('ResetFilter') ? t('ResetFilter') : 'Reset Filters'}
                  sx={borderlessButtonSx(false, !hasActiveFilters || !onResetFilters)}
                >
                  <IconRotateClockwise size={18} stroke={1.75} />
                </IconButton>
              </Box>
            </Tooltip>
          )}

          {/* 4. Column Visibility Settings Icon Button */}
          {showColumnVisibility && (
            <>
              <Tooltip title={t.has('Columns') ? t('Columns') : 'Columns'}>
                <IconButton
                  onClick={handleOpenColumnMenu}
                  size="small"
                  aria-label={t.has('Columns') ? t('Columns') : 'Columns'}
                  aria-haspopup="true"
                  aria-expanded={Boolean(columnMenuAnchorEl)}
                  sx={borderlessButtonSx(Boolean(columnMenuAnchorEl))}
                >
                  <IconSettings size={18} stroke={1.75} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={columnMenuAnchorEl}
                open={Boolean(columnMenuAnchorEl)}
                onClose={handleCloseColumnMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: isRtl ? 'left' : 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: isRtl ? 'left' : 'right' }}
                slotProps={{
                  paper: {
                    sx: { minWidth: 180, borderRadius: 2, p: 0.5 },
                  },
                }}
              >
                {columns
                  .filter((col) => col.id !== 'selection' && col.id !== 'actions')
                  .map((col) => {
                    const isVisible = visibleColumnIds.includes(col.id);
                    const label = typeof col.header === 'string' ? col.header : col.id;
                    return (
                      <MenuItem
                        key={col.id}
                        onClick={() => onToggleColumnVisibility(col.id)}
                        dense
                        sx={{ borderRadius: 1 }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Checkbox size="small" checked={isVisible} disableRipple sx={{ p: 0 }} />
                        </ListItemIcon>
                        <ListItemText primary={label} primaryTypographyProps={{ fontSize: '0.85rem' }} />
                      </MenuItem>
                    );
                  })}
              </Menu>
            </>
          )}

          {/* 5. CSV Export Icon Button */}
          {onDownloadCsv && (
            <Tooltip title={t.has('ExportCsv') ? t('ExportCsv') : 'Export CSV'}>
              <IconButton
                onClick={onDownloadCsv}
                size="small"
                aria-label={t.has('ExportCsv') ? t('ExportCsv') : 'Export CSV'}
                sx={borderlessButtonSx(false)}
              >
                <IconDownload size={18} stroke={1.75} />
              </IconButton>
            </Tooltip>
          )}

          {/* 6. Additional icon-only table actions (e.g., Refresh) */}
          {iconActions.map((act) => (
            <Tooltip key={act.id} title={act.tooltip || act.label || ''}>
              <Box component="span" sx={{ display: 'inline-flex' }}>
                <IconButton
                  onClick={act.onClick}
                  size="small"
                  color={act.color === 'default' ? 'inherit' : act.color}
                  disabled={act.disabled}
                  aria-label={act.tooltip || act.label || act.id}
                  sx={borderlessButtonSx(false, act.disabled)}
                >
                  {act.icon}
                </IconButton>
              </Box>
            </Tooltip>
          ))}

          {/* Selected Count & Bulk Delete */}
          {selectedCount > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                size="small"
                label={
                  t.has('SelectedCount')
                    ? t('SelectedCount', { count: selectedCount })
                    : `${selectedCount} selected`
                }
                onDelete={onClearSelection}
                color="primary"
                variant="outlined"
                sx={{
                  height: 30,
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'primary.dark' : 'primary.light',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(93, 135, 255, 0.15)'
                      : 'rgba(93, 135, 255, 0.08)',
                }}
              />
              {onBulkDelete && (
                <Tooltip
                  title={
                    t.has('DeleteSelected')
                      ? `${t('DeleteSelected')} (${selectedCount})`
                      : `Delete selected (${selectedCount})`
                  }
                >
                  <IconButton
                    color="error"
                    size="small"
                    onClick={onBulkDelete}
                    aria-label={
                      t.has('DeleteSelected')
                        ? `${t('DeleteSelected')} (${selectedCount})`
                        : `Delete selected (${selectedCount})`
                    }
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '8px',
                      color: 'error.main',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(250, 137, 107, 0.2)'
                            : 'rgba(250, 137, 107, 0.12)',
                      },
                    }}
                  >
                    <IconTrash size={18} stroke={1.75} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          )}

          {/* Visual Separator between Table Controls and Action Buttons */}
          {(buttonActions.length > 0 || primaryAction) && (
            <Divider
              orientation="vertical"
              flexItem
              sx={{
                height: 24,
                alignSelf: 'center',
                mx: { xs: 0.75, sm: 1.25 },
                borderColor: 'divider',
              }}
            />
          )}

          {/* Module Action Buttons (Price List, New Sale, Add Member, etc.) */}
          {buttonActions.map((act) => (
            <Button
              key={act.id}
              variant="contained"
              color={act.color === 'default' || !act.color ? 'primary' : act.color}
              startIcon={act.icon}
              onClick={act.onClick}
              disabled={act.disabled}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: '7px',
                textTransform: 'none',
                px: 2,
                height: 36,
                whiteSpace: 'nowrap',
              }}
            >
              {act.label}
            </Button>
          ))}

          {primaryAction && (
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25 }}>
              {primaryAction}
            </Box>
          )}
        </Box>
      </Box>

      {/* Expandable Filter Box */}
      {filtersContent && (
        <Collapse in={isFilterOpen}>
          <Box
            sx={{
              p: { xs: 2, sm: 2.5 },
              mt: 1.5,
              mb: 0.75,
              borderRadius: '12px',
              border: (theme) => `1px solid ${theme.palette.divider}`,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.background.default, 0.6)
                  : alpha(theme.palette.grey[50], 0.8),
              '& .MuiInputLabel-root': {
                fontSize: '0.85rem !important',
                fontWeight: '600 !important',
                letterSpacing: '0.01em',
              },
              '& .MuiFormControl-root': {
                my: 0,
              },
            }}
          >
            {filtersContent}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

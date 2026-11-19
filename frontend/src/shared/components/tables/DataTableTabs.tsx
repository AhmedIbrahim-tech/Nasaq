'use client';

import React, { ReactNode, KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { useTheme, alpha } from '@mui/material/styles';
import { SxProps, Theme } from '@mui/material';

export interface DataTableTabItem {
  /** Unique identifier or tab value matching filter query */
  value: string;
  /** Display label for the tab (string or ReactNode) */
  label: ReactNode;
  /** Optional aggregate counter badge */
  count?: number | string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Optional tooltip text */
  tooltip?: string;
  /** Optional accessible label */
  ariaLabel?: string;
}

export interface DataTableTabsProps {
  /** Tab items configuration list */
  items: DataTableTabItem[];
  /** Currently selected tab value */
  value: string;
  /** Callback fired when a tab is selected */
  onChange: (value: string) => void;
  /** Optional accessible label for the tablist container */
  ariaLabel?: string;
  /** Optional action element rendered at the opposite side of the tabs (e.g. Create Button) */
  action?: ReactNode;
  /** Custom container styling */
  sx?: SxProps<Theme>;
}

/**
 * Reusable role-based and category filter tabs component.
 * Modeled directly after the original Modernize User Table (`modernize/src/app/components/react-table/TableUser.tsx`).
 *
 * Features:
 * - Responsive horizontal scrolling on mobile
 * - Full light and dark mode MUI theme adaptation
 * - Full RTL and LTR support with CSS logical properties
 * - WAI-ARIA tablist & tab accessibility semantics
 * - Keyboard navigation (Enter / Space)
 * - Optional count badge and icon per tab
 * - Optional action slot (e.g. Create User button) aligned opposite the tabs
 */
export function DataTableTabs({
  items,
  value,
  onChange,
  ariaLabel = 'Filter tabs',
  action,
  sx,
}: DataTableTabsProps) {
  const theme = useTheme();

  const tabsBar = (
    <Box
      role="tablist"
      aria-label={ariaLabel}
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        py: 0.5,
        px: 0.5,
        bgcolor:
          theme.palette.mode === 'dark'
            ? alpha(theme.palette.grey[800], 0.6)
            : theme.palette.grey[100],
        borderRadius: '7px',
        border: '1px solid',
        borderColor: theme.palette.divider,
        gap: 0.5,
        width: 'fit-content',
        maxWidth: '100%',
        scrollbarWidth: 'thin',
        '&::-webkit-scrollbar': {
          height: 4,
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: alpha(theme.palette.text.primary, 0.15),
          borderRadius: 2,
        },
        ...sx,
      }}
    >
      {items.map((tab) => {
        const isSelected = value === tab.value;

        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
          if (tab.disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onChange(tab.value);
          }
        };

        const handleClick = () => {
          if (tab.disabled) return;
          onChange(tab.value);
        };

        const tabNode = (
          <Box
            key={tab.value}
            role="tab"
            aria-selected={isSelected}
            aria-disabled={tab.disabled}
            aria-label={tab.ariaLabel}
            tabIndex={tab.disabled ? -1 : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 2,
              py: 0.75,
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              fontSize: '0.8125rem', // 13px matching Modernize User Table
              fontWeight: isSelected ? 600 : 500,
              minHeight: '32px',
              borderRadius: '6px',
              bgcolor: isSelected ? 'primary.main' : 'transparent',
              color: isSelected
                ? 'primary.contrastText'
                : tab.disabled
                ? 'text.disabled'
                : 'text.secondary',
              boxShadow: isSelected ? '0 2px 6px rgba(93, 135, 255, 0.28)' : 'none',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              userSelect: 'none',
              opacity: tab.disabled ? 0.6 : 1,
              transition: theme.transitions.create(
                ['background-color', 'color', 'box-shadow', 'opacity'],
                { duration: 150 }
              ),
              '&:hover': {
                bgcolor: isSelected
                  ? 'primary.main'
                  : tab.disabled
                  ? 'transparent'
                  : alpha(theme.palette.primary.main, 0.08),
                color: isSelected
                  ? 'primary.contrastText'
                  : tab.disabled
                  ? 'text.disabled'
                  : 'text.primary',
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 1,
              },
            }}
          >
            {tab.icon && (
              <Box
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginInlineEnd: 0.75,
                  fontSize: '1rem',
                  lineHeight: 1,
                }}
              >
                {tab.icon}
              </Box>
            )}

            <Box component="span">{tab.label}</Box>

            {tab.count !== undefined && (
              <Chip
                size="small"
                label={tab.count}
                sx={{
                  marginInlineStart: 1,
                  height: 18,
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  bgcolor: isSelected
                    ? 'rgba(255, 255, 255, 0.24)'
                    : alpha(theme.palette.grey[500], 0.16),
                  color: isSelected ? '#ffffff' : 'text.secondary',
                  pointerEvents: 'none',
                  border: 'none',
                  '& .MuiChip-label': {
                    px: 0.75,
                  },
                }}
              />
            )}
          </Box>
        );

        if (tab.tooltip) {
          return (
            <Tooltip key={tab.value} title={tab.tooltip} arrow>
              {tabNode}
            </Tooltip>
          );
        }

        return tabNode;
      })}
    </Box>
  );

  if (action) {
    return (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={1.5}
        width="100%"
      >
        {tabsBar}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {action}
        </Box>
      </Stack>
    );
  }

  return tabsBar;
}

export default DataTableTabs;

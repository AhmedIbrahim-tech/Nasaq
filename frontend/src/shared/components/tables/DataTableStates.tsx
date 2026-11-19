'use client';

import React, { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { IconAlertTriangle, IconInbox } from '@tabler/icons-react';
import { useTranslations } from 'next-intl';

interface LoadingSkeletonRowsProps {
  columnsCount: number;
  rowsCount?: number;
}

export function LoadingSkeletonRows({ columnsCount, rowsCount = 5 }: LoadingSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, rIdx) => (
        <TableRow key={`skeleton-row-${rIdx}`}>
          {Array.from({ length: columnsCount }).map((_, cIdx) => (
            <TableCell key={`skeleton-cell-${rIdx}-${cIdx}`} sx={{ py: 1.5 }}>
              <Skeleton
                variant={cIdx === 0 ? 'rounded' : 'text'}
                height={cIdx === 0 ? 24 : 20}
                width={cIdx === 0 ? 24 : cIdx === 1 ? '75%' : '50%'}
                animation="wave"
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

export function DataTableEmptyState({ message }: { message?: ReactNode }) {
  const t = useTranslations();
  const displayMessage = message ?? (t.has('NoRecordsFound') ? t('NoRecordsFound') : 'No records found');

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1} py={4}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'text.secondary',
        }}
      >
        <IconInbox size={28} />
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="textSecondary">
        {displayMessage}
      </Typography>
    </Box>
  );
}

interface EmptyStateRowProps {
  columnsCount: number;
  message?: ReactNode;
}

export function EmptyStateRow({ columnsCount, message }: EmptyStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount} align="center" sx={{ py: 6 }}>
        <DataTableEmptyState message={message} />
      </TableCell>
    </TableRow>
  );
}

export function DataTableErrorState({ error = 'Failed to load data', onRetry }: { error?: ReactNode; onRetry?: () => void }) {
  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1.5} py={4}>
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'error.light',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main',
        }}
      >
        <IconAlertTriangle size={28} />
      </Box>
      <Typography variant="subtitle1" fontWeight={600} color="error">
        {error}
      </Typography>
      {onRetry && (
        <Button variant="outlined" color="primary" size="small" onClick={onRetry}>
          Retry
        </Button>
      )}
    </Box>
  );
}

interface ErrorStateRowProps {
  columnsCount: number;
  error?: ReactNode;
  onRetry?: () => void;
}

export function ErrorStateRow({ columnsCount, error = 'Failed to load data', onRetry }: ErrorStateRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={columnsCount} align="center" sx={{ py: 6 }}>
        <DataTableErrorState error={error} onRetry={onRetry} />
      </TableCell>
    </TableRow>
  );
}

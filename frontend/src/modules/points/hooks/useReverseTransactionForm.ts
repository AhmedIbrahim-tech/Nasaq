'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { PointTransaction } from '../types';

interface UseReverseTransactionFormProps {
  transaction: PointTransaction | null;
  onConfirm: (transactionId: string, reason: string) => Promise<void>;
}

export function useReverseTransactionForm({ transaction, onConfirm }: UseReverseTransactionFormProps) {
  const t = useTranslations();
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t('ReversalReasonRequired'));
      return;
    }
    if (!transaction) return;

    await onConfirm(transaction.id, reason.trim());
    setReason('');
    setError(null);
  }, [reason, transaction, onConfirm, t]);

  return {
    reason,
    setReason,
    error,
    setError,
    handleSubmit,
  };
}

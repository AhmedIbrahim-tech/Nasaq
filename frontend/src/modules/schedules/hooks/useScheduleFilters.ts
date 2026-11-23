'use client';

import { useState, useCallback } from 'react';

export function useScheduleFilters() {
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const resetFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setPage(1);
  }, []);

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    showFilters,
    setShowFilters,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetFilters,
  };
}

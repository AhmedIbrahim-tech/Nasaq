'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilterParams, resetFilters } from '../slices/locations.slice';

export function useLocationFilters() {
  const dispatch = useAppDispatch();
  const { filterParams } = useAppSelector((state) => state.locations);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showFilters, setShowFilters] = useState(false);

  // Column visibility state (Default to concise overview; details accessible in expandable row)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    name: true,
    radiusMeters: true,
    employeeCount: true,
    isActive: true,
    coordinates: false,
    accuracyThresholdMeters: false,
    created_Utc: false,
  });

  const handleToggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  const handleSearchChange = useCallback((search: string) => {
    dispatch(setFilterParams({ search }));
    setPage(1);
  }, [dispatch]);

  const handleIsActiveChange = useCallback((isActive: boolean | undefined) => {
    dispatch(setFilterParams({ isActive }));
    setPage(1);
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
    setPage(1);
  }, [dispatch]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  }, []);

  return {
    filterParams,
    page,
    pageSize,
    showFilters,
    setShowFilters,
    columnVisibility,
    setColumnVisibility,
    toggleColumn: handleToggleColumn,
    onSearchChange: handleSearchChange,
    onIsActiveChange: handleIsActiveChange,
    onResetFilters: handleResetFilters,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
  };
}

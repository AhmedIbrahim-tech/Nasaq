'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilterParams, resetFilters } from '../slices/employee.slice';

export function useEmployeeFilters() {
  const dispatch = useAppDispatch();
  const filterParams = useAppSelector((state) => state.employees.filterParams);

  const [showFilters, setShowFilters] = useState(false);

  // Column visibility state (Default to concise overview; details accessible in expandable row)
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>({
    employeeCode: true,
    fullName: true,
    primaryWorkInfo: true,
    isActive: true,
    department: false,
    jobTitle: false,
    supervisorName: false,
    workLocationName: false,
    userRole: false,
    hireDate: false,
  });

  const handleSearchChange = useCallback((search: string) => {
    dispatch(setFilterParams({ search, page: 1 }));
  }, [dispatch]);

  const handleDepartmentChange = useCallback((department: string) => {
    dispatch(setFilterParams({ department, page: 1 }));
  }, [dispatch]);

  const handleIsActiveChange = useCallback((isActive: boolean | undefined) => {
    dispatch(setFilterParams({ isActive, page: 1 }));
  }, [dispatch]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setFilterParams({ page }));
  }, [dispatch]);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    dispatch(setFilterParams({ pageSize: newPageSize, page: 1 }));
  }, [dispatch]);

  const handleSortChange = useCallback((column: string, order: 'asc' | 'desc') => {
    dispatch(setFilterParams({ sortBy: column, sortDescending: order === 'desc', page: 1 }));
  }, [dispatch]);

  const handleResetFilters = useCallback(() => {
    dispatch(resetFilters());
  }, [dispatch]);

  const handleToggleColumn = useCallback((columnId: string) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  }, []);

  return {
    filterParams,
    showFilters,
    setShowFilters,
    columnVisibility,
    toggleColumn: handleToggleColumn,
    onSearchChange: handleSearchChange,
    onDepartmentChange: handleDepartmentChange,
    onIsActiveChange: handleIsActiveChange,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    onSortChange: handleSortChange,
    onResetFilters: handleResetFilters,
  };
}

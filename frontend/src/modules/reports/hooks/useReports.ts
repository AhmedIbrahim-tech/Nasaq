'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { notify } from '@/shared/services/notification.service';
import { locationsService } from '@/modules/locations/services/locations.service';
import { scheduleService } from '@/modules/schedules/services/schedule.service';
import { employeeService } from '@/modules/employees/services/employee.service';
import { reportsService } from '../services/reports.service';
import type {
  ReportCatalogItem,
  ReportFilterRequest,
  ReportResult,
} from '../types';
import type {
  FilterLocationOption,
  FilterShiftOption,
  FilterEmployeeOption,
} from '../components/ReportFiltersBar';

export function useReports() {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith('ar');

  // Catalog & Active Report
  const [catalog, setCatalog] = useState<ReportCatalogItem[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>('daily-attendance');
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Report Execution Result
  const [reportResult, setReportResult] = useState<ReportResult | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<ReportFilterRequest>({
    reportId: 'daily-attendance',
    pageNumber: 1,
    pageSize: 20,
    language: isAr ? 'ar' : 'en',
  });
  const [showFilters, setShowFilters] = useState(false);

  // Lookups for filters (with bilingual support)
  const [locations, setLocations] = useState<FilterLocationOption[]>([]);
  const [shifts, setShifts] = useState<FilterShiftOption[]>([]);
  const [employees, setEmployees] = useState<FilterEmployeeOption[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);

  // 1. Fetch Catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setCatalogLoading(true);
        const items = await reportsService.getCatalog();
        setCatalog(items);
        if (items.length > 0 && !selectedReportId) {
          setSelectedReportId(items[0].id);
        }
      } catch {
        notify.error(t('ErrorLoadingData'));
      } finally {
        setCatalogLoading(false);
      }
    };

    fetchCatalog();
  }, [t, selectedReportId]);

  // 2. Fetch Supporting Lookups with Bilingual Names
  useEffect(() => {
    const fetchLookups = async () => {
      try {
        const [locsRes, shiftsRes, empsRes] = await Promise.all([
          locationsService.getLocations({}),
          scheduleService.getShifts({ pageSize: 100 }),
          employeeService.getEmployees({ pageSize: 200 }),
        ]);

        const locsItems = (locsRes as any)?.data || (locsRes as any)?.items || [];
        const shiftsItems = (shiftsRes as any)?.data || (shiftsRes as any)?.items || [];
        const empsItems = (empsRes as any)?.data || (empsRes as any)?.items || [];

        if (locsItems.length > 0) {
          setLocations(
            locsItems.map((l: any) => ({
              id: l.id,
              name: l.name,
              nameAr: l.nameAr,
            }))
          );
        }
        if (shiftsItems.length > 0) {
          setShifts(
            shiftsItems.map((s: any) => ({
              id: s.id,
              name: s.name,
              nameAr: s.nameAr,
            }))
          );
        }
        if (empsItems.length > 0) {
          setEmployees(
            empsItems.map((e: any) => ({
              id: e.id,
              fullName: `${e.firstName || ''} ${e.lastName || ''}`.trim(),
              fullNameAr: e.fullNameAr || (e.firstNameAr ? `${e.firstNameAr} ${e.lastNameAr || ''}`.trim() : undefined),
              code: e.employeeCode || '',
            }))
          );
          const depts = Array.from(
            new Set(
              empsItems
                .map((e: any) => (isAr && e.departmentAr ? e.departmentAr : e.department))
                .filter(Boolean)
            )
          ) as string[];
          setDepartments(depts);
        }
      } catch {
        // quiet lookup error
      }
    };

    fetchLookups();
  }, [isAr]);

  // 3. Execute Active Report
  const loadReport = useCallback(async () => {
    if (!selectedReportId) return;

    try {
      setReportLoading(true);
      const req: ReportFilterRequest = {
        ...filters,
        reportId: selectedReportId,
        language: isAr ? 'ar' : 'en',
      };
      const res = await reportsService.executeReport(req);
      setReportResult(res);
    } catch {
      notify.error(t('ErrorLoadingData'));
    } finally {
      setReportLoading(false);
    }
  }, [filters, selectedReportId, isAr, t]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // Active Report Details
  const activeReport = useMemo(
    () => catalog.find((c) => c.id === selectedReportId),
    [catalog, selectedReportId]
  );

  const supportedFilters = activeReport?.supportedFilters || [];

  const handleSelectReport = (newReportId: string) => {
    setSelectedReportId(newReportId);
    setFilters({
      reportId: newReportId,
      pageNumber: 1,
      pageSize: 20,
      language: isAr ? 'ar' : 'en',
    });
  };

  const handleFilterChange = (newFilters: Partial<ReportFilterRequest>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      reportId: selectedReportId,
      pageNumber: 1,
      pageSize: 20,
      language: isAr ? 'ar' : 'en',
    });
  };

  // Export Action
  const handleExport = async (format: 'csv' | 'xlsx' | 'pdf', scope: 'all' | 'current_page') => {
    try {
      const exportReq: ReportFilterRequest = {
        ...filters,
        reportId: selectedReportId,
        exportFormat: format,
        exportScope: scope,
        language: isAr ? 'ar' : 'en',
      };
      await reportsService.exportReport(exportReq);
    } catch {
      notify.error(t('ErrorLoadingData'));
    }
  };

  const hasActiveFilters = Boolean(
    filters.searchTerm ||
      filters.fromDate ||
      filters.toDate ||
      (filters.workLocationId && filters.workLocationId !== 'all') ||
      (filters.workShiftId && filters.workShiftId !== 'all') ||
      (filters.employeeId && filters.employeeId !== 'all') ||
      (filters.department && filters.department !== 'all') ||
      (filters.status && filters.status !== 'all') ||
      (filters.pointCategory && filters.pointCategory !== 'all')
  );

  return {
    catalog,
    selectedReportId,
    catalogLoading,
    reportResult,
    reportLoading,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    locations,
    shifts,
    employees,
    departments,
    activeReport,
    supportedFilters,
    hasActiveFilters,
    handleSelectReport,
    handleFilterChange,
    handleResetFilters,
    handleExport,
    loadReport,
  };
}

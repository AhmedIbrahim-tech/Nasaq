'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { notify } from '@/shared/services/notification.service';
import { RoleNames } from '@/shared/constants/roles';
import {
  fetchLocationsThunk,
  fetchLocationsSummaryThunk,
  createLocationThunk,
  updateLocationThunk,
  toggleLocationStatusThunk,
  deleteLocationThunk,
  bulkDeleteLocationsThunk,
  setSelectedLocation,
} from '../slices/locations.slice';
import type { WorkLocation, CreateLocationRequest, UpdateLocationRequest } from '../types';

export function useLocations() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { roles } = useAppSelector((state) => state.auth);
  const {
    items,
    selectedLocation,
    summary,
    summaryLoading,
    loading,
    actionLoading,
    filterParams,
  } = useAppSelector((state) => state.locations);

  const canManage = useMemo(
    () => roles?.includes(RoleNames.SuperAdmin) || roles?.includes(RoleNames.Admin) || false,
    [roles]
  );

  // Dialog and UI states
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [formDialogMode, setFormDialogMode] = useState<'create' | 'edit'>('create');
  const [editingLocation, setEditingLocation] = useState<WorkLocation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion dialog states
  const [locationToDelete, setLocationToDelete] = useState<WorkLocation | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(() => {
    dispatch(fetchLocationsThunk(filterParams));
    dispatch(fetchLocationsSummaryThunk());
  }, [dispatch, filterParams]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Dialog open/close handlers
  const handleOpenCreate = useCallback(() => {
    setFormDialogMode('create');
    setEditingLocation(null);
    setFormDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((location: WorkLocation) => {
    setFormDialogMode('edit');
    setEditingLocation(location);
    setFormDialogOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormDialogOpen(false);
    setEditingLocation(null);
  }, []);

  const handleOpenDetails = useCallback((location: WorkLocation) => {
    dispatch(setSelectedLocation(location));
    setDetailsDialogOpen(true);
  }, [dispatch]);

  const handleCloseDetails = useCallback(() => {
    setDetailsDialogOpen(false);
  }, []);

  // CRUD handlers
  const handleFormSubmit = useCallback(async (
    data: CreateLocationRequest | UpdateLocationRequest
  ): Promise<void> => {
    try {
      if (formDialogMode === 'create') {
        await dispatch(createLocationThunk(data as CreateLocationRequest)).unwrap();
        notify.success(t('LocationCreatedSuccess'));
      } else if (editingLocation) {
        await dispatch(
          updateLocationThunk({
            id: editingLocation.id,
            data: data as UpdateLocationRequest,
          })
        ).unwrap();
        notify.success(t('LocationUpdatedSuccess'));
      }
      setFormDialogOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
      throw err;
    }
  }, [formDialogMode, editingLocation, dispatch, t, loadData]);

  const handleToggleStatus = useCallback(async (location: WorkLocation) => {
    try {
      const updated = await dispatch(
        toggleLocationStatusThunk({
          id: location.id,
          request: { isActive: !location.isActive },
        })
      ).unwrap();

      notify.success(
        updated.isActive
          ? t('LocationActivatedSuccess')
          : t('LocationDeactivatedSuccess')
      );
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    }
  }, [dispatch, t, loadData]);

  // Single Delete Handler
  const handleOpenSingleDelete = useCallback((location: WorkLocation) => {
    setLocationToDelete(location);
  }, []);

  const handleCloseSingleDelete = useCallback(() => {
    setLocationToDelete(null);
  }, []);

  const handleConfirmSingleDelete = useCallback(async () => {
    if (!locationToDelete) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteLocationThunk(locationToDelete.id)).unwrap();
      notify.success(t('LocationDeletedSuccess'));
      setSelectedIds((prev) => prev.filter((id) => id !== locationToDelete.id));
      setLocationToDelete(null);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    } finally {
      setIsDeleting(false);
    }
  }, [locationToDelete, dispatch, t, loadData]);

  // Bulk Delete Handler
  const handleOpenBulkDelete = useCallback(() => {
    setBulkDeleteOpen(true);
  }, []);

  const handleCloseBulkDelete = useCallback(() => {
    setBulkDeleteOpen(false);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDeleting(true);
      await dispatch(bulkDeleteLocationsThunk(selectedIds)).unwrap();
      notify.success(t('LocationsBulkDeletedSuccess'));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    } finally {
      setIsDeleting(false);
    }
  }, [selectedIds, dispatch, t, loadData]);

  // Export CSV
  const handleExportCsv = useCallback(() => {
    if (items.length === 0) {
      notify.error(t('NoRecordsFound'));
      return;
    }
    const headers = [
      t('LocationName'),
      t('Latitude'),
      t('Longitude'),
      t('GeofenceRadiusMeters'),
      t('AccuracyThresholdMeters'),
      t('AssignedEmployees'),
      t('Status'),
      t('CreatedDate'),
    ];

    const rows = items.map((loc) => [
      `"${loc.name}"`,
      loc.latitude,
      loc.longitude,
      loc.radiusMeters,
      loc.accuracyThresholdMeters,
      loc.employeeCount,
      loc.isActive ? t('Active') : t('Inactive'),
      loc.created_Utc ? new Date(loc.created_Utc).toLocaleDateString() : '',
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `work_locations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items, t]);

  return {
    items,
    selectedLocation,
    summary,
    summaryLoading,
    loading,
    actionLoading,
    canManage,
    formDialogOpen,
    formDialogMode,
    editingLocation,
    detailsDialogOpen,
    selectedIds,
    setSelectedIds,
    locationToDelete,
    bulkDeleteOpen,
    isDeleting,
    loadData,
    openCreate: handleOpenCreate,
    openEdit: handleOpenEdit,
    closeForm: handleCloseForm,
    openDetails: handleOpenDetails,
    closeDetails: handleCloseDetails,
    submitForm: handleFormSubmit,
    toggleStatus: handleToggleStatus,
    openDelete: handleOpenSingleDelete,
    closeDelete: handleCloseSingleDelete,
    confirmDelete: handleConfirmSingleDelete,
    openBulkDelete: handleOpenBulkDelete,
    closeBulkDelete: handleCloseBulkDelete,
    confirmBulkDelete: handleConfirmBulkDelete,
    exportCsv: handleExportCsv,
  };
}

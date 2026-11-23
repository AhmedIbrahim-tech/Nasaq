'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserProfile } from '@/modules/auth/slices/auth.slice';
import { notify } from '@/shared/services/notification.service';
import { RoleNames } from '@/shared/constants/roles';
import { fetchLocationsThunk } from '@/modules/locations';
import { broadcastPhotoInvalidation } from '@/shared/hooks/useAuthenticatedPhotoUrl';
import {
  fetchEmployeesThunk,
  fetchSupervisorsThunk,
  fetchEmployeesSummaryThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  toggleEmployeeStatusThunk,
  deleteEmployeeThunk,
  bulkDeleteEmployeesThunk,
} from '../slices/employee.slice';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types';

export function useEmployees() {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { roles, user: currentUser } = useAppSelector((state) => state.auth);
  const {
    items,
    supervisors,
    summary,
    summaryLoading,
    totalCount,
    currentPage,
    pageSize,
    loading,
    actionLoading,
    filterParams,
  } = useAppSelector((state) => state.employees);
  const { items: locations } = useAppSelector((state) => state.locations);

  const canManage = useMemo(
    () => roles?.includes(RoleNames.SuperAdmin) || roles?.includes(RoleNames.Admin) || false,
    [roles]
  );

  const isSuperAdmin = useMemo(
    () => roles?.includes(RoleNames.SuperAdmin) || false,
    [roles]
  );

  // Dialog & selection UI states
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion dialog states
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Computed departments list from current items
  const departments = useMemo(() => {
    const depts = new Set<string>();
    items.forEach((item) => {
      const d = item.department;
      if (d && d.trim()) depts.add(d.trim());
    });
    return Array.from(depts);
  }, [items]);

  const loadData = useCallback(() => {
    dispatch(fetchEmployeesThunk(filterParams));
    dispatch(fetchEmployeesSummaryThunk());
  }, [dispatch, filterParams]);

  useEffect(() => {
    loadData();
    if (canManage) {
      dispatch(fetchSupervisorsThunk());
      dispatch(fetchLocationsThunk({ isActive: true }));
    }
  }, [loadData, canManage, dispatch]);

  const handleOpenCreate = useCallback(() => {
    setSelectedEmployee(null);
    setFormMode('create');
    setFormOpen(true);
  }, []);

  const handleOpenEdit = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setFormMode('edit');
    setFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleOpenDetails = useCallback((employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsOpen(false);
    setSelectedEmployee(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: any) => {
    try {
      if (formMode === 'create') {
        const payload: CreateEmployeeRequest = {
          employeeCode: formData.employeeCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          firstNameAr: formData.firstNameAr || undefined,
          lastNameAr: formData.lastNameAr || undefined,
          firstNameEn: formData.firstNameEn || undefined,
          lastNameEn: formData.lastNameEn || undefined,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          departmentAr: formData.departmentAr || undefined,
          jobTitle: formData.jobTitle || undefined,
          jobTitleAr: formData.jobTitleAr || undefined,
          hireDate: formData.hireDate,
          supervisorId: formData.supervisorId || undefined,
          workLocationId: formData.workLocationId || undefined,
          createUserAccount: formData.createUserAccount,
          userRole: formData.createUserAccount ? formData.userRole : undefined,
          password: formData.createUserAccount && formData.password ? formData.password : undefined,
          photo: formData.photo || undefined,
        };
        await dispatch(createEmployeeThunk(payload)).unwrap();
        notify.success(t('EmployeeCreatedSuccess'));
      } else if (selectedEmployee) {
        const payload: UpdateEmployeeRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          firstNameAr: formData.firstNameAr !== undefined ? formData.firstNameAr : selectedEmployee.firstNameAr,
          lastNameAr: formData.lastNameAr !== undefined ? formData.lastNameAr : selectedEmployee.lastNameAr,
          firstNameEn: formData.firstNameEn || undefined,
          lastNameEn: formData.lastNameEn || undefined,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          departmentAr: formData.departmentAr !== undefined ? formData.departmentAr : selectedEmployee.departmentAr,
          jobTitle: formData.jobTitle || undefined,
          jobTitleAr: formData.jobTitleAr !== undefined ? formData.jobTitleAr : selectedEmployee.jobTitleAr,
          hireDate: formData.hireDate,
          supervisorId: formData.supervisorId !== undefined ? formData.supervisorId : null,
          workLocationId: formData.workLocationId !== undefined ? formData.workLocationId : null,
          userRole: formData.userRole || undefined,
          photo: formData.photo || undefined,
          removeProfilePhoto: formData.removeProfilePhoto,
        };
        const updated = await dispatch(
          updateEmployeeThunk({ id: selectedEmployee.id, data: payload })
        ).unwrap();

        if (formData.removeProfilePhoto || formData.photo) {
          broadcastPhotoInvalidation(selectedEmployee.profilePhoto);
        }

        if (currentUser?.employeeId === selectedEmployee.id || currentUser?.id === selectedEmployee.userId) {
          dispatch(updateUserProfile({ profilePhoto: updated.profilePhoto }));
        }

        notify.success(t('EmployeeUpdatedSuccess'));
      }
      setFormOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    }
  }, [dispatch, formMode, selectedEmployee, currentUser, t, loadData]);

  const handleToggleStatus = useCallback(async (employee: Employee) => {
    try {
      const currentStatus = employee.isActive;
      await dispatch(
        toggleEmployeeStatusThunk({
          id: employee.id,
          request: { isActive: !currentStatus },
        })
      ).unwrap();
      notify.success(
        !currentStatus ? t('EmployeeActivatedSuccess') : t('EmployeeDeactivatedSuccess')
      );
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    }
  }, [dispatch, t, loadData]);

  const handleOpenSingleDelete = useCallback((employee: Employee) => {
    setEmployeeToDelete(employee);
  }, []);

  const handleCloseSingleDelete = useCallback(() => {
    setEmployeeToDelete(null);
  }, []);

  const handleConfirmSingleDelete = useCallback(async () => {
    if (!employeeToDelete) return;
    try {
      setIsDeleting(true);
      await dispatch(deleteEmployeeThunk(employeeToDelete.id)).unwrap();
      if (employeeToDelete.profilePhoto) {
        broadcastPhotoInvalidation(employeeToDelete.profilePhoto);
      }
      notify.success(t('EmployeeDeletedSuccess'));
      setSelectedIds((prev) => prev.filter((id) => id !== employeeToDelete.id));
      setEmployeeToDelete(null);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, employeeToDelete, t, loadData]);

  const handleOpenBulkDelete = useCallback(() => {
    if (selectedIds.length > 0) {
      setBulkDeleteOpen(true);
    }
  }, [selectedIds.length]);

  const handleCloseBulkDelete = useCallback(() => {
    setBulkDeleteOpen(false);
  }, []);

  const handleConfirmBulkDelete = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      setIsDeleting(true);
      items
        .filter((emp) => selectedIds.includes(emp.id) && emp.profilePhoto)
        .forEach((emp) => broadcastPhotoInvalidation(emp.profilePhoto));
      await dispatch(bulkDeleteEmployeesThunk(selectedIds)).unwrap();
      notify.success(t('EmployeesBulkDeletedSuccess'));
      setSelectedIds([]);
      setBulkDeleteOpen(false);
      loadData();
    } catch (err: any) {
      notify.error(err || t('ErrorOccurred'));
    } finally {
      setIsDeleting(false);
    }
  }, [dispatch, selectedIds, items, t, loadData]);

  const handleExportCsv = useCallback(() => {
    if (items.length === 0) {
      notify.error(t('NoRecordsFound'));
      return;
    }
    const headers = [
      t('EmployeeCode'),
      t('FullName'),
      t('Email'),
      t('PhoneNumber'),
      t('Department'),
      t('JobTitle'),
      t('Supervisor'),
      t('WorkLocation'),
      t('Status'),
      t('HireDate'),
    ];

    const rows = items.map((emp) => [
      emp.employeeCode,
      emp.fullName,
      emp.email,
      emp.phoneNumber || '',
      emp.department || '',
      emp.jobTitle || '',
      emp.supervisorName || '',
      emp.workLocationName || '',
      emp.isActive ? t('Active') : t('Inactive'),
      emp.hireDate ? emp.hireDate.split('T')[0] : '',
    ]);

    const csvContent =
      '\uFEFF' +
      [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [items, t]);

  return {
    items,
    supervisors,
    summary,
    summaryLoading,
    totalCount,
    currentPage,
    pageSize,
    loading,
    actionLoading,
    locations,
    departments,
    canManage,
    isSuperAdmin,
    formOpen,
    formMode,
    selectedEmployee,
    detailsOpen,
    selectedIds,
    setSelectedIds,
    employeeToDelete,
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

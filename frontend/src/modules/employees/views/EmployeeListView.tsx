"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { notify } from "@/shared/services/notification.service";
import { RoleNames } from "@/shared/constants/roles";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import {
  fetchEmployeesThunk,
  fetchSupervisorsThunk,
  createEmployeeThunk,
  updateEmployeeThunk,
  toggleEmployeeStatusThunk,
  setFilterParams,
  resetFilters,
} from "../slices/employee.slice";
import { EmployeeFilters } from "../components/EmployeeFilters";
import { EmployeeTable } from "../components/EmployeeTable";
import { EmployeeFormDialog } from "../components/EmployeeFormDialog";
import { EmployeeDetailsDialog } from "../components/EmployeeDetailsDialog";
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from "../types";

export const EmployeeListView: React.FC = () => {
  const t = useTranslations();
  const dispatch = useAppDispatch();

  const { roles } = useAppSelector((state) => state.auth);
  const {
    items,
    supervisors,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    loading,
    actionLoading,
    filterParams,
  } = useAppSelector((state) => state.employees);

  const canManage = useMemo(
    () => roles?.includes(RoleNames.SuperAdmin) || roles?.includes(RoleNames.Admin) || false,
    [roles]
  );

  const isSupervisorOnly = useMemo(
    () => roles?.includes(RoleNames.Supervisor) && !canManage,
    [roles, canManage]
  );

  const isSuperAdmin = useMemo(
    () => roles?.includes(RoleNames.SuperAdmin) || false,
    [roles]
  );

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Departments list for filter dropdown
  const departments = useMemo(() => {
    const depts = new Set<string>();
    items.forEach((item) => {
      const d = item.department;
      if (d && d.trim()) depts.add(d.trim());
    });
    return Array.from(depts);
  }, [items]);

  const loadEmployees = useCallback(() => {
    dispatch(fetchEmployeesThunk(filterParams));
  }, [dispatch, filterParams]);

  useEffect(() => {
    loadEmployees();
    if (canManage) {
      dispatch(fetchSupervisorsThunk());
    }
  }, [loadEmployees, canManage, dispatch]);

  const handleSearchChange = (search: string) => {
    dispatch(setFilterParams({ search, page: 1 }));
  };

  const handleDepartmentChange = (department: string) => {
    dispatch(setFilterParams({ department, page: 1 }));
  };

  const handleIsActiveChange = (isActive: boolean | undefined) => {
    dispatch(setFilterParams({ isActive, page: 1 }));
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setFilterParams({ page }));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handleOpenCreate = () => {
    setSelectedEmployee(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleOpenDetails = (employee: Employee) => {
    setSelectedEmployee(employee);
    setDetailsOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formMode === "create") {
        const payload: CreateEmployeeRequest = {
          employeeCode: formData.employeeCode,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          jobTitle: formData.jobTitle || undefined,
          hireDate: formData.hireDate,
          supervisorId: formData.supervisorId || undefined,
          createUserAccount: formData.createUserAccount,
          userRole: formData.createUserAccount ? formData.userRole : undefined,
          password: formData.createUserAccount && formData.password ? formData.password : undefined,
          photo: formData.photo || undefined,
        };
        await dispatch(createEmployeeThunk(payload)).unwrap();
        notify.success(t("EmployeeCreatedSuccess"));
      } else if (selectedEmployee) {
        const payload: UpdateEmployeeRequest = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phoneNumber: formData.phoneNumber || undefined,
          department: formData.department || undefined,
          jobTitle: formData.jobTitle || undefined,
          hireDate: formData.hireDate,
          supervisorId: formData.supervisorId !== undefined ? formData.supervisorId : null,
          userRole: formData.userRole || undefined,
          photo: formData.photo || undefined,
          removeProfilePhoto: formData.removeProfilePhoto,
        };
        await dispatch(
          updateEmployeeThunk({ id: selectedEmployee.id, data: payload })
        ).unwrap();
        notify.success(t("EmployeeUpdatedSuccess"));
      }
      setFormOpen(false);
      loadEmployees();
    } catch (err: any) {
      notify.error(err || "Operation failed.");
    }
  };

  const handleToggleStatus = async (employee: Employee) => {
    try {
      const currentStatus = employee.isActive;
      await dispatch(
        toggleEmployeeStatusThunk({
          id: employee.id,
          request: { isActive: !currentStatus },
        })
      ).unwrap();
      notify.success(
        !currentStatus ? t("EmployeeActivatedSuccess") : t("EmployeeDeactivatedSuccess")
      );
      loadEmployees();
    } catch (err: any) {
      notify.error(err || "Status toggle failed.");
    }
  };

  return (
    <PageContainer title={t("EmployeeManagement")} description={t("EmployeesSubtitle")}>
      <Breadcrumb
        title={t("Employees")}
        items={[
          { title: t("Dashboard"), to: "/" },
          { title: t("Workforce"), to: "/employees" },
        ]}
      />

      <Box sx={{ mt: 3 }}>
        {/* Header Summary & Action */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h5" fontWeight={700}>
                {t("EmployeeManagement")}
              </Typography>
              {isSupervisorOnly && (
                <Chip size="small" color="info" label={t("AssignedEmployeesOnly")} />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t("EmployeesSubtitle")}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<IconRefresh size={18} />}
              onClick={loadEmployees}
              disabled={loading}
            >
              {t("Refresh")}
            </Button>
            {canManage && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<IconPlus size={18} />}
                onClick={handleOpenCreate}
              >
                {t("AddNewEmployee")}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Filter Controls */}
        <EmployeeFilters
          search={filterParams.search || ""}
          onSearchChange={handleSearchChange}
          department={filterParams.department || ""}
          onDepartmentChange={handleDepartmentChange}
          isActive={filterParams.isActive}
          onIsActiveChange={handleIsActiveChange}
          departments={departments}
          onReset={handleResetFilters}
        />

        {/* Employees Table */}
        <EmployeeTable
          employees={items}
          loading={loading}
          canManage={canManage}
          onView={handleOpenDetails}
          onEdit={handleOpenEdit}
          onToggleStatus={handleToggleStatus}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {/* Create / Edit Form Dialog */}
      <EmployeeFormDialog
        open={formOpen}
        mode={formMode}
        employee={selectedEmployee}
        isSubmitting={actionLoading}
        isSuperAdmin={isSuperAdmin}
        departments={departments}
        supervisors={supervisors}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
      />

      {/* View Details Dialog */}
      <EmployeeDetailsDialog
        open={detailsOpen}
        employee={selectedEmployee}
        canManage={canManage}
        onClose={() => setDetailsOpen(false)}
        onEdit={() => {
          setDetailsOpen(false);
          if (selectedEmployee) handleOpenEdit(selectedEmployee);
        }}
      />
    </PageContainer>
  );
};

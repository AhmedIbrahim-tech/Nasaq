"use client";

import React, { useState, useEffect, useContext } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { IconUser, IconCamera, IconTrash } from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { RoleNames } from "@/shared/constants/roles";
import { Router } from "@/lib/api/router";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import { toDateInputValue } from "@/shared/utils/i18nFormatters";
import { ProfilePhotoAvatar } from "@/shared/components/avatar";
import { CustomizerContext } from "@/theme/customizerContext";
import { SecondaryLanguageCheckbox } from "@/shared/components/forms/SecondaryLanguageCheckbox";
import type { WorkLocation } from "@/modules/locations";
import type { Employee, SupervisorLookup } from "../types";

interface EmployeeFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  employee: Employee | null;
  isSubmitting: boolean;
  isSuperAdmin: boolean;
  departments: string[];
  supervisors: SupervisorLookup[];
  locations?: WorkLocation[];
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}

export const EmployeeFormDialog: React.FC<EmployeeFormDialogProps> = ({
  open,
  mode,
  employee,
  isSubmitting,
  isSuperAdmin,
  departments,
  supervisors,
  locations = [],
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();

  const [formData, setFormData] = useState<{
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    department: string;
    jobTitle: string;
    hireDate: string;
    createUserAccount: boolean;
    userRole: string;
    password: string;
    supervisorId: string | null;
    workLocationId: string | null;
  }>({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    jobTitle: "",
    hireDate: toDateInputValue(new Date().toISOString()),
    createUserAccount: false,
    userRole: RoleNames.Employee,
    password: "",
    supervisorId: null,
    workLocationId: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [removePhotoRequested, setRemovePhotoRequested] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  useEffect(() => {
    if (mode === "edit" && employee) {
      setFormData({
        employeeCode: employee.employeeCode || "",
        firstName: employee.firstName || "",
        lastName: employee.lastName || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        department: employee.department || "",
        jobTitle: employee.jobTitle || "",
        hireDate: toDateInputValue(employee.hireDate) || toDateInputValue(new Date().toISOString()),
        createUserAccount: false,
        userRole: (employee.userRole || RoleNames.Employee) as any,
        password: "",
        supervisorId: employee.supervisorId || null,
        workLocationId: employee.workLocationId || null,
      });
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError(null);
      setRemovePhotoRequested(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } else {
      setFormData({
        employeeCode: "",
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        department: "",
        jobTitle: "",
        hireDate: toDateInputValue(new Date().toISOString()),
        createUserAccount: false,
        userRole: RoleNames.Employee,
        password: "",
        supervisorId: null,
        workLocationId: null,
      });
      if (photoPreview && photoPreview.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhoto(null);
      setPhotoPreview(null);
      setPhotoError(null);
      setRemovePhotoRequested(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    setErrors({});
  }, [mode, employee, open]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setPhotoError(t("InvalidImageFile"));
      return;
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setPhotoError(t("ProfilePhotoHint"));
      return;
    }

    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setRemovePhotoRequested(false);
  };

  const handleRemovePhoto = () => {
    if (photoPreview && photoPreview.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhoto(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setRemovePhotoRequested(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (mode === "create" && !formData.employeeCode.trim()) {
      newErrors.employeeCode = t("EmployeeCodeRequired");
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = t("FirstNameRequired");
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t("LastNameRequired");
    }
    if (!formData.email.trim()) {
      newErrors.email = t("EmailRequired");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = t("InvalidEmail");
    }
    if (!formData.hireDate) {
      newErrors.hireDate = t("HireDateRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "create") {
      await onSubmit({ ...formData, photo });
    } else {
      await onSubmit({
        ...formData,
        photo,
        removeProfilePhoto: removePhotoRequested,
      });
    }
  };

  const allowedRoles = isSuperAdmin
    ? [RoleNames.Employee, RoleNames.Supervisor, RoleNames.Admin, RoleNames.SuperAdmin]
    : [RoleNames.Employee, RoleNames.Supervisor, RoleNames.Admin];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          maxHeight: "calc(100% - 64px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 2.5,
          flexShrink: 0,
        }}
      >
        <Typography component="div" variant="h6" fontWeight={700}>
          {mode === "create" ? t("AddNewEmployee") : t("EditEmployee")}
        </Typography>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
          <Grid container spacing={2.5}>
            {/* Optional Profile Photo Selector */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 2,
                  border: "1px dashed",
                  borderColor: photoError ? "error.main" : "divider",
                  borderRadius: 2,
                  bgcolor: "action.hover",
                }}
              >
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems="center">
                  <ProfilePhotoAvatar
                    src={photoPreview}
                    photoId={removePhotoRequested ? null : (mode === "edit" ? employee?.profilePhoto : null)}
                    name={formData.firstName || formData.lastName ? `${formData.firstName} ${formData.lastName}` : (employee?.fullName || undefined)}
                    size={80}
                    colorScheme="soft"
                    sx={{
                      border: "2px solid",
                      borderColor: "divider",
                    }}
                  />

                  <Box sx={{ flexGrow: 1, textAlign: { xs: "center", sm: "start" } }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {t("ProfilePhoto")}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                      {t("ProfilePhotoHint")}
                    </Typography>

                    {(() => {
                      const hasActivePhoto = Boolean(
                        photo || (mode === "edit" && employee?.profilePhoto && !removePhotoRequested)
                      );
                      return (
                        <Stack direction="row" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }}>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/jpg"
                            onChange={handlePhotoSelect}
                            style={{ display: "none" }}
                          />
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<IconCamera size={16} />}
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {hasActivePhoto ? t("ChangePhoto") : t("SelectProfilePhoto")}
                          </Button>
                          {hasActivePhoto && (
                            <Button
                              size="small"
                              color="error"
                              variant="text"
                              startIcon={<IconTrash size={16} />}
                              onClick={handleRemovePhoto}
                            >
                              {t("RemovePhoto")}
                            </Button>
                          )}
                        </Stack>
                      );
                    })()}

                    {photoError && (
                      <Typography variant="caption" color="error" display="block" sx={{ mt: 1 }}>
                        {photoError}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Box>
            </Grid>

            {/* Employee Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("EmployeeCode")}
                required
                disabled={mode === "edit"}
                value={formData.employeeCode}
                onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                error={Boolean(errors.employeeCode)}
                helperText={errors.employeeCode}
              />
            </Grid>

            {/* Email */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="email"
                label={t("Email")}
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={Boolean(errors.email)}
                helperText={errors.email}
              />
            </Grid>

            {/* First Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("FirstName")}
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
              />
            </Grid>

            {/* Last Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("LastName")}
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
              />
            </Grid>

            {/* Phone Number */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("PhoneNumber")}
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                slotProps={{
                  htmlInput: {
                    dir: "ltr",
                    placeholder: "+966 50 000 0000",
                  },
                }}
              />
            </Grid>

            {/* Hire Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label={t("HireDate")}
                required
                InputLabelProps={{ shrink: true }}
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                error={Boolean(errors.hireDate)}
                helperText={errors.hireDate}
              />
            </Grid>

            {/* Department */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("Department")}
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </Grid>

            {/* Job Title */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("JobTitle")}
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
              />
            </Grid>

            {/* Direct Supervisor Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label={t("DirectSupervisor")}
                value={formData.supervisorId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, supervisorId: e.target.value ? e.target.value : null })
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) => {
                    if (!selected) return <em>{t("UnassignedSupervisor")}</em>;
                    const found = supervisors.find((s) => s.id === selected);
                    return found ? `${found.fullName} (${found.employeeCode})` : selected;
                  },
                }}
              >
                <MenuItem value="">
                  <em>{t("UnassignedSupervisor")}</em>
                </MenuItem>
                {supervisors
                  .filter((s) => !employee || s.id !== employee.id)
                  .map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.fullName} ({s.employeeCode}) {s.role ? `— ${s.role}` : ""}
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            {/* Work Location Selection */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label={t("WorkLocation")}
                value={formData.workLocationId || ""}
                onChange={(e) =>
                  setFormData({ ...formData, workLocationId: e.target.value ? e.target.value : null })
                }
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected: any) => {
                    if (!selected) return <em>{t("UnassignedLocation")}</em>;
                    const found = locations.find((l) => l.id === selected);
                    return found ? found.name : selected;
                  },
                }}
              >
                <MenuItem value="">
                  <em>{t("UnassignedLocation")}</em>
                </MenuItem>
                {locations.map((loc) => (
                  <MenuItem key={loc.id} value={loc.id}>
                    {loc.name} {!loc.isActive ? `(${t("Inactive")})` : ""}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Role & User Account Section */}
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
                {t("AccountAndSecurity")}
              </Typography>
            </Grid>

            {mode === "create" ? (
              <>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.createUserAccount}
                        onChange={(e) =>
                          setFormData({ ...formData, createUserAccount: e.target.checked })
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {t("CreateUserAccount")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {t("CreateUserAccountDesc")}
                        </Typography>
                      </Box>
                    }
                  />
                </Grid>

                {formData.createUserAccount && (
                  <>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        select
                        fullWidth
                        label={t("SystemRole")}
                        value={formData.userRole}
                        onChange={(e) => setFormData({ ...formData, userRole: e.target.value as any })}
                      >
                        {allowedRoles.map((role) => (
                          <MenuItem key={role} value={role}>
                            {t(role)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        type="password"
                        label={t("TemporaryPassword")}
                        placeholder={t("TemporaryPasswordHint")}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        helperText={t("TemporaryPasswordHint")}
                      />
                    </Grid>
                  </>
                )}
              </>
            ) : (
              // Edit mode role assignment
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label={t("SystemRole")}
                  value={formData.userRole}
                  onChange={(e) => setFormData({ ...formData, userRole: e.target.value as any })}
                >
                  {allowedRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      {t(role)}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 1.5, flex: "0 0 auto", flexShrink: 0, borderTop: 1, borderColor: "divider" }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} /> : null}
          >
            {mode === "create" ? t("CreateEmployee") : t("SaveEmployee")}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

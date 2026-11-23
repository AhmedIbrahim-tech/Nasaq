"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Alert from "@mui/material/Alert";
import { IconUserCheck, IconCalendarTime, IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@mui/material/styles";
import { getEmployeeDisplayName, getEmployeeDepartment } from "@/modules/employees/utils/employeeLocalization";
import { getScheduleDisplayName } from "../utils/scheduleLocalization";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import { useAssignScheduleForm } from "../hooks";
import type { WorkSchedule, AssignEmployeeScheduleRequest } from "../types";
import type { Employee } from "@/modules/employees/types";

interface AssignScheduleDialogProps {
  open: boolean;
  employees: Employee[];
  schedules: WorkSchedule[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: AssignEmployeeScheduleRequest) => Promise<void>;
}

export const AssignScheduleDialog: React.FC<AssignScheduleDialogProps> = ({
  open,
  employees,
  schedules,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const {
    formData,
    setFormData,
    errors,
    handleSubmit,
  } = useAssignScheduleForm({ open, schedules, onSubmit });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconUserCheck size={24} color="#1976d2" />
          <Typography component="div" variant="h6" fontWeight={700}>
            {t("AssignScheduleToEmployee")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12 }}>
              <Alert severity="info" icon={<IconInfoCircle size={20} />}>
                {t("AssignmentConflictWarningNotice")}
              </Alert>
            </Grid>

            {/* Employee Selection */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required error={Boolean(errors.employeeId)}>
                <InputLabel>{t("SelectEmployee")}</InputLabel>
                <Select
                  value={formData.employeeId}
                  label={t("SelectEmployee")}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                >
                  {employees
                    .filter((e) => e.isActive)
                    .map((emp) => (
                      <MenuItem key={emp.id} value={emp.id}>
                        {getEmployeeDisplayName(emp, isRtl)} ({emp.employeeCode}) — {getEmployeeDepartment(emp, isRtl) || t("General")}
                      </MenuItem>
                    ))}
                </Select>
                {errors.employeeId && <FormHelperText>{errors.employeeId}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Schedule Selection */}
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required error={Boolean(errors.workScheduleId)}>
                <InputLabel>{t("SelectSchedule")}</InputLabel>
                <Select
                  value={formData.workScheduleId}
                  label={t("SelectSchedule")}
                  onChange={(e) => setFormData({ ...formData, workScheduleId: e.target.value })}
                >
                  {schedules
                    .filter((s) => s.isActive)
                    .map((sch) => (
                      <MenuItem key={sch.id} value={sch.id}>
                        {getScheduleDisplayName(sch, isRtl)} {sch.isDefault ? `(${t("Default")})` : ""}
                      </MenuItem>
                    ))}
                </Select>
                {errors.workScheduleId && <FormHelperText>{errors.workScheduleId}</FormHelperText>}
              </FormControl>
            </Grid>

            {/* Effective From */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("EffectiveFromDate")}
                required
                type="date"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.effectiveFrom}
                onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                error={Boolean(errors.effectiveFrom)}
                helperText={errors.effectiveFrom}
              />
            </Grid>

            {/* Effective To */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("EffectiveToDateOptional")}
                type="date"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.effectiveTo}
                onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
                error={Boolean(errors.effectiveTo)}
                helperText={errors.effectiveTo || t("LeaveEmptyForOpenEnded")}
              />
            </Grid>

            {/* Notes */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("Notes")}
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t("AssignmentNotesPlaceholder")}
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
          <Button onClick={onClose} variant="outlined" color="error" disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {t("AssignSchedule")}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

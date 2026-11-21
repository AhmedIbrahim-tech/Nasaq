"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { IconClock, IconMoon, IconSun, IconAlertCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import type { WorkShift, CreateShiftRequest, UpdateShiftRequest } from "../types";

interface ShiftFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  shift: WorkShift | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateShiftRequest | UpdateShiftRequest) => Promise<void>;
}

export const ShiftFormDialog: React.FC<ShiftFormDialogProps> = ({
  open,
  mode,
  shift,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();

  const [formData, setFormData] = useState<{
    name: string;
    startTime: string;
    endTime: string;
    isOvernight: boolean;
    earlyStartTime: string;
    onTimeStartTime: string;
    lateStartTime: string;
    cutoffTime: string;
    notes: string;
    isActive: boolean;
  }>({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    isOvernight: false,
    earlyStartTime: "07:30",
    onTimeStartTime: "09:00",
    lateStartTime: "09:30",
    cutoffTime: "12:00",
    notes: "",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && shift) {
      setFormData({
        name: shift.name || "",
        startTime: shift.startTime?.substring(0, 5) || "09:00",
        endTime: shift.endTime?.substring(0, 5) || "17:00",
        isOvernight: shift.isOvernight ?? false,
        earlyStartTime: shift.earlyStartTime?.substring(0, 5) || "",
        onTimeStartTime: shift.onTimeStartTime?.substring(0, 5) || "",
        lateStartTime: shift.lateStartTime?.substring(0, 5) || "",
        cutoffTime: shift.cutoffTime?.substring(0, 5) || "",
        notes: shift.notes || "",
        isActive: shift.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        startTime: "09:00",
        endTime: "17:00",
        isOvernight: false,
        earlyStartTime: "07:30",
        onTimeStartTime: "09:00",
        lateStartTime: "09:30",
        cutoffTime: "12:00",
        notes: "",
        isActive: true,
      });
    }
    setErrors({});
  }, [mode, shift, open]);

  // Compute overnight state & estimated duration
  const isAutoOvernight = formData.endTime <= formData.startTime && formData.startTime !== "" && formData.endTime !== "";
  const effectiveOvernight = formData.isOvernight || isAutoOvernight;

  const calculateHours = (): number => {
    if (!formData.startTime || !formData.endTime || formData.startTime === formData.endTime) return 0;
    const [sH, sM] = formData.startTime.split(":").map(Number);
    const [eH, eM] = formData.endTime.split(":").map(Number);
    const startMins = sH * 60 + sM;
    const endMins = eH * 60 + eM;

    if (effectiveOvernight) {
      return (24 * 60 - startMins + endMins) / 60;
    }
    return (endMins - startMins) / 60;
  };

  const durationHours = calculateHours();

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("ShiftNameRequired");
    } else if (formData.name.length > 150) {
      newErrors.name = t("ShiftNameMaxLength");
    }

    if (!formData.startTime) {
      newErrors.startTime = t("StartTimeRequired");
    }

    if (!formData.endTime) {
      newErrors.endTime = t("EndTimeRequired");
    }

    if (formData.startTime && formData.endTime && formData.startTime === formData.endTime) {
      newErrors.endTime = t("StartAndEndSameError");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateShiftRequest = {
      name: formData.name.trim(),
      startTime: formData.startTime,
      endTime: formData.endTime,
      isOvernight: effectiveOvernight,
      earlyStartTime: formData.earlyStartTime || null,
      onTimeStartTime: formData.onTimeStartTime || null,
      lateStartTime: formData.lateStartTime || null,
      cutoffTime: formData.cutoffTime || null,
      notes: formData.notes.trim() || null,
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  };

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
          {effectiveOvernight ? (
            <IconMoon size={24} color="#7b1fa2" />
          ) : (
            <IconSun size={24} color="#f57c00" />
          )}
          <Typography component="div" variant="h6" fontWeight={700}>
            {mode === "create" ? t("AddNewShift") : t("EditShift")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
          <Grid container spacing={2.5}>
            {/* Shift Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("ShiftName")}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder={t("ShiftNamePlaceholder")}
              />
            </Grid>

            {/* Start Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("StartTime")}
                required
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                error={Boolean(errors.startTime)}
                helperText={errors.startTime}
              />
            </Grid>

            {/* End Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("EndTime")}
                required
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                error={Boolean(errors.endTime)}
                helperText={errors.endTime}
              />
            </Grid>

            {/* Overnight & Duration Banner */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: effectiveOvernight ? "secondary.light" : "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  {effectiveOvernight ? <IconMoon size={20} color="#7b1fa2" /> : <IconClock size={20} />}
                  <Typography variant="body2" fontWeight={600}>
                    {effectiveOvernight ? t("OvernightShiftNotice") : t("DayShiftNotice")}
                  </Typography>
                </Stack>
                <Chip
                  label={`${durationHours.toFixed(1)} ${t("HoursUnit")}`}
                  color={effectiveOvernight ? "secondary" : "primary"}
                  size="small"
                  variant="filled"
                />
              </Box>
            </Grid>

            {/* Arrival Windows Section Header */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>
                {t("ArrivalWindowsAndCutoff")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {t("ArrivalWindowsHelper")}
              </Typography>
            </Grid>

            {/* Early Start Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("EarlyArrivalStart")}
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.earlyStartTime}
                onChange={(e) => setFormData({ ...formData, earlyStartTime: e.target.value })}
                helperText={t("EarlyArrivalStartHelper")}
              />
            </Grid>

            {/* On-Time Start Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("OnTimeArrivalStart")}
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.onTimeStartTime}
                onChange={(e) => setFormData({ ...formData, onTimeStartTime: e.target.value })}
                helperText={t("OnTimeArrivalStartHelper")}
              />
            </Grid>

            {/* Late Start Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("LateArrivalThreshold")}
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.lateStartTime}
                onChange={(e) => setFormData({ ...formData, lateStartTime: e.target.value })}
                helperText={t("LateArrivalThresholdHelper")}
              />
            </Grid>

            {/* Cutoff Time */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("AttendanceCutoffTime")}
                type="time"
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.cutoffTime}
                onChange={(e) => setFormData({ ...formData, cutoffTime: e.target.value })}
                helperText={t("AttendanceCutoffTimeHelper")}
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
                placeholder={t("ShiftNotesPlaceholder")}
              />
            </Grid>

            {/* IsActive Switch */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {t("ShiftActiveStatus")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("ShiftActiveStatusDesc")}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      color="primary"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
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
            {mode === "create" ? t("CreateShift") : t("SaveChanges")}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

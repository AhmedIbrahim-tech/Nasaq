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
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import { IconCalendarTime, IconCheck, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import type {
  WorkSchedule,
  WorkShift,
  CreateScheduleRequest,
  UpdateScheduleRequest,
  ScheduleDayInput,
} from "../types";

interface ScheduleFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  schedule: WorkSchedule | null;
  shifts: WorkShift[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateScheduleRequest | UpdateScheduleRequest) => Promise<void>;
}

const DAYS_OF_WEEK = [
  { day: 0, key: "Sunday" },
  { day: 1, key: "Monday" },
  { day: 2, key: "Tuesday" },
  { day: 3, key: "Wednesday" },
  { day: 4, key: "Thursday" },
  { day: 5, key: "Friday" },
  { day: 6, key: "Saturday" },
];

export const ScheduleFormDialog: React.FC<ScheduleFormDialogProps> = ({
  open,
  mode,
  schedule,
  shifts,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    days: Record<number, { isWorkingDay: boolean; workShiftId: string }>;
  }>({
    name: "",
    description: "",
    isDefault: false,
    isActive: true,
    days: {},
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const defaultShiftId = shifts.length > 0 ? shifts[0].id : "";

    if (mode === "edit" && schedule) {
      const daysMap: Record<number, { isWorkingDay: boolean; workShiftId: string }> = {};
      schedule.days.forEach((d) => {
        daysMap[d.dayOfWeek] = {
          isWorkingDay: d.isWorkingDay,
          workShiftId: d.workShiftId || defaultShiftId,
        };
      });

      setFormData({
        name: schedule.name || "",
        description: schedule.description || "",
        isDefault: schedule.isDefault ?? false,
        isActive: schedule.isActive ?? true,
        days: daysMap,
      });
    } else {
      // Default: Sunday-Thursday working, Friday & Saturday off
      const initialDays: Record<number, { isWorkingDay: boolean; workShiftId: string }> = {};
      DAYS_OF_WEEK.forEach(({ day }) => {
        const isWork = day !== 5 && day !== 6;
        initialDays[day] = {
          isWorkingDay: isWork,
          workShiftId: isWork ? defaultShiftId : "",
        };
      });

      setFormData({
        name: "",
        description: "",
        isDefault: false,
        isActive: true,
        days: initialDays,
      });
    }
    setErrors({});
  }, [mode, schedule, open, shifts]);

  const handleDayToggle = (day: number) => {
    setFormData((prev) => {
      const current = prev.days[day] || { isWorkingDay: false, workShiftId: "" };
      const nextWorking = !current.isWorkingDay;
      const defaultShiftId = shifts.length > 0 ? shifts[0].id : "";
      return {
        ...prev,
        days: {
          ...prev.days,
          [day]: {
            isWorkingDay: nextWorking,
            workShiftId: nextWorking ? (current.workShiftId || defaultShiftId) : "",
          },
        },
      };
    });
  };

  const handleDayShiftChange = (day: number, shiftId: string) => {
    setFormData((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [day]: {
          ...prev.days[day],
          workShiftId: shiftId,
        },
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("ScheduleNameRequired");
    } else if (formData.name.length > 150) {
      newErrors.name = t("ScheduleNameMaxLength");
    }

    // Check that every working day has a selected shift
    let hasWorkingDayWithoutShift = false;
    Object.entries(formData.days).forEach(([_, config]) => {
      if (config.isWorkingDay && !config.workShiftId) {
        hasWorkingDayWithoutShift = true;
      }
    });

    if (hasWorkingDayWithoutShift) {
      newErrors.days = t("AllWorkingDaysRequireShift");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const daysPayload: ScheduleDayInput[] = DAYS_OF_WEEK.map(({ day }) => {
      const config = formData.days[day] || { isWorkingDay: false, workShiftId: "" };
      return {
        dayOfWeek: day,
        isWorkingDay: config.isWorkingDay,
        workShiftId: config.isWorkingDay ? config.workShiftId : null,
      };
    });

    const payload: CreateScheduleRequest = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      isDefault: formData.isDefault,
      isActive: formData.isActive,
      days: daysPayload,
    };

    await onSubmit(payload);
  };

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
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconCalendarTime size={24} color="#1976d2" />
          <Typography component="div" variant="h6" fontWeight={700}>
            {mode === "create" ? t("AddNewSchedule") : t("EditSchedule")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", overflowX: "hidden", minHeight: 0 }}>
          <Grid container spacing={2.5} sx={{ width: "100%", m: 0, "& > .MuiGrid-root": { pt: 2.5, pl: { xs: 0, sm: 2.5 } } }}>
            {/* Schedule Name */}
            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                label={t("ScheduleName")}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder={t("ScheduleNamePlaceholder")}
              />
            </Grid>

            {/* IsDefault Switch */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  height: "100%",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {t("DefaultSchedule")}
                </Typography>
                <Switch
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  color="primary"
                />
              </Box>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("Description")}
                multiline
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t("ScheduleDescriptionPlaceholder")}
              />
            </Grid>

            {/* Days Table */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                {t("WeeklyDaysConfiguration")}
              </Typography>
              {errors.days && (
                <Typography variant="caption" color="error" sx={{ display: "block", mb: 1 }}>
                  {errors.days}
                </Typography>
              )}

              <TableContainer component={Paper} variant="outlined" sx={{ width: "100%", overflowX: "hidden" }}>
                <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "22%", fontWeight: 700 }}>{t("Day")}</TableCell>
                      <TableCell sx={{ width: "28%", fontWeight: 700 }}>{t("WorkingDayStatus")}</TableCell>
                      <TableCell sx={{ width: "50%", fontWeight: 700 }}>{t("AssignedShift")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {DAYS_OF_WEEK.map(({ day, key }) => {
                      const dayConfig = formData.days[day] || { isWorkingDay: false, workShiftId: "" };
                      const selectedShift = shifts.find((s) => s.id === dayConfig.workShiftId);

                      return (
                        <TableRow key={day} hover>
                          <TableCell sx={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {t(key)}
                          </TableCell>
                          <TableCell>
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={dayConfig.isWorkingDay}
                                  onChange={() => handleDayToggle(day)}
                                  color="success"
                                />
                              }
                              label={
                                <Chip
                                  size="small"
                                  label={dayConfig.isWorkingDay ? t("WorkDay") : t("DayOff")}
                                  color={dayConfig.isWorkingDay ? "success" : "default"}
                                  variant="outlined"
                                  sx={{ fontSize: "0.75rem", height: 22 }}
                                />
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {dayConfig.isWorkingDay ? (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <FormControl size="small" fullWidth sx={{ minWidth: 0 }}>
                                  <Select
                                    value={dayConfig.workShiftId}
                                    onChange={(e) => handleDayShiftChange(day, e.target.value)}
                                    displayEmpty
                                    sx={{
                                      "& .MuiSelect-select": {
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        fontSize: "0.85rem",
                                      },
                                    }}
                                  >
                                    {shifts.map((s) => (
                                      <MenuItem key={s.id} value={s.id}>
                                        {s.name} ({s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                                        {s.isOvernight ? " 🌙" : ""})
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                                {selectedShift && (
                                  <Chip
                                    size="small"
                                    label={`${selectedShift.durationHours}h`}
                                    color="primary"
                                    variant="filled"
                                    sx={{ flexShrink: 0, height: 22, fontSize: "0.75rem" }}
                                  />
                                )}
                              </Stack>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {t("NoShiftAssignedDayOff")}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
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
                    {t("ScheduleActiveStatus")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("ScheduleActiveStatusDesc")}
                  </Typography>
                </Box>
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  color="primary"
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
            {mode === "create" ? t("CreateSchedule") : t("SaveChanges")}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

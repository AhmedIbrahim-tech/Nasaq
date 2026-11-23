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
import { SecondaryLanguageCheckbox } from "@/shared/components/forms/SecondaryLanguageCheckbox";
import { getShiftDisplayName } from "../utils/scheduleLocalization";
import { useScheduleForm } from "../hooks";
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

  const {
    formData,
    setFormData,
    errors,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    handleDayToggle,
    handleShiftChange: handleDayShiftChange,
    handleSubmit,
    daysOfWeek: DAYS_OF_WEEK,
  } = useScheduleForm({ mode, schedule, shifts, open, onSubmit });

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
            {/* Primary Schedule Name */}
            {isAr ? (
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label={t("ScheduleName")}
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  error={Boolean(errors.nameAr)}
                  helperText={errors.nameAr}
                  placeholder={t("ScheduleNamePlaceholder")}
                />
              </Grid>
            ) : (
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label={t("ScheduleName")}
                  required
                  value={formData.nameEn || formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      nameEn: e.target.value,
                      name: e.target.value,
                    })
                  }
                  error={Boolean(errors.nameEn || errors.name)}
                  helperText={errors.nameEn || errors.name}
                  placeholder={t("ScheduleNamePlaceholder")}
                />
              </Grid>
            )}

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

            {/* Primary Description */}
            {isAr ? (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("Description")}
                  multiline
                  rows={2}
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  placeholder={t("ScheduleDescriptionPlaceholder")}
                />
              </Grid>
            ) : (
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label={t("Description")}
                  multiline
                  rows={2}
                  value={formData.descriptionEn || formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      descriptionEn: e.target.value,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("ScheduleDescriptionPlaceholder")}
                />
              </Grid>
            )}

            {/* Secondary Language Checkbox */}
            <Grid size={{ xs: 12 }}>
              <SecondaryLanguageCheckbox
                checked={showSecondaryLanguage}
                onChange={(checked: boolean) => setShowSecondaryLanguage(checked)}
                isRtl={isAr}
                customLabel={isAr ? "إضافة البيانات باللغة الإنجليزية" : "Add Arabic Details"}
              />
            </Grid>

            {/* Secondary Schedule Name & Description */}
            {showSecondaryLanguage && (
              isAr ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("NameEn")}
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Weekly Standard 5-Day Schedule"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("DescriptionEn")}
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="e.g. Sunday to Thursday with Friday and Saturday off"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("NameAr")}
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: جدول العمل الأسبوعي القياسي (5 أيام)"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("DescriptionAr")}
                      value={formData.descriptionAr}
                      onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                      placeholder="مثال: أيام العمل من الأحد إلى الخميس مع راحة يومي الجمعة والسبت"
                    />
                  </Grid>
                </>
              )
            )}

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
                                        {getShiftDisplayName(s, isAr)} ({s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
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

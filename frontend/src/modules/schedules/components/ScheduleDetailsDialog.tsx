"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";
import { formatDateTime } from "@/shared/utils/i18nFormatters";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import {
  IconCalendarTime,
  IconClock,
  IconUsers,
  IconCalendar,
  IconEdit,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { WorkSchedule } from "../types";

interface ScheduleDetailsDialogProps {
  open: boolean;
  schedule: WorkSchedule | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
}

const DAYS_NAMES: Record<number, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
};

export const ScheduleDetailsDialog: React.FC<ScheduleDetailsDialogProps> = ({
  open,
  schedule,
  canManage,
  onClose,
  onEdit,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  if (!schedule) return null;

  const workingDays = schedule.days?.filter((d) => d.isWorkingDay) || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle component="div" sx={{ pb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: schedule.isActive ? "primary.light" : "action.hover",
                color: schedule.isActive ? "primary.main" : "text.secondary",
                display: "flex",
              }}
            >
              <IconCalendarTime size={24} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography component="div" variant="h6" fontWeight={700}>
                  {schedule.name}
                </Typography>
                {schedule.isDefault && (
                  <Chip size="small" label={t("Default")} color="info" variant="filled" />
                )}
              </Stack>
              <Typography variant="caption" color="text.secondary">
                {t("WorkScheduleDetails")}
              </Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={schedule.isActive ? t("Active") : t("Inactive")}
              color={schedule.isActive ? "success" : "default"}
            />
            <DialogCloseButton onClose={onClose} size="small" />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={2.5}>
          {/* Quick Metrics */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconClock size={20} color="#1976d2" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("WorkingDaysCount")}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {workingDays.length} / 7 {t("DaysUnit")}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            <Grid size={{ xs: 6, sm: 4 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconUsers size={20} color="#2e7d32" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t("AssignedEmployees")}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {schedule.assignedEmployeesCount || 0}
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {schedule.description && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {t("Description")}
                </Typography>
                <Typography variant="body2">{schedule.description}</Typography>
              </Grid>
            )}
          </Grid>

          <Divider />

          {/* 7 Days Table */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("WeeklyDaysConfiguration")}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width="25%">{t("Day")}</TableCell>
                    <TableCell width="25%">{t("Status")}</TableCell>
                    <TableCell width="30%">{t("Shift")}</TableCell>
                    <TableCell width="20%">{t("WorkingHours")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {schedule.days?.map((day) => (
                    <TableRow key={day.id} hover>
                      <TableCell sx={{ fontWeight: 600 }}>
                        {t(DAYS_NAMES[day.dayOfWeek] || "Day")}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={day.isWorkingDay ? t("WorkDay") : t("DayOff")}
                          color={day.isWorkingDay ? "success" : "default"}
                          variant={day.isWorkingDay ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell>
                        {day.isWorkingDay && day.shiftName ? (
                          <Typography variant="body2" fontWeight={500}>
                            {day.shiftName} {day.isOvernight ? "🌙" : ""}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {day.isWorkingDay && day.startTime && day.endTime ? (
                          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                            {day.startTime.substring(0, 5)} - {day.endTime.substring(0, 5)} (
                            {day.durationHours}h)
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          <Divider />

          {/* Audit Info */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("AuditInformation")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconCalendar size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("CreatedDate")}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(schedule.created_Utc, isRtl)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconClock size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("UpdatedDate")}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(schedule.updated_Utc, isRtl)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.5, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
        <Button onClick={onClose} variant="outlined" color="error">
          {t("Close")}
        </Button>
        {canManage && (
          <Button
            onClick={() => {
              onClose();
              onEdit();
            }}
            variant="contained"
            color="primary"
            startIcon={<IconEdit size={16} />}
          >
            {t("Edit")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

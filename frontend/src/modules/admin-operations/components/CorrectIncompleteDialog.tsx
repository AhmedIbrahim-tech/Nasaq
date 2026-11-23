"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import { IconClockCheck, IconClock, IconUser } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { formatDateTime } from "@/shared/utils/i18nFormatters";
import { getLocalizedEmployeeName } from "@/shared/utils/localization";
import type { AttendanceRecord } from "../types";

interface CorrectIncompleteDialogProps {
  open: boolean;
  record: AttendanceRecord | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string, manualCheckOutTimeUtc: string, reason: string) => Promise<void>;
}

export const CorrectIncompleteDialog: React.FC<CorrectIncompleteDialogProps> = ({
  open,
  record,
  loading,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [checkOutTime, setCheckOutTime] = useState("");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const toLocalDatetimeInput = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  useEffect(() => {
    if (record) {
      const checkInDate = new Date(record.checkInTimeUtc);
      const now = new Date();
      // Default to 8 hours after checkin or current time, capped at now
      const targetTime = checkInDate.getTime() + 8 * 60 * 60 * 1000;
      const defaultOut = new Date(targetTime < now.getTime() ? targetTime : now.getTime());
      setCheckOutTime(toLocalDatetimeInput(defaultOut));
      setReason("");
      setTouched(false);
    }
  }, [record]);

  if (!record) return null;

  const checkInDate = new Date(record.checkInTimeUtc);
  const selectedOutDate = checkOutTime ? new Date(checkOutTime) : null;
  const isTimeValid = selectedOutDate != null && selectedOutDate.getTime() > checkInDate.getTime();
  const isTimeNotInFuture = selectedOutDate != null && selectedOutDate.getTime() <= Date.now() + 5 * 60 * 1000;
  const isReasonValid = reason.trim().length >= 3;
  const isValid = isTimeValid && isTimeNotInFuture && isReasonValid;

  const durationMinutes =
    selectedOutDate && isTimeValid
      ? Math.round((selectedOutDate.getTime() - checkInDate.getTime()) / 60000)
      : 0;
  const durationHours = (durationMinutes / 60).toFixed(1);

  const handleConfirm = async () => {
    setTouched(true);
    if (!isValid || !selectedOutDate) return;
    await onConfirm(record.id, selectedOutDate.toISOString(), reason.trim());
    setReason("");
    setTouched(false);
  };

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setTouched(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <IconClockCheck size={22} color="primary" />
        {t("CorrectIncomplete")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            {t("CorrectIncompleteConfirm")}
          </Alert>

          {/* Record Summary */}
          <Box
            sx={{
              p: 2,
              borderRadius: "8px",
              bgcolor: (theme) => theme.palette.action.hover,
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack spacing={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <IconUser size={18} />
                <Typography variant="subtitle2" fontWeight={600}>
                  {getLocalizedEmployeeName(record, isRtl)} ({record.employeeCode})
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconClock size={18} />
                <Typography variant="body2" color="text.secondary">
                  {t("OriginalCheckInTime")}:{" "}
                  <Typography component="span" variant="body2" fontWeight={600} color="text.primary">
                    {formatDateTime(record.checkInTimeUtc, isRtl)}
                  </Typography>
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* Manual Checkout Time */}
          <TextField
            fullWidth
            type="datetime-local"
            size="small"
            label={
              <span>
                {t("ManualCheckOutTime")} <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
              </span>
            }
            value={checkOutTime}
            onChange={(e) => setCheckOutTime(e.target.value)}
            error={touched && (!isTimeValid || !isTimeNotInFuture)}
            helperText={
              touched && !isTimeValid
                ? t("CheckOutBeforeCheckIn")
                : touched && !isTimeNotInFuture
                ? t("CheckOutCannotBeInFuture")
                : durationMinutes > 0
                ? `${durationHours}h (${durationMinutes} min)`
                : undefined
            }
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />

          {/* Mandatory Reason */}
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label={
              <span>
                {t("CorrectionReason")} <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
              </span>
            }
            placeholder={t("CorrectionReasonPlaceholder") || t("ReasonPlaceholder")}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (!touched) setTouched(true);
            }}
            error={touched && !isReasonValid}
            helperText={touched && !isReasonValid ? t("CorrectionReasonPlaceholder") : undefined}
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 1.5 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit" sx={{ fontWeight: 600 }}>
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconClockCheck size={18} />}
          sx={{ borderRadius: "8px", px: 2.5, fontWeight: 600 }}
        >
          {t("CorrectIncomplete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

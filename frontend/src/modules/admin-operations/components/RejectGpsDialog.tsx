"use client";

import React, { useState } from "react";
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
import { IconX, IconAlertTriangle, IconUser, IconClock } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  formatDateTime,
  formatGeofenceFailureReason,
} from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord } from "../types";

interface RejectGpsDialogProps {
  open: boolean;
  record: AttendanceRecord | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
}

export const RejectGpsDialog: React.FC<RejectGpsDialogProps> = ({
  open,
  record,
  loading,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  if (!record) return null;

  const isValid = reason.trim().length >= 3;

  const handleConfirm = async () => {
    setTouched(true);
    if (!isValid) return;
    await onConfirm(record.id, reason.trim());
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
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1, color: "error.main" }}>
        <IconAlertTriangle size={22} />
        {t("RejectGps")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="warning" sx={{ borderRadius: "8px" }}>
            {t("RejectGpsConfirm")}
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
                  {record.employeeName} ({record.employeeCode})
                </Typography>
              </Box>

              <Box display="flex" alignItems="center" gap={1}>
                <IconClock size={18} />
                <Typography variant="body2" color="text.secondary">
                  {t("OriginalCheckInTime")}:{" "}
                  <Box component="span" sx={{ direction: "ltr", display: "inline-block" }}>
                    {formatDateTime(record.checkInTimeUtc, isRtl)}
                  </Box>
                </Typography>
              </Box>

              {record.checkInFailureReason && (
                <Typography variant="caption" color="error.main" fontWeight={600}>
                  {formatGeofenceFailureReason(record.checkInFailureReason, isRtl)}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Mandatory Rejection Reason */}
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            size="small"
            label={
              <span>
                {t("RejectionReason")} <span style={{ color: "red" }}>*</span>
              </span>
            }
            placeholder={t("ReasonPlaceholder")}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (!touched) setTouched(true);
            }}
            error={touched && !isValid}
            helperText={touched && !isValid ? t("ReasonPlaceholder") : undefined}
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconX size={18} />}
          sx={{ borderRadius: "8px", px: 2.5 }}
        >
          {t("RejectGps")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

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
import { alpha, useTheme } from "@mui/material/styles";
import { IconCheck, IconX, IconMapPin, IconClock, IconUser } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import {
  formatDateTime,
  formatDistance,
  formatGeofenceFailureReason,
} from "@/shared/utils/i18nFormatters";
import type { AttendanceRecord } from "../types";

interface ApproveGpsDialogProps {
  open: boolean;
  record: AttendanceRecord | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (id: string, reviewNotes?: string) => Promise<void>;
}

export const ApproveGpsDialog: React.FC<ApproveGpsDialogProps> = ({
  open,
  record,
  loading,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [reviewNotes, setReviewNotes] = useState("");

  if (!record) return null;

  const handleConfirm = async () => {
    await onConfirm(record.id, reviewNotes.trim() || undefined);
    setReviewNotes("");
  };

  const handleClose = () => {
    if (loading) return;
    setReviewNotes("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <IconCheck size={22} color="green" />
        {t("ApproveGps")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            {t("ApproveGpsConfirm")}
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
                  <span>{formatDateTime(record.checkInTimeUtc, isRtl)}</span>
                </Typography>
              </Box>

              {record.workLocationName && (
                <Box display="flex" alignItems="center" gap={1}>
                  <IconMapPin size={18} />
                  <Typography variant="body2" color="text.secondary">
                    {record.workLocationName}
                    {record.checkInDistanceMeters != null &&
                      ` (${formatDistance(record.checkInDistanceMeters, isRtl)})`}
                  </Typography>
                </Box>
              )}

              {record.checkInFailureReason && (
                <Typography variant="caption" color="warning.main" fontWeight={600}>
                  {formatGeofenceFailureReason(record.checkInFailureReason, isRtl)}
                </Typography>
              )}
            </Stack>
          </Box>

          {/* Optional Review Notes */}
          <TextField
            fullWidth
            multiline
            rows={3}
            size="small"
            label={t("ReviewNotes")}
            placeholder={t("ReviewNotesPlaceholder")}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
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
          color="success"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
          sx={{ borderRadius: "8px", px: 2.5 }}
        >
          {t("ApproveGps")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

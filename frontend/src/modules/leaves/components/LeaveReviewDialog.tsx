"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { LeaveRequest } from "../types";

interface LeaveReviewDialogProps {
  open: boolean;
  onClose: () => void;
  leaveRequest: LeaveRequest | null;
  mode: "approve" | "reject";
  onApprove: (id: string, notes?: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  isLoading?: boolean;
}

export const LeaveReviewDialog: React.FC<LeaveReviewDialogProps> = ({
  open,
  onClose,
  leaveRequest,
  mode,
  onApprove,
  onReject,
  isLoading = false,
}) => {
  const t = useTranslations();
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNotes("");
      setErrorMsg(null);
    }
  }, [open]);

  if (!leaveRequest) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (mode === "reject" && !notes.trim()) {
      setErrorMsg(t("RejectionReasonRequired"));
      return;
    }

    try {
      if (mode === "approve") {
        await onApprove(leaveRequest.id, notes.trim() || undefined);
      } else {
        await onReject(leaveRequest.id, notes.trim());
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || t("ErrorReviewingLeaveRequest"));
    }
  };

  const isApprove = mode === "approve";

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: { xs: "calc(100% - 20px)", sm: "calc(100% - 64px)" },
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
        <DialogTitle sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: isApprove ? "success.light" : "error.light",
                color: isApprove ? "success.main" : "error.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {isApprove ? <IconCircleCheck size={20} /> : <IconCircleX size={20} />}
            </Box>
            <Typography variant="h6" component="span" fontWeight={600}>
              {isApprove ? t("ApproveLeave") : t("RejectLeave")}
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflowY: "auto", flex: "1 1 auto" }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}

          <Alert severity={isApprove ? "info" : "warning"} sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {leaveRequest.employeeName} ({leaveRequest.employeeCode})
            </Typography>
            <Typography variant="body2">
              {leaveRequest.leaveTypeName} • {leaveRequest.startDate} - {leaveRequest.endDate} ({leaveRequest.daysCount} {t("Days")})
            </Typography>
          </Alert>

          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              <span>
                {isApprove ? t("ReviewNotes") : t("RejectionReason")}{" "}
                {!isApprove && (
                  <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                )}
              </span>
            }
            placeholder={
              isApprove
                ? t("ReviewNotesPlaceholder")
                : t("RejectionReasonPlaceholder")
            }
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isLoading}
            autoFocus
          />
        </DialogContent>

        <DialogActions
          sx={{
            flex: "0 0 auto",
            flexShrink: 0,
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={isApprove ? "success" : "error"}
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isApprove ? t("Approve") : t("Reject")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

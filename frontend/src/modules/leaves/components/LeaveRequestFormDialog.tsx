"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { IconUpload, IconFile, IconX, IconCalendarPlus } from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import type { LeaveType, SubmitLeaveRequestData } from "../types";

interface LeaveRequestFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitLeaveRequestData) => Promise<void>;
  leaveTypes: LeaveType[];
  isLoading?: boolean;
}

export const LeaveRequestFormDialog: React.FC<LeaveRequestFormDialogProps> = ({
  open,
  onClose,
  onSubmit,
  leaveTypes,
  isLoading = false,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  const [leaveTypeId, setLeaveTypeId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Selected leave type details
  const selectedType = leaveTypes.find((lt) => lt.id === leaveTypeId);

  useEffect(() => {
    if (open) {
      setLeaveTypeId(leaveTypes[0]?.id || "");
      const today = new Date().toISOString().split("T")[0];
      setStartDate(today);
      setEndDate(today);
      setReason("");
      setAttachment(null);
      setErrorMsg(null);
    }
  }, [open, leaveTypes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg(t("FileSizeLimit10MB"));
        return;
      }
      setAttachment(file);
      setErrorMsg(null);
    }
  };

  const handleRemoveFile = () => {
    setAttachment(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!leaveTypeId) {
      setErrorMsg(t("LeaveTypeRequired"));
      return;
    }

    if (!startDate) {
      setErrorMsg(t("StartDateRequired"));
      return;
    }

    if (!endDate) {
      setErrorMsg(t("EndDateRequired"));
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg(t("InvalidDateRange"));
      return;
    }

    if (selectedType?.requiresAttachment && !attachment) {
      setErrorMsg(t("AttachmentRequired"));
      return;
    }

    try {
      await onSubmit({
        leaveTypeId,
        startDate,
        endDate,
        reason: reason.trim() || undefined,
        attachment,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || t("ErrorSubmittingLeaveRequest"));
    }
  };

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
        <DialogTitle sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1,
                bgcolor: "primary.light",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconCalendarPlus size={20} />
            </Box>
            <Typography variant="h6" component="span" fontWeight={600}>
              {t("RequestLeave")}
            </Typography>
          </Stack>
          <IconButton
            aria-label="close"
            onClick={onClose}
            disabled={isLoading}
            size="small"
            sx={{
              color: (theme) => theme.palette.error.main,
              bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.16),
              },
            }}
          >
            <IconX size={18} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3, overflowY: "auto", flex: "1 1 auto" }}>
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {errorMsg}
            </Alert>
          )}

          <Grid container spacing={2.5}>
            {/* Leave Type Select */}
            <Grid size={{ xs: 12 }}>
              <TextField
                select
                fullWidth
                label={
                  <span>
                    {t("LeaveType")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                value={leaveTypeId}
                onChange={(e) => setLeaveTypeId(e.target.value)}
                disabled={isLoading}
                SelectProps={{
                  renderValue: (selectedId: any) => {
                    const selected = leaveTypes.find((lt) => lt.id === selectedId);
                    if (!selected) return "";
                    return (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {isAr && selected.nameAr ? selected.nameAr : selected.name}
                        </Typography>
                        <Chip
                          label={selected.isPaid ? t("PaidLeave") : t("Unpaid")}
                          size="small"
                          color={selected.isPaid ? "success" : "default"}
                          variant="filled"
                          sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600, px: 0.5 }}
                        />
                        {selected.requiresAttachment && (
                          <Chip
                            label={t("RequiresAttachment")}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    );
                  },
                }}
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type.id} value={type.id}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", py: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {isAr && type.nameAr ? type.nameAr : type.name}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <Chip
                          label={type.isPaid ? t("PaidLeave") : t("Unpaid")}
                          size="small"
                          color={type.isPaid ? "success" : "default"}
                          variant="filled"
                          sx={{ height: 22, fontSize: "0.75rem", fontWeight: 600, px: 0.5 }}
                        />
                        {type.requiresAttachment && (
                          <Chip
                            label={t("RequiresAttachment")}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ height: 20, fontSize: "0.7rem", fontWeight: 500 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Start Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label={
                  <span>
                    {t("StartDate")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                InputLabelProps={{ shrink: true }}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* End Date */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label={
                  <span>
                    {t("EndDate")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                InputLabelProps={{ shrink: true }}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Reason */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("LeaveReason")}
                placeholder={t("LeaveReasonPlaceholder")}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Attachment File Input */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("Attachment")}
                {selectedType?.requiresAttachment && (
                  <span style={{ color: "var(--mui-palette-error-main, #d32f2f)", marginInlineStart: 4 }}>*</span>
                )}
              </Typography>

              {attachment ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    border: 1,
                    borderColor: "primary.light",
                    borderRadius: 1,
                    bgcolor: "primary.50",
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ overflow: "hidden" }}>
                    <IconFile size={20} color="var(--mui-palette-primary-main)" />
                    <Typography variant="body2" noWrap sx={{ maxWidth: 280 }}>
                      {attachment.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({(attachment.size / 1024).toFixed(0)} KB)
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    color="error"
                    onClick={handleRemoveFile}
                    startIcon={<IconX size={16} />}
                  >
                    {t("Remove")}
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<IconUpload size={20} />}
                  sx={{ py: 1.5, borderStyle: "dashed" }}
                  disabled={isLoading}
                >
                  {t("SelectAttachment")}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            flex: "0 0 auto",
            flexShrink: 0,
            px: 3,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
            sx={{ fontWeight: 600, px: 2.5 }}
          >
            {t("SubmitRequest")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

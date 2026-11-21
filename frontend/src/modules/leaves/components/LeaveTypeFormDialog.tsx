"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";
import { IconSettings, IconEdit, IconX } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type {
  LeaveType,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from "../types";

interface LeaveTypeFormDialogProps {
  open: boolean;
  onClose: () => void;
  leaveType: LeaveType | null;
  mode: "create" | "edit";
  onSubmitCreate: (data: CreateLeaveTypeRequest) => Promise<void>;
  onSubmitUpdate: (id: string, data: UpdateLeaveTypeRequest) => Promise<void>;
  isLoading?: boolean;
}

export const LeaveTypeFormDialog: React.FC<LeaveTypeFormDialogProps> = ({
  open,
  onClose,
  leaveType,
  mode,
  onSubmitCreate,
  onSubmitUpdate,
  isLoading = false,
}) => {
  const t = useTranslations();
  const isEdit = mode === "edit";

  const [name, setName] = useState<string>("");
  const [nameAr, setNameAr] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [requiresAttachment, setRequiresAttachment] = useState<boolean>(false);
  const [defaultDaysPerYear, setDefaultDaysPerYear] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (isEdit && leaveType) {
        setName(leaveType.name);
        setNameAr(leaveType.nameAr);
        setCode(leaveType.code);
        setDescription(leaveType.description || "");
        setIsPaid(leaveType.isPaid);
        setRequiresAttachment(leaveType.requiresAttachment);
        setDefaultDaysPerYear(
          leaveType.defaultDaysPerYear !== null && leaveType.defaultDaysPerYear !== undefined
            ? String(leaveType.defaultDaysPerYear)
            : ""
        );
      } else {
        setName("");
        setNameAr("");
        setCode("");
        setDescription("");
        setIsPaid(true);
        setRequiresAttachment(false);
        setDefaultDaysPerYear("");
      }
      setErrorMsg(null);
    }
  }, [open, isEdit, leaveType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg(t("NameRequired"));
      return;
    }

    if (!nameAr.trim()) {
      setErrorMsg(t("ArabicNameRequired"));
      return;
    }

    if (!isEdit && !code.trim()) {
      setErrorMsg(t("CodeRequired"));
      return;
    }

    const days = defaultDaysPerYear.trim() ? parseInt(defaultDaysPerYear, 10) : null;

    try {
      if (isEdit && leaveType) {
        await onSubmitUpdate(leaveType.id, {
          name: name.trim(),
          nameAr: nameAr.trim(),
          description: description.trim() || null,
          isPaid,
          requiresAttachment,
          defaultDaysPerYear: days,
        });
      } else {
        await onSubmitCreate({
          name: name.trim(),
          nameAr: nameAr.trim(),
          code: code.trim().toUpperCase(),
          description: description.trim() || null,
          isPaid,
          requiresAttachment,
          defaultDaysPerYear: days,
        });
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || err.message || t("ErrorSavingLeaveType"));
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
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
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
              {isEdit ? <IconEdit size={20} /> : <IconSettings size={20} />}
            </Box>
            <Typography variant="h6" component="span" fontWeight={600}>
              {isEdit ? t("EditLeaveType") : t("CreateLeaveType")}
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
            {/* Arabic Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  <span>
                    {t("LeaveTypeNameAr")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                value={nameAr}
                onChange={(e) => setNameAr(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* English Name */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  <span>
                    {t("LeaveTypeName")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Code */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={
                  <span>
                    {t("LeaveTypeCode")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                disabled={isEdit || isLoading}
                helperText={isEdit ? t("CodeCannotBeChanged") : t("CodeUppercaseOnly")}
              />
            </Grid>

            {/* Default Days Per Year */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="number"
                label={t("DefaultDaysPerYear")}
                value={defaultDaysPerYear}
                onChange={(e) => setDefaultDaysPerYear(e.target.value)}
                disabled={isLoading}
                inputProps={{ min: 0, max: 365 }}
              />
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t("Description")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
              />
            </Grid>

            {/* Switches */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPaid}
                    onChange={(e) => setIsPaid(e.target.checked)}
                    disabled={isLoading}
                    color="success"
                  />
                }
                label={t("IsPaid")}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={requiresAttachment}
                    onChange={(e) => setRequiresAttachment(e.target.checked)}
                    disabled={isLoading}
                    color="warning"
                  />
                }
                label={t("RequiresAttachment")}
              />
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
          >
            {isEdit ? t("Save") : t("Create")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

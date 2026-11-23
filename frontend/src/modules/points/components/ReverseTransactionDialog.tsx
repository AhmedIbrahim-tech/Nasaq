"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import { IconArrowBackUp, IconAlertTriangle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import { useReverseTransactionForm } from "../hooks";
import type { PointTransaction } from "../types";

interface ReverseTransactionDialogProps {
  open: boolean;
  transaction: PointTransaction | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (transactionId: string, reason: string) => Promise<void>;
}

export const ReverseTransactionDialog: React.FC<ReverseTransactionDialogProps> = ({
  open,
  transaction,
  isSubmitting,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();

  const {
    reason,
    setReason,
    error,
    setError,
    handleSubmit,
  } = useReverseTransactionForm({ transaction, onConfirm });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
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
          <IconArrowBackUp size={24} color="#FA896B" />
          <Typography component="div" variant="h6" fontWeight={700}>
            {t("ReverseTransaction")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
        <Stack spacing={2}>
          <Alert severity="warning" icon={<IconAlertTriangle size={20} />}>
            {t("ReversalNoticeWarning")}
          </Alert>

          {transaction && (
            <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: 2 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("TargetTransaction")}:
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {transaction.reason} ({transaction.points > 0 ? `+${transaction.points}` : transaction.points} pts)
              </Typography>
            </Box>
          )}

          <TextField
            fullWidth
            required
            multiline
            rows={3}
            label={t("ReversalReason")}
            placeholder={t("ReversalReasonPlaceholder")}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            error={Boolean(error)}
            helperText={error}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
          {t("Cancel")}
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="error"
          disabled={isSubmitting}
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {t("ConfirmReversal")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

"use client";

import React, { useState, useEffect, useContext } from "react";
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
import { useTheme } from "@mui/material/styles";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { formatDateOnly, formatDaysCount } from "@/shared/utils/i18nFormatters";
import { useAppSelector } from "@/store/hooks";
import { CustomizerContext } from "@/theme/customizerContext";
import {
  getLocalizedEmployeeName,
  getLocalizedLeaveTypeName,
} from "@/shared/utils/localization";
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
  const theme = useTheme();
  const locale = useLocale();
  const customizer = useContext(CustomizerContext);
  const isRtl =
    customizer?.isLanguage === "ar" ||
    customizer?.activeDir === "rtl" ||
    theme.direction === "rtl" ||
    locale.startsWith("ar");
  const authUser = useAppSelector((state) => state.auth.user);
  const [notes, setNotes] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setNotes("");
      setErrorMsg(null);
    }
  }, [open]);

  if (!leaveRequest) return null;

  const isOwnRequest = Boolean(
    leaveRequest &&
      authUser &&
      ((authUser.employeeId && leaveRequest.employeeId && authUser.employeeId.toLowerCase() === leaveRequest.employeeId.toLowerCase()) ||
        (authUser.fullName && leaveRequest.employeeName && authUser.fullName.toLowerCase() === leaveRequest.employeeName.toLowerCase()) ||
        (authUser.email && leaveRequest.employeeName && authUser.email.toLowerCase().includes(leaveRequest.employeeName.toLowerCase())) ||
        (authUser.email && authUser.email.split("@")[0].toLowerCase() === leaveRequest.employeeName.toLowerCase()))
  );

  const localizeErrorMessage = (msg: string | null | undefined): string => {
    if (!msg) return t("ErrorReviewingLeaveRequest");
    const lower = msg.toLowerCase();
    if (
      lower.includes("cannot reject your own leave request") ||
      lower.includes("reject your own") ||
      lower.includes("cannot reject own") ||
      lower.includes("لا يمكنك رفض طلب الإجازة") ||
      msg.includes("لا يمكنك رفض طلب الإجازة")
    ) {
      return isRtl
        ? "لا يمكنك رفض طلب الإجازة الخاص بك. يرجى استخدام خيار الإلغاء بدلاً من ذلك."
        : "You cannot reject your own leave request. Use cancel instead.";
    }
    if (
      lower.includes("cannot approve your own leave request") ||
      lower.includes("approve your own") ||
      lower.includes("cannot approve own") ||
      lower.includes("لا يمكنك اعتماد طلب الإجازة") ||
      msg.includes("لا يمكنك اعتماد طلب الإجازة")
    ) {
      return isRtl
        ? "لا يمكنك اعتماد طلب الإجازة الخاص بك."
        : "You cannot approve your own leave request.";
    }
    if (lower.includes("not found") || msg.includes("غير موجود")) {
      return isRtl ? "طلب الإجازة غير موجود." : "Leave request not found.";
    }
    if (
      lower.includes("only pending requests can be rejected") ||
      lower.includes("only pending requests") ||
      lower.includes("cannot reject a request with status") ||
      lower.includes("cannot approve a request with status")
    ) {
      return isRtl
        ? "لا يمكن مراجعة هذا الطلب لأنه ليس في حالة قيد الانتظار."
        : "Only pending requests can be reviewed.";
    }
    if (
      lower.includes("authorized to review leave requests") ||
      lower.includes("authorized to review") ||
      lower.includes("authorized to approve")
    ) {
      return isRtl
        ? "أنت مصرح فقط بمراجعة طلبات الإجازة للموظفين التابعين لفريقك."
        : "You are only authorized to review leave requests for your assigned team members.";
    }
    return msg;
  };

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
      const raw = err.response?.data?.message || err.message;
      setErrorMsg(localizeErrorMessage(raw));
    }
  };

  const isApprove = mode === "approve";

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      dir={isRtl ? "rtl" : "ltr"}
      PaperProps={{
        sx: {
          direction: isRtl ? "rtl" : "ltr",
          textAlign: isRtl ? "right" : "left",
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
          {isOwnRequest && (
            <Alert
              severity="warning"
              dir={isRtl ? "rtl" : "ltr"}
              sx={{
                mb: 2,
                textAlign: isRtl ? "right" : "left",
                direction: isRtl ? "rtl" : "ltr",
              }}
            >
              {isRtl
                ? "لا يمكنك مراجعة أو رفض طلب الإجازة الخاص بك. يرجى استخدام خيار إلغاء الطلب بدلاً من ذلك."
                : "You cannot review or reject your own leave request. Please use the cancel option instead."}
            </Alert>
          )}

          {errorMsg && (
            <Alert
              severity="error"
              dir={isRtl ? "rtl" : "ltr"}
              sx={{
                mb: 2,
                textAlign: isRtl ? "right" : "left",
                direction: isRtl ? "rtl" : "ltr",
              }}
            >
              {errorMsg}
            </Alert>
          )}

          <Alert severity={isApprove ? "info" : "warning"} sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {getLocalizedEmployeeName(
                {
                  employeeName: leaveRequest.employeeName,
                  employeeNameAr: leaveRequest.employeeNameAr,
                },
                isRtl,
                leaveRequest.employeeName
              )}{" "}
              (
              <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
                {leaveRequest.employeeCode}
              </span>
              )
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.5,
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                flexWrap: "wrap",
                direction: isRtl ? "rtl" : "ltr",
              }}
            >
              <Typography component="span" variant="body2" fontWeight={600}>
                {getLocalizedLeaveTypeName(
                  {
                    leaveTypeName: leaveRequest.leaveTypeName,
                    leaveTypeNameAr: leaveRequest.leaveTypeNameAr,
                  },
                  isRtl,
                  isRtl ? "إجازة" : "Leave"
                )}
              </Typography>
              <span>({formatDaysCount(leaveRequest.daysCount, isRtl)})</span>
              <span>•</span>
              <span style={{ direction: "ltr", unicodeBidi: "isolate", display: "inline-block" }}>
                {formatDateOnly(leaveRequest.startDate, isRtl)} → {formatDateOnly(leaveRequest.endDate, isRtl)}
              </span>
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
            disabled={isLoading || isOwnRequest}
            startIcon={isLoading ? <CircularProgress size={18} color="inherit" /> : undefined}
          >
            {isApprove ? t("Approve") : t("Reject")}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

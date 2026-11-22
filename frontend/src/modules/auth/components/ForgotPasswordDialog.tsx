"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import { IconKey, IconCheck, IconSend } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { submitForgotPassword } from "../services/auth.service";

interface ForgotPasswordDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ForgotPasswordDialog: React.FC<ForgotPasswordDialogProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(isRtl ? "يرجى إدخال البريد الإلكتروني أو الرقم الوظيفي." : "Please enter your email or employee code.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const msg = await submitForgotPassword(identifier.trim());
      setSubmittedMessage(
        isRtl
          ? "إذا كانت البيانات المدخلة مطابقة لحساب مسجل في النظام، فقد تم إرسال طلب استعادة كلمة المرور بنجاح لمراجعة الإدارة. ستصلك كلمة المرور الجديدة على بريدك الإلكتروني بعد اعتماد الطلب."
          : msg
      );
    } catch (err: unknown) {
      setError(isRtl ? "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً." : "An error occurred while submitting your request.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIdentifier("");
    setSubmittedMessage(null);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              bgcolor: "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconKey size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isRtl ? "استعادة كلمة المرور" : "Forgot Password"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isRtl ? "طلب اعتماد إداري لتسليم كلمة مرور مؤقتة" : "Request administrative approval for a temporary password"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        {submittedMessage ? (
          <Alert severity="success" icon={<IconCheck size={20} />} sx={{ borderRadius: "12px" }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              {isRtl ? "تم استلام الطلب" : "Request Received"}
            </Typography>
            <Typography variant="body2">{submittedMessage}</Typography>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} id="forgot-password-form">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isRtl
                ? "أدخل بريدك الإلكتروني المسجل أو رقمك الوظيفي لطلب استعادة كلمة المرور. سيتم إرسال الطلب لمراجعة الإدارة."
                : "Enter your registered email address or employee code to request password recovery. The request will be submitted for administrator approval."}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
                {error}
              </Alert>
            )}

            <TextField
              label={isRtl ? "البريد الإلكتروني أو الرقم الوظيفي" : "Email or Employee Code"}
              placeholder={isRtl ? "name@domain.com أو EMP-1234" : "name@domain.com or EMP-1234"}
              fullWidth
              size="small"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {submittedMessage ? (
          <Button variant="contained" onClick={handleClose} sx={{ borderRadius: "8px", px: 3 }}>
            {isRtl ? "تم" : "Done"}
          </Button>
        ) : (
          <>
            <Button onClick={handleClose} color="inherit" disabled={loading} sx={{ borderRadius: "8px" }}>
              {isRtl ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              form="forgot-password-form"
              variant="contained"
              disabled={loading || !identifier.trim()}
              startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconSend size={18} />}
              sx={{ borderRadius: "8px", px: 3, fontWeight: 600 }}
            >
              {isRtl ? "إرسال الطلب" : "Submit Request"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

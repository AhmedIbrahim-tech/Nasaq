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
import { useTheme } from "@mui/material/styles";
import { IconKey, IconShieldLock, IconArrowRight, IconArrowLeft } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ChangePasswordDialog } from "@/modules/core/profile/components/ChangePasswordDialog";
import * as authService from "@/modules/auth/services/auth.service";
import type { ChangePasswordRequest } from "@/modules/auth/types";

interface TemporaryPasswordReminderDialogProps {
  open: boolean;
  onClose: () => void;
  onLater: () => void;
}

export const TemporaryPasswordReminderDialog: React.FC<TemporaryPasswordReminderDialogProps> = ({
  open,
  onClose,
  onLater,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);
  const [changeError, setChangeError] = useState<string | null>(null);

  const handleOpenChangePassword = () => {
    setChangeError(null);
    setChangePasswordOpen(true);
  };

  const handleSubmitPassword = async (data: ChangePasswordRequest) => {
    setChangeLoading(true);
    setChangeError(null);
    try {
      await authService.changePassword(data);
      setChangePasswordOpen(false);
      onClose();
    } catch (err: any) {
      setChangeError(
        err.response?.data?.message ||
          err.message ||
          (isRtl ? "تعذر تغيير كلمة المرور" : "Failed to change password")
      );
    } finally {
      setChangeLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={open && !changePasswordOpen}
        onClose={onLater}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "16px",
            p: 1,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                bgcolor: "warning.light",
                color: "warning.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconKey size={24} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {isRtl ? "تنبيه أمان — كلمة مرور مؤقتة" : "Security Notice — Temporary Password"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isRtl ? "توصية أمنية لحماية حسابك" : "Recommended action to secure your account"}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: isRtl ? "rgba(255, 174, 31, 0.08)" : "warning.lighter",
              border: "1px solid",
              borderColor: "warning.light",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
              {isRtl
                ? "أنت مسجل الدخول حالياً باستخدام كلمة مرور مؤقتة تم إنشاؤها لك. يُنصح بشدة بتعيين كلمة مرور شخصية جديدة الآن لضمان سرية حسابك."
                : "You are currently logged in with a temporary password. It is strongly recommended to set a personal permanent password now to ensure account privacy."}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {isRtl
              ? "يمكنك المتابعة بالضغط على «لاحقاً»، وسيتم تذكيرك مجدداً عند تسجيل الدخول القادم."
              : "You may continue by clicking 'Later', and you will be reminded again on your next login."}
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={onLater}
            sx={{ borderRadius: "8px", px: 2.5 }}
          >
            {isRtl ? "لاحقاً" : "Later"}
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleOpenChangePassword}
            startIcon={<IconShieldLock size={18} />}
            sx={{ borderRadius: "8px", px: 3, fontWeight: 600 }}
          >
            {isRtl ? "تغيير كلمة المرور الآن" : "Change Password Now"}
          </Button>
        </DialogActions>
      </Dialog>

      {changePasswordOpen && (
        <ChangePasswordDialog
          open={changePasswordOpen}
          onClose={() => setChangePasswordOpen(false)}
          onSubmit={handleSubmitPassword}
          isLoading={changeLoading}
          errorMessage={changeError}
        />
      )}
    </>
  );
};

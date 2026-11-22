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
import Chip from "@mui/material/Chip";
import { useTheme } from "@mui/material/styles";
import {
  IconMapPin,
  IconCurrentLocation,
  IconCheck,
  IconAlertCircle,
  IconBuildingSkyscraper,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { locationsService } from "../services/locations.service";
import { notify } from "@/shared/services/notification.service";

interface EmployeeLocationOnboardingDialogProps {
  open: boolean;
  onClose: () => void;
  onLater: () => void;
  onSuccess?: () => void;
}

export const EmployeeLocationOnboardingDialog: React.FC<EmployeeLocationOnboardingDialogProps> = ({
  open,
  onClose,
  onLater,
  onSuccess,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [addressDesc, setAddressDesc] = useState("");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CRITICAL RULE (Section 13): Geolocation is ONLY requested on explicit button click!
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(isRtl ? "خدمة تحديد الموقع غير مدعومة في متصفحك." : "Geolocation is not supported by your browser.");
      return;
    }

    setIsCapturingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsCapturingGps(false);
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        setIsCapturingGps(false);
        let msg = isRtl ? "تعذر تحديد الموقع الجغرافي." : "Failed to obtain GPS location.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = isRtl
            ? "تم رفض الإذن للوصول إلى الموقع. يرجى تفعيل إذن الموقع في المتصفح والمحاولة مجدداً."
            : "Location permission denied. Please allow location access in your browser settings.";
        } else if (error.code === error.TIMEOUT) {
          msg = isRtl ? "انتهت مهلة تحديد الموقع. يرجى المحاولة مرة أخرى." : "Location request timed out. Please try again.";
        }
        setGpsError(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleSubmit = async () => {
    if (!coords) return;

    try {
      setIsSubmitting(true);
      const result = await locationsService.registerPersonalLocation(
        coords.latitude,
        coords.longitude,
        coords.accuracy,
        addressDesc.trim() || undefined
      );

      if (result.hasApprovedLocation) {
        notify.success(
          isRtl
            ? "تم اعتماد موقعك تلقائياً لتطابقه مع موقع رسمي للشركة."
            : "Location approved automatically as it matches a registered company site."
        );
      } else {
        notify.info(
          isRtl
            ? "تم إرسال طلب تسجيل الموقع وهو قيد مراجعة الإدارة."
            : "Location registration submitted and is awaiting administrator review."
        );
      }

      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : isRtl ? "فشل تسجيل الموقع." : "Failed to register location.";
      notify.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onLater}
      maxWidth="sm"
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
              bgcolor: "primary.light",
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconMapPin size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {isRtl ? "تسجيل موقعك المعتمد للحضور" : "Register Approved Attendance Location"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isRtl ? "مطلوب لتسهيل التحقق التلقائي من الحضور والانصراف" : "Required for automatic attendance verification"}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ py: 2 }}>
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: "info.lighter",
            border: "1px solid",
            borderColor: "info.light",
            mb: 2.5,
          }}
        >
          <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
            {isRtl
              ? "يرجى تسجيل موقعك المعتمد لاستخدامه في التحقق من الحضور والانصراف. يمكنك تسجيل موقعك الحالي (مثل المنزل أو السكن). إذا كان موقعك مطابقاً لموقع رسمي للشركة سيتم اعتماده فوراً."
              : "Please register your preferred location for attendance verification. You can capture your current location (e.g. home or residence). If it matches an official company site, it will be approved automatically."}
          </Typography>
        </Box>

        {gpsError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {gpsError}
          </Alert>
        )}

        {!coords ? (
          <Box
            sx={{
              p: 3,
              borderRadius: "12px",
              border: "1.5px dashed",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "background.neutral",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {isRtl
                ? "اضغط على الزر أدناه لتحديد موقعك الجغرافي الحالي بدقة عبر المتصفح:"
                : "Click the button below to capture your current GPS location:"}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCaptureLocation}
              disabled={isCapturingGps}
              startIcon={
                isCapturingGps ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <IconCurrentLocation size={20} />
                )
              }
              sx={{ borderRadius: "8px", px: 3, py: 1 }}
            >
              {isCapturingGps
                ? isRtl ? "جارٍ تحديد الموقع..." : "Acquiring GPS..."
                : isRtl ? "تحديد موقعي الحالي" : "Capture My Location"}
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "success.lighter",
                border: "1px solid",
                borderColor: "success.light",
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <IconCheck size={20} color={theme.palette.success.main} />
                <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                  {isRtl ? "تم التقاط الإحداثيات بنجاح" : "Coordinates Captured Successfully"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Chip
                  size="small"
                  label={`Lat: ${coords.latitude.toFixed(6)}`}
                  sx={{ direction: "ltr", fontFamily: "monospace" }}
                />
                <Chip
                  size="small"
                  label={`Lon: ${coords.longitude.toFixed(6)}`}
                  sx={{ direction: "ltr", fontFamily: "monospace" }}
                />
                {coords.accuracy && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={coords.accuracy <= 50 ? "success" : "warning"}
                    label={`${isRtl ? "دقة:" : "Accuracy:"} ±${coords.accuracy.toFixed(0)}m`}
                  />
                )}
              </Stack>
              <Button
                size="small"
                color="inherit"
                onClick={handleCaptureLocation}
                disabled={isCapturingGps}
                startIcon={<IconCurrentLocation size={16} />}
                sx={{ mt: 1.5, textTransform: "none" }}
              >
                {isRtl ? "إعادة الالتقاط" : "Recapture"}
              </Button>
            </Box>

            <TextField
              label={isRtl ? "وصف الموقع (اختياري)" : "Location Description (Optional)"}
              placeholder={isRtl ? "مثال: المنزل، السكن، المكتب الشخصي" : "e.g. Home, Residence, Personal Office"}
              fullWidth
              size="small"
              value={addressDesc}
              onChange={(e) => setAddressDesc(e.target.value)}
              helperText={
                isRtl
                  ? "وصف يساعد الإدارة في تمييز موقعك المعتمد"
                  : "Helps administrators identify your registered location"
              }
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onLater}
          disabled={isSubmitting}
          sx={{ borderRadius: "8px", px: 2.5 }}
        >
          {isRtl ? "لاحقاً" : "Later"}
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!coords || isSubmitting}
          startIcon={
            isSubmitting ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <IconCheck size={18} />
            )
          }
          sx={{ borderRadius: "8px", px: 3, fontWeight: 600 }}
        >
          {isRtl ? "تأكيد وتسجيل الموقع" : "Confirm & Register Location"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

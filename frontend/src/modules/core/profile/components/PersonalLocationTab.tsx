"use client";

import React, { useState, useEffect, useCallback } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import {
  IconMapPin,
  IconCurrentLocation,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconX,
  IconRefresh,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { locationsService } from "@/modules/locations/services/locations.service";
import type { MyLocationStatus, EmployeeLocationRequest } from "@/modules/locations/types";
import { notify } from "@/shared/services/notification.service";

export const PersonalLocationTab: React.FC = () => {
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === "rtl";

  const [statusData, setStatusData] = useState<MyLocationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [isCapturingGps, setIsCapturingGps] = useState(false);
  const [newCoords, setNewCoords] = useState<{ latitude: number; longitude: number; accuracy?: number } | null>(null);
  const [newAddressDesc, setNewAddressDesc] = useState("");
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await locationsService.getMyPersonalLocation();
      setStatusData(data);
    } catch (err: unknown) {
      notify.error(isRtl ? "تعذر تحميل بيانات الموقع المعتمد." : "Failed to load location status.");
    } finally {
      setLoading(false);
    }
  }, [isRtl]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Handle capturing single-shot GPS on explicit user action
  const handleCaptureLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(isRtl ? "خدمة تحديد الموقع غير مدعومة." : "Geolocation is not supported.");
      return;
    }

    setIsCapturingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsCapturingGps(false);
        setNewCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      (err) => {
        setIsCapturingGps(false);
        setGpsError(
          err.code === err.PERMISSION_DENIED
            ? isRtl
              ? "تم رفض الإذن للوصول إلى الموقع في المتصفح."
              : "Location permission denied."
            : isRtl
            ? "تعذر تحديد الموقع الجغرافي."
            : "Failed to acquire GPS coordinates."
        );
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleSubmitChange = async () => {
    if (!newCoords) return;

    try {
      setIsSubmitting(true);
      if (statusData?.hasApprovedLocation) {
        // Request Change: current approved location remains active
        await locationsService.requestLocationChange(
          newCoords.latitude,
          newCoords.longitude,
          newCoords.accuracy,
          newAddressDesc.trim() || undefined
        );
        notify.success(
          isRtl
            ? "تم إرسال طلب تغيير الموقع بنجاح. يبقى موقعك الحالي نشطاً لحين مراجعة الطلب."
            : "Location change request submitted. Your current location remains active until reviewed."
        );
      } else {
        // First registration
        const res = await locationsService.registerPersonalLocation(
          newCoords.latitude,
          newCoords.longitude,
          newCoords.accuracy,
          newAddressDesc.trim() || undefined
        );
        if (res.hasApprovedLocation) {
          notify.success(
            isRtl
              ? "تم اعتماد موقعك تلقائياً لتطابقه مع موقع رسمي للشركة."
              : "Location approved automatically as it matches a company location."
          );
        } else {
          notify.info(
            isRtl
              ? "تم إرسال طلب تسجيل الموقع وهو قيد مراجعة الإدارة."
              : "Location request submitted and awaiting administrator review."
          );
        }
      }

      setChangeDialogOpen(false);
      setNewCoords(null);
      setNewAddressDesc("");
      fetchStatus();
    } catch (err: unknown) {
      notify.error(err instanceof Error ? err.message : isRtl ? "فشل إرسال الطلب." : "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!statusData?.pendingRequest) return;

    try {
      setIsCancelling(true);
      await locationsService.cancelLocationRequest(statusData.pendingRequest.id);
      notify.success(isRtl ? "تم إلغاء طلب الموقع بنجاح." : "Location request cancelled successfully.");
      setCancelDialogOpen(false);
      fetchStatus();
    } catch (err: unknown) {
      notify.error(isRtl ? "فشل إلغاء الطلب." : "Failed to cancel request.");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  const approved = statusData?.approvedLocation;
  const pending = statusData?.pendingRequest;
  const lastRejected = statusData?.lastRejectedRequest;

  return (
    <Stack spacing={3}>
      {/* 1. Pending Request Banner */}
      {pending && (
        <Alert
          severity="warning"
          icon={<IconClock size={20} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setCancelDialogOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              {isRtl ? "إلغاء الطلب" : "Cancel Request"}
            </Button>
          }
          sx={{ borderRadius: "12px", border: "1px solid", borderColor: "warning.light" }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {isRtl ? "طلب تسجيل موقع قيد المراجعة الإدارية" : "Location Request Awaiting Administrator Review"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {isRtl
              ? "طلبك المسجل قيد مراجعة الإدارة حالياً. إذا كان لديك موقع سابق معتمد، فإنه يظل سارياً ونشطاً لحين البت في هذا الطلب."
              : "Your submitted location is currently awaiting administrator review. If you have an existing approved location, it remains active."}
          </Typography>
        </Alert>
      )}

      {/* 2. Last Rejected Request Notice */}
      {!pending && lastRejected && lastRejected.rejectionReason && (
        <Alert
          severity="error"
          icon={<IconAlertTriangle size={20} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setChangeDialogOpen(true)}
              sx={{ fontWeight: 600 }}
            >
              {isRtl ? "تسجيل موقع جديد" : "Register New Location"}
            </Button>
          }
          sx={{ borderRadius: "12px", border: "1px solid", borderColor: "error.light" }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {isRtl ? "تم رفض طلب الموقع الأخير" : "Previous Location Request Rejected"}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {isRtl ? `سبب الرفض: ${lastRejected.rejectionReason}` : `Rejection Reason: ${lastRejected.rejectionReason}`}
          </Typography>
        </Alert>
      )}

      {/* 3. Approved Location Card */}
      <Card sx={{ borderRadius: "16px", boxShadow: theme.shadows[2] }}>
        <CardContent sx={{ p: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={2} sx={{ mb: 2.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "12px",
                  bgcolor: approved ? "success.lighter" : "background.neutral",
                  color: approved ? "success.main" : "text.secondary",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconMapPin size={24} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {isRtl ? "الموقع الجغرافي المعتمد" : "Approved Registered Location"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isRtl ? "يُستخدم للتحقق التلقائي عند تسجيل الحضور والانصراف" : "Used for automatic attendance verification"}
                </Typography>
              </Box>
            </Stack>

            {approved ? (
              <Chip
                label={isRtl ? "معتمد ونشط" : "Approved & Active"}
                color="success"
                icon={<IconCheck size={16} />}
                sx={{ fontWeight: 700 }}
              />
            ) : (
              <Chip
                label={isRtl ? "غير مسجل" : "Not Registered"}
                color="default"
                sx={{ fontWeight: 600 }}
              />
            )}
          </Stack>

          {approved ? (
            <Stack spacing={2}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: "12px",
                  bgcolor: "background.neutral",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {isRtl ? "وصف الموقع:" : "Location Description:"}
                </Typography>
                <Typography variant="subtitle1" fontWeight={700}>
                  {approved.addressDescription || (isRtl ? "الموقع الشخصي المعتمد" : "Personal Registered Location")}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Lat: ${approved.latitude.toFixed(6)}`}
                    sx={{ direction: "ltr", fontFamily: "monospace" }}
                  />
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Lon: ${approved.longitude.toFixed(6)}`}
                    sx={{ direction: "ltr", fontFamily: "monospace" }}
                  />
                  {approved.source && (
                    <Chip
                      size="small"
                      color="primary"
                      variant="filled"
                      label={approved.source}
                    />
                  )}
                </Stack>
              </Box>

              <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setChangeDialogOpen(true)}
                  disabled={!!pending}
                  startIcon={<IconMapPin size={18} />}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                >
                  {isRtl ? "طلب تغيير الموقع" : "Request Location Change"}
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Box sx={{ py: 3, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {isRtl
                  ? "لم تقم بتسجيل موقعك المعتمد بعد. يتيح لك تسجيل الموقع إمكانية التحقق التلقائي عند الحضور والانصراف دون الحاجة لمراجعة إدارية."
                  : "You have not registered an approved location yet. Registering your location enables automatic attendance verification."}
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setChangeDialogOpen(true)}
                disabled={!!pending}
                startIcon={<IconMapPin size={18} />}
                sx={{ borderRadius: "8px", px: 3, fontWeight: 600 }}
              >
                {isRtl ? "تسجيل موقعي المعتمد الآن" : "Register Approved Location Now"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Capture / Request Location */}
      <Dialog
        open={changeDialogOpen}
        onClose={() => setChangeDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {approved
              ? isRtl ? "طلب تغيير الموقع المعتمد" : "Request Location Change"
              : isRtl ? "تسجيل الموقع المعتمد" : "Register Approved Location"}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ py: 2 }}>
          {gpsError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
              {gpsError}
            </Alert>
          )}

          {!newCoords ? (
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
                  ? "اضغط على الزر لتحديد موقعك الحالي بدقة عبر نظام GPS:"
                  : "Click below to acquire your current GPS coordinates:"}
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
                sx={{ borderRadius: "8px" }}
              >
                {isCapturingGps
                  ? isRtl ? "جارٍ التحديد..." : "Acquiring..."
                  : isRtl ? "تحديد موقعي الحالي" : "Capture Current Location"}
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
                <Typography variant="subtitle2" fontWeight={700} color="success.dark" sx={{ mb: 1 }}>
                  {isRtl ? "تم التقاط الإحداثيات بنجاح" : "Coordinates Captured"}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={`Lat: ${newCoords.latitude.toFixed(6)}`} sx={{ direction: "ltr" }} />
                  <Chip size="small" label={`Lon: ${newCoords.longitude.toFixed(6)}`} sx={{ direction: "ltr" }} />
                </Stack>
                <Button
                  size="small"
                  onClick={handleCaptureLocation}
                  disabled={isCapturingGps}
                  sx={{ mt: 1, textTransform: "none" }}
                >
                  {isRtl ? "إعادة الالتقاط" : "Recapture"}
                </Button>
              </Box>

              <TextField
                label={isRtl ? "وصف الموقع (اختياري)" : "Description (Optional)"}
                placeholder={isRtl ? "مثال: المنزل، السكن" : "e.g. Home, Apartment"}
                fullWidth
                size="small"
                value={newAddressDesc}
                onChange={(e) => setNewAddressDesc(e.target.value)}
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setChangeDialogOpen(false)} color="inherit">
            {isRtl ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitChange}
            disabled={!newCoords || isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} color="inherit" />}
          >
            {isRtl ? "إرسال الطلب" : "Submit Request"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: Confirm Cancel Request */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            {isRtl ? "إلغاء طلب الموقع" : "Cancel Location Request"}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            {isRtl
              ? "هل أنت متأكد من رغبتك في إلغاء طلب تسجيل/تغيير الموقع المعلق؟"
              : "Are you sure you want to cancel the pending location request?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setCancelDialogOpen(false)} color="inherit">
            {isRtl ? "تراجع" : "Back"}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmCancel}
            disabled={isCancelling}
          >
            {isRtl ? "تأكيد الإلغاء" : "Confirm Cancel"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

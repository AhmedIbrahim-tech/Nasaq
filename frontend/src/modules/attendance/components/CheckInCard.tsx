"use client";

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import {
  IconMapPin,
  IconClockCheck,
  IconClockOff,
  IconCurrentLocation,
  IconAlertTriangle,
  IconShieldCheck,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { CurrentAttendanceStatus, CheckInRequest, CheckOutRequest } from "../types";

interface CheckInCardProps {
  status: CurrentAttendanceStatus | null;
  isLoading: boolean;
  onCheckIn: (req: CheckInRequest) => Promise<void>;
  onCheckOut: (req: CheckOutRequest) => Promise<void>;
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
  status,
  isLoading,
  onCheckIn,
  onCheckOut,
}) => {
  const theme = useTheme();
  const t = useTranslations();

  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const acquireLocation = () => {
    if (!navigator.geolocation) {
      setGpsError(t("GeolocationNotSupported"));
      return;
    }

    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setIsLocating(false);
      },
      (err) => {
        setGpsError(err.message || t("GeolocationError"));
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  useEffect(() => {
    acquireLocation();
  }, []);

  const handleAction = async () => {
    setActionLoading(true);
    setActionError(null);

    try {
      if (status?.isCheckedIn) {
        await onCheckOut({
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          accuracyMeters: coords?.accuracy ?? null,
          notes: notes.trim() || null,
          deviceInfo: navigator.userAgent.substring(0, 150),
        });
      } else {
        await onCheckIn({
          latitude: coords?.lat ?? null,
          longitude: coords?.lng ?? null,
          accuracyMeters: coords?.accuracy ?? null,
          notes: notes.trim() || null,
          deviceInfo: navigator.userAgent.substring(0, 150),
        });
      }
      setNotes("");
    } catch (err: any) {
      setActionError(err.message || t("AttendanceActionFailed"));
    } finally {
      setActionLoading(false);
    }
  };

  const isCheckedIn = Boolean(status?.isCheckedIn);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <Box
        sx={{
          p: 3,
          bgcolor: isCheckedIn
            ? theme.palette.mode === "dark"
              ? "rgba(19, 222, 185, 0.08)"
              : "#e8f8f5"
            : theme.palette.mode === "dark"
            ? "rgba(93, 135, 255, 0.08)"
            : "#eff4ff",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            {isCheckedIn ? (
              <IconClockCheck size={28} color="#13DEB9" />
            ) : (
              <IconClockOff size={28} color="#5D87FF" />
            )}
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {isCheckedIn ? t("CurrentlyCheckedIn") : t("ReadyToCheckIn")}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isCheckedIn
                  ? `${t("CheckedInAt")}: ${status?.activeAttendance?.checkInTimeUtc ? new Date(status.activeAttendance.checkInTimeUtc).toLocaleTimeString() : "--:--"}`
                  : t("RecordYourDailyAttendance")}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={isCheckedIn ? t("ActiveSession") : t("OffDuty")}
            color={isCheckedIn ? "success" : "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Box>

      <CardContent sx={{ p: 3 }}>
        {actionError && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {actionError}
          </Alert>
        )}

        {gpsError && (
          <Alert
            severity="warning"
            icon={<IconAlertTriangle size={20} />}
            sx={{ mb: 2.5, borderRadius: 2 }}
          >
            {t("GpsPendingReviewNotice")}: {gpsError}
          </Alert>
        )}

        {/* GPS Coordinates Bar */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: "10px",
            bgcolor: "action.hover",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <IconMapPin size={20} color={coords ? "#13DEB9" : "#FA896B"} />
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {t("CurrentGpsLocation")}
              </Typography>
              <Typography variant="body2" fontWeight={600} dir="ltr">
                {coords
                  ? `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)} (±${Math.round(coords.accuracy)}m)`
                  : isLocating
                  ? t("AcquiringLocation")
                  : t("LocationUnavailable")}
              </Typography>
            </Box>
          </Stack>

          <Button
            size="small"
            variant="outlined"
            onClick={acquireLocation}
            disabled={isLocating}
            startIcon={
              isLocating ? (
                <CircularProgress size={16} />
              ) : (
                <IconCurrentLocation size={16} />
              )
            }
          >
            {t("RefreshGps")}
          </Button>
        </Box>

        {/* Optional Notes Field */}
        <TextField
          fullWidth
          size="small"
          placeholder={t("AttendanceNotesPlaceholder")}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          sx={{ mb: 3 }}
        />

        {/* Action Button */}
        <Button
          fullWidth
          size="large"
          variant="contained"
          color={isCheckedIn ? "error" : "primary"}
          onClick={handleAction}
          disabled={isLoading || actionLoading}
          startIcon={
            actionLoading ? (
              <CircularProgress size={20} color="inherit" />
            ) : isCheckedIn ? (
              <IconClockOff size={22} />
            ) : (
              <IconClockCheck size={22} />
            )
          }
          sx={{
            py: 1.5,
            fontSize: "1rem",
            fontWeight: 700,
            borderRadius: "10px",
          }}
        >
          {isCheckedIn ? t("SubmitCheckOut") : t("SubmitCheckIn")}
        </Button>
      </CardContent>
    </Card>
  );
};

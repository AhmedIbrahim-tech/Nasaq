"use client";

import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import { IconMapPin, IconInfoCircle } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import type { WorkLocation, CreateLocationRequest, UpdateLocationRequest } from "../types";

interface LocationFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  location: WorkLocation | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationRequest | UpdateLocationRequest) => Promise<void>;
}

export const LocationFormDialog: React.FC<LocationFormDialogProps> = ({
  open,
  mode,
  location,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();

  const [formData, setFormData] = useState<{
    name: string;
    latitude: string;
    longitude: string;
    radiusMeters: string;
    accuracyThresholdMeters: string;
    isActive: boolean;
  }>({
    name: "",
    latitude: "",
    longitude: "",
    radiusMeters: "150",
    accuracyThresholdMeters: "50",
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === "edit" && location) {
      setFormData({
        name: location.name || "",
        latitude: location.latitude !== undefined ? location.latitude.toString() : "",
        longitude: location.longitude !== undefined ? location.longitude.toString() : "",
        radiusMeters: (location.radiusMeters || 150).toString(),
        accuracyThresholdMeters: (location.accuracyThresholdMeters || 50).toString(),
        isActive: location.isActive ?? true,
      });
    } else {
      setFormData({
        name: "",
        latitude: "",
        longitude: "",
        radiusMeters: "150",
        accuracyThresholdMeters: "50",
        isActive: true,
      });
    }
    setErrors({});
  }, [mode, location, open]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("LocationNameRequired");
    } else if (formData.name.length > 200) {
      newErrors.name = t("LocationNameMaxLength");
    }

    const lat = parseFloat(formData.latitude);
    if (!formData.latitude.trim() || isNaN(lat)) {
      newErrors.latitude = t("LatitudeRequired");
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = t("LatitudeRangeError");
    }

    const lng = parseFloat(formData.longitude);
    if (!formData.longitude.trim() || isNaN(lng)) {
      newErrors.longitude = t("LongitudeRequired");
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = t("LongitudeRangeError");
    }

    const radius = parseFloat(formData.radiusMeters);
    if (!formData.radiusMeters.trim() || isNaN(radius)) {
      newErrors.radiusMeters = t("RadiusRequired");
    } else if (radius <= 0 || radius > 10000) {
      newErrors.radiusMeters = t("RadiusRangeError");
    }

    const accuracy = parseFloat(formData.accuracyThresholdMeters);
    if (!formData.accuracyThresholdMeters.trim() || isNaN(accuracy)) {
      newErrors.accuracyThresholdMeters = t("AccuracyThresholdRequired");
    } else if (accuracy <= 0 || accuracy > 1000) {
      newErrors.accuracyThresholdMeters = t("AccuracyThresholdRangeError");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radiusMeters: parseFloat(formData.radiusMeters),
      accuracyThresholdMeters: parseFloat(formData.accuracyThresholdMeters),
      isActive: formData.isActive,
    };

    await onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
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
          <IconMapPin size={24} color="#1976d2" />
          <Typography component="div" variant="h6" fontWeight={700}>
            {mode === "create" ? t("AddNewLocation") : t("EditLocation")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
          <Grid container spacing={2.5}>
            {/* Alert / Notice for Geofence defaults */}
            <Grid size={{ xs: 12 }}>
              <Alert
                severity="info"
                icon={<IconInfoCircle size={20} />}
                sx={{
                  alignItems: "center",
                  "& .MuiAlert-icon": {
                    marginInlineEnd: 1.5,
                    p: 0,
                  },
                }}
              >
                {t("GeofenceConfigInfo")}
              </Alert>
            </Grid>

            {/* Location Name */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label={t("LocationName")}
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                error={Boolean(errors.name)}
                helperText={errors.name}
                placeholder={t("LocationNamePlaceholder")}
              />
            </Grid>

            {/* Latitude */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("Latitude")}
                required
                type="number"
                inputProps={{ step: "any", min: -90, max: 90 }}
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                error={Boolean(errors.latitude)}
                helperText={errors.latitude || t("LatitudeHelper")}
                placeholder="24.713552"
              />
            </Grid>

            {/* Longitude */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("Longitude")}
                required
                type="number"
                inputProps={{ step: "any", min: -180, max: 180 }}
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                error={Boolean(errors.longitude)}
                helperText={errors.longitude || t("LongitudeHelper")}
                placeholder="46.675296"
              />
            </Grid>

            {/* Radius (Meters) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("GeofenceRadiusMeters")}
                required
                type="number"
                inputProps={{ step: "any", min: 1, max: 10000 }}
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.radiusMeters}
                onChange={(e) => setFormData({ ...formData, radiusMeters: e.target.value })}
                error={Boolean(errors.radiusMeters)}
                helperText={errors.radiusMeters || t("GeofenceRadiusHelper")}
              />
            </Grid>

            {/* Accuracy Threshold (Meters) */}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("AccuracyThresholdMeters")}
                required
                type="number"
                inputProps={{ step: "any", min: 1, max: 1000 }}
                slotProps={{ htmlInput: { dir: "ltr" } }}
                value={formData.accuracyThresholdMeters}
                onChange={(e) =>
                  setFormData({ ...formData, accuracyThresholdMeters: e.target.value })
                }
                error={Boolean(errors.accuracyThresholdMeters)}
                helperText={errors.accuracyThresholdMeters || t("AccuracyThresholdHelper")}
              />
            </Grid>

            {/* IsActive Switch */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {t("LocationActiveStatus")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t("LocationActiveStatusDesc")}
                  </Typography>
                </Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      color="primary"
                    />
                  }
                  label=""
                  sx={{ m: 0 }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, gap: 1.5, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
          <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
            {t("Cancel")}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {mode === "create" ? t("CreateLocation") : t("SaveChanges")}
          </Button>
        </DialogActions>
    </Dialog>
  );
};

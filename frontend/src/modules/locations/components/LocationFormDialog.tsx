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
import Chip from "@mui/material/Chip";
import { IconMapPin, IconInfoCircle, IconCurrentLocation } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import { SecondaryLanguageCheckbox } from "@/shared/components/forms/SecondaryLanguageCheckbox";
import { useLocationForm } from "../hooks";
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

  const {
    formData,
    setFormData,
    errors,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    isCapturingGps,
    capturedAccuracy,
    onCaptureCurrentLocation: handleCaptureCurrentLocation,
    onSubmit: handleSubmit,
  } = useLocationForm({ mode, location, open, onSubmit });

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

            {/* Primary Name & Address Fields */}
            {isAr ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("LocationName")}
                    required
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                    error={Boolean(errors.nameAr)}
                    helperText={errors.nameAr}
                    placeholder={t("LocationNamePlaceholder")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Address")}
                    value={formData.addressAr}
                    onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                    placeholder="مثال: حي العليا، الرياض"
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("LocationName")}
                    required
                    value={formData.nameEn || formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        nameEn: e.target.value,
                        name: e.target.value,
                      })
                    }
                    error={Boolean(errors.nameEn || errors.name)}
                    helperText={errors.nameEn || errors.name}
                    placeholder={t("LocationNamePlaceholder")}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("Address")}
                    value={formData.addressEn || formData.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        addressEn: e.target.value,
                        address: e.target.value,
                      })
                    }
                    placeholder="e.g. Olaya District, Riyadh"
                  />
                </Grid>
              </>
            )}

            {/* Secondary Language Checkbox */}
            <Grid size={{ xs: 12 }}>
              <SecondaryLanguageCheckbox
                checked={showSecondaryLanguage}
                onChange={(checked: boolean) => setShowSecondaryLanguage(checked)}
                isRtl={isAr}
                customLabel={isAr ? "إضافة البيانات باللغة الإنجليزية" : "Add Arabic Details"}
              />
            </Grid>

            {/* Secondary Name & Address Fields */}
            {showSecondaryLanguage && (
              isAr ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("NameEn")}
                      value={formData.nameEn}
                      onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                      placeholder="e.g. Riyadh Headquarters"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("AddressEn")}
                      value={formData.addressEn}
                      onChange={(e) => setFormData({ ...formData, addressEn: e.target.value })}
                      placeholder="e.g. Olaya District, Riyadh"
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("NameAr")}
                      value={formData.nameAr}
                      onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                      placeholder="مثال: المقر الرئيسي - الرياض"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      label={t("AddressAr")}
                      value={formData.addressAr}
                      onChange={(e) => setFormData({ ...formData, addressAr: e.target.value })}
                      placeholder="مثال: حي العليا، الرياض"
                    />
                  </Grid>
                </>
              )
            )}

            {/* GPS Method A: Capture Current Location */}
            <Grid size={{ xs: 12 }}>
              <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  onClick={handleCaptureCurrentLocation}
                  disabled={isCapturingGps || isSubmitting}
                  startIcon={
                    isCapturingGps ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <IconCurrentLocation size={18} />
                    )
                  }
                  sx={{ borderRadius: "8px", textTransform: "none", fontWeight: 600 }}
                >
                  {isCapturingGps ? "جارٍ تحديد الموقع..." : "تحديد موقعي الحالي / Use Current Location"}
                </Button>
                {capturedAccuracy && (
                  <Chip
                    size="small"
                    variant="outlined"
                    color={capturedAccuracy <= 50 ? "success" : "warning"}
                    label={`الدقة: ±${capturedAccuracy.toFixed(0)}m`}
                  />
                )}
              </Stack>
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

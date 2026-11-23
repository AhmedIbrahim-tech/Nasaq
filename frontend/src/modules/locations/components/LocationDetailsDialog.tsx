"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { formatEmployeesCount, formatDateTime, formatCoordinates } from "@/shared/utils/i18nFormatters";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import {
  IconMapPin,
  IconRadar,
  IconTarget,
  IconUsers,
  IconCalendar,
  IconClock,
  IconEdit,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { getLocationDisplayName, getLocationDisplayAddress } from "../utils/locationLocalization";
import type { WorkLocation } from "../types";

interface LocationDetailsDialogProps {
  open: boolean;
  location: WorkLocation | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const LocationDetailsDialog: React.FC<LocationDetailsDialogProps> = ({
  open,
  location,
  canManage,
  onClose,
  onEdit,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  if (!location) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ pb: 1, flexShrink: 0 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                bgcolor: location.isActive ? "primary.light" : "action.hover",
                color: location.isActive ? "primary.main" : "text.secondary",
                display: "flex",
              }}
            >
              <IconMapPin size={24} />
            </Box>
            <Box>
              <Typography component="div" variant="h6" fontWeight={700}>
                {getLocationDisplayName(location, isRtl)}
              </Typography>
              {(() => {
                const addr = getLocationDisplayAddress(location, isRtl);
                return addr ? (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {addr}
                  </Typography>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    {t("WorkLocationDetails")}
                  </Typography>
                );
              })()}
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              size="small"
              label={location.isActive ? t("Active") : t("Inactive")}
              color={location.isActive ? "success" : "default"}
            />
            <DialogCloseButton onClose={onClose} size="small" />
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: 1, overflowY: "auto" }}>
        <Stack spacing={2.5}>
          {/* Coordinates & Geofencing */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("GeofenceAndLocationData")}
            </Typography>
            <Grid container spacing={2}>
              {/* Latitude & Longitude */}
              <Grid size={{ xs: 12 }}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: "action.hover",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    {t("GPSCoordinates")}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ fontFamily: "monospace", mt: 0.5 }}>
                    {t("Latitude")}: {location.latitude.toFixed(6)} | {t("Longitude")}:{" "}
                    {location.longitude.toFixed(6)}
                  </Typography>
                </Box>
              </Grid>

              {/* Radius */}
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconRadar size={20} color="#1976d2" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("GeofenceRadius")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {location.radiusMeters} {t("MetersUnit")}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Accuracy Threshold */}
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconTarget size={20} color="#2e7d32" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("AccuracyThreshold")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {location.accuracyThresholdMeters} {t("MetersUnit")}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Assigned Employees */}
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconUsers size={20} color="#ed6c02" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("AssignedEmployees")}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatEmployeesCount(location.assignedEmployeesCount ?? location.employeeCount, isRtl)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Audit Info */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("AuditInformation")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconCalendar size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("CreatedDate")}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(location.created_Utc, isRtl)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconClock size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("UpdatedDate")}
                    </Typography>
                    <Typography variant="body2">
                      {formatDateTime(location.updated_Utc, isRtl)}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {location.created_By && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("CreatedBy")}: {location.created_By}
                  </Typography>
                </Grid>
              )}
              {location.updated_By && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">
                    {t("UpdatedBy")}: {location.updated_By}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1.5, borderTop: 1, borderColor: "divider", flexShrink: 0 }}>
        <Button onClick={onClose} variant="outlined" color="error">
          {t("Close")}
        </Button>
        {canManage && (
          <Button
            onClick={() => {
              onClose();
              onEdit();
            }}
            variant="contained"
            color="primary"
            startIcon={<IconEdit size={16} />}
          >
            {t("Edit")}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

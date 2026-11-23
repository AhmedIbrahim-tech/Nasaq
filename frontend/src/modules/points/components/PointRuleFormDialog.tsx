"use client";

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import MenuItem from "@mui/material/MenuItem";
import { IconAward, IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";
import { SecondaryLanguageCheckbox } from "@/shared/components/forms/SecondaryLanguageCheckbox";
import { usePointRuleForm } from "../hooks";
import type { PointRule, CreatePointRuleRequest, UpdatePointRuleRequest, PointEventType, PointCategory } from "../types";

interface PointRuleFormDialogProps {
  open: boolean;
  rule: PointRule | null;
  mode: "create" | "edit";
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePointRuleRequest | UpdatePointRuleRequest) => Promise<void>;
}

export const PointRuleFormDialog: React.FC<PointRuleFormDialogProps> = ({
  open,
  rule,
  mode,
  isSubmitting,
  onClose,
  onSubmit,
}) => {
  const t = useTranslations();

  const {
    formData,
    setFormData,
    showSecondaryLanguage,
    setShowSecondaryLanguage,
    isAr,
    errors,
    handleSubmit,
  } = usePointRuleForm({ open, rule, mode, onSubmit });

  const eventTypes: PointEventType[] = [
    "OnTimeArrival",
    "LateArrival",
    "AfterCutoffArrival",
    "EarlyDeparture",
    "CompletedShift",
    "MissingCheckOut",
    "GeofenceBreach",
    "ManualAdjustment",
  ];

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
          <IconAward size={24} color="#5D87FF" />
          <Typography component="div" variant="h6" fontWeight={700}>
            {mode === "create" ? t("AddNewPointRule") : t("EditPointRule")}
          </Typography>
        </Stack>
        <DialogCloseButton onClose={onClose} disabled={isSubmitting} />
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
        <Grid container spacing={2.5}>
          {/* Primary Rule Name */}
          <Grid size={{ xs: 12 }}>
            {isAr ? (
              <TextField
                fullWidth
                label={
                  <span>
                    {t("RuleName")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
                value={formData.nameAr}
                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                error={Boolean(errors.nameAr)}
                helperText={errors.nameAr}
              />
            ) : (
              <TextField
                fullWidth
                label={
                  <span>
                    {t("RuleName")}{" "}
                    <span style={{ color: "var(--mui-palette-error-main, #d32f2f)" }}>*</span>
                  </span>
                }
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
              />
            )}
          </Grid>

          {/* Category */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label={t("Category")}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as PointCategory })}
            >
              <MenuItem value="Green">{t("GreenCategory")}</MenuItem>
              <MenuItem value="Red">{t("RedCategory")}</MenuItem>
              <MenuItem value="Black">{t("BlackCategory")}</MenuItem>
            </TextField>
          </Grid>

          {/* Event Type */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              fullWidth
              required
              label={t("EventType")}
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value as PointEventType })}
            >
              {eventTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(type)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Points Value */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              type="number"
              label={t("PointsValue")}
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value, 10) || 0 })}
              helperText={
                formData.category === "Green"
                  ? t("PositivePointsHint")
                  : t("NegativePointsHint")
              }
            />
          </Grid>

          {/* Primary Description */}
          <Grid size={{ xs: 12 }}>
            {isAr ? (
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t("Description")}
                value={formData.descriptionAr}
                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              />
            ) : (
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t("Description")}
                value={formData.descriptionEn || formData.description}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    descriptionEn: e.target.value,
                    description: e.target.value,
                  })
                }
              />
            )}
          </Grid>

          {/* Secondary Language Checkbox */}
          <Grid size={{ xs: 12 }}>
            <SecondaryLanguageCheckbox
              checked={showSecondaryLanguage}
              onChange={(checked: boolean) => setShowSecondaryLanguage(checked)}
              isRtl={isAr}
              customLabel={isAr ? "إضافة البيانات باللغة الإنجليزية" : "Add Arabic Details"}
            />
          </Grid>

          {/* Secondary Fields */}
          {showSecondaryLanguage && (
            isAr ? (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("NameEn")}
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    placeholder="e.g. On-Time Arrival"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("DescriptionEn")}
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
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
                    placeholder="مثال: حضور في الموعد المحدد"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("DescriptionAr")}
                    value={formData.descriptionAr}
                    onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                  />
                </Grid>
              </>
            )
          )}

          {/* Effective From */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              required
              type="date"
              label={t("EffectiveFromDate")}
              slotProps={{ htmlInput: { dir: "ltr" } }}
              value={formData.effectiveFrom}
              onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
              error={Boolean(errors.effectiveFrom)}
              helperText={errors.effectiveFrom}
            />
          </Grid>

          {/* Effective To */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              type="date"
              label={t("EffectiveToDateOptional")}
              slotProps={{ htmlInput: { dir: "ltr" } }}
              value={formData.effectiveTo}
              onChange={(e) => setFormData({ ...formData, effectiveTo: e.target.value })}
              error={Boolean(errors.effectiveTo)}
              helperText={errors.effectiveTo || t("LeaveEmptyForOpenEnded")}
            />
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
          startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
        >
          {mode === "create" ? t("CreateRule") : t("SaveChanges")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

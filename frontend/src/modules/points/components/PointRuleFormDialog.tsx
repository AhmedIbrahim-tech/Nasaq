"use client";

import React, { useState, useEffect } from "react";
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
import type { PointRule, CreatePointRuleRequest, UpdatePointRuleRequest, PointCategory, PointEventType } from "../types";

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

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: PointCategory;
    eventType: PointEventType;
    points: number;
    effectiveFrom: string;
    effectiveTo: string;
  }>({
    name: "",
    description: "",
    category: "Green",
    eventType: "OnTimeArrival",
    points: 10,
    effectiveFrom: new Date().toISOString().substring(0, 10),
    effectiveTo: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && rule) {
        setFormData({
          name: rule.name,
          description: rule.description || "",
          category: rule.category,
          eventType: rule.eventType,
          points: rule.points,
          effectiveFrom: rule.effectiveFrom,
          effectiveTo: rule.effectiveTo || "",
        });
      } else {
        setFormData({
          name: "",
          description: "",
          category: "Green",
          eventType: "OnTimeArrival",
          points: 10,
          effectiveFrom: new Date().toISOString().substring(0, 10),
          effectiveTo: "",
        });
      }
      setErrors({});
    }
  }, [open, mode, rule]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t("RuleNameRequired");
    }

    if (!formData.effectiveFrom) {
      newErrors.effectiveFrom = t("EffectiveFromRequired");
    }

    if (formData.effectiveFrom && formData.effectiveTo && formData.effectiveTo < formData.effectiveFrom) {
      newErrors.effectiveTo = t("EffectiveToMustBeAfterFrom");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === "create") {
      const payload: CreatePointRuleRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        eventType: formData.eventType,
        points: Number(formData.points),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };
      await onSubmit(payload);
    } else if (rule) {
      const payload: UpdatePointRuleRequest = {
        id: rule.id,
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        eventType: formData.eventType,
        points: Number(formData.points),
        effectiveFrom: formData.effectiveFrom,
        effectiveTo: formData.effectiveTo || null,
      };
      await onSubmit(payload);
    }
  };

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
          {/* Rule Name */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              label={t("RuleName")}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={Boolean(errors.name)}
              helperText={errors.name}
            />
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

          {/* Description */}
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              label={t("Description")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Grid>

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

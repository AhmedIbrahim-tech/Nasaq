"use client";

import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { IconAward, IconCheck } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { PointCategory, ManualPointAdjustmentRequest } from "../types";

interface EmployeeOption {
  id: string;
  fullName: string;
  code: string;
}

interface ManualPointAdjustmentDialogProps {
  open: boolean;
  employees: EmployeeOption[];
  loading: boolean;
  onClose: () => void;
  onConfirm: (data: ManualPointAdjustmentRequest) => Promise<void>;
}

export const ManualPointAdjustmentDialog: React.FC<ManualPointAdjustmentDialogProps> = ({
  open,
  employees,
  loading,
  onClose,
  onConfirm,
}) => {
  const t = useTranslations();
  const [employeeId, setEmployeeId] = useState("");
  const [category, setCategory] = useState<PointCategory>("Green");
  const [points, setPoints] = useState<number>(10);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const isEmployeeValid = Boolean(employeeId);
  const isPointsValid = typeof points === "number" && !isNaN(points) && points !== 0;
  const isReasonValid = reason.trim().length >= 3;
  const isValid = isEmployeeValid && isPointsValid && isReasonValid;

  const handleConfirm = async () => {
    setTouched(true);
    if (!isValid) return;

    await onConfirm({
      employeeId,
      category,
      points: Number(points),
      reason: reason.trim(),
    });

    handleClose();
  };

  const handleClose = () => {
    if (loading) return;
    setEmployeeId("");
    setCategory("Green");
    setPoints(10);
    setReason("");
    setTouched(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
        <IconAward size={22} color="primary" />
        {t("AdjustPoints")}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            {t("PositiveForRewardNegativeForPenalty")}
          </Alert>

          {/* Employee Selection */}
          <TextField
            select
            fullWidth
            required
            size="small"
            label={
              <span>
                {t("Employee")} <span style={{ color: "red" }}>*</span>
              </span>
            }
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            error={touched && !isEmployeeValid}
            helperText={touched && !isEmployeeValid ? t("EmployeeRequired") : undefined}
            disabled={loading}
            SelectProps={{
              displayEmpty: true,
              renderValue: (selected: any) =>
                !selected ? (
                  <span style={{ opacity: 0.6 }}>{t("SelectEmployee")}</span>
                ) : (
                  employees.find((emp) => emp.id === selected)?.fullName || selected
                ),
            }}
          >
            <MenuItem value="" disabled>
              {t("SelectEmployee")}
            </MenuItem>
            {employees.map((emp) => (
              <MenuItem key={emp.id} value={emp.id}>
                {emp.fullName} ({emp.code})
              </MenuItem>
            ))}
          </TextField>

          {/* Category Selection */}
          <TextField
            select
            fullWidth
            size="small"
            label={t("PointsCategory")}
            value={category}
            onChange={(e) => setCategory(e.target.value as PointCategory)}
            disabled={loading}
          >
            <MenuItem value="Green">{t("GreenPoints")}</MenuItem>
            <MenuItem value="Red">{t("RedPoints")}</MenuItem>
            <MenuItem value="Black">{t("BlackPoints")}</MenuItem>
          </TextField>

          {/* Points Amount */}
          <TextField
            fullWidth
            required
            type="number"
            size="small"
            label={
              <span>
                {t("PointsAmount")} <span style={{ color: "red" }}>*</span>
              </span>
            }
            value={points}
            onChange={(e) => setPoints(Number(e.target.value))}
            error={touched && !isPointsValid}
            helperText={touched && !isPointsValid ? t("PointsRequired") : undefined}
            disabled={loading}
          />

          {/* Mandatory Reason */}
          <TextField
            fullWidth
            required
            multiline
            rows={3}
            size="small"
            label={
              <span>
                {t("AdjustmentReason")} <span style={{ color: "red" }}>*</span>
              </span>
            }
            placeholder={t("ReasonPlaceholder")}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (!touched) setTouched(true);
            }}
            error={touched && !isReasonValid}
            helperText={touched && !isReasonValid ? t("ReasonPlaceholder") : undefined}
            disabled={loading}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          {t("Cancel")}
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="primary"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconCheck size={18} />}
          sx={{ borderRadius: "8px", px: 2.5 }}
        >
          {t("AdjustPoints")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

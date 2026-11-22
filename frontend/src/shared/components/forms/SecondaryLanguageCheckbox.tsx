"use client";

import React from "react";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { IconLanguage } from "@tabler/icons-react";

interface SecondaryLanguageCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  isRtl: boolean;
  disabled?: boolean;
  customLabel?: string;
  sx?: any;
}

/**
 * Shared Secondary Language Checkbox for all NASAQ Create/Edit forms.
 * Follows RULE BIL-002:
 * - Arabic UI: "إضافة البيانات باللغة الإنجليزية"
 * - English UI: "Add Arabic Translation"
 */
export const SecondaryLanguageCheckbox: React.FC<SecondaryLanguageCheckboxProps> = ({
  checked,
  onChange,
  isRtl,
  disabled = false,
  customLabel,
  sx,
}) => {
  const defaultLabel = isRtl
    ? "إضافة البيانات باللغة الإنجليزية"
    : "Add Arabic Translation";

  const labelText = customLabel || defaultLabel;

  return (
    <Box sx={{ my: 1, ...sx }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(e) => onChange(e.target.checked)}
            disabled={disabled}
            color="primary"
            size="small"
            sx={{
              "&.Mui-checked": {
                color: "primary.main",
              },
            }}
          />
        }
        label={
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <IconLanguage size={18} color="var(--mui-palette-primary-main, #5D87FF)" />
            <Typography variant="body2" fontWeight={600} color="text.primary">
              {labelText}
            </Typography>
          </Box>
        }
        sx={{
          userSelect: "none",
          m: 0,
        }}
      />
    </Box>
  );
};

"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import {
  IconDownload,
  IconFileTypeCsv,
  IconFileSpreadsheet,
  IconFileTypePdf,
  IconChevronDown,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface ReportExportMenuProps {
  onExport: (format: "csv" | "xlsx" | "pdf", scope: "all" | "current_page") => Promise<void>;
  disabled?: boolean;
}

export const ReportExportMenu: React.FC<ReportExportMenuProps> = ({ onExport, disabled = false }) => {
  const t = useTranslations();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleTriggerExport = async (format: "csv" | "xlsx" | "pdf", scope: "all" | "current_page") => {
    handleClose();
    try {
      setExportingFormat(format);
      await onExport(format, scope);
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <Box>
      <Button
        variant="outlined"
        color="primary"
        disabled={disabled || Boolean(exportingFormat)}
        startIcon={
          exportingFormat ? (
            <CircularProgress size={16} color="inherit" />
          ) : (
            <IconDownload size={18} />
          )
        }
        endIcon={<IconChevronDown size={16} />}
        onClick={handleClick}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontWeight: 600,
          height: 40,
          px: 2,
          display: "inline-flex",
          alignItems: "center",
          gap: 1, // 8px icon-to-label separation
        }}
      >
        {exportingFormat ? t("Exporting") : t("Export")}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            borderRadius: "10px",
            minWidth: 200,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.5)"
                : "0 8px 24px rgba(0,0,0,0.08)",
            p: 0.5,
          },
        }}
      >
        <MenuItem onClick={() => handleTriggerExport("csv", "all")} sx={{ borderRadius: "6px", py: 1 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <IconFileTypeCsv size={18} color="#0284c7" />
          </ListItemIcon>
          <ListItemText primary={t("ExportAsCsv")} secondary={t("ExportAll")} />
        </MenuItem>

        <MenuItem onClick={() => handleTriggerExport("xlsx", "all")} sx={{ borderRadius: "6px", py: 1 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <IconFileSpreadsheet size={18} color="#16a34a" />
          </ListItemIcon>
          <ListItemText primary={t("ExportAsExcel")} secondary={t("ExportAll")} />
        </MenuItem>

        <MenuItem onClick={() => handleTriggerExport("pdf", "all")} sx={{ borderRadius: "6px", py: 1 }}>
          <ListItemIcon sx={{ minWidth: 28 }}>
            <IconFileTypePdf size={18} color="#dc2626" />
          </ListItemIcon>
          <ListItemText primary={t("ExportAsPdf")} secondary={t("ExportAll")} />
        </MenuItem>
      </Menu>
    </Box>
  );
};

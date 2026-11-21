"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import { formatEmployeesCount } from "@/shared/utils/i18nFormatters";
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconCheck,
  IconX,
  IconMapPin,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { WorkLocation } from "../types";

interface LocationTableProps {
  locations: WorkLocation[];
  loading: boolean;
  canManage: boolean;
  onView: (location: WorkLocation) => void;
  onEdit: (location: WorkLocation) => void;
  onToggleStatus: (location: WorkLocation) => void;
}

export const LocationTable: React.FC<LocationTableProps> = ({
  locations,
  loading,
  canManage,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [menuAnchor, setMenuAnchor] = useState<null | {
    el: HTMLElement;
    location: WorkLocation;
  }>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, location: WorkLocation) => {
    setMenuAnchor({ el: event.currentTarget, location });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  if (loading) {
    return (
      <Card
        elevation={0}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          p: 2,
        }}
      >
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} height={52} sx={{ my: 1 }} />
        ))}
      </Card>
    );
  }

  if (locations.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          border: (theme) => `1px solid ${theme.palette.divider}`,
          borderRadius: "12px",
          py: 8,
          textAlign: "center",
        }}
      >
        <IconMapPin size={48} stroke={1.5} style={{ opacity: 0.4, margin: "0 auto" }} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1.5 }}>
          {t("NoLocationsFound")}
        </Typography>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <TableContainer>
        <Table sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              <TableCell>{t("LocationName")}</TableCell>
              <TableCell>{t("Coordinates")}</TableCell>
              <TableCell>{t("GeofenceRadius")}</TableCell>
              <TableCell>{t("AccuracyThreshold")}</TableCell>
              <TableCell>{t("AssignedEmployees")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell>{t("CreatedDate")}</TableCell>
              <TableCell align="right">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((loc) => (
              <TableRow key={loc.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 1,
                        bgcolor: loc.isActive ? "primary.light" : "action.hover",
                        color: loc.isActive ? "primary.main" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <IconMapPin size={20} />
                    </Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {loc.name}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "monospace",
                      bgcolor: "action.hover",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  >
                    {loc.latitude.toFixed(6)}, {loc.longitude.toFixed(6)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {loc.radiusMeters} {t("MetersUnit")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {loc.accuracyThresholdMeters} {t("MetersUnit")}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    icon={<IconUsers size={14} />}
                    label={formatEmployeesCount(loc.assignedEmployeesCount ?? loc.employeeCount, isRtl)}
                    variant="outlined"
                    color={(loc.assignedEmployeesCount ?? loc.employeeCount ?? 0) > 0 ? "info" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={loc.isActive ? t("Active") : t("Inactive")}
                    color={loc.isActive ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {loc.created_Utc ? new Date(loc.created_Utc).toLocaleDateString() : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleOpenMenu(e, loc)}>
                    <IconDotsVertical size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            if (menuAnchor) onView(menuAnchor.location);
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText>{t("ViewDetails")}</ListItemText>
        </MenuItem>

        {canManage && (
          <MenuItem
            onClick={() => {
              if (menuAnchor) onEdit(menuAnchor.location);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <IconEdit size={18} />
            </ListItemIcon>
            <ListItemText>{t("Edit")}</ListItemText>
          </MenuItem>
        )}

        {canManage && menuAnchor && (
          <MenuItem
            onClick={() => {
              onToggleStatus(menuAnchor.location);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              {menuAnchor.location.isActive ? (
                <IconX size={18} color="red" />
              ) : (
                <IconCheck size={18} color="green" />
              )}
            </ListItemIcon>
            <ListItemText>
              {menuAnchor.location.isActive ? t("Deactivate") : t("Activate")}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

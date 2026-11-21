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
import {
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconUserCheck,
  IconUserX,
  IconShield,
  IconUserCircle,
  IconMapPin,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { useTheme } from "@mui/material/styles";
import { formatDateOnly } from "@/shared/utils/i18nFormatters";
import { ProfilePhotoAvatar } from "@/shared/components/avatar";
import type { Employee } from "../types";

interface EmployeeTableProps {
  employees: Employee[];
  loading: boolean;
  canManage: boolean;
  onView: (employee: Employee) => void;
  onEdit: (employee: Employee) => void;
  onToggleStatus: (employee: Employee) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading,
  canManage,
  onView,
  onEdit,
  onToggleStatus,
}) => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  const [menuAnchor, setMenuAnchor] = useState<null | { el: HTMLElement; employee: Employee }>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setMenuAnchor({ el: event.currentTarget, employee });
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const getRoleColor = (role?: string | null): "primary" | "secondary" | "info" | "default" => {
    switch (role) {
      case "SuperAdmin":
        return "primary";
      case "Admin":
        return "secondary";
      case "Supervisor":
        return "info";
      default:
        return "default";
    }
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

  if (employees.length === 0) {
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
        <IconUserCircle size={48} stroke={1.5} style={{ opacity: 0.4, margin: "0 auto" }} />
        <Typography variant="h6" color="text.secondary" sx={{ mt: 1.5 }}>
          {t("NoEmployeesFound")}
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
              <TableCell>{t("EmployeeCode")}</TableCell>
              <TableCell>{t("EmployeeName")}</TableCell>
              <TableCell>{t("Department")}</TableCell>
              <TableCell>{t("JobTitle")}</TableCell>
              <TableCell>{t("DirectSupervisor")}</TableCell>
              <TableCell>{t("WorkLocation")}</TableCell>
              <TableCell>{t("SystemRole")}</TableCell>
              <TableCell>{t("Status")}</TableCell>
              <TableCell>{t("HireDate")}</TableCell>
              <TableCell align="right">{t("Actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id} hover>
                <TableCell>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                      fontFamily: "monospace",
                      bgcolor: "action.hover",
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      display: "inline-block",
                    }}
                  >
                    {employee.employeeCode}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1.5}>
                    <ProfilePhotoAvatar
                      photoId={employee.profilePhoto}
                      name={employee.fullName || `${employee.firstName} ${employee.lastName}`}
                      size={36}
                      colorScheme="soft"
                    />
                    <Box minWidth={0}>
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {employee.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {employee.department || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {employee.jobTitle || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  {employee.supervisorName ? (
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {employee.supervisorName}
                      </Typography>
                      {employee.supervisorCode && (
                        <Typography variant="caption" color="text.secondary">
                          {employee.supervisorCode}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t("NoSupervisorAssigned")}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {employee.workLocationName ? (
                    <Chip
                      size="small"
                      icon={<IconMapPin size={14} />}
                      label={employee.workLocationName}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t("NoLocationAssigned")}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {employee.userRole ? (
                    <Chip
                      size="small"
                      icon={<IconShield size={14} />}
                      label={t(employee.userRole)}
                      color={getRoleColor(employee.userRole)}
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      {t("NoLinkedUser")}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={employee.isActive ? t("Active") : t("Inactive")}
                    color={employee.isActive ? "success" : "default"}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" sx={{ direction: "ltr", display: "inline-block" }}>
                    {employee.hireDate ? formatDateOnly(employee.hireDate, isRtl) : "-"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, employee)}
                  >
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
            if (menuAnchor) onView(menuAnchor.employee);
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
              if (menuAnchor) onEdit(menuAnchor.employee);
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
              onToggleStatus(menuAnchor.employee);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              {menuAnchor.employee.isActive ? (
                <IconUserX size={18} color="red" />
              ) : (
                <IconUserCheck size={18} color="green" />
              )}
            </ListItemIcon>
            <ListItemText>
              {menuAnchor.employee.isActive
                ? t("Deactivate")
                : t("Activate")}
            </ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
};

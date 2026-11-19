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
import {
  IconMail,
  IconPhone,
  IconBriefcase,
  IconCalendar,
  IconShield,
  IconClock,
  IconUser,
  IconUserCheck,
  IconEdit,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { Employee } from "../types";

interface EmployeeDetailsDialogProps {
  open: boolean;
  employee: Employee | null;
  canManage: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export const EmployeeDetailsDialog: React.FC<EmployeeDetailsDialogProps> = ({
  open,
  employee,
  canManage,
  onClose,
  onEdit,
}) => {
  const t = useTranslations();

  if (!employee) return null;

  const isActive = employee.isActive;
  const fullName = employee.fullName || `${employee.firstName} ${employee.lastName}`;
  const code = employee.employeeCode;
  const email = employee.email;
  const phone = employee.phoneNumber;
  const dept = employee.department;
  const title = employee.jobTitle;
  const hireDate = employee.hireDate;
  const userRole = employee.userRole;
  const userId = employee.userId;
  const supervisorName = employee.supervisorName;
  const supervisorCode = employee.supervisorCode;
  const createdUtc = employee.created_Utc;
  const createdBy = employee.created_By;
  const updatedUtc = employee.updated_Utc;
  const updatedBy = employee.updated_By;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {fullName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontFamily: "monospace",
                bgcolor: "action.hover",
                px: 1,
                py: 0.25,
                borderRadius: 0.5,
              }}
            >
              {code}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip
              size="small"
              label={isActive ? t("Active") : t("Inactive")}
              color={isActive ? "success" : "default"}
            />
            {userRole && (
              <Chip
                size="small"
                icon={<IconShield size={14} />}
                label={t(userRole)}
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          {/* Section 1: Employment */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("EmploymentInformation")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconBriefcase size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("Department")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {dept || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconUser size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("JobTitle")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {title || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconCalendar size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("HireDate")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {hireDate ? new Date(hireDate).toLocaleDateString() : "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconUserCheck size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("DirectSupervisor")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {supervisorName ? `${supervisorName} (${supervisorCode})` : t("NoSupervisorAssigned")}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 2: Contact Information */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("PersonalInformation")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconMail size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("Email")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {email}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconPhone size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("PhoneNumber")}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {phone || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>

          <Divider />

          {/* Section 3: User Account & Audit */}
          <Box>
            <Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mb: 1.5 }}>
              {t("AuditInformation")}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconClock size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("CreatedUtc")}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {createdUtc ? new Date(createdUtc).toLocaleString() : "-"}
                    </Typography>
                    {createdBy && (
                      <Typography variant="caption" color="text.secondary">
                        {t("CreatedBy")}: {createdBy}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconClock size={18} color="#666" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {t("UpdatedUtc")}
                    </Typography>
                    <Typography variant="caption" display="block">
                      {updatedUtc ? new Date(updatedUtc).toLocaleString() : "-"}
                    </Typography>
                    {updatedBy && (
                      <Typography variant="caption" color="text.secondary">
                        {t("UpdatedBy")}: {updatedBy}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {canManage && (
          <Button
            startIcon={<IconEdit size={18} />}
            variant="outlined"
            onClick={() => {
              onClose();
              onEdit();
            }}
          >
            {t("Edit")}
          </Button>
        )}
        <Button onClick={onClose} variant="contained" color="inherit">
          {t("Close")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

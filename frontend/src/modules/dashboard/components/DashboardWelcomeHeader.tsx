"use client";

import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { useTheme, alpha } from "@mui/material/styles";
import { IconCalendar } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import { ProfilePhotoAvatar } from "@/shared/components/avatar";
import { CustomizerContext } from "@/theme/customizerContext";
import { formatUserRole } from "@/shared/utils/format.utils";

interface DashboardWelcomeHeaderProps {
  displayName: string;
  photoId?: string | null;
  roles: string[];
  isAdmin: boolean;
  isSupervisor: boolean;
}

export const DashboardWelcomeHeader: React.FC<DashboardWelcomeHeaderProps> = ({
  displayName,
  photoId,
  roles,
  isAdmin,
  isSupervisor,
}) => {
  const theme = useTheme();
  const t = useTranslations();
  const isDark = theme.palette.mode === "dark";
  const { isLanguage } = useContext(CustomizerContext);

  const todayFormatted = new Intl.DateTimeFormat(isLanguage === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date()).replace(/[\u200e\u200f]/g, "");

  const supportingText = isAdmin
    ? t("DashboardWelcomeAdminDesc")
    : isSupervisor
    ? t("DashboardWelcomeSupervisorDesc")
    : t("DashboardWelcomeEmployeeDesc");

  return (
    <Card
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5 },
        mb: 3,
        backgroundColor: isDark ? alpha(theme.palette.background.paper, 0.8) : "primary.light",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: "12px",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0 }}>
          <ProfilePhotoAvatar
            photoId={photoId}
            name={displayName}
            size={48}
            colorScheme="soft"
            sx={{
              border: `2px solid ${theme.palette.background.paper}`,
              boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={700} sx={{ fontSize: { xs: "1.15rem", sm: "1.35rem" }, mb: 0.25 }}>
              {t("DashboardWelcomeBack", { name: displayName })}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }} noWrap>
              {supportingText}
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ alignSelf: { xs: "flex-start", sm: "center" } }}
        >
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            sx={{
              bgcolor: isDark ? alpha(theme.palette.common.white, 0.05) : "background.paper",
              px: 1.25,
              py: 0.5,
              borderRadius: "8px",
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <IconCalendar size={16} stroke={1.75} color={theme.palette.text.secondary} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {todayFormatted}
            </Typography>
          </Stack>

          {roles.slice(0, 2).map((role) => (
            <Chip
              key={role}
              label={formatUserRole(role, t)}
              color="primary"
              variant="outlined"
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.75rem",
                bgcolor: isDark ? alpha(theme.palette.primary.main, 0.15) : "background.paper",
              }}
            />
          ))}
        </Stack>
      </Stack>
    </Card>
  );
};

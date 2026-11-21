"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Avatar from "@mui/material/Avatar";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconAlertTriangle,
  IconClockExclamation,
  IconChecklist,
  IconUsers,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { AdminOperationsSummary } from "../types";

interface AdminOperationsStatsCardsProps {
  summary: AdminOperationsSummary | null;
  loading: boolean;
}

export const AdminOperationsStatsCards: React.FC<AdminOperationsStatsCardsProps> = ({
  summary,
  loading,
}) => {
  const t = useTranslations();
  const theme = useTheme();

  const cards = [
    {
      title: t("PendingGpsExceptions"),
      value: summary?.pendingGpsExceptionsCount ?? 0,
      icon: <IconAlertTriangle size={24} />,
      color: theme.palette.warning.main,
      bgcolor: alpha(theme.palette.warning.main, 0.12),
    },
    {
      title: t("IncompleteRecords"),
      value: summary?.incompleteAttendanceCount ?? 0,
      icon: <IconClockExclamation size={24} />,
      color: theme.palette.secondary.main,
      bgcolor: alpha(theme.palette.secondary.main, 0.12),
    },
    {
      title: t("TodayVerified"),
      value: summary?.todayVerifiedAttendance ?? 0,
      icon: <IconChecklist size={24} />,
      color: theme.palette.success.main,
      bgcolor: alpha(theme.palette.success.main, 0.12),
    },
    {
      title: t("TodayTotal"),
      value: summary?.todayTotalAttendance ?? 0,
      icon: <IconUsers size={24} />,
      color: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.primary.main, 0.12),
    },
  ];

  return (
    <Grid container spacing={2.5}>
      {cards.map((card, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            elevation={0}
            sx={{
              p: 1,
              borderRadius: "12px",
              border: `1px solid ${theme.palette.divider}`,
              height: "100%",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: theme.shadows[3],
              },
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={500} mb={0.5}>
                    {card.title}
                  </Typography>
                  {loading ? (
                    <Skeleton variant="text" width={60} height={36} />
                  ) : (
                    <Typography variant="h4" fontWeight={700}>
                      {card.value.toLocaleString()}
                    </Typography>
                  )}
                </Box>
                <Avatar
                  sx={{
                    bgcolor: card.bgcolor,
                    color: card.color,
                    width: 48,
                    height: 48,
                    borderRadius: "10px",
                  }}
                >
                  {card.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

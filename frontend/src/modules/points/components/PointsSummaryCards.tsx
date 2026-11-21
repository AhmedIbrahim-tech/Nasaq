"use client";

import React from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import {
  IconAward,
  IconCircleCheck,
  IconAlertCircle,
  IconAlertTriangle,
  IconHourglassEmpty,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import type { EmployeePointsSummary } from "../types";

interface PointsSummaryCardsProps {
  summary: EmployeePointsSummary | null;
}

export const PointsSummaryCards: React.FC<PointsSummaryCardsProps> = ({ summary }) => {
  const t = useTranslations();

  const cards = [
    {
      title: t("TotalPointsBalance"),
      value: summary?.totalFinalizedPoints ?? 0,
      icon: <IconAward size={26} color="#5D87FF" />,
      color: summary && summary.totalFinalizedPoints >= 0 ? "success.main" : "error.main",
      bgColor: "rgba(93, 135, 255, 0.08)",
    },
    {
      title: t("GreenPointsPositive"),
      value: `+${summary?.greenPoints ?? 0}`,
      icon: <IconCircleCheck size={26} color="#13DEB9" />,
      color: "#13DEB9",
      bgColor: "rgba(19, 222, 185, 0.08)",
    },
    {
      title: t("RedPointsNegative"),
      value: `${summary?.redPoints ?? 0}`,
      icon: <IconAlertCircle size={26} color="#FA896B" />,
      color: "#FA896B",
      bgColor: "rgba(250, 137, 107, 0.08)",
    },
    {
      title: t("BlackPointsSevere"),
      value: `${summary?.blackPoints ?? 0}`,
      icon: <IconAlertTriangle size={26} color="#2A3547" />,
      color: "#2A3547",
      bgColor: "rgba(42, 53, 71, 0.1)",
    },
    {
      title: t("PendingReviewPoints"),
      value: summary?.pendingPoints ?? 0,
      icon: <IconHourglassEmpty size={26} color="#FFAE1F" />,
      color: "#FFAE1F",
      bgColor: "rgba(255, 174, 31, 0.08)",
    },
  ];

  return (
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {cards.map((card, idx) => (
        <Grid key={idx} size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Card
            elevation={0}
            sx={{
              borderRadius: "12px",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2" color="text.secondary" fontWeight={500}>
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "10px",
                    bgcolor: card.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {card.icon}
                </Box>
              </Stack>
              <Typography variant="h4" fontWeight={700} sx={{ color: card.color }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

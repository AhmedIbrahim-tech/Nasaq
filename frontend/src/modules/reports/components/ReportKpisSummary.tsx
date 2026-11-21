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
  IconChartBar,
  IconChecklist,
  IconClock,
  IconAlertTriangle,
  IconAward,
} from "@tabler/icons-react";
import { useLocale } from "next-intl";
import type { ReportSummaryKpi } from "../types";

interface ReportKpisSummaryProps {
  kpis: ReportSummaryKpi[];
  loading: boolean;
}

export const ReportKpisSummary: React.FC<ReportKpisSummaryProps> = ({ kpis, loading }) => {
  const theme = useTheme();
  const locale = useLocale();
  const isAr = locale.startsWith("ar");

  if (!loading && (!kpis || kpis.length === 0)) {
    return null;
  }

  const icons = [
    { icon: <IconChartBar size={22} />, color: theme.palette.primary.main },
    { icon: <IconChecklist size={22} />, color: theme.palette.success.main },
    { icon: <IconClock size={22} />, color: theme.palette.warning.main },
    { icon: <IconAlertTriangle size={22} />, color: theme.palette.error.main },
    { icon: <IconAward size={22} />, color: theme.palette.secondary.main },
  ];

  return (
    <Grid container spacing={2}>
      {loading
        ? Array.from({ length: 4 }).map((_, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 3 }}>
              <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: "10px", p: 1 }}>
                <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
                  <Skeleton variant="text" width="60%" height={24} />
                  <Skeleton variant="text" width="40%" height={36} />
                </CardContent>
              </Card>
            </Grid>
          ))
        : kpis.map((kpi, idx) => {
            const iconObj = icons[idx % icons.length];
            const label = isAr ? kpi.labelAr : kpi.labelEn;
            const displayValue = kpi.value.toLocaleString();

            return (
              <Grid key={kpi.key || idx} size={{ xs: 12, sm: 6, md: 3 }}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "10px",
                    border: `1px solid ${theme.palette.divider}`,
                    height: "100%",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: theme.shadows[2],
                    },
                  }}
                >
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={500} mb={0.5} display="block">
                          {label}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {displayValue}
                        </Typography>
                      </Box>
                      <Avatar
                        sx={{
                          bgcolor: alpha(iconObj.color, 0.12),
                          color: iconObj.color,
                          width: 42,
                          height: 42,
                          borderRadius: "8px",
                        }}
                      >
                        {iconObj.icon}
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
    </Grid>
  );
};

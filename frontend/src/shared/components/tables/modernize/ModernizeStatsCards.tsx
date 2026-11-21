"use client";

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";

export interface ModernizeStatCardItem {
  value: string | number;
  label: string;
  icon: React.ReactNode;
  bgcolor?: string;
  color?: string;
}

export interface ModernizeStatsCardsProps {
  title?: string;
  action?: React.ReactNode;
  items: ModernizeStatCardItem[];
  loading?: boolean;
}

export const ModernizeStatsCards: React.FC<ModernizeStatsCardsProps> = ({
  title,
  action,
  items,
  loading = false,
}) => {
  const getCardFlex = (count: number) => {
    if (count <= 2) {
      return { xs: "1 1 100%", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(50% - 8px)" };
    }
    if (count === 3) {
      return { xs: "1 1 100%", sm: "1 1 calc(33.333% - 11px)", md: "1 1 calc(33.333% - 11px)" };
    }
    if (count === 4) {
      return { xs: "1 1 calc(50% - 8px)", sm: "1 1 calc(50% - 8px)", md: "1 1 calc(25% - 12px)" };
    }
    return {
      xs: "1 1 calc(50% - 8px)",
      sm: "1 1 calc(33.33% - 11px)",
      md: "1 1 0",
    };
  };

  const cardFlex = getCardFlex(items.length);

  return (
    <Box>
      {(title || action) && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1.5}
          sx={{ mb: 2 }}
        >
          {title && (
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>
          )}
          {action && <Box display="flex" alignItems="center">{action}</Box>}
        </Box>
      )}
      <Box display="flex" gap={2} flexWrap="wrap" width="100%">
        {items.map((stat, index) => (
          <Card
            elevation={0}
            key={index}
            sx={{
              backgroundColor: stat.bgcolor || "primary.light",
              p: 1.75,
              borderRadius: "12px",
              border: (theme) => `1px solid ${theme.palette.divider}`,
              flex: cardFlex,
              minWidth: { xs: "140px", sm: "160px" },
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 4px 14px rgba(0,0,0,0.4)"
                    : "0 4px 14px rgba(0,0,0,0.07)",
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                {loading ? (
                  <Skeleton width={60} height={28} />
                ) : (
                  <Typography
                    fontSize={17}
                    fontWeight={700}
                    color={stat.color || "text.primary"}
                    sx={{ lineHeight: 1.2 }}
                  >
                    {stat.value}
                  </Typography>
                )}
                {loading ? (
                  <Skeleton width={80} height={18} sx={{ mt: 0.5 }} />
                ) : (
                  <Typography
                    fontSize={11.5}
                    color="text.secondary"
                    fontWeight={600}
                    sx={{ mt: 0.5, letterSpacing: "0.2px" }}
                  >
                    {stat.label}
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                }}
              >
                {stat.icon}
              </Box>
            </Stack>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

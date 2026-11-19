'use client';

import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import InputAdornment from "@mui/material/InputAdornment";
import {
  IconSearch,
  IconChecks,
  IconRefresh,
  IconFilter,
} from "@tabler/icons-react";
import { useTranslations } from "next-intl";

interface NotificationFiltersProps {
  unreadOnly: boolean;
  selectedCategory: string | null;
  searchQuery: string;
  unreadCount: number;
  onSetUnreadOnly: (unreadOnly: boolean) => void;
  onSetCategory: (category: string | null) => void;
  onSetSearch: (query: string) => void;
  onMarkAllAsRead: () => Promise<void>;
  onRefresh: () => void;
}

const CATEGORIES = [
  { value: "Sale", labelKey: "CategorySale" },
  { value: "Purchase", labelKey: "CategoryPurchase" },
  { value: "Expense", labelKey: "CategoryExpense" },
  { value: "BankOperation", labelKey: "CategoryBank" },
  { value: "TreasuryOperation", labelKey: "CategoryTreasury" },
  { value: "Info", labelKey: "CategoryInfo" },
  { value: "Success", labelKey: "CategorySuccess" },
  { value: "Warning", labelKey: "CategoryWarning" },
  { value: "Error", labelKey: "CategoryError" },
];

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  unreadOnly,
  selectedCategory,
  searchQuery,
  unreadCount,
  onSetUnreadOnly,
  onSetCategory,
  onSetSearch,
  onMarkAllAsRead,
  onRefresh,
}) => {
  const t = useTranslations();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        onSetSearch(localSearch);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [localSearch, searchQuery, onSetSearch]);

  return (
    <Box sx={{ p: 2, bgcolor: "action.hover", borderRadius: "8px", mb: 3 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
      >
        {/* Search & Category Filter */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ flex: 1 }}>
          <TextField
            size="small"
            placeholder={t("SearchNotifications")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconSearch size={18} />
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: { sm: 240 } }}
          />

          <TextField
            size="small"
            select
            value={selectedCategory || "ALL"}
            onChange={(e) => {
              const val = e.target.value;
              onSetCategory(val === "ALL" ? null : val);
            }}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="ALL">{t("CategoryAll")}</MenuItem>
            {CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {t(c.labelKey)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Read/Unread Toggle & Bulk Actions */}
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
          <ToggleButtonGroup
            size="small"
            value={unreadOnly ? "UNREAD" : "ALL"}
            exclusive
            onChange={(_, val) => {
              if (val !== null) {
                onSetUnreadOnly(val === "UNREAD");
              }
            }}
          >
            <ToggleButton value="ALL" sx={{ px: 2 }}>
              {t("AllNotifications")}
            </ToggleButton>
            <ToggleButton value="UNREAD" sx={{ px: 2 }}>
              {t("UnreadOnly")} {unreadCount > 0 && `(${unreadCount})`}
            </ToggleButton>
          </ToggleButtonGroup>

          {unreadCount > 0 && (
            <Button
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<IconChecks size={18} />}
              onClick={onMarkAllAsRead}
            >
              {t("MarkAllAsRead")}
            </Button>
          )}

          <Button
            variant="text"
            color="inherit"
            size="small"
            startIcon={<IconRefresh size={18} />}
            onClick={onRefresh}
          >
            {t("Refresh")}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

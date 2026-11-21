'use client';

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Pagination from "@mui/material/Pagination";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { IconBellOff, IconRefresh } from "@tabler/icons-react";
import { useTranslations } from "next-intl";
import PageContainer from "@/shared/components/container/PageContainer";
import Breadcrumb from "@/shared/layouts/dashboard/shared/breadcrumb/Breadcrumb";
import { notify } from "@/shared/services/notification.service";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationDetailsDialog } from "../components/NotificationDetailsDialog";

export const NotificationsCenterView: React.FC = () => {
  const t = useTranslations();
  const {
    items,
    totalCount,
    unreadCount,
    page,
    pageSize,
    unreadOnly,
    selectedCategory,
    searchQuery,
    loading,
    error,
    selectedNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    setPage,
    setUnreadOnly,
    setSelectedCategory,
    setSearchQuery,
    setSelectedNotification,
    resetFilters,
  } = useNotifications(true);

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      notify.success(t("MarkedAsReadSuccess"));
    } catch {
      notify.error(t("Error"));
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      notify.success(t("AllMarkedAsRead"));
    } catch {
      notify.error(t("Error"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      notify.success(t("NotificationDeleted"));
    } catch {
      notify.error(t("Error"));
    }
  };

  const breadcrumbs = [
    { title: t("Dashboard"), to: "/" },
    { title: t("NotificationsCenter") },
  ];

  return (
    <PageContainer title={t("NotificationsCenter")} description={t("NotificationsSubtitle")}>
      <Breadcrumb title={t("NotificationsCenter")} items={breadcrumbs} />

      <Box sx={{ mt: 3 }}>
        <Card
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderRadius: "12px",
            border: (theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* Header Summary */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Typography variant="h6" fontWeight={600}>
                  {t("NotificationsCenter")}
                </Typography>
                {unreadCount > 0 && (
                  <Chip
                    label={`${unreadCount} ${t("Unread")}`}
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                )}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("NotificationsSubtitle")}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {/* Filters Toolbar */}
          <NotificationFilters
            unreadOnly={unreadOnly}
            selectedCategory={selectedCategory}
            searchQuery={searchQuery}
            unreadCount={unreadCount}
            onSetUnreadOnly={setUnreadOnly}
            onSetCategory={setSelectedCategory}
            onSetSearch={setSearchQuery}
            onMarkAllAsRead={handleMarkAllAsRead}
            onRefresh={fetchNotifications}
            onReset={resetFilters}
            hasActiveFilters={Boolean(searchQuery || selectedCategory || unreadOnly)}
          />

          {/* Error Alert */}
          {error && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={fetchNotifications} startIcon={<IconRefresh size={16} />}>
                  {t("Retry")}
                </Button>
              }
              sx={{ mb: 3, borderRadius: "8px" }}
            >
              {error}
            </Alert>
          )}

          {/* Loading Skeletons */}
          {loading === "pending" && (
            <Stack spacing={2}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" height={88} sx={{ borderRadius: "8px" }} />
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {loading !== "pending" && !error && items.length === 0 && (
            <Box
              sx={{
                py: 8,
                textAlign: "center",
                bgcolor: "background.paper",
                borderRadius: "8px",
                border: "1px dashed",
                borderColor: "divider",
              }}
            >
              <IconBellOff size={48} stroke={1.2} style={{ opacity: 0.5, marginBottom: 12 }} />
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                {unreadOnly ? t("NoUnreadNotifications") : t("NoNotificationsFound")}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {t("NotificationsSubtitle")}
              </Typography>
            </Box>
          )}

          {/* Notification Cards List */}
          {loading !== "pending" && items.length > 0 && (
            <Stack spacing={1.5}>
              {items.map((item) => (
                <NotificationCard
                  key={item.id}
                  notification={item}
                  onSelect={(selected) => {
                    setSelectedNotification(selected);
                    if (!selected.isRead) {
                      handleMarkAsRead(selected.id);
                    }
                  }}
                  onMarkRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}

          {/* Details Dialog */}
          <NotificationDetailsDialog
            notification={selectedNotification}
            open={Boolean(selectedNotification)}
            onClose={() => setSelectedNotification(null)}
            onMarkRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        </Card>
      </Box>
    </PageContainer>
  );
};

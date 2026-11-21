'use client';

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { IconExternalLink, IconCheck, IconTrash } from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { NotificationBadgeIcon } from "./NotificationBadgeIcon";
import { formatFullDateTime } from "../utils/formatTime";
import type { NotificationItem } from "../types";

interface NotificationDetailsDialogProps {
  notification: NotificationItem | null;
  open: boolean;
  onClose: () => void;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const NotificationDetailsDialog: React.FC<NotificationDetailsDialogProps> = ({
  notification,
  open,
  onClose,
  onMarkRead,
  onDelete,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  if (!notification) return null;

  const handleActionClick = () => {
    if (notification.actionUrl) {
      if (!notification.isRead) {
        onMarkRead(notification.id);
      }
      onClose();
      router.push(notification.actionUrl);
    }
  };

  const handleMarkRead = async () => {
    await onMarkRead(notification.id);
  };

  const handleDelete = async () => {
    await onDelete(notification.id);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle component="div" sx={{ pb: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <NotificationBadgeIcon category={notification.category} size={24} avatarSize={44} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography component="div" variant="h6" fontWeight={700} noWrap>
              {notification.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatFullDateTime(notification.createdUtc, locale)}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={notification.category}
              size="small"
              variant="outlined"
              color="primary"
            />
            {notification.isRead ? (
              <Chip
                label={t("Read")}
                size="small"
                color="default"
                variant="filled"
              />
            ) : (
              <Chip
                label={t("Unread")}
                size="small"
                color="warning"
                variant="filled"
              />
            )}
          </Stack>

          <Typography
            variant="body1"
            sx={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.7,
              color: "text.primary",
            }}
          >
            {notification.message}
          </Typography>
        </Stack>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 2, justifyContent: "space-between" }}>
        <Button
          color="error"
          variant="text"
          startIcon={<IconTrash size={18} />}
          onClick={handleDelete}
        >
          {t("DeleteNotification")}
        </Button>
        <Stack direction="row" spacing={1}>
          {!notification.isRead && (
            <Button
              variant="outlined"
              color="primary"
              startIcon={<IconCheck size={18} />}
              onClick={handleMarkRead}
            >
              {t("MarkAsRead")}
            </Button>
          )}
          {notification.actionUrl && (
            <Button
              variant="contained"
              color="primary"
              endIcon={<IconExternalLink size={18} />}
              onClick={handleActionClick}
            >
              {t("SeeAllNotifications")}
            </Button>
          )}
          <Button variant="outlined" color="inherit" onClick={onClose}>
            {t("Close")}
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
};

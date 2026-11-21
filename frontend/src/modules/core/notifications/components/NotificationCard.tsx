'use client';

import React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import {
  IconCheck,
  IconTrash,
  IconExternalLink,
} from "@tabler/icons-react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { NotificationBadgeIcon } from "./NotificationBadgeIcon";
import { formatRelativeTime } from "../utils/formatTime";
import type { NotificationItem } from "../types";

interface NotificationCardProps {
  notification: NotificationItem;
  onSelect: (item: NotificationItem) => void;
  onMarkRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onSelect,
  onMarkRead,
  onDelete,
}) => {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const handleActionNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (notification.actionUrl) {
      if (!notification.isRead) {
        onMarkRead(notification.id);
      }
      router.push(notification.actionUrl);
    }
  };

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: notification.isRead ? "divider" : "primary.main",
        bgcolor: notification.isRead ? "background.paper" : "action.hover",
        borderRadius: 2,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          boxShadow: 2,
          borderColor: "primary.main",
        },
        position: "relative",
      }}
    >
      <CardActionArea
        onClick={() => onSelect(notification)}
        sx={{
          p: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          textAlign: "inherit",
        }}
      >
        <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "flex-start" }}>
          {/* Category Icon */}
          <NotificationBadgeIcon category={notification.category} size={22} avatarSize={44} />

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
              <Typography
                variant="subtitle1"
                fontWeight={notification.isRead ? 600 : 700}
                color={notification.isRead ? "text.primary" : "primary.main"}
                noWrap
                sx={{ flex: 1 }}
              >
                {notification.title}
              </Typography>
              {!notification.isRead && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "primary.main",
                    flexShrink: 0,
                  }}
                />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                {formatRelativeTime(notification.createdUtc, locale)}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                mb: 1,
              }}
            >
              {notification.message}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Chip
                label={notification.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem", height: 22 }}
              />

              {/* Action Buttons */}
              <Stack direction="row" spacing={0.5} alignItems="center" onClick={(e) => e.stopPropagation()}>
                {notification.actionUrl && (
                  <Tooltip title={t("SeeAllNotifications")}>
                    <IconButton size="small" color="primary" onClick={handleActionNavigate}>
                      <IconExternalLink size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                {!notification.isRead && (
                  <Tooltip title={t("MarkAsRead")}>
                    <IconButton size="small" color="success" onClick={handleMarkRead}>
                      <IconCheck size={18} />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={t("DeleteNotification")}>
                  <IconButton size="small" color="error" onClick={handleDelete}>
                    <IconTrash size={18} />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </CardActionArea>
    </Card>
  );
};

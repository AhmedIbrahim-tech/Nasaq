'use client';

import React from "react";
import Avatar from "@mui/material/Avatar";
import {
  IconClockCheck,
  IconCalendarTime,
  IconAward,
  IconCalendar,
  IconShield,
  IconInfoCircle,
  IconCircleCheck,
  IconAlertTriangle,
  IconAlertCircle,
  IconBell,
} from "@tabler/icons-react";
import type { NotificationCategory } from "../types";

interface NotificationBadgeIconProps {
  category: NotificationCategory;
  size?: number;
  avatarSize?: number;
}

export const NotificationBadgeIcon: React.FC<NotificationBadgeIconProps> = ({
  category,
  size = 20,
  avatarSize = 40,
}) => {
  switch (category) {
    case "Attendance":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "info.light",
            color: "info.main",
          }}
        >
          <IconClockCheck size={size} stroke={1.8} />
        </Avatar>
      );
    case "Leaves":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <IconCalendarTime size={size} stroke={1.8} />
        </Avatar>
      );
    case "Points":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "warning.light",
            color: "warning.main",
          }}
        >
          <IconAward size={size} stroke={1.8} />
        </Avatar>
      );
    case "Schedules":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "secondary.light",
            color: "secondary.main",
          }}
        >
          <IconCalendar size={size} stroke={1.8} />
        </Avatar>
      );
    case "System":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "error.light",
            color: "error.main",
          }}
        >
          <IconShield size={size} stroke={1.8} />
        </Avatar>
      );
    case "Success":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "success.light",
            color: "success.main",
          }}
        >
          <IconCircleCheck size={size} stroke={1.8} />
        </Avatar>
      );
    case "Warning":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "warning.light",
            color: "warning.main",
          }}
        >
          <IconAlertTriangle size={size} stroke={1.8} />
        </Avatar>
      );
    case "Error":
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "error.light",
            color: "error.main",
          }}
        >
          <IconAlertCircle size={size} stroke={1.8} />
        </Avatar>
      );
    case "Info":
    default:
      return (
        <Avatar
          sx={{
            width: avatarSize,
            height: avatarSize,
            bgcolor: "primary.light",
            color: "primary.main",
          }}
        >
          <IconInfoCircle size={size} stroke={1.8} />
        </Avatar>
      );
  }
};

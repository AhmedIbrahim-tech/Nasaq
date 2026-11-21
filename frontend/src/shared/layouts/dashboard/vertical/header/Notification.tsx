'use client';

import React, { useState } from 'react';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { IconBellRinging, IconChecks } from '@tabler/icons-react';
import Scrollbar from '@/shared/components/custom-scroll/Scrollbar';
import { useHeaderNotifications } from '@/modules/core/notifications/hooks/useHeaderNotifications';
import { NotificationBadgeIcon } from '@/modules/core/notifications/components/NotificationBadgeIcon';
import { formatRelativeTime } from '@/modules/core/notifications/utils/formatTime';
import type { NotificationItem } from '@/modules/core/notifications/types';

const Notifications: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const locale = useLocale();
  const router = useRouter();
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);

  const {
    unreadCount,
    recentItems,
    recentLoading,
    fetchRecent,
    markAsRead,
    markAllAsRead,
  } = useHeaderNotifications();

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
    fetchRecent(5);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleItemClick = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    handleClose2();
    if (item.actionUrl) {
      let url = item.actionUrl;
      if (url.startsWith('/BankAccounts')) url = '/treasury/bank-accounts';
      else if (url.startsWith('/Treasury')) url = '/treasury';
      else if (url.startsWith('/Sales')) url = '/sales';
      else if (url.startsWith('/Purchases')) url = '/purchases';
      router.push(url);
    }
  };

  const handleMarkAll = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label={t("Notifications")}
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          color: anchorEl2 ? 'primary.main' : 'text.secondary',
        }}
        onClick={handleClick2}
      >
        <Badge
          badgeContent={unreadCount > 99 ? '99+' : unreadCount}
          color="error"
          invisible={unreadCount === 0}
        >
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: isRtl ? 'left' : 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '360px',
            borderRadius: 2,
            boxShadow: 4,
          },
        }}
      >
        <Stack direction="row" py={2} px={3} justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={700}>
            {t("Notifications")}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {unreadCount > 0 ? (
              <>
                <Chip
                  label={`${unreadCount} ${t("Unread")}`}
                  color="warning"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                />
                <IconButton
                  size="small"
                  color="primary"
                  title={t("MarkAllAsRead")}
                  onClick={handleMarkAll}
                >
                  <IconChecks size={18} />
                </IconButton>
              </>
            ) : (
              <Chip
                label={t("Read")}
                color="default"
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            )}
          </Stack>
        </Stack>

        <Scrollbar sx={{ maxHeight: '385px' }}>
          {recentLoading && (
            <Stack spacing={1.5} sx={{ p: 2 }}>
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" spacing={2} alignItems="center">
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="90%" />
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}

          {!recentLoading && recentItems.length === 0 && (
            <Box py={4} textAlign="center">
              <Typography variant="body2" color="text.secondary">
                {t("NoNotificationsFound")}
              </Typography>
            </Box>
          )}

          {!recentLoading &&
            recentItems.map((notification) => (
              <MenuItem
                key={notification.id}
                sx={{
                  py: 1.5,
                  px: 2.5,
                  bgcolor: notification.isRead ? 'transparent' : 'action.hover',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  '&:last-child': { borderBottom: 0 },
                }}
                onClick={() => handleItemClick(notification)}
              >
                <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ width: '100%' }}>
                  <NotificationBadgeIcon
                    category={notification.category}
                    size={20}
                    avatarSize={38}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="subtitle2"
                        color={notification.isRead ? 'text.primary' : 'primary.main'}
                        fontWeight={notification.isRead ? 600 : 700}
                        noWrap
                        sx={{ maxWidth: '170px' }}
                      >
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                        {formatRelativeTime(notification.createdUtc, locale)}
                      </Typography>
                    </Stack>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: '0.8rem',
                        mt: 0.25,
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </Box>
                </Stack>
              </MenuItem>
            ))}
        </Scrollbar>

        <Box p={2} pt={1.5} sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            href="/notifications"
            variant="outlined"
            component={Link}
            color="primary"
            fullWidth
            onClick={handleClose2}
          >
            {t("SeeAllNotifications")}
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;

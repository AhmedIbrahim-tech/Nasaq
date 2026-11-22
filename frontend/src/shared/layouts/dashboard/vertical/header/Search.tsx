"use client";

import React, { useState, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";
import {
  IconSearch,
  IconX,
  IconArrowRight,
  IconArrowLeft,
  IconSearchOff,
} from "@tabler/icons-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { useAppSelector } from "@/store/hooks";
import Menuitems, { MenuitemsType } from "../sidebar/MenuItems";
import { filterVerticalMenuItems } from "@/shared/utils/navigationFilter";
import DialogCloseButton from "@/shared/components/buttons/DialogCloseButton";

interface SearchItem {
  id: string;
  title: string;
  localizedTitle: string;
  href: string;
  icon: any;
  subheader: string;
}

const NAV_ITEM_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  Dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  Employees: { ar: "الموظفون", en: "Employees" },
  WorkLocations: { ar: "مواقع العمل", en: "Work Locations" },
  "Work Locations": { ar: "مواقع العمل", en: "Work Locations" },
  WorkSchedules: { ar: "جداول العمل", en: "Work Schedules" },
  "Work Schedules": { ar: "جداول العمل", en: "Work Schedules" },
  Attendance: { ar: "الحضور والانصراف", en: "Attendance" },
  PointsAndPenalties: { ar: "النقاط والجزاءات", en: "Points & Penalties" },
  "Points & Penalties": { ar: "النقاط والجزاءات", en: "Points & Penalties" },
  LeaveManagement: { ar: "إدارة الإجازات", en: "Leave Management" },
  "Leave Management": { ar: "إدارة الإجازات", en: "Leave Management" },
  AdminOperations: { ar: "العمليات والإشراف", en: "Admin Operations" },
  "Admin Operations": { ar: "العمليات والإشراف", en: "Admin Operations" },
  Reports: { ar: "التقارير", en: "Reports" },
  Profile: { ar: "الملف الشخصي", en: "Profile" },
  Notifications: { ar: "الإشعارات", en: "Notifications" },
  Settings: { ar: "الإعدادات", en: "Settings" },
  System: { ar: "النظام", en: "System" },
  Main: { ar: "الرئيسية", en: "Main" },
  Workforce: { ar: "القوى العاملة", en: "Workforce" },
};

const Search: React.FC = () => {
  const t = useTranslations();
  const theme = useTheme();
  const locale = useLocale();
  const isRtl = locale.startsWith("ar") || theme.direction === "rtl";
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const roles = useAppSelector((state) => state.auth.roles) ?? [];

  // Global keyboard shortcut: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpen = () => {
    setSearch("");
    setOpen(true);
  };

  const handleClose = () => {
    setSearch("");
    setOpen(false);
  };

  // Filter menu items by user roles
  const authorizedMenuItems = useMemo(() => {
    return filterVerticalMenuItems(Menuitems, {
      effectiveRoles: roles,
      effectivePermissions: [],
      permissionsLoading: false,
    });
  }, [roles]);

  // Flatten routable items with localized titles & subheaders
  const allNavItems = useMemo<SearchItem[]>(() => {
    const resolveTitle = (raw: string): string => {
      if (!raw) return "";
      if (NAV_ITEM_TRANSLATIONS[raw]) {
        return isRtl ? NAV_ITEM_TRANSLATIONS[raw].ar : NAV_ITEM_TRANSLATIONS[raw].en;
      }
      if (t.has(raw as any)) {
        const val = t(raw as any);
        if (val && val !== raw) return val;
      }
      return raw;
    };

    const result: SearchItem[] = [];
    let currentSubheader = "";

    for (const item of authorizedMenuItems) {
      if (item.subheader) {
        currentSubheader = resolveTitle(item.subheader);
        continue;
      }

      if (item.title && item.href) {
        const localizedTitle = resolveTitle(item.title);
        result.push({
          id: item.id || item.title,
          title: item.title,
          localizedTitle,
          href: item.href,
          icon: item.icon,
          subheader: currentSubheader,
        });
      }

      if (item.children) {
        for (const child of item.children) {
          if (child.title && child.href) {
            const localizedTitle = resolveTitle(child.title);
            result.push({
              id: child.id || child.title,
              title: child.title,
              localizedTitle,
              href: child.href,
              icon: child.icon || item.icon,
              subheader: currentSubheader,
            });
          }
        }
      }
    }

    return result;
  }, [authorizedMenuItems, t, isRtl]);

  // Filter based on search query across localized title, raw title, href, and subheader
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allNavItems;

    return allNavItems.filter((item) => {
      const matchLocalized = item.localizedTitle.toLowerCase().includes(q);
      const matchRaw = item.title.toLowerCase().includes(q);
      const matchHref = item.href.toLowerCase().includes(q);
      const matchSub = item.subheader.toLowerCase().includes(q);
      return matchLocalized || matchRaw || matchHref || matchSub;
    });
  }, [allNavItems, search]);

  return (
    <>
      <Tooltip title={`${t("Search")} (Ctrl+K)`}>
        <IconButton
          aria-label={t("Search")}
          color="inherit"
          aria-controls="search-menu"
          aria-haspopup="true"
          onClick={handleOpen}
          size="large"
          sx={{
            color: open ? "primary.main" : "text.secondary",
            transition: "all 0.2s",
            "&:hover": {
              color: "primary.main",
              bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
            },
          }}
        >
          <IconSearch size={20} stroke={1.75} />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="sm"
        dir={isRtl ? "rtl" : "ltr"}
        aria-labelledby="global-search-dialog-title"
        PaperProps={{
          sx: {
            direction: isRtl ? "rtl" : "ltr",
            textAlign: isRtl ? "right" : "left",
            position: "fixed",
            top: { xs: 30, sm: 60 },
            m: 0,
            borderRadius: "14px",
            border: (th) => `1px solid ${th.palette.divider}`,
            boxShadow: (th) => `0 16px 48px ${alpha(th.palette.common.black, 0.16)}`,
            overflow: "hidden",
            bgcolor: "background.paper",
          },
        }}
      >
        {/* Search Header Bar */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <IconSearch size={22} stroke={1.75} />
          </Box>

          <InputBase
            id="global-search-input"
            autoFocus
            fullWidth
            placeholder={isRtl ? "ابحث عن صفحة بالاسم أو المسار..." : "Search pages by name or route..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            inputProps={{
              "aria-label": isRtl ? "بحث الصفحات" : "Search Pages",
              style: { textAlign: isRtl ? "right" : "left" },
            }}
            sx={{
              fontSize: "1rem",
              fontWeight: 500,
              color: "text.primary",
            }}
          />

          {search && (
            <IconButton
              size="small"
              onClick={() => setSearch("")}
              aria-label={isRtl ? "مسح البحث" : "Clear Search"}
              sx={{ color: "text.secondary", p: 0.5 }}
            >
              <IconX size={18} />
            </IconButton>
          )}

          <DialogCloseButton size="small" onClose={handleClose} />
        </Box>

        {/* Results Container */}
        <Box sx={{ maxHeight: "55vh", overflowY: "auto", p: 1.5 }}>
          {filteredItems.length > 0 ? (
            <>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{
                  px: 1.5,
                  pt: 0.5,
                  pb: 1,
                  display: "block",
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  textAlign: isRtl ? "right" : "left",
                }}
              >
                {search.trim()
                  ? (isRtl ? "نتائج البحث" : "Search Results")
                  : (isRtl ? "روابط الصفحات السريعة" : "Quick Page Links")}
              </Typography>

              <List component="nav" disablePadding>
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <ListItemButton
                      key={item.id}
                      component={Link}
                      href={item.href}
                      onClick={handleClose}
                      sx={{
                        borderRadius: "10px",
                        p: 1.25,
                        mb: 0.5,
                        display: "flex",
                        alignItems: "center",
                        gap: 1.75,
                        transition: "all 0.15s ease-in-out",
                        "&:hover": {
                          bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
                          "& .nav-arrow": {
                            opacity: 1,
                            color: "primary.main",
                            transform: isRtl ? "translateX(-3px)" : "translateX(3px)",
                          },
                          "& .nav-icon-box": {
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                          },
                        },
                      }}
                    >
                      {/* Icon Container */}
                      <Box
                        className="nav-icon-box"
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "8px",
                          bgcolor: (th) => alpha(th.palette.primary.main, 0.08),
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        {Icon ? (
                          <Icon size={20} stroke={1.75} />
                        ) : (
                          <IconSearch size={20} stroke={1.75} />
                        )}
                      </Box>

                      {/* Title & Route Subtitle */}
                      <Box
                        sx={{
                          minWidth: 0,
                          flex: 1,
                          textAlign: isRtl ? "right" : "left",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          fontWeight={600}
                          color="text.primary"
                          noWrap
                        >
                          {item.localizedTitle}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          sx={{ display: "block", mt: 0.25 }}
                        >
                          {item.subheader && `${item.subheader} • `}
                          <span
                            style={{
                              direction: "ltr",
                              unicodeBidi: "isolate",
                              display: "inline-block",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {item.href}
                          </span>
                        </Typography>
                      </Box>

                      {/* Direction-Aware Trailing Arrow */}
                      <Box
                        className="nav-arrow"
                        sx={{
                          color: "text.disabled",
                          display: "flex",
                          alignItems: "center",
                          opacity: 0.35,
                          transition: "all 0.15s ease-in-out",
                        }}
                      >
                        {isRtl ? (
                          <IconArrowLeft size={18} stroke={1.75} />
                        ) : (
                          <IconArrowRight size={18} stroke={1.75} />
                        )}
                      </Box>
                    </ListItemButton>
                  );
                })}
              </List>
            </>
          ) : (
            /* Empty State */
            <Box sx={{ py: 6, px: 3, textAlign: "center" }}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  bgcolor: (th) => alpha(th.palette.warning.main, 0.1),
                  color: "warning.main",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <IconSearchOff size={28} stroke={1.75} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} color="text.primary">
                {t.has("NoMatchingPages") ? t("NoMatchingPages") : (isRtl ? "لم يتم العثور على صفحات مطابقة" : "No matching pages found")}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5, maxWidth: 360, mx: "auto" }}
              >
                {t.has("SearchPagesHint") ? t("SearchPagesHint") : (isRtl ? "جرّب البحث باسم الصفحة أو الكلمة المفتاحية أو المسار" : "Try searching by page name, keyword, or URL path")}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Footer Shortcut Bar */}
        <Divider />
        <Box
          sx={{
            px: 2.5,
            py: 1.25,
            bgcolor: (th) => alpha(th.palette.text.primary, 0.03),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Chip
              label="ESC"
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                fontWeight: 700,
                fontFamily: "monospace",
                bgcolor: "action.hover",
                color: "text.secondary",
              }}
            />
            <Typography variant="caption" color="text.secondary">
              {t.has("PressEscToClose") ? t("PressEscToClose") : (isRtl ? "اضغط ESC للإغلاق" : "Press ESC to close")}
            </Typography>
          </Stack>

          <Typography
            variant="caption"
            color="text.disabled"
            sx={{ fontWeight: 600, letterSpacing: 0.5 }}
          >
            NASAQ
          </Typography>
        </Box>
      </Dialog>
    </>
  );
};

export default Search;

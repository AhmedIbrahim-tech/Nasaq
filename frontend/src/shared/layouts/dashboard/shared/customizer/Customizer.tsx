'use client';

import React, { FC, useState, useContext, useEffect } from "react";
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Fab from '@mui/material/Fab';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { styled, useTheme, alpha } from '@mui/material/styles';
import DialogCloseButton from '@/shared/components/buttons/DialogCloseButton';

import { CustomizerContext } from "@/theme/customizerContext";
import Box, { BoxProps } from "@mui/material/Box";
import { IconX, IconSettings, IconCheck } from "@tabler/icons-react";
import Scrollbar from "@/shared/components/custom-scroll/Scrollbar";
import WbSunnyTwoToneIcon from "@mui/icons-material/WbSunnyTwoTone";
import DarkModeTwoToneIcon from "@mui/icons-material/DarkModeTwoTone";
import SwipeLeftAltTwoToneIcon from "@mui/icons-material/SwipeLeftAltTwoTone";
import SwipeRightAltTwoToneIcon from "@mui/icons-material/SwipeRightAltTwoTone";
import AspectRatioTwoToneIcon from "@mui/icons-material/AspectRatioTwoTone";
import CallToActionTwoToneIcon from "@mui/icons-material/CallToActionTwoTone";
import ViewSidebarTwoToneIcon from "@mui/icons-material/ViewSidebarTwoTone";
import WebAssetTwoToneIcon from "@mui/icons-material/WebAssetTwoTone";
import {
  BorderOuter,
} from "@mui/icons-material";
import { useTranslations } from "next-intl";

const SidebarWidth = "320px";

export const openCustomizer = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nasaq:open-customizer'));
  }
};

interface Colors {
  id: number;
  bgColor: string;
  disp: string;
  nameEn: string;
  nameAr: string;
}

const Customizer: FC = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const theme = useTheme();
  const t = useTranslations();
  const isRtl = theme.direction === 'rtl';

  const {
    activeDir,
    setActiveDir,
    activeMode,
    setActiveMode,
    isCollapse,
    setIsCollapse,
    activeTheme,
    isLayout,
    isCardShadow,
    setIsCardShadow,
    setIsLayout,
    isBorderRadius,
    setIsBorderRadius,
    setActiveTheme
  } = useContext(CustomizerContext);

  useEffect(() => {
    const handleOpen = () => setShowDrawer(true);
    window.addEventListener("nasaq:open-customizer", handleOpen);
    return () => window.removeEventListener("nasaq:open-customizer", handleOpen);
  }, []);

  const StyledBox = styled(Box)<BoxProps>(({ theme }) => ({
    boxShadow: theme.shadows[1],
    padding: "16px",
    cursor: "pointer",
    justifyContent: "center",
    display: "flex",
    alignItems: "center",
    borderRadius: "10px",
    transition: "all 0.2s ease-in-out",
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      transform: "translateY(-2px)",
      borderColor: theme.palette.primary.main,
      boxShadow: theme.shadows[4],
    },
  }));

  const thColors: Colors[] = [
    { id: 1, bgColor: "#5D87FF", disp: "BLUE_THEME", nameEn: "Blue", nameAr: "أزرق" },
    { id: 2, bgColor: "#0074BA", disp: "AQUA_THEME", nameEn: "Aqua", nameAr: "مائي" },
    { id: 3, bgColor: "#763EBD", disp: "PURPLE_THEME", nameEn: "Purple", nameAr: "بنفسجي" },
    { id: 4, bgColor: "#0A7EA4", disp: "GREEN_THEME", nameEn: "Green", nameAr: "أخضر" },
    { id: 5, bgColor: "#01C0C8", disp: "CYAN_THEME", nameEn: "Cyan", nameAr: "سماوي" },
    { id: 6, bgColor: "#FA896B", disp: "ORANGE_THEME", nameEn: "Orange", nameAr: "برتقالي" },
  ];

  return (
    <div>
      {/* Direction-Aware Floating Button */}
      <Tooltip title={isRtl ? "تخصيص الواجهة (Settings)" : "Customize Interface (الإعدادات)"}>
        <Fab
          color="primary"
          aria-label="settings"
          onClick={() => setShowDrawer(true)}
          sx={{
            position: "fixed",
            insetInlineEnd: "25px",
            bottom: "25px",
            zIndex: 1250,
            width: 48,
            height: 48,
            boxShadow: (theme) => `0 4px 14px ${alpha(theme.palette.primary.main, 0.45)}`,
            transition: "all 0.25s ease",
            "&:hover": {
              transform: "rotate(30deg) scale(1.08)",
            },
          }}
        >
          <IconSettings stroke={1.8} size={24} />
        </Fab>
      </Tooltip>

      {/* Direction-Aware Drawer (Anchors opposite from the sidebar) */}
      <Drawer
        anchor={isRtl ? "left" : "right"}
        open={showDrawer}
        onClose={() => setShowDrawer(false)}
        slotProps={{
          paper: {
            sx: {
              width: SidebarWidth,
              borderInlineStart: `1px solid ${theme.palette.divider}`,
              bgcolor: "background.paper",
            },
          }
        }}
      >
        <Scrollbar sx={{ height: "calc(100vh - 5px)" }}>
          {/* Drawer Header */}
          <Box
            p={2.5}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h5" fontWeight={700}>
              {isRtl ? "تخصيص الواجهة" : "Theme Settings"}
            </Typography>

            <DialogCloseButton onClose={() => setShowDrawer(false)} size="small" />
          </Box>
          <Divider />

          <Box p={3}>
            {/* Theme Option (Light / Dark) */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "نمط المظهر" : "Theme Mode"}
            </Typography>
            <Stack direction="row" gap={2} my={1.5}>
              <StyledBox
                onClick={() => setActiveMode("light")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: activeMode === "light" ? "primary.main" : "divider",
                  bgcolor: activeMode === "light" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <WbSunnyTwoToneIcon color={activeMode === "light" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>
                  {isRtl ? "فاتح" : "Light"}
                </Typography>
              </StyledBox>
              <StyledBox
                onClick={() => setActiveMode("dark")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: activeMode === "dark" ? "primary.main" : "divider",
                  bgcolor: activeMode === "dark" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <DarkModeTwoToneIcon color={activeMode === "dark" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>
                  {isRtl ? "داكن" : "Dark"}
                </Typography>
              </StyledBox>
            </Stack>

            <Box pt={2.5} />

            {/* Layout Direction */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "اتجاه الواجهة" : "Theme Direction"}
            </Typography>
            <Stack direction="row" gap={2} my={1.5}>
              <StyledBox
                onClick={() => setActiveDir("ltr")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: activeDir === "ltr" ? "primary.main" : "divider",
                  bgcolor: activeDir === "ltr" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <SwipeLeftAltTwoToneIcon color={activeDir === "ltr" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>LTR</Typography>
              </StyledBox>
              <StyledBox
                onClick={() => setActiveDir("rtl")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: activeDir === "rtl" ? "primary.main" : "divider",
                  bgcolor: activeDir === "rtl" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <SwipeRightAltTwoToneIcon color={activeDir === "rtl" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>RTL</Typography>
              </StyledBox>
            </Stack>

            <Box pt={2.5} />

            {/* Theme Colors */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "ألوان السمة" : "Theme Colors"}
            </Typography>
            <Grid container spacing={1.5} my={0.5}>
              {thColors.map((thcolor) => (
                <Grid key={thcolor.id} size={4}>
                  <StyledBox
                    onClick={() => setActiveTheme(thcolor.disp)}
                    sx={{
                      p: 1.25,
                      borderColor: activeTheme === thcolor.disp ? "primary.main" : "divider",
                      bgcolor: activeTheme === thcolor.disp ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                    }}
                  >
                    <Tooltip title={isRtl ? thcolor.nameAr : thcolor.nameEn} placement="top">
                      <Box
                        sx={{
                          backgroundColor: thcolor.bgColor,
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          alignItems: "center",
                          justifyContent: "center",
                          display: "flex",
                          color: "white",
                          boxShadow: `0 2px 6px ${alpha(thcolor.bgColor, 0.4)}`,
                        }}
                      >
                        {activeTheme === thcolor.disp && <IconCheck size={16} stroke={3} />}
                      </Box>
                    </Tooltip>
                  </StyledBox>
                </Grid>
              ))}
            </Grid>

            <Box pt={2.5} />

            {/* Container Option (Boxed / Full) */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "عرض الحاوية" : "Container Width"}
            </Typography>
            <Stack direction="row" gap={2} my={1.5}>
              <StyledBox
                onClick={() => setIsLayout("boxed")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: isLayout === "boxed" ? "primary.main" : "divider",
                  bgcolor: isLayout === "boxed" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <CallToActionTwoToneIcon color={isLayout === "boxed" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "محدد" : "Boxed"}</Typography>
              </StyledBox>
              <StyledBox
                onClick={() => setIsLayout("full")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: isLayout === "full" ? "primary.main" : "divider",
                  bgcolor: isLayout === "full" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <AspectRatioTwoToneIcon color={isLayout === "full" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "كامل" : "Full"}</Typography>
              </StyledBox>
            </Stack>

            <Box pt={2.5} />

            {/* Sidebar Collapse Option */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "القائمة الجانبية" : "Sidebar Layout"}
            </Typography>
            <Stack direction="row" gap={2} my={1.5}>
              <StyledBox
                onClick={() => setIsCollapse("full-sidebar")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: isCollapse === "full-sidebar" ? "primary.main" : "divider",
                  bgcolor: isCollapse === "full-sidebar" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <WebAssetTwoToneIcon color={isCollapse === "full-sidebar" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "كاملة" : "Full"}</Typography>
              </StyledBox>
              <StyledBox
                onClick={() => setIsCollapse("mini-sidebar")}
                flex={1}
                gap={1}
                sx={{
                  borderColor: isCollapse === "mini-sidebar" ? "primary.main" : "divider",
                  bgcolor: isCollapse === "mini-sidebar" ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <ViewSidebarTwoToneIcon color={isCollapse === "mini-sidebar" ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "مصغرة" : "Mini"}</Typography>
              </StyledBox>
            </Stack>

            <Box pt={2.5} />

            {/* Card Shadow / Border */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "نمط البطاقات" : "Card Style"}
            </Typography>
            <Stack direction="row" gap={2} my={1.5}>
              <StyledBox
                onClick={() => setIsCardShadow(false)}
                flex={1}
                gap={1}
                sx={{
                  borderColor: !isCardShadow ? "primary.main" : "divider",
                  bgcolor: !isCardShadow ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <BorderOuter color={!isCardShadow ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "إطار" : "Border"}</Typography>
              </StyledBox>
              <StyledBox
                onClick={() => setIsCardShadow(true)}
                flex={1}
                gap={1}
                sx={{
                  borderColor: isCardShadow ? "primary.main" : "divider",
                  bgcolor: isCardShadow ? alpha(theme.palette.primary.main, 0.08) : "background.paper",
                }}
              >
                <CallToActionTwoToneIcon color={isCardShadow ? "primary" : "inherit"} />
                <Typography variant="body2" fontWeight={600}>{isRtl ? "ظل" : "Shadow"}</Typography>
              </StyledBox>
            </Stack>

            <Box pt={2.5} />

            {/* Border Radius Slider */}
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
              {isRtl ? "انحناء الزوايا" : "Border Radius"} ({isBorderRadius}px)
            </Typography>
            <Slider
              size="small"
              value={isBorderRadius}
              aria-label="Border Radius"
              min={4}
              max={20}
              onChange={(_: any, val: number | number[]) => setIsBorderRadius(val as number)}
              valueLabelDisplay="auto"
              sx={{ mt: 1 }}
            />
          </Box>
        </Scrollbar>
      </Drawer>
    </div>
  );
};

export default Customizer;

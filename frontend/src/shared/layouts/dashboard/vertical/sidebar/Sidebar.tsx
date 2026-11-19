'use client';

import React, { useContext } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { IconX } from "@tabler/icons-react";

import SidebarItems from "./SidebarItems";
import Logo from "../../shared/logo/Logo";
import { CustomizerContext } from "@/theme/customizerContext";
import config from '@/theme/config';
import Scrollbar from "@/shared/components/custom-scroll/Scrollbar";
import { Profile } from "./SidebarProfile/Profile";

const Sidebar = () => {
  const lgDown = useMediaQuery((theme: any) => theme.breakpoints.down("lg"));
  const {
    isCollapse,
    isSidebarHover,
    setIsSidebarHover,
    isMobileSidebar,
    setIsMobileSidebar,
  } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const SidebarWidth = config.sidebarWidth;

  const theme = useTheme();
  const isRtl = theme.direction === 'rtl';
  const isDark = theme.palette.mode === 'dark';

  const isMini = isCollapse === "mini-sidebar";
  const toggleWidth = isMini ? MiniSidebarWidth : SidebarWidth;

  return (
    <>
      {!lgDown ? (
        <Box
          component="aside"
          aria-label="Desktop Sidebar"
          sx={{
            zIndex: 100,
            width: toggleWidth,
            flexShrink: 0,
            ...(isCollapse === "mini-sidebar" && {
              position: "absolute",
            }),
          }}
        >
          {/* Sidebar for desktop */}
          <Drawer
            anchor={isRtl ? 'right' : 'left'}
            open
            variant="permanent"
            slotProps={{
              paper: {
                sx: {
                  transition: theme.transitions.create("width", {
                    duration: theme.transitions.duration.shorter,
                    easing: theme.transitions.easing.easeInOut,
                  }),
                  width: toggleWidth,
                  boxSizing: "border-box",
                  left: isRtl ? 'auto !important' : '0 !important',
                  right: isRtl ? '0 !important' : 'auto !important',
                  bgcolor: isDark ? '#14181f' : '#ffffff',
                  backgroundImage: 'none',
                  borderRight: isRtl ? 'none' : `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}`,
                  borderLeft: isRtl ? `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)'}` : 'none',
                  boxShadow: 'none',
                },
              }
            }}
          >
            {/* Sidebar Inner Container */}
            <Box
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              {/* Branding / Logo */}
              <Box
                px={isMini ? 1 : 2}
                sx={{
                  flexShrink: 0,
                  height: config.topbarHeight,
                  display: 'flex',
                  alignItems: 'center',
                  borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
                }}
              >
                <Logo />
              </Box>

              {/* Navigation List */}
              <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
                <Scrollbar sx={{ height: "100%", '& .simplebar-content': { overflowX: 'hidden' } }}>
                  <SidebarItems />
                </Scrollbar>
              </Box>

              {/* Profile / Account area */}
              <Box
                sx={{
                  flexShrink: 0,
                  borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'}`,
                }}
              >
                <Profile />
              </Box>
            </Box>
          </Drawer>
        </Box>
      ) : (
        /* Mobile Drawer */
        <Drawer
          anchor={isRtl ? 'right' : 'left'}
          open={isMobileSidebar}
          onClose={() => setIsMobileSidebar(false)}
          variant="temporary"
          aria-label="Mobile Navigation Drawer"
          slotProps={{
            paper: {
              sx: {
                width: { xs: 'min(290px, 86vw)', sm: SidebarWidth },
                maxWidth: '86vw',
                bgcolor: isDark ? '#14181f' : '#ffffff',
                backgroundImage: 'none',
                border: "0 !important",
                boxShadow: isDark
                  ? '0 20px 40px rgba(0,0,0,0.6)'
                  : '0 20px 40px rgba(15,23,42,0.15)',
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              },
            }
          }}
        >
          {/* Mobile Drawer Header with Logo and Close button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              height: config.topbarHeight,
              flexShrink: 0,
              borderBottom: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <Logo />
            <IconButton
              aria-label="close-mobile-sidebar"
              onClick={() => setIsMobileSidebar(false)}
              size="small"
              sx={{
                width: 32,
                height: 32,
                borderRadius: '8px',
                color: 'text.secondary',
                bgcolor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)',
                '&:hover': {
                  bgcolor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
                  color: 'text.primary',
                },
              }}
            >
              <IconX size={18} stroke={2} />
            </IconButton>
          </Box>

          {/* Scrollable Navigation for Mobile */}
          <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
            <Scrollbar sx={{ height: "100%", '& .simplebar-content': { overflowX: 'hidden' } }}>
              <SidebarItems />
            </Scrollbar>
          </Box>

          {/* Profile at Bottom of Mobile Drawer */}
          <Box
            sx={{
              flexShrink: 0,
              borderTop: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'}`,
            }}
          >
            <Profile />
          </Box>
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;

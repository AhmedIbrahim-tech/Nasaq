"use client";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { styled, useTheme } from "@mui/material/styles";
import React, { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthSessionContext } from "@/modules/auth";
import Loading from "@/app/loading";
import Header from "@/shared/layouts/dashboard/vertical/header/Header";
import Sidebar from "@/shared/layouts/dashboard/vertical/sidebar/Sidebar";
import Customizer from "@/shared/layouts/dashboard/shared/customizer/Customizer";
import Navigation from "@/shared/layouts/dashboard/horizontal/navbar/Navigation";
import HorizontalHeader from "@/shared/layouts/dashboard/horizontal/header/Header";
import { CustomizerContext } from "@/theme/customizerContext";
import config from "@/theme/config";

import { ConnectionRecoveryView } from "@/shared/components/recovery/ConnectionRecoveryView";
import { OnboardingCoordinator } from "@/shared/components/onboarding/OnboardingCoordinator";

const MainWrapper = styled("div")(() => ({
  display: "flex",
  minHeight: "100vh",
  width: "100%",
}));

const PageWrapper = styled("div")(() => ({
  display: "flex",
  flexGrow: 1,
  minWidth: 0,
  paddingBottom: "60px",
  flexDirection: "column",
  zIndex: 1,
  width: "100%",
  backgroundColor: "transparent",
}));

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    status,
    isVerifying,
    errorReason,
    retryCount,
    maxRetries,
    nextRetryIn,
    retryVerification,
    resetAndLogin,
  } = useAuthSessionContext();
  const router = useRouter();
  const { activeLayout, isLayout, isCollapse } = useContext(CustomizerContext);
  const MiniSidebarWidth = config.miniSidebarWidth;
  const theme = useTheme();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "initializing" || status === "unauthenticated") {
    return <Loading />;
  }

  if (status === "unverified") {
    return (
      <ConnectionRecoveryView
        errorReason={errorReason}
        isVerifying={isVerifying}
        retryCount={retryCount}
        maxRetries={maxRetries}
        nextRetryIn={nextRetryIn}
        onRetry={retryVerification}
        onResetAndLogin={resetAndLogin}
      />
    );
  }

  return (
    <MainWrapper>
      {/* ------------------------------------------- */}
      {/* Sidebar */}
      {/* ------------------------------------------- */}
      {activeLayout === "horizontal" ? null : <Sidebar />}
      {/* ------------------------------------------- */}
      {/* Main Wrapper */}
      {/* ------------------------------------------- */}
      <PageWrapper
        className="page-wrapper"
        sx={{
          ...(isCollapse === "mini-sidebar" && {
            [theme.breakpoints.up("lg")]: {
              marginInlineStart: `${MiniSidebarWidth}px`,
            },
          }),
        }}
      >
        {/* ------------------------------------------- */}
        {/* Header */}
        {/* ------------------------------------------- */}
        {activeLayout === 'horizontal' ? <HorizontalHeader /> : <Header />}

        {/* PageContent */}
        {activeLayout === 'horizontal' ? <Navigation /> : ""}
        <Container
          maxWidth={isLayout === "boxed" ? "lg" : false}
          sx={{
            maxWidth: isLayout === "boxed" ? "lg" : "100%!important",
            px: { xs: 1.5, sm: 2.5, md: 3 },
          }}
        >
          {/* ------------------------------------------- */}
          {/* PageContent */}
          {/* ------------------------------------------- */}

          <Box sx={{ minHeight: "calc(100vh - 170px)" }}>
            {/* <Outlet /> */}
            {children}
            {/* <Index /> */}
          </Box>
          <OnboardingCoordinator />

          {/* ------------------------------------------- */}
          {/* End Page */}
          {/* ------------------------------------------- */}
        </Container>
        <Customizer />
      </PageWrapper>
    </MainWrapper>
  );
}

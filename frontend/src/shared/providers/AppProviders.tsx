"use client";
import React, { useContext, ReactNode } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import RTL from "@/shared/layouts/dashboard/shared/customizer/RTL";
import { ThemeSettings } from "@/theme/Theme";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { CustomizerContext, CustomizerContextProvider } from '@/theme/customizerContext';
import { NextIntlClientProvider } from 'next-intl';
import { getMessageFallback, handleTranslationError } from '@/i18n/fallback';

import StoreProvider from '@/store/StoreProvider';

import enMessages from '@/i18n/messages/en.json';
import arMessages from '@/i18n/messages/ar.json';

import { NotificationProvider } from '@/shared/providers/NotificationProvider';
import { SessionTerminationModal } from '@/modules/auth';
import { AuthSessionInitializer } from '@/modules/auth/components/AuthSessionInitializer';
import { RealtimeNotificationsListener } from '@/modules/core/notifications/components/RealtimeNotificationsListener';

import rtlPlugin from 'stylis-plugin-rtl';
import { prefixer } from 'stylis';

const messagesMap: Record<string, any> = {
  en: enMessages,
  ar: arMessages,
};

function InnerProviders({ children }: { children: ReactNode }) {
  const theme = ThemeSettings();
  const { activeDir, isLanguage } = useContext(CustomizerContext);
  const locale = isLanguage === 'ar' ? 'ar' : 'en';
  const messages = messagesMap[locale] || messagesMap.en;
  const isRtl = activeDir === 'rtl';

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={messages}
      getMessageFallback={getMessageFallback}
      onError={handleTranslationError}
    >
      <AppRouterCacheProvider
        key={activeDir}
        options={{
          key: isRtl ? 'muirtl' : 'muiltr',
          stylisPlugins: isRtl ? [prefixer, rtlPlugin] : [],
          enableCssLayer: true,
        }}
      >
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <NotificationProvider>
            <AuthSessionInitializer>
              <RealtimeNotificationsListener />
              {children}
              <SessionTerminationModal />
            </AuthSessionInitializer>
          </NotificationProvider>
        </ThemeProvider>
      </AppRouterCacheProvider>
    </NextIntlClientProvider>
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <CustomizerContextProvider>
        <InnerProviders>{children}</InnerProviders>
      </CustomizerContextProvider>
    </StoreProvider>
  );
}

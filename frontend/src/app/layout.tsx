import React from "react";
import NextTopLoader from 'nextjs-toploader';
import "./global.css";
import AppProviders from "@/shared/providers/AppProviders";
import ServiceWorkerRegister from "@/shared/components/pwa/ServiceWorkerRegister";

export const metadata = {
  title: "Nasaq — Employee Attendance Management",
  description: "Nasaq Employee Attendance and Workforce Management System",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/logos/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icon.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Nasaq',
  },
};

export const viewport = {
  themeColor: '#5D87FF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var m = localStorage.getItem('nasaq-theme-mode') || localStorage.getItem('corestarter-theme-mode');
                  if (m === 'dark' || m === 'light') {
                    document.documentElement.classList.remove('light', 'dark');
                    document.documentElement.classList.add(m);
                    document.documentElement.setAttribute('data-theme-mode', m);
                    if (m === 'dark') {
                      document.documentElement.style.colorScheme = 'dark';
                      document.documentElement.style.backgroundColor = '#171c23';
                    } else {
                      document.documentElement.style.colorScheme = 'light';
                      document.documentElement.style.backgroundColor = '#ffffff';
                    }
                  }
                  var d = localStorage.getItem('nasaq_dir') || localStorage.getItem('corestarter_dir');
                  var l = localStorage.getItem('nasaq_lang') || localStorage.getItem('corestarter_lang');
                  if (d === 'rtl' || d === 'ltr') {
                    document.documentElement.setAttribute('dir', d);
                  } else if (l === 'ar') {
                    document.documentElement.setAttribute('dir', 'rtl');
                  }
                  if (l) {
                    document.documentElement.setAttribute('lang', l);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <ServiceWorkerRegister />
        <NextTopLoader color="#5D87FF" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

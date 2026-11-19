import React from "react";
import NextTopLoader from 'nextjs-toploader';
import "./global.css";
import AppProviders from "@/shared/providers/AppProviders";

export const metadata = {
  title: "CoreStarter — Clean Architecture & Modernize",
  description: "CoreStarter Enterprise Starter Template with .NET 10, Next.js 16, and Material UI",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/logos/favicon.png', sizes: '64x64', type: 'image/png' },
    ],
  },
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
                  var m = localStorage.getItem('corestarter-theme-mode');
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
                  var d = localStorage.getItem('corestarter_dir');
                  var l = localStorage.getItem('corestarter_lang');
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
        <NextTopLoader color="#5D87FF" />
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

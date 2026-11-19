import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Nasaq — Employee Attendance Management',
    short_name: 'Nasaq',
    description: 'Nasaq Employee Attendance and Workforce Management System for Sharm Photographer',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#5D87FF',
    orientation: 'portrait-primary',
    lang: 'ar',
    dir: 'rtl',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/images/logos/favicon.png',
        sizes: '64x64',
        type: 'image/png',
      },
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}

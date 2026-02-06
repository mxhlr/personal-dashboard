import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Real Rise',
    short_name: 'Real Rise',
    description: 'Personal Dashboard für Habits, Goals, OKRs und persönliche Entwicklung',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00E5FF',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    categories: ['productivity', 'lifestyle', 'health-fitness'],
    shortcuts: [
      {
        name: 'Daily Habits',
        short_name: 'Habits',
        description: 'Track your daily habits',
        url: '/daily-log',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
      {
        name: 'Weekly Review',
        short_name: 'Review',
        description: 'Complete your weekly review',
        url: '/reviews/weekly',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
          },
        ],
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
      },
    ],
  };
}

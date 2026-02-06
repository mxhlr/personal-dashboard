import type { NextConfig } from "next";

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  cacheId: "real-rise-v7-light-mode-fix",
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.convex\.cloud\/.*/i,
      handler: "NetworkFirst",
      options: {
        cacheName: "convex-api-cache",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60,
        },
      },
    },
  ],
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
};

export default withBundleAnalyzer(withPWA(nextConfig));

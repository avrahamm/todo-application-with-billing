import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable font preloading to prevent unused preload warnings
  optimizeFonts: false,

  // Add security headers
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          // Using a less restrictive value for Cross-Origin-Embedder-Policy
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

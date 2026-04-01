import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.giphy.com',
      },
    ],
  },
  serverExternalPackages: ['@supabase/supabase-js', 'mongodb']
};

export default nextConfig;

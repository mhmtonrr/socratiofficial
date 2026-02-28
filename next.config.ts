import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: 'custom',
    loaderFile: './app/utils/imageLoader.ts',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static.ticimax.cloud',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'gemini.google.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

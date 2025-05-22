// next.config.js
import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config: any) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname,'src'),
    };
    return config;
  },
};


// http://seal-app-8m3g5.ondigitalocean.app

// NEXT_PUBLIC_API_URL
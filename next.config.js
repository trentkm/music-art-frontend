/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  images: {
    // Disable optimization to allow arbitrary remote images from the backend.
    unoptimized: true
  }
};

module.exports = nextConfig;

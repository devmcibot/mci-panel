/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { serverActions: false },
  output: 'standalone',
};
module.exports = nextConfig;

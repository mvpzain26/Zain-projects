/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  // Enable webpack 5
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  // Set the output mode to 'export' for static export
  output: 'export',
  // Add any other configurations you need
};

module.exports = nextConfig;
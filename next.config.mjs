// file: next.config.mjs
// description: Next.js configuration enabling strict mode and typed routes
// reference: tsconfig.json

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Standalone output for optimized container deployments (Railway, Docker)
  output: 'standalone',
};

export default nextConfig;

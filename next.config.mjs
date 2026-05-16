// file: next.config.mjs
// description: Next.js configuration enabling strict mode and typed routes
// reference: tsconfig.json

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self), payment=(self)' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://code.iconify.design https://maps.googleapis.com https://maps.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com data:",
      "img-src 'self' data: blob: https://*.googleapis.com https://*.gstatic.com https://*.yelpcdn.com https://s3-media0.fl.yelpcdn.com https://s3-media1.fl.yelpcdn.com https://s3-media2.fl.yelpcdn.com https://s3-media3.fl.yelpcdn.com https://s3-media4.fl.yelpcdn.com",
      "connect-src 'self' https://api.yelp.com https://maps.googleapis.com https://*.turso.io https://*.libsql.io https://forge.butterfly-effect.dev",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ')
  }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Standalone output for optimized container deployments (Railway, Docker)
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;

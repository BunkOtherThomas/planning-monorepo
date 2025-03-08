/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  transpilePackages: ['@planning/common-utils', '@quest-board/types'],
  images: {
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    externalDir: true,
    outputFileTracingRoot: process.env.VERCEL ? undefined : process.cwd(),
  },
};

module.exports = nextConfig;

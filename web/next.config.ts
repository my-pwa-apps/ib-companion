/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787',
  },
  experimental: {
    // needed for @/* aliases without src/
    typedRoutes: false,
  },
}

export default nextConfig

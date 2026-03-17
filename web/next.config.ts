/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Static export for GitHub Pages
  output: 'export',
  // basePath only set when deploying to GitHub Pages (set via env in CI)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
  // Required for static export — disables Next.js image optimization server
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8787',
  },
}

export default nextConfig

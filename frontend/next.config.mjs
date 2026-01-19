/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['starseeker-frontend'],
  eslint: {
    // ESLintの警告を無視する設定
    ignoreDuringBuilds: true,
  },
}

export default nextConfig

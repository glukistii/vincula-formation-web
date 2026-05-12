/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vincula-formation.com' },
      { protocol: 'https', hostname: 'www.vincula-formation.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
    ],
  },
  experimental: {
    typedRoutes: false,
  },
};

export default nextConfig;

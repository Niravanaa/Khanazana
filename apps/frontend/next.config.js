/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Local Supabase
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '54331',
        pathname: '/storage/v1/object/public/**',
      },
      // Hosted Supabase (*.supabase.co)
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;

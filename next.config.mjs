import withLinaria from 'next-with-linaria';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
};

export default withLinaria(nextConfig);

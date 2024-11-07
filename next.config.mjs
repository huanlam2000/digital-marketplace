

/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '**'
      }
    ]
  },
  experimental: { serverComponentsExternalPackages: ['stripe.ts'] },
  webpack: (config) => {
    config.externals.push('payload') // treat payload as external module and use require when load it.
    return config
  }
}

export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Ignore the critical dependency warning
    config.module = {
      ...config.module,
      exprContextCritical: false
    }
    
    // Add this to handle Supabase realtime warnings
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve.fallback,
        "fs": false,
        "net": false,
        "tls": false
      }
    }
    
    return config
  },
  transpilePackages: ['@supabase/supabase-js'],
  experimental: {
    esmExternals: 'loose'
  }
}

module.exports = nextConfig
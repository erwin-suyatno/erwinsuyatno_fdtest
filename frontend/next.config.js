/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable modern bundling
    modern: true,
    // Enable SWC minification
    swcMinify: true,
  },
  
  // Optimize bundle splitting
  webpack: (config, { dev, isServer }) => {
    // Optimize chunks for better lazy loading
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate chunk for pages
          pages: {
            test: /[\\/]src[\\/]pages[\\/]/,
            name: 'pages',
            priority: 10,
            chunks: 'all',
          },
          // Separate chunk for components
          components: {
            test: /[\\/]src[\\/]components[\\/]/,
            name: 'components',
            priority: 10,
            chunks: 'all',
          },
          // Separate chunk for services
          services: {
            test: /[\\/]src[\\/]services[\\/]/,
            name: 'services',
            priority: 10,
            chunks: 'all',
          },
        },
      };
    }
    
    return config;
  },
  
  // Enable compression
  compress: true,
  
  // Optimize images
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  
  // PWA features removed - Next.js doesn't have built-in PWA support
  // To add PWA, install next-pwa package and configure properly
  
  // Performance optimizations
  poweredByHeader: false,
  generateEtags: false,
  
  // Enable static optimization
  trailingSlash: false,
  
  // Optimize for production
  ...(process.env.NODE_ENV === 'production' && {
    output: 'standalone',
  }),
};

module.exports = nextConfig;

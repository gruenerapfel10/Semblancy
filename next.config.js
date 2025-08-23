/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Add support for PDF.js worker
    config.module.rules.push({
      test: /\.node/,
      use: 'raw-loader',
    });
    
    // Fix for markdown/MDX dependencies color import issue
    config.resolve.alias = {
      ...config.resolve.alias,
      'estree-util-visit/do-not-use-color': false,
      'unist-util-visit-parents/do-not-use-color': false,
    };
    
    return config;
  },
}

module.exports = nextConfig 
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer, webpack }) => {
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
    
    // Handle canvas dependency - mock it for both client and server on Vercel
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    
    // Ignore canvas warnings
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /canvas/,
        contextRegExp: /pdfjs-dist/,
      })
    );
    
    return config;
  },
}

module.exports = nextConfig 